import type { ChallengeCategory } from "@/lib/types/database";

export const BRAND = {
  name: "Divergent Classes",
  product: "Design Lab",
  tagline: "Exam-format mocks. Daily practice. Real feedback.",
  blue: "#2B9FE8",
  yellow: "#F5C518",
} as const;

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  "UCEED Part B",
  "NID DAT Mains",
  "NIFT Situation Test",
  "CEED",
  "NID M.Des",
];

export const CATEGORY_META: Record<
  ChallengeCategory,
  { color: string; icon: string; short: string }
> = {
  "UCEED Part B": { color: "#2B9FE8", icon: "✏️", short: "UCEED" },
  "NID DAT Mains": { color: "#2B9FE8", icon: "🎨", short: "NID DAT" },
  "NIFT Situation Test": { color: "#F5C518", icon: "📐", short: "NIFT ST" },
  CEED: { color: "#2B9FE8", icon: "💡", short: "CEED" },
  "NID M.Des": { color: "#F5C518", icon: "🏛️", short: "NID M.Des" },
};

export const XP_CONFIG = {
  BASE_CHALLENGE: 50,
  DIFFICULTY_MULTIPLIER: { easy: 0.8, medium: 1, hard: 1.5 } as const,
  STREAK_BONUS_PER_DAY: 5,
  MAX_STREAK_BONUS: 50,
  XP_PER_LEVEL: 200,
} as const;

export const DIFFICULTY_COLORS = {
  easy: "#10b981",
  medium: "#F5C518",
  hard: "#ef4444",
} as const;
