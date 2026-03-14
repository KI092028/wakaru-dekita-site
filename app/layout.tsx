import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "わかったできる | 先生向けお助けサイト",
  description: "登録不要ですぐ使える、教員向けのシンプルなお助けツールサイトです。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
