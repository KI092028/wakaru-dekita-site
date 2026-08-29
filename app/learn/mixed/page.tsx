import type { Metadata } from "next";
import Link from "next/link";

import { MixedGame } from "@/components/mixed/mixed-game";

export const metadata: Metadata = {
  title: "仮分数・帯分数 | わかる・できる",
  description:
    "7/3 と 2と1/3 が同じ大きさであることを、帯の図で確かめながら変換する練習。どちらの向きも同じ絵で見ます。登録不要・完全無料。",
};

export default function MixedPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">仮分数・帯分数</h1>
        <p className="mb-8 text-center text-muted-foreground">
          帯を 見ながら、同じ 大きさに 書きかえよう。
        </p>
        <MixedGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            手順（分子÷分母、整数×分母＋分子）を覚えること自体は難しくありません。
            難しいのは
            <strong className="font-bold text-foreground">
              その手順が何をしているのかが見えないこと
            </strong>
            です。「7÷3 の商が 2」と言われても、なぜ商が整数部分になるのかは分かりません。
          </p>
          <p className="mt-3">
            そこで、1 を分母の数に分けた帯を並べ、分子のぶんだけ色をつけています。
            まるごと塗れた帯の本数がそのまま整数部分、残りが分数部分です。
            <strong className="font-bold text-foreground">
              仮分数→帯分数でも、帯分数→仮分数でも図はまったく同じ
            </strong>
            にしてあります。向きが違うだけで見ているものは1つだ、と分かるようにするためです。
          </p>
          <p className="mt-3">
            出題は両方向を毎回2問ずつ通します。仮分数から帯分数にはできても
            逆はできない、ということが普通に起こるためです。
          </p>
        </div>
      </div>
    </main>
  );
}
