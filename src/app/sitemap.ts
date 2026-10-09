import { site } from "@/data/site";
import type { MetadataRoute } from "next";

const BASE = site.url;

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
