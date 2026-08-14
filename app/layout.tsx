import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const siteName = "わかる・できる";
const title = "わかる・できる | 小学生向け算数の練習サイト";
const description =
  "小学校の算数を学年・単元ごとに練習できる無料サイト。ひっ算や分度器は1手ずつ進めるので、どこでつまずいたのかが分かります。登録不要・完全無料。";

export const metadata: Metadata = {
  metadataBase: new URL("https://wakaru-dekita-site.com"),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName,
    title,
    description,
    url: "/",
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/ogp.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
