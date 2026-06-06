"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DashboardStats,
  Submission,
  WeeklyDayProgress,
  AiReviewResult,
} from "@/lib/types/database";
import type { GradingResult } from "@/lib/grading/analyze";
import { createDefaultWeeklyProgress } from "@/lib/gamification/streak";
import { getLevelProgress } from "@/lib/gamification/xp";
import { XP_CONFIG } from "@/lib/constants";

interface DemoUser {
  id: string;
  email: string;
  full_name: string;
}

interface DemoState {
  user: DemoUser | null;
  xp: number;
  streak: number;
  longestStreak: number;
  weeklyProgress: WeeklyDayProgress[];
  submissions: Record<string, Submission>;
  gradingResults: Record<string, GradingResult>;
  login: (email: string, name?: string) => void;
  logout: () => void;
  saveGrading: (challengeId: string, result: GradingResult, imageUrl: string) => void;
  completeChallenge: (
    challengeId: string,
    xpEarned: number,
    imageUrl?: string,
    grading?: AiReviewResult
  ) => void;
  getStats: () => DashboardStats;
  getGrading: (challengeId: string) => GradingResult | undefined;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      user: null,
      xp: 0,
      streak: 0,
      longestStreak: 0,
      weeklyProgress: createDefaultWeeklyProgress(),
      submissions: {},
      gradingResults: {},

      login: (email, name) =>
        set({
          user: {
            id: "demo-user",
            email,
            full_name: name ?? email.split("@")[0],
          },
        }),

      logout: () =>
        set({
          user: null,
          xp: 0,
          streak: 0,
          longestStreak: 0,
          weeklyProgress: createDefaultWeeklyProgress(),
          submissions: {},
          gradingResults: {},
        }),

      saveGrading: (challengeId, result, imageUrl) => {
        const state = get();
        const submission: Submission = {
          id: `sub-${challengeId}`,
          user_id: state.user?.id ?? "demo-user",
          challenge_id: challengeId,
          image_url: imageUrl,
          notes: null,
          status: "submitted",
          ai_review_status: "completed",
          ai_review_result: result,
          ai_review_requested_at: new Date().toISOString(),
          ai_review_completed_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({
          submissions: { ...state.submissions, [challengeId]: submission },
          gradingResults: { ...state.gradingResults, [challengeId]: result },
        });
      },

      getGrading: (challengeId) => get().gradingResults[challengeId],

      completeChallenge: (challengeId, xpEarned, imageUrl, grading) => {
        const state = get();
        const today = new Date().toISOString().split("T")[0];
        const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          new Date().getDay()
        ];

        const newStreak = state.streak + 1;
        const newXp = state.xp + xpEarned;

        const submission: Submission = {
          id: `sub-${challengeId}`,
          user_id: state.user?.id ?? "demo-user",
          challenge_id: challengeId,
          image_url: imageUrl ?? null,
          notes: null,
          status: "completed",
          ai_review_status: grading ? "completed" : "not_requested",
          ai_review_result: grading ?? get().gradingResults[challengeId] ?? null,
          ai_review_requested_at: null,
          ai_review_completed_at: null,
          submitted_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set({
          xp: newXp,
          streak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          weeklyProgress: state.weeklyProgress.map((d) =>
            d.day === weekday
              ? { ...d, completed: true, xp: d.xp + xpEarned }
              : d
          ),
          submissions: { ...state.submissions, [challengeId]: submission },
        });

        void today;
      },

      getStats: () => {
        const { xp, streak, weeklyProgress } = get();
        const { level, xpToNextLevel, progress } = getLevelProgress(xp);
        return {
          streak,
          xp,
          level,
          levelProgress: progress,
          xpToNextLevel,
          weeklyProgress,
        };
      },
    }),
    { name: "divergent-demo" }
  )
);

export function getDemoDefaultStats(): DashboardStats {
  return {
    streak: 3,
    xp: 340,
    level: 2,
    levelProgress: 70,
    xpToNextLevel: XP_CONFIG.XP_PER_LEVEL - 140,
    weeklyProgress: [
      { day: "Mon", completed: true, xp: 50 },
      { day: "Tue", completed: true, xp: 75 },
      { day: "Wed", completed: true, xp: 50 },
      { day: "Thu", completed: false, xp: 0 },
      { day: "Fri", completed: false, xp: 0 },
      { day: "Sat", completed: false, xp: 0 },
      { day: "Sun", completed: false, xp: 0 },
    ],
  };
}
