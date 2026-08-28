import type { Metadata } from "next";

import { TriGame } from "@/components/tri/tri-game";

export const metadata: Metadata = {
  title: "三角形・平行四辺形の面積 | わかる・できる",
  description:
    "なぜ÷2なのか、高さはどこか。図を切ってうつす・回してつける操作から公式を出します。高さが底辺の外に出る三角形も扱います。登録不要・完全無料。",
};

export default function TriangleAreaPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">三角形・平行四辺形の面積</h1>
        <p className="mb-8 text-balance text-center text-muted-foreground">
          切って うつす。回して つける。公式は そのあとで 出てくるよ。
        </p>
        <TriGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            この単元のつまずきは2つあります。
            <strong className="font-bold text-foreground">なぜ÷2なのか分からない</strong>
            こと（だから三角形で忘れ、平行四辺形では要らないのに付けてしまう）と、
            <strong className="font-bold text-foreground">高さがどこか分からない</strong>
            こと（ななめの辺を高さにして計算してしまう）です。
          </p>
          <p className="mt-3">
            公式を書かせても直らないのは、
            <strong className="font-bold text-foreground">公式が「動かした結果」だから</strong>
            です。動かすところを飛ばして結果だけ渡しているので、
            動かし方を知らない子には覚える手がかりがありません。
          </p>
          <p className="mt-3">
            そこで、平行四辺形を先に置いています。左のはしを切って右へうつすと長方形になり、
            面積は変わらないので「底辺×高さ」。そのうえで三角形は、同じものをもう1つ回してつけると
            平行四辺形になるので、その半分。
            <strong className="font-bold text-foreground">
              この順番は入れかえられません。
            </strong>
            ÷2は、平行四辺形が底辺×高さだと分かってはじめて意味を持つからです。
          </p>
          <p className="mt-3">
            3問目は
            <strong className="font-bold text-foreground">高さが底辺の外に出る三角形</strong>
            です。底辺を点線でのばしてから高さを下ろす形を、直角のしるしつきで見せています。
            ここは教科書でも1ページで通りすぎるところですが、
            つまずいたまま6年へ進む子が多い場所です。
          </p>
          <p className="mt-3">
            4問目は、底辺と高さをそのままに頂点だけを横へ動かします。
            ななめの辺はどんどん長くなるのに、
            <strong className="font-bold text-foreground">面積の数は動きません。</strong>
            「ななめの辺は面積に関係ない」——つまり「あれは高さではない」を、
            言葉ではなく目で確かめてもらうためのものです。
          </p>
          <p className="mt-3">
            なお、図はどれもななめの辺が5cmになる形（3・4・5）にしてあります。
            そうすると「底辺×5÷2」というよくある誤答が整数で出るので、
            その数を打った子に「5cmはななめの辺だね」と名前を挙げて返せます。
          </p>
        </div>
      </div>
    </main>
  );
}
