import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://designlab.divergentclasses.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/submit", "/profile", "/reset-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
