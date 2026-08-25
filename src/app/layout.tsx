import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.role.toLowerCase()}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "графічний дизайн",
    "портфоліо",
    "айдентика",
    "логотип",
    "дизайнер",
    site.name,
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} — ${site.role.toLowerCase()}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role.toLowerCase()}`,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${manrope.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col bg-ink text-bone">
        {children}
      </body>
    </html>
  );
}
