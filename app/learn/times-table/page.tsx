import type { Metadata } from "next";
import Link from "next/link";

import { QuizGame } from "@/components/quiz/quiz-game";

export const metadata: Metadata = {
  title: "九九ドリル | わかる・できる",
  description:
    "小学2〜3年生向けの無料九九ドリル。81マスの九九マップをうめながら、苦手な九九を重点的にれんしゅうできます。",
};

export default function TimesTablePage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">九九</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">2〜3年生向け・81マスの九九マップをうめよう</p>
        <QuizGame title="九九" unit="times-table" />
      </div>
    </main>
  );
}
