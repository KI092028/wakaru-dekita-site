import type { Metadata } from "next";
import Link from "next/link";

import { SakuraGame } from "@/components/sakura/sakura-game";

export const metadata: Metadata = {
  title: "くり上がり・くり下がり（さくらんぼ計算） | わかる・できる",
  description:
    "8+5 や 13−8 を、10のまとまりを作りながら1手ずつ。さくらんぼの図と10のわくで、どちらの数を分けるのかが見えます。登録不要・完全無料。",
};

export default function CarryPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">くり上がり・くり下がり</h1>
        <p className="mb-8 text-center text-muted-foreground">
          10の まとまりを 作って、さくらんぼで 分けよう。
        </p>
        <SakuraGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            <strong className="font-bold text-foreground">
              算数が苦手になる子の、いちばん下の段がここ
            </strong>
            です。8+5 や 13−8 が出てこないままだと、そのあとのひっ算・かけ算・わり算が
            すべて「1けたの計算で止まる」ことになります。
          </p>
          <p className="mt-3">
            つまずきの本体は答えを覚えていないことではなく、
            10のまとまりを作る手が出てこないことです。そして
            <strong className="font-bold text-foreground">
              どちらの数を分けるのかで迷う
            </strong>
            子が多い——たし算では後ろの数を、ひき算では前の数を分けます。
            そこで、分ける数だけを式の中で枠で囲んであります。
          </p>
          <p className="mt-3">
            「あと2で10」は、数だけ言われても1年生には出てきません。
            5×2 のわくに点を置いて、空いている数がそのまま答えになるようにしています。
            教室でブロックを並べてやっていることと同じです。
          </p>
          <p className="mt-3">
            答えを先に聞かず、分ける数を1つずつ埋めてもらいます。
            どの段で止まったかが記録に残るので、
            「10の合成が出ない」のか「最後に10をたし忘れる」のかが分かれます。
          </p>
        </div>
      </div>
    </main>
  );
}
