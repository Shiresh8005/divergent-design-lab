export type ChallengeCategory =
  | "UCEED Part B"
  | "NID DAT Mains"
  | "NIFT Situation Test"
  | "CEED"
  | "NID M.Des";

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export type SubmissionStatus = "draft" | "submitted" | "completed";

export type AiReviewStatus =
  | "not_requested"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type XpSource =
  | "challenge_complete"
  | "streak_bonus"
  | "daily_login"
  | "manual_adjustment";

export interface WeeklyDayProgress {
  day: string;
  completed: boolean;
  xp: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  xp_total: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  slug?: string;
  title: string;
  description: string;
  prompt_text: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  xp_reward: number;
  time_limit_minutes: number;
  challenge_date: string;
  is_active: boolean;
  created_at: string;
  /** e.g. "UCEED 2024 Part B" — sourced from official PYQ / studio test memory */
  exam_source?: string;
  exam_marks?: number;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  weekly_progress: WeeklyDayProgress[];
  updated_at: string;
}

export interface XpLog {
  id: string;
  user_id: string;
  amount: number;
  source: XpSource;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_slug: string;
  image_url: string | null;
  notes: string | null;
  status: SubmissionStatus;
  ai_review_status: AiReviewStatus;
  ai_review_result: AiReviewResult | null;
  ai_review_requested_at: string | null;
  ai_review_completed_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Phase 2+ AI review result shape */
export interface AiReviewResult {
  overall_score: number;
  composition_score: number;
  creativity_score: number;
  technique_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  model_version: string;
  reviewed_at: string;
}

export interface DashboardStats {
  streak: number;
  xp: number;
  level: number;
  levelProgress: number;
  xpToNextLevel: number;
  weeklyProgress: WeeklyDayProgress[];
}
