import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";

import { Shell } from "@/components/shell";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const description = "The YouTube videos Hacker News keeps recommending. 6,454 videos from 20 years of HN comments, no accounts.";

// Absolute base for og:image and canonical URLs: explicit site URL, then Vercel's production host.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "HTube", template: "%s | HTube" },
  description,
  applicationName: "HTube",
  keywords: ["Hacker News", "HackerTube", "YouTube", "talks", "lectures", "documentaries", "programming"],
  openGraph: { type: "website", siteName: "HTube", title: "HTube", description, locale: "en_US" },
  twitter: { card: "summary_large_image", title: "HTube", description, creator: "@justmalhar" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0f0f0f",
};

// Runs before first paint: applies the saved theme and sidebar rail so neither flashes.
// Storage can throw (blocked cookies, some private modes), so the defaults stay on failure.
const bootScript =
  "try{var d=document.documentElement,s=localStorage;d.dataset.theme=s.getItem('oht.theme')==='light'?'light':'dark';if(s.getItem('oht.rail')==='1')d.setAttribute('data-rail','')}catch(e){}";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: bootScript sets data-theme and data-rail before React hydrates.
    <html lang="en" className={`${roboto.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
