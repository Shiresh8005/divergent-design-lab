import type { AiReviewResult, AiReviewStatus } from "@/lib/types/database";

/** Contract for Phase 2+ AI review pipeline */
export interface AiReviewJob {
  submissionId: string;
  userId: string;
  challengeId: string;
  imageUrl: string;
  category: string;
  promptText: string;
  status: AiReviewStatus;
  priority: "normal" | "high";
  createdAt: string;
}

export interface AiReviewProvider {
  name: string;
  review(imageUrl: string, context: AiReviewContext): Promise<AiReviewResult>;
}

export interface AiReviewContext {
  category: string;
  promptText: string;
  difficulty: string;
}

export interface AiReviewQueue {
  enqueue(job: Omit<AiReviewJob, "status" | "createdAt">): Promise<string>;
  getStatus(jobId: string): Promise<AiReviewStatus>;
  processNext(): Promise<void>;
}

/** Placeholder result schema stored in submissions.ai_review_result */
export const AI_REVIEW_RESULT_SCHEMA = {
  overall_score: "number 0-100",
  composition_score: "number 0-100",
  creativity_score: "number 0-100",
  technique_score: "number 0-100",
  feedback: "string",
  strengths: "string[]",
  improvements: "string[]",
  model_version: "string",
  reviewed_at: "ISO timestamp",
} as const;
