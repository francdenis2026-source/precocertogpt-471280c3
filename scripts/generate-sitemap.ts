// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.precocerto.live";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/buscar", changefreq: "daily", priority: "0.9" },
  { path: "/explorar", changefreq: "weekly", priority: "0.9" },
  { path: "/mercados", changefreq: "daily", priority: "0.9" },
  { path: "/estabelecimentos", changefreq: "weekly", priority: "0.8" },
  { path: "/farmacias", changefreq: "weekly", priority: "0.7" },
  { path: "/padarias", changefreq: "weekly", priority: "0.7" },
  { path: "/livros", changefreq: "weekly", priority: "0.7" },
  { path: "/servicos", changefreq: "weekly", priority: "0.7" },
  { path: "/autora/dorinha-barroso", changefreq: "monthly", priority: "0.7" },
  { path: "/cultura/fremix-producoes", changefreq: "monthly", priority: "0.6" },
  { path: "/lojista", changefreq: "monthly", priority: "0.6" },
  { path: "/colaborar", changefreq: "monthly", priority: "0.5" },
  { path: "/fale-conosco", changefreq: "monthly", priority: "0.5" },
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), `${generateSitemap(entries)}\n`);
console.log(`sitemap.xml written (${entries.length} entries)`);
