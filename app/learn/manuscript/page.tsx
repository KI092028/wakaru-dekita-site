import type { Metadata } from "next";
import Link from "next/link";

import { ManuscriptEditor } from "@/components/manuscript/manuscript-editor";

export const metadata: Metadata = {
  title: "原稿用紙 | わかる・できる",
  description:
    "縦15マス×横20マス（300字づめ）の原稿用紙に、打った文章がそのまま入ります。文字数のカウント、縦書き・横書きの切りかえ、A4での印刷ができます。登録不要・完全無料。",
};

export default function ManuscriptPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-6 print:max-w-none print:px-0">
        <div className="print:hidden">
          <Link
            href="/learn"
            className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← たんげんいちらんに戻る
          </Link>
          <h1 className="mb-2 text-center text-2xl font-bold">原稿用紙</h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            国語・全学年／300字づめ（15行 × 20マス）・A4で印刷できます
          </p>
        </div>
        <ManuscriptEditor />
      </div>
    </main>
  );
}
