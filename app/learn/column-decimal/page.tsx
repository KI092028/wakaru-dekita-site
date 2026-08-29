import type { Metadata } from "next";
import Link from "next/link";

import { ColumnGame } from "@/components/column/column-game";

export const metadata: Metadata = {
  title: "小数のたし算・ひき算のひっ算 | わかる・できる",
  description:
    "小学4年生向け、小数のたし算・ひき算のひっ算を無料でれんしゅうできます。けたをそろえて0を書き足す、答えの小数点を打つ、という手順を1手ずつ進められます。",
};

export default function ColumnDecimalPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">小数のたし算・ひき算</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          4年生向け・けたをそろえて、小数点を たてに そろえる
        </p>
        <ColumnGame mode="decimal" />
      </div>
    </main>
  );
}
