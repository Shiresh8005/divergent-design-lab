import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-center">
      <p className="text-6xl">🎨</p>
      <h1 className="mt-4 text-2xl font-bold">Challenge not found</h1>
      <p className="mt-2 text-sm text-white/50">
        This challenge doesn&apos;t exist or has expired.
      </p>
      <Button asChild className="mt-6">
        <Link href="/challenges">Browse challenges</Link>
      </Button>
    </div>
  );
}
