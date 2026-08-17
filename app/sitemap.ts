import type { MetadataRoute } from "next";

import { recActivities } from "@/lib/rec/activities";
import { availableUnits } from "@/lib/quiz/units";

/**
 * sitemap.xml。**単元マスタから作る。**
 *
 * 手で書いた一覧にすると、単元を足したときに必ず入れ忘れる。
 * robots.txt はこのファイルの出力先を指しているので、
 * ここが空だと robots.txt が存在しないURLを指すことになる（実際に一度そうなっていた）。
 *
 * 静的書き出し（output: "export"）でも、ビルド時に out/sitemap.xml が作られる。
 */

const BASE = "https://wakaru-dekita-site.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", priority: 1 },
    { path: "/learn", priority: 0.9 },
    { path: "/record", priority: 0.5 },
    { path: "/about", priority: 0.5 },
    { path: "/teachers", priority: 0.5 },
    { path: "/teachers/rec", priority: 0.5 },
    { path: "/teachers/use", priority: 0.4 },
    { path: "/contact", priority: 0.3 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${BASE}${page.path}`,
      changeFrequency: "monthly" as const,
      priority: page.priority,
    })),
    ...availableUnits().map((unit) => ({
      url: `${BASE}/learn/${unit.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...recActivities.map((activity) => ({
      url: `${BASE}/teachers/rec/${activity.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
