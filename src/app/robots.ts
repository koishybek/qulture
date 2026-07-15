import type { MetadataRoute } from "next";
import { absoluteSiteUrl, configuredSiteOrigin } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteSiteUrl(configuredSiteOrigin(), "/sitemap.xml");
  return {
    rules: [
      { userAgent: "*", allow: ["/ru", "/kz"], disallow: ["/admin", "/api", "/*?demo=1"] },
    ],
    ...(sitemap ? { sitemap } : {}),
  };
}
