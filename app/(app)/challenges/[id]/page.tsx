import { notFound } from "next/navigation";
import { getChallengeById } from "@/lib/challenges/seed-data";
import { ChallengeDetailClient } from "@/components/challenges/challenge-detail-client";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) notFound();

  return <ChallengeDetailClient challenge={challenge} />;
}
