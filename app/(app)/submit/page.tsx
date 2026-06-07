"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/submit/upload-zone";
import { GradedDrawing } from "@/components/submit/graded-drawing";
import { GradingFeedback } from "@/components/submit/grading-feedback";
import { QuestionPaper } from "@/components/challenges/question-paper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getChallengeById, getTodaysChallenge } from "@/lib/challenges/seed-data";
import {
  createSubmission,
  uploadSubmissionImage,
} from "@/lib/actions/submissions";
import { isSupabaseConfigured, useDemoAuth } from "@/lib/auth/config";
import { useDemoStore } from "@/lib/demo/store";
import { gradeSubmission, type GradingResult } from "@/lib/grading/analyze";

function SubmitForm() {
  const searchParams = useSearchParams();
  const fallback = getTodaysChallenge();
  const challengeId = searchParams.get("challenge") ?? fallback.id;
  const challenge = getChallengeById(challengeId) ?? fallback;
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradingResult | null>(null);

  const saveGrading = useDemoStore((s) => s.saveGrading);
  const existingGrading = useDemoStore((s) => s.getGrading(challengeId));

  async function handleSubmit() {
    if (!file || !previewUrl) return;
    setGrading(true);
    setError(null);

    try {
      const graded = await gradeSubmission(file, challenge.category);
      setResult(graded);

      if (useDemoAuth()) {
        saveGrading(challenge.id, graded, previewUrl);
      } else if (isSupabaseConfigured()) {
        const formData = new FormData();
        formData.append("file", file);
        const upload = await uploadSubmissionImage(formData);
        if (!upload.success || !upload.url) {
          throw new Error(upload.error ?? "Image upload failed");
        }
        const saved = await createSubmission(
          challenge.id,
          upload.url,
          notes || null,
          graded
        );
        if (!saved.success) {
          throw new Error(saved.error ?? "Failed to save submission");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setGrading(false);
    }
  }

  const displayResult = result ?? existingGrading;

  if (displayResult && previewUrl) {
    return (
      <div className="space-y-6 pb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
            <h1 className="text-xl font-bold">Graded — {challenge.title}</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Scored using {challenge.category} exam rubric
          </p>
        </motion.div>

        <GradedDrawing imageUrl={previewUrl} result={displayResult} />
        <GradingFeedback result={displayResult} />

        <Button
          onClick={() => router.push(`/challenges/${challenge.id}`)}
          className="h-12 w-full rounded-xl btn-brand"
        >
          Back to challenge — mark complete
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Drawing</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Upload your sheet — we grade it instantly on exam parameters
        </p>
      </div>

      <QuestionPaper challenge={challenge} compact />

      <UploadZone
        previewUrl={previewUrl}
        onFileSelect={(f, url) => {
          setFile(f);
          setPreviewUrl(url);
        }}
        onClear={() => {
          setFile(null);
          setPreviewUrl(null);
        }}
      />

      <div>
        <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
          Notes (optional)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Time taken, materials used, self-assessment..."
          className="min-h-[80px] resize-none border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={grading || !file}
        className="h-12 w-full rounded-xl btn-brand"
      >
        {grading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Grading against exam rubric...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit &amp; Get Marks
          </>
        )}
      </Button>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitForm />
    </Suspense>
  );
}
