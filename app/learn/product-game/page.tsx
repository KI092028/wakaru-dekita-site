import type { Metadata } from "next";
import Link from "next/link";

import { ProductGame } from "@/components/product/product-game";

export const metadata: Metadata = {
  title: "かけ算じんとり（2人であそぶ） | わかる・できる",
  description:
    "1台を2人で。こまを1つ動かして、2つの数のかけ算の答えのマスを取る。たて・よこ・ななめに4つならべたら勝ち。登録不要・完全無料。",
};

export default function ProductGamePage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">かけ算じんとり</h1>
        <p className="mb-8 text-balance text-center text-muted-foreground">
          1台を 2人で。4つ ならべたら 勝ち。
        </p>
        <ProductGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            このサイトで
            <strong className="font-bold text-foreground">はじめての対戦形式</strong>です。
            2人で1台を回します。教室ならペア、家ならきょうだいや大人と。
          </p>
          <p className="mt-3">
            これまで、ドリルに点数やランクを重ねる形は手応えが出ませんでした。
            点数を抜いても中核（問題を解くこと）が残ってしまうので、
            <strong className="font-bold text-foreground">
              あってもなくても同じ層
            </strong>
            になっていたためです。このゲームは勝敗を抜くと何も残りません。
            そこが今までのものとの違いです。
          </p>
          <p className="mt-3">
            算数として効くのは、
            <strong className="font-bold text-foreground">
              「どのマスを取るか」ではなく「相手に何を渡すか」
            </strong>
            を考えることになる点です。こまは1つしか動かせないので、
            自分が取ったあと、相手が次に取れる範囲が決まってしまいます。
            九九を覚えているだけでは勝てず、逆から考える必要が出ます。
          </p>
          <p className="mt-3">
            盤が6×6なのは偶然ではありません。
            <strong className="font-bold text-foreground">
              1〜9どうしをかけた答えは、ちょうど36通り
            </strong>
            です（60や11のように、九九では出ない数があるためこの数になります）。
            ぴったり埋まるので、余りも足りないところも出ません。
          </p>
          <p className="mt-3">
            はじめの人は、こまを2つ置くだけでマスは取れません。
            ここで取れると先手が有利になりすぎるためです。
          </p>
          <p className="mt-3">
            <strong className="font-bold text-foreground">
              この単元は、端末に何も保存しません。
            </strong>
            勝ち負けを残しても、次にやることが分かるわけではないので。
          </p>
        </div>
      </div>
    </main>
  );
}
