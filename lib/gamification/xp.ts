import { XP_CONFIG } from "@/lib/constants";
import type { ChallengeDifficulty } from "@/lib/types/database";

export function calculateChallengeXp(
  baseXp: number,
  difficulty: ChallengeDifficulty,
  streakDays = 0
): number {
  const multiplier = XP_CONFIG.DIFFICULTY_MULTIPLIER[difficulty];
  const streakBonus = Math.min(
    streakDays * XP_CONFIG.STREAK_BONUS_PER_DAY,
    XP_CONFIG.MAX_STREAK_BONUS
  );
  return Math.round(baseXp * multiplier + streakBonus);
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_CONFIG.XP_PER_LEVEL) + 1;
}

export function getLevelProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progress: number;
} {
  const level = getLevelFromXp(xp);
  const currentLevelXp = xp % XP_CONFIG.XP_PER_LEVEL;
  const xpToNextLevel = XP_CONFIG.XP_PER_LEVEL - currentLevelXp;
  const progress = (currentLevelXp / XP_CONFIG.XP_PER_LEVEL) * 100;

  return { level, currentLevelXp, xpToNextLevel, progress };
}

export function getLevelTitle(level: number): string {
  if (level < 3) return "Sketch Starter";
  if (level < 5) return "Line Explorer";
  if (level < 8) return "Form Builder";
  if (level < 12) return "Concept Crafter";
  if (level < 16) return "Design Strategist";
  if (level < 20) return "Portfolio Pro";
  return "Exam Crusher";
}
