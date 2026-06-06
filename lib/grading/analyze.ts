import type { ChallengeCategory } from "@/lib/types/database";
import type { AiReviewResult } from "@/lib/types/database";
import { getRubric, type RubricCriterion } from "./rubrics";

export interface ImageMetrics {
  width: number;
  height: number;
  edgeDensity: number;
  contrast: number;
  brightness: number;
  centerWeight: number;
  colorVariance: number;
  aspectScore: number;
}

export interface GradingAnnotation {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "strength" | "improve";
}

export interface GradingResult extends AiReviewResult {
  totalMarks: number;
  maxMarks: number;
  criterionScores: Array<{
    id: string;
    name: string;
    score: number;
    maxMarks: number;
  }>;
  annotations: GradingAnnotation[];
  grade: string;
}

/** Analyze uploaded image via canvas heuristics */
export async function analyzeImage(file: File): Promise<ImageMetrics> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const maxDim = 400;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.floor(bitmap.width * scale);
  canvas.height = Math.floor(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let edgeSum = 0;
  let lumSum = 0;
  let lumSqSum = 0;
  let centerSum = 0;
  let centerCount = 0;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.3;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      lumSum += lum;
      lumSqSum += lum * lum;

      const iR = ((y) * width + (x + 1)) * 4;
      const iL = ((y) * width + (x - 1)) * 4;
      const iD = ((y + 1) * width + x) * 4;
      const lumR = 0.299 * data[iR] + 0.587 * data[iR + 1] + 0.114 * data[iR + 2];
      const lumL = 0.299 * data[iL] + 0.587 * data[iL + 1] + 0.114 * data[iL + 2];
      const lumD = 0.299 * data[iD] + 0.587 * data[iD + 1] + 0.114 * data[iD + 2];
      edgeSum += Math.abs(4 * lum - lumR - lumL - lumD);

      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy < r * r) {
        centerSum += lum;
        centerCount++;
      }
    }
  }

  const pixels = (width - 2) * (height - 2);
  const mean = lumSum / pixels;
  const variance = lumSqSum / pixels - mean * mean;
  const edgeDensity = edgeSum / (pixels * 255);
  const contrast = Math.sqrt(Math.max(0, variance)) / 128;
  const brightness = mean / 255;
  const centerWeight = centerCount > 0 ? centerSum / centerCount / 255 : 0.5;

  const ratio = width / height;
  const aspectScore =
    ratio >= 1.2 && ratio <= 1.6 ? 1 : ratio >= 0.9 && ratio <= 1.8 ? 0.75 : 0.5;

  bitmap.close();

  return {
    width: bitmap.width,
    height: bitmap.height,
    edgeDensity: Math.min(1, edgeDensity * 3),
    contrast: Math.min(1, contrast),
    brightness,
    centerWeight,
    colorVariance: Math.min(1, Math.sqrt(variance) / 80),
    aspectScore,
  };
}

function scoreCriterion(
  criterion: RubricCriterion,
  metrics: ImageMetrics,
  category: ChallengeCategory,
  seed: number
): number {
  const jitter = ((seed * criterion.id.length) % 17) / 100 - 0.08;
  let base = 0.55 + jitter;

  switch (criterion.id) {
    case "perspective":
    case "technical":
    case "structure":
      base += metrics.edgeDensity * 0.25 + metrics.aspectScore * 0.15;
      break;
    case "line_quality":
    case "drawing_skill":
    case "sketch_comm":
      base += metrics.edgeDensity * 0.35 + metrics.contrast * 0.1;
      break;
    case "composition":
    case "spatial":
      base += metrics.centerWeight * 0.2 + metrics.aspectScore * 0.2;
      break;
    case "colour":
    case "rendering":
      base += metrics.colorVariance * 0.25 + metrics.contrast * 0.15;
      break;
    case "annotation":
    case "documentation":
    case "process":
      base += metrics.edgeDensity * 0.15 + (metrics.width > 1200 ? 0.15 : 0.05);
      break;
    case "creativity":
    case "concept":
    case "innovation":
    case "critical":
      base += metrics.colorVariance * 0.15 + (seed % 20) / 100;
      break;
    case "material_use":
    case "craft":
      base += metrics.contrast * 0.2 + metrics.edgeDensity * 0.15;
      break;
    case "brief_fit":
    case "problem_id":
    case "research":
      base += 0.1 + metrics.centerWeight * 0.15;
      break;
    case "ideation":
    case "form":
    case "finish":
      base += metrics.edgeDensity * 0.2 + metrics.aspectScore * 0.1;
      break;
    default:
      base += metrics.edgeDensity * 0.2;
  }

  if (category === "NIFT Situation Test" && metrics.brightness < 0.35) {
    base -= 0.05;
  }

  return Math.round(
    Math.min(criterion.maxMarks, Math.max(criterion.maxMarks * 0.35, base * criterion.maxMarks))
  );
}

function buildFeedback(
  scores: Array<{ criterion: RubricCriterion; score: number }>,
  category: ChallengeCategory
): { strengths: string[]; improvements: string[]; feedback: string } {
  const sorted = [...scores].sort((a, b) => b.score / b.criterion.maxMarks - a.score / a.criterion.maxMarks);
  const weakest = [...scores].sort((a, b) => a.score / a.criterion.maxMarks - b.score / b.criterion.maxMarks);

  const strengths = sorted.slice(0, 2).map(
    (s) =>
      `${s.criterion.name}: ${Math.round((s.score / s.criterion.maxMarks) * 100)}% — ${getStrengthTip(s.criterion.id, category)}`
  );

  const improvements = weakest.slice(0, 3).map(
    (s) =>
      `${s.criterion.name}: Focus on ${s.criterion.description.toLowerCase()}. ${getImproveTip(s.criterion.id, category)}`
  );

  const total = scores.reduce((a, s) => a + s.score, 0);
  const max = scores.reduce((a, s) => a + s.criterion.maxMarks, 0);
  const pct = Math.round((total / max) * 100);

  const feedback =
    pct >= 75
      ? `Strong ${category} attempt. Your sheet reads well to an examiner — keep this consistency across mock tests.`
      : pct >= 55
        ? `Decent attempt for ${category}. You're on track but examiners will look for sharper execution in weak areas below.`
        : `This attempt needs more exam-format discipline. ${category} sheets are judged fast — lead with clear construction and labels.`;

  return { strengths, improvements, feedback };
}

function getStrengthTip(id: string, cat: ChallengeCategory): string {
  const tips: Record<string, string> = {
    perspective: "Your spatial setup reads clearly — maintain this in timed mocks.",
    line_quality: "Line confidence is visible; examiners reward decisive strokes.",
    composition: "Layout holds attention — good for NID poster-style questions.",
    structure: "Structural clarity would score in a real situation test jury.",
    sketch_comm: "Communication through sketches is effective.",
  };
  return tips[id] ?? `Solid work for ${cat}.`;
}

function getImproveTip(id: string, cat: ChallengeCategory): string {
  const tips: Record<string, string> = {
    perspective: "Add a ground line and one vanishing point reference before detailing.",
    annotation: "UCEED sheets need 3–5 labelled callouts — add dimensions and material notes.",
    line_quality: "Use lighter construction lines, then darken only final contours.",
    composition: "Leave 15% margin; NID sheets with cramped borders lose presentation marks.",
    material_use: "Show how each given material is used — label wire gauge, fold lines.",
    documentation: "Include 2 rough thumbnails in the corner before the final model photo.",
    problem_id: "Write a one-line problem statement at the top — CEED evaluators expect this.",
    ideation: "Show 3 variant thumbnails (even small) before the resolved concept.",
    research: "Add a small context box: user, context, constraint — M.Des panels need this.",
    technical: "Include one orthographic view with a dimension line.",
    craft: "Clean up glue marks and frayed edges before photographing.",
    colour: "Limit palette to 3 colours max unless the question demands more.",
  };
  return tips[id] ?? `Practice this parameter in your next ${cat} mock.`;
}

function buildAnnotations(
  scores: Array<{ criterion: RubricCriterion; score: number }>
): GradingAnnotation[] {
  const weak = scores
    .filter((s) => s.score / s.criterion.maxMarks < 0.65)
    .slice(0, 4);

  const positions = [
    { x: 12, y: 18 },
    { x: 78, y: 22 },
    { x: 15, y: 72 },
    { x: 82, y: 68 },
  ];

  return weak.map((s, i) => ({
    id: s.criterion.id,
    x: positions[i]?.x ?? 50,
    y: positions[i]?.y ?? 50,
    label: s.criterion.name,
    type: "improve" as const,
  }));
}

function getGrade(pct: number): string {
  if (pct >= 85) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 55) return "B";
  if (pct >= 45) return "C";
  return "Needs Work";
}

export async function gradeSubmission(
  file: File,
  category: ChallengeCategory
): Promise<GradingResult> {
  const metrics = await analyzeImage(file);
  const rubric = getRubric(category);
  const seed = file.size + file.lastModified + category.length;

  const scored = rubric.criteria.map((criterion) => {
    const score = scoreCriterion(criterion, metrics, category, seed);
    return { criterion, score };
  });

  const totalMarks = scored.reduce((a, s) => a + s.score, 0);
  const maxMarks = rubric.totalMarks;
  const pct = (totalMarks / maxMarks) * 100;

  const { strengths, improvements, feedback } = buildFeedback(scored, category);
  const annotations = buildAnnotations(scored);

  const composition = scored.find((s) => ["composition", "perspective", "spatial", "structure"].includes(s.criterion.id));
  const creativity = scored.find((s) => ["creativity", "concept", "innovation", "ideation"].includes(s.criterion.id));
  const technique = scored.find((s) => ["line_quality", "drawing_skill", "craft", "technical", "sketch_comm"].includes(s.criterion.id));

  return {
    overall_score: Math.round(pct),
    composition_score: composition
      ? Math.round((composition.score / composition.criterion.maxMarks) * 100)
      : Math.round(pct * 0.9),
    creativity_score: creativity
      ? Math.round((creativity.score / creativity.criterion.maxMarks) * 100)
      : Math.round(pct * 0.85),
    technique_score: technique
      ? Math.round((technique.score / technique.criterion.maxMarks) * 100)
      : Math.round(pct * 0.95),
    feedback,
    strengths,
    improvements,
    model_version: "divergent-rubric-v1",
    reviewed_at: new Date().toISOString(),
    totalMarks,
    maxMarks,
    criterionScores: scored.map((s) => ({
      id: s.criterion.id,
      name: s.criterion.name,
      score: s.score,
      maxMarks: s.criterion.maxMarks,
    })),
    annotations,
    grade: getGrade(pct),
  };
}
