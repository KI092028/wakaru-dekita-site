import type { Metadata } from "next";
import Link from "next/link";

import { QuizApp } from "@/components/quiz/quiz-app";

export const metadata: Metadata = {
  title: "九九ドリル | わかる・できる",
  description: "小学2〜3年生向け、1の段から9の段までの九九をれんしゅうできる無料ドリルです。",
};

export default function TimesTablePage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">九九</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">2〜3年生向け・1の段〜9の段</p>
        <QuizApp title="九九" unit="times-table" />
      </div>
    </main>
  );
}
