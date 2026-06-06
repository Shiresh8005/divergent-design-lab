import type { ChallengeCategory, DailyChallenge } from "@/lib/types/database";
import { CHALLENGE_CATEGORIES } from "@/lib/constants";
import {
  calibrateChallenge,
  groupByCategory,
} from "@/lib/challenges/exam-difficulty";

export function getTodayDateString(date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/** Stable day index 0–364 for rotation (UTC date) */
export function getDayIndex(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function pickForDay(
  pool: DailyChallenge[],
  dayIndex: number,
  categoryOffset: number
): DailyChallenge | null {
  if (pool.length === 0) return null;
  const idx = (dayIndex + categoryOffset) % pool.length;
  const picked = pool[idx];
  return {
    ...calibrateChallenge(picked),
    challenge_date: getTodayDateString(),
  };
}

const CATEGORY_OFFSET: Record<ChallengeCategory, number> = {
  "UCEED Part B": 0,
  "NID DAT Mains": 3,
  "NIFT Situation Test": 7,
  CEED: 11,
  "NID M.Des": 13,
};

/**
 * One rotating mock per exam track — changes every calendar day.
 * Each category cycles through its own question pool independently.
 */
export function getTodaysChallenges(
  allChallenges: DailyChallenge[],
  date = new Date()
): DailyChallenge[] {
  const dayIndex = getDayIndex(date);
  const byCategory = groupByCategory(allChallenges.map(calibrateChallenge));
  const today = getTodayDateString(date);

  return CHALLENGE_CATEGORIES.map((category) => {
    const pool = byCategory[category];
    const picked = pickForDay(pool, dayIndex, CATEGORY_OFFSET[category]);
    if (!picked) {
      throw new Error(`No challenges in pool for ${category}`);
    }
    return { ...picked, challenge_date: today };
  });
}

/** Featured mock on dashboard — rotates through categories by day */
export function getTodaysFeaturedChallenge(
  allChallenges: DailyChallenge[],
  date = new Date()
): DailyChallenge {
  const dayIndex = getDayIndex(date);
  const todays = getTodaysChallenges(allChallenges, date);
  const categoryIndex = dayIndex % CHALLENGE_CATEGORIES.length;
  const category = CHALLENGE_CATEGORIES[categoryIndex];
  return (
    todays.find((c) => c.category === category) ??
    todays[0]
  );
}

export function isTodaysChallenge(
  challengeId: string,
  allChallenges: DailyChallenge[],
  date = new Date()
): boolean {
  return getTodaysChallenges(allChallenges, date).some((c) => c.id === challengeId);
}

export function getTodaysChallengeIds(
  allChallenges: DailyChallenge[],
  date = new Date()
): string[] {
  return getTodaysChallenges(allChallenges, date).map((c) => c.id);
}
