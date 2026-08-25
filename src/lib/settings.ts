import { cache } from "react";
import { readDocument } from "@/lib/blob-store";
import { site } from "@/lib/site";

export type SocialLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  name: string;
  role: string;
  location: string;
  tagline: string;
  description: string;
  available: boolean;
  email: string;
  socials: SocialLink[];
  tools: string[];
  services: string[];
  aboutHeading: string;
  aboutParagraphs: string[];
};

/**
 * Значення за замовчуванням. Використовуються, поки Роман не збереже свої
 * тексти в адмінці, і як основа при злитті — щоб старий збережений документ
 * без нового поля не залишив сайт з порожньою секцією.
 */
export const defaultSettings: SiteSettings = {
  name: site.name,
  role: site.role,
  location: site.location,
  tagline: site.tagline,
  description: site.description,
  available: site.available,
  email: site.email,
  socials: site.socials.map((social) => ({ ...social })),
  tools: [...site.tools],
  services: [...site.services],
  aboutHeading: "Роблю графіку, яка працює на впізнаваність",
  aboutParagraphs: [
    "Я skweezxd — графічний дизайнер. Працюю з айдентикою, постерами та digital-графікою: від першого скетчу до готових файлів для друку й соцмереж.",
    "Починаю з задачі, а не з красивої картинки. Розбираюсь, для кого продукт і чим він відрізняється, і вже потім будую візуальну систему, яку легко масштабувати на всі носії.",
  ],
};

export const SETTINGS_DOCUMENT = "settings";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const stored = await readDocument<Partial<SiteSettings>>(SETTINGS_DOCUMENT);
  if (!stored) return defaultSettings;

  return { ...defaultSettings, ...stored };
});
