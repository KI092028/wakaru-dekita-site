import type { Metadata } from "next";
import Link from "next/link";

import { AreaGame } from "@/components/area/area-game";

export const metadata: Metadata = {
  title: "面積と周りの長さ | わかる・できる",
  description:
    "面積と周りの長さを取りちがえる、を直す単元。まわりの長さは「ふちをなぞる」、面積は「マスを数える」。同じ周りの長さでも面積が変わることを動かして確かめます。登録不要・完全無料。",
};

export default function AreaPerimeterPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">面積と周りの長さ</h1>
        <p className="mb-8 text-center text-muted-foreground">
          まわりの長さは ふちを なぞる。面積は 中の マスを 数える。
        </p>
        <AreaGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            <strong className="font-bold text-foreground">
              面積と周りの長さを取りちがえる
            </strong>
            のは、4年でいちばん多いつまずきのひとつです。「たて×よこ」だったか
            「（たて＋よこ）×2」だったかを思い出せない、という形で出ます。
            式を覚え直させても、次の週にはまた入れかわります。
          </p>
          <p className="mt-3">
            入れかわるのは、
            <strong className="font-bold text-foreground">2つが別の量だと分かっていない</strong>
            からです。どちらも「長方形の大きさを表す数」に見えているので、
            どちらの式でも通りそうに感じてしまいます。
          </p>
          <p className="mt-3">
            そこで、やることを分けました。
            <strong className="font-bold text-foreground">まわりの長さは、ふちを指でなぞります。</strong>
            4本の辺を順にタップすると長さがたされていき、1周してはじめて数が出ます。
            2辺だけで決定を押すと、なぞれていない辺が灰色のまま残ります——
            「たて＋よこ」で止まる誤りを、その場でつかまえるためです。
            面積のほうは、方眼のマスを数えます。手の動きが違うので、
            式を思い出せなくても取りちがえようがありません。
          </p>
          <p className="mt-3">
            後半の2問は、片方を止めたままもう片方を動かします。たとえば周りの長さを
            20cmに固定したまま形を変えると、面積は9cm²（1×9）から25cm²（5×5）まで変わります。
            <strong className="font-bold text-foreground">
              同じ周りの長さでも、面積は同じになりません。
            </strong>
            できたあとに全部の形を表で並べているので、
            「正方形に近いほど面積は大きく、周りの長さは短い」が見えます。
          </p>
          <p className="mt-3">
            なお1〜2問目は、必ず「2問目のほうが周りの長さは長いのに面積は小さい」
            組み合わせになるようにしてあります。適当な長方形を2つ出しても
            この関係になるとは限らず、いちばん見せたいことが出たり出なかったりするためです。
          </p>
        </div>
      </div>
    </main>
  );
}
