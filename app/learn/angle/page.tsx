import type { Metadata } from "next";
import Link from "next/link";

import { AngleGame } from "@/components/protractor/angle-game";

export const metadata: Metadata = {
  title: "角の大きさ（分度器） | わかる・できる",
  description:
    "小学4年生向け、分度器の使い方を無料でれんしゅうできます。中心を頂点に合わせる、0を辺に合わせる、目もりを読む、の3つを1手ずつ。内側と外側の目もりの読み違いをその場で指摘します。",
};

export default function AnglePage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">角の大きさ</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          4年生向け・分度器を 自分で 当てて はかる
        </p>
        <AngleGame />
      </div>
    </main>
  );
}
