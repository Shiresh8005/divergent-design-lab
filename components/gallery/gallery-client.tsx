"use client";

import { Images } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface GalleryPost {
  id: string;
  imageUrl: string;
  caption: string | null;
  likes: number;
  challengeSlug: string;
  authorName: string;
}

export function GalleryClient({ posts }: { posts: GalleryPost[] }) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <Images className="h-6 w-6 text-[var(--brand-blue)]" />
          <h1 className="text-2xl font-bold">Community Gallery</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Student submissions shared with the community
        </p>
      </div>

      {posts.length === 0 ? (
        <GlassCard className="p-8 text-center" hover={false}>
          <p className="text-sm text-[var(--muted)]">
            No public submissions yet. Complete a mock and share your work!
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <GlassCard key={post.id} className="overflow-hidden p-0" hover>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.caption ?? `Submission by ${post.authorName}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-3">
                <p className="text-sm font-medium">{post.authorName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {post.challengeSlug} · {post.likes} likes
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
