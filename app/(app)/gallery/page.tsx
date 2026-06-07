import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/config";
import { GalleryClient } from "@/components/gallery/gallery-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Gallery — Design Lab",
};

export default async function GalleryPage() {
  if (!isSupabaseConfigured()) {
    return <GalleryClient posts={[]} />;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_posts")
    .select("id, image_url, caption, likes_count, challenge_slug, profiles(full_name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  const posts =
    data?.map((p) => ({
      id: p.id,
      imageUrl: p.image_url,
      caption: p.caption,
      likes: p.likes_count,
      challengeSlug: p.challenge_slug,
      authorName:
        (Array.isArray(p.profiles)
          ? p.profiles[0]?.full_name
          : (p.profiles as { full_name: string | null } | null)?.full_name) ??
        "Designer",
    })) ?? [];

  return <GalleryClient posts={posts} />;
}
