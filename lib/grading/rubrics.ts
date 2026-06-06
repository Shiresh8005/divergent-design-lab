import type { ChallengeCategory } from "@/lib/types/database";

export interface RubricCriterion {
  id: string;
  name: string;
  maxMarks: number;
  description: string;
}

export interface ExamRubric {
  category: ChallengeCategory;
  totalMarks: number;
  passingMarks: number;
  criteria: RubricCriterion[];
}

/** Rubrics aligned to actual entrance exam evaluation parameters */
export const EXAM_RUBRICS: Record<ChallengeCategory, ExamRubric> = {
  "UCEED Part B": {
    category: "UCEED Part B",
    totalMarks: 100,
    passingMarks: 40,
    criteria: [
      {
        id: "perspective",
        name: "Perspective & Proportion",
        maxMarks: 25,
        description: "1-point / 2-point perspective accuracy, scale consistency",
      },
      {
        id: "form",
        name: "Form & Structure",
        maxMarks: 25,
        description: "3D volume rendering, orthographic alignment",
      },
      {
        id: "line_quality",
        name: "Line Quality",
        maxMarks: 20,
        description: "Confident strokes, clean construction lines vs final lines",
      },
      {
        id: "annotation",
        name: "Annotations & Labels",
        maxMarks: 15,
        description: "Dimensions, materials, design callouts as per UCEED format",
      },
      {
        id: "creativity",
        name: "Design Thinking",
        maxMarks: 15,
        description: "Problem-solving approach, usability consideration",
      },
    ],
  },
  "NID DAT Mains": {
    category: "NID DAT Mains",
    totalMarks: 100,
    passingMarks: 45,
    criteria: [
      {
        id: "composition",
        name: "Composition & Layout",
        maxMarks: 25,
        description: "Visual balance, use of space — NID poster/composition format",
      },
      {
        id: "concept",
        name: "Concept & Narrative",
        maxMarks: 25,
        description: "Idea originality, thematic connection to prompt",
      },
      {
        id: "drawing_skill",
        name: "Drawing Skill",
        maxMarks: 20,
        description: "Human figure/object proportion, gesture quality",
      },
      {
        id: "colour",
        name: "Colour & Medium",
        maxMarks: 15,
        description: "Appropriate medium use, colour harmony if applicable",
      },
      {
        id: "finish",
        name: "Presentation",
        maxMarks: 15,
        description: "Overall finish within 3-hour mains time sensibility",
      },
    ],
  },
  "NIFT Situation Test": {
    category: "NIFT Situation Test",
    totalMarks: 100,
    passingMarks: 50,
    criteria: [
      {
        id: "structure",
        name: "3D Structure & Stability",
        maxMarks: 30,
        description: "Model stands, joints secure, material integrity",
      },
      {
        id: "material_use",
        name: "Material Usage",
        maxMarks: 25,
        description: "Creative use of given materials (wire/cardboard/paper)",
      },
      {
        id: "brief_fit",
        name: "Brief Interpretation",
        maxMarks: 20,
        description: "Solution directly addresses the situation test problem",
      },
      {
        id: "craft",
        name: "Craftsmanship",
        maxMarks: 15,
        description: "Neat cutting, folding, joining — NIFT craft marks",
      },
      {
        id: "documentation",
        name: "Sketch Documentation",
        maxMarks: 10,
        description: "Preliminary sketches showing exploration process",
      },
    ],
  },
  CEED: {
    category: "CEED",
    totalMarks: 100,
    passingMarks: 45,
    criteria: [
      {
        id: "problem_id",
        name: "Problem Identification",
        maxMarks: 25,
        description: "Clear user need / pain point identification",
      },
      {
        id: "ideation",
        name: "Ideation & Variants",
        maxMarks: 20,
        description: "Multiple concepts explored before final selection",
      },
      {
        id: "sketch_comm",
        name: "Sketch Communication",
        maxMarks: 25,
        description: "Readable sketches with arrows, flows, annotations",
      },
      {
        id: "rendering",
        name: "Rendering Quality",
        maxMarks: 15,
        description: "Shading, material indication, depth cues",
      },
      {
        id: "innovation",
        name: "Innovation & Feasibility",
        maxMarks: 15,
        description: "Novel yet buildable solution for CEED Part B",
      },
    ],
  },
  "NID M.Des": {
    category: "NID M.Des",
    totalMarks: 100,
    passingMarks: 50,
    criteria: [
      {
        id: "research",
        name: "Research Depth",
        maxMarks: 20,
        description: "Context mapping, user/stakeholder consideration",
      },
      {
        id: "spatial",
        name: "Spatial Design",
        maxMarks: 25,
        description: "Plan, section, scale — spatial thinking for M.Des",
      },
      {
        id: "process",
        name: "Design Process",
        maxMarks: 20,
        description: "Iterations visible, not just final solution",
      },
      {
        id: "technical",
        name: "Technical Drawing",
        maxMarks: 20,
        description: "Dimensions, orthographic accuracy, detailing",
      },
      {
        id: "critical",
        name: "Critical Thinking",
        maxMarks: 15,
        description: "Justification of decisions, trade-off awareness",
      },
    ],
  },
};

export function getRubric(category: ChallengeCategory): ExamRubric {
  return EXAM_RUBRICS[category];
}
