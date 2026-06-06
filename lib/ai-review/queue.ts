import type { AiReviewJob, AiReviewProvider } from "./types";

/**
 * Phase 2+ AI Review Queue Architecture
 *
 * Flow:
 * 1. Student completes submission → submissions.ai_review_status = 'queued'
 * 2. Background worker picks job from queue
 * 3. Worker calls AiReviewProvider.review()
 * 4. Result stored in submissions.ai_review_result
 * 5. Status updated to 'completed' or 'failed'
 *
 * Implementation options:
 * - Supabase Edge Function + pg_cron
 * - Vercel Cron + API route
 * - Inngest / Trigger.dev for durable jobs
 */

export class InMemoryAiReviewQueue {
  private jobs: Map<string, AiReviewJob> = new Map();

  async enqueue(
    job: Omit<AiReviewJob, "status" | "createdAt">
  ): Promise<string> {
    const id = crypto.randomUUID();
    this.jobs.set(id, {
      ...job,
      status: "queued",
      createdAt: new Date().toISOString(),
    });
    return id;
  }

  async getStatus(jobId: string) {
    return this.jobs.get(jobId)?.status ?? "not_requested";
  }

  async processNext(provider: AiReviewProvider): Promise<void> {
    const next = [...this.jobs.values()].find((j) => j.status === "queued");
    if (!next) return;

    next.status = "processing";
    try {
      await provider.review(next.imageUrl, {
        category: next.category,
        promptText: next.promptText,
        difficulty: "medium",
      });
      next.status = "completed";
    } catch {
      next.status = "failed";
    }
  }
}

/** Stub provider — replace with vision model in Phase 2 */
export const stubAiReviewProvider: AiReviewProvider = {
  name: "stub-v0",
  async review() {
    throw new Error("AI review not implemented in Phase 1");
  },
};

export async function requestAiReview(
  _submissionId: string
): Promise<{ queued: false; message: string }> {
  return {
    queued: false,
    message: "AI review coming in Phase 2. Your submission is saved.",
  };
}
