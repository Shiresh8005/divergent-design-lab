import type {
  ChallengeCategory,
  ChallengeDifficulty,
  DailyChallenge,
} from "@/lib/types/database";
import { CHALLENGE_CATEGORIES } from "@/lib/constants";

/** Exam-calibrated difficulty floor & rewards per entrance exam */
export const EXAM_TIER: Record<
  ChallengeCategory,
  {
    tier: ChallengeDifficulty;
    baseXp: number;
    label: string;
  }
> = {
  "UCEED Part B": {
    tier: "hard",
    baseXp: 60,
    label: "National · IIT Bombay",
  },
  "NID DAT Mains": {
    tier: "hard",
    baseXp: 70,
    label: "Studio test · High competition",
  },
  "NIFT Situation Test": {
    tier: "hard",
    baseXp: 65,
    label: "3D practical · Jury scored",
  },
  CEED: {
    tier: "medium",
    baseXp: 55,
    label: "Part B · Design aptitude",
  },
  "NID M.Des": {
    tier: "hard",
    baseXp: 80,
    label: "Postgraduate · Spatial depth",
  },
};

/** Per-question overrides — some PYQs are relatively approachable within a hard exam */
const QUESTION_DIFFICULTY: Partial<Record<string, ChallengeDifficulty>> = {
  "uceed-2024-lunchbox": "medium",
  "uceed-2025-portable-seat": "medium",
  "nid-rainwater-storyboard": "medium",
  "nid-cup-holder-route": "medium",
  "ceed-sphere-chair": "medium",
  "ceed-toothbrush-pain": "medium",
};

const DIFFICULTY_XP: Record<ChallengeDifficulty, number> = {
  easy: 40,
  medium: 50,
  hard: 75,
};

export function getQuestionDifficulty(
  challengeId: string,
  category: ChallengeCategory
): ChallengeDifficulty {
  return (
    QUESTION_DIFFICULTY[challengeId] ??
    EXAM_TIER[category].tier
  );
}

export function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  switch (difficulty) {
    case "easy":
      return "Foundation";
    case "medium":
      return "Exam standard";
    case "hard":
      return "Competition tier";
  }
}

export function calibrateChallenge(challenge: DailyChallenge): DailyChallenge {
  const difficulty = getQuestionDifficulty(challenge.id, challenge.category);
  const tier = EXAM_TIER[challenge.category];
  const xp_reward = Math.max(
    DIFFICULTY_XP[difficulty],
    Math.round(tier.baseXp * (difficulty === "hard" ? 1.15 : difficulty === "medium" ? 1 : 0.85))
  );

  return {
    ...challenge,
    difficulty,
    xp_reward,
  };
}

export const SEED_CHALLENGES_CALIBRATED = (challenges: DailyChallenge[]) =>
  challenges.map(calibrateChallenge);

export function groupByCategory(
  challenges: DailyChallenge[]
): Record<ChallengeCategory, DailyChallenge[]> {
  const groups = Object.fromEntries(
    CHALLENGE_CATEGORIES.map((c) => [c, [] as DailyChallenge[]])
  ) as Record<ChallengeCategory, DailyChallenge[]>;

  for (const ch of challenges) {
    groups[ch.category].push(ch);
  }
  return groups;
}
