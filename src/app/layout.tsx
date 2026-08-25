import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { getSettings } from "@/lib/settings";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.name} — ${settings.role.toLowerCase()}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${settings.name}`,
    },
    description: settings.description,
    keywords: [
      "графічний дизайн",
      "портфоліо",
      "айдентика",
      "логотип",
      "дизайнер",
      settings.name,
    ],
    authors: [{ name: settings.name }],
    openGraph: {
      type: "website",
      locale: "uk_UA",
      url: siteUrl,
      siteName: settings.name,
      title,
      description: settings.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: settings.description,
    },
  };
}

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
