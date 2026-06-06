import type { WeeklyDayProgress } from "@/lib/types/database";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getTodayWeekday(): string {
  return WEEKDAYS[new Date().getDay()];
}

export function createDefaultWeeklyProgress(): WeeklyDayProgress[] {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    completed: false,
    xp: 0,
  }));
}

export function isConsecutiveDay(lastDate: string | null, today: string): boolean {
  if (!lastDate) return false;
  const last = new Date(lastDate + "T12:00:00");
  const current = new Date(today + "T12:00:00");
  const diff = (current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diff === 1;
}

export function isSameDay(lastDate: string | null, today: string): boolean {
  return lastDate === today;
}

export function updateStreakOnCompletion(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null,
  weeklyProgress: WeeklyDayProgress[],
  xpEarned: number
): {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  weekly_progress: WeeklyDayProgress[];
} {
  const today = getTodayDateString();
  const todayWeekday = getTodayWeekday();

  let newStreak = currentStreak;
  if (isSameDay(lastActivityDate, today)) {
    newStreak = currentStreak;
  } else if (isConsecutiveDay(lastActivityDate, today)) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const updatedWeekly = weeklyProgress.map((d) =>
    d.day === todayWeekday
      ? { ...d, completed: true, xp: d.xp + xpEarned }
      : d
  );

  return {
    current_streak: newStreak,
    longest_streak: Math.max(longestStreak, newStreak),
    last_activity_date: today,
    weekly_progress: updatedWeekly,
  };
}
