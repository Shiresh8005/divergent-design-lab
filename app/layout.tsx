import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme/theme-provider";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://designlab.divergentclasses.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.product} — ${BRAND.name}`,
    template: `%s — ${BRAND.product}`,
  },
  description: BRAND.tagline,
  openGraph: {
    title: `${BRAND.product} — ${BRAND.name}`,
    description: BRAND.tagline,
    url: siteUrl,
    siteName: BRAND.product,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.product} — ${BRAND.name}`,
    description: BRAND.tagline,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${sourceSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
