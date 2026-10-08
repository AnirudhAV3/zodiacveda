import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/catalog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/", "/*?*"] },
      { userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "ClaudeBot", "PerplexityBot"], allow: ["/", "/build", "/calculators/"], disallow: ["/api/", "/_next/", "/chart/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
