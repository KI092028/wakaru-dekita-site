import type { Metadata } from "next";
import Link from "next/link";

import { ColumnGame } from "@/components/column/column-game";

export const metadata: Metadata = {
  title: "たし算・ひき算のひっ算 | わかる・できる",
  description:
    "小学2〜3年生向け、たし算とひき算のひっ算を無料でれんしゅうできます。くり上がりの1を書く手、となりから借りる手を1手ずつ進めるので、どこでつまずいているかが分かります。",
};

export default function ColumnAddSubPage() {
  return (
    <main className="flex-1 bg-muted/30 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/learn" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-2xl font-bold">たし算・ひき算のひっ算</h1>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          2〜3年生向け・くり上がりと くり下がりを 1手ずつ
        </p>
        <ColumnGame mode="integer" />
      </div>
    </main>
  );
}
