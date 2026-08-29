import type { Metadata } from "next";
import Link from "next/link";

import { RomajiGame } from "@/components/romaji/romaji-game";

export const metadata: Metadata = {
  title: "ローマ字 | わかる・できる",
  description:
    "かなを見てローマ字で打つ練習。訓令式（si）もヘボン式（shi）も正解にして、学校でならうのはどちらかを伝えます。46字の表つき。登録不要・完全無料。",
};

export default function RomajiPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">ローマ字</h1>
        <p className="mb-8 text-balance text-center text-muted-foreground">
          ぼいんと しいんを 組み合わせて、46字を おぼえよう。
        </p>
        <RomajiGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            ローマ字でいちばん子どもを混乱させるのは、
            <strong className="font-bold text-foreground">書き方が2通りあること</strong>です。
            学校でならうのは訓令式（si・ti・tu・hu）ですが、
            駅名の看板もパスポートもローマ字入力もヘボン式（shi・chi・tsu・fu）で、
            子どもは毎日その両方を目にしています。
          </p>
          <p className="mt-3">
            「し」を shi と書いて✕をもらうと、
            <strong className="font-bold text-foreground">
              どちらも正しいのに間違いだと思ってしまいます。
            </strong>
            ここでは両方を正解にしたうえで、「学校では si をならう」と1行そえています。
            消すべきなのは書き方の片方ではなく、混乱のほうだと考えています。
          </p>
          <p className="mt-3">
            キーボードは、上の段が母音（a i u e o）、下が子音という並びにしてあります。
            ローマ字が「子音＋母音」でできていることが、押すたびに目に入るようにするためです。
            ローマ字に使わない字（q や x）は出していません。
          </p>
          <p className="mt-3">
            下の表は九九の81マスと同じ考え方で、同じ字を2回続けて書けると色がつきます。
            <strong className="font-bold text-foreground">ぜんぶで46字しかない</strong>
            と分かっていることに意味があります。
          </p>
          <p className="mt-3">
            いまのところ清音46字だけです。濁音・半濁音・拗音（きゃ）・促音（がっこう）は
            まだ入れていません。まず「子音＋母音」の形をつかむところまでを扱っています。
          </p>
        </div>
      </div>
    </main>
  );
}
