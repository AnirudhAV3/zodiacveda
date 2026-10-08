import type { MetadataRoute } from "next";
import { CALCULATOR_SEO, SITE_URL, SEO_UPDATED } from "@/lib/seo/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const modified = new Date(SEO_UPDATED);
  return [
    { url: SITE_URL, lastModified: modified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/copyright`, lastModified: modified, changeFrequency: "yearly", priority: 0.3 },
    ...Object.values(CALCULATOR_SEO).map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: modified,
      changeFrequency: "monthly" as const,
      priority: page.path === "/build" ? 1 : 0.9,
    })),
  ];
}
