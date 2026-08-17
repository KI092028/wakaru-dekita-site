import type { Metadata } from "next";

import { TimesMeaningGame } from "@/components/times/times-game";

export const metadata: Metadata = {
  title: "かけ算の意味（1つ分といくつ分） | わかる・できる",
  description:
    "九九は言えるのに文章題で式が立てられない、を正面から。絵から「1つ分」と「いくつ分」をとり出して式を作ります。登録不要・完全無料。",
};

export default function TimesMeaningPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">かけ算の意味</h1>
        <p className="mb-8 text-center text-muted-foreground">
          絵から「1つ分」と「いくつ分」を さがして、式を つくろう。
        </p>
        <TimesMeaningGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            <strong className="font-bold text-foreground">
              九九は言えるのに、文章題になると式が立てられない
            </strong>
            ——算数が苦手な子のいちばん多い訴えです。原因は計算力ではなく、
            かけ算が「1つ分の数」と「いくつ分」のかけ合わせだと分かっていないことにあります。
          </p>
          <p className="mt-3">
            九九を先に覚えると、この意味が抜けたまま先へ進めてしまいます。
            ひっ算もわり算も手順だけで乗り切れるので、文章題になったところで初めて止まります。
          </p>
          <p className="mt-3">
            そこで
            <strong className="font-bold text-foreground">答えを最後に聞きます。</strong>
            先に「ぜんぶでいくつ」を聞くと、数えて出せてしまい、
            かけ算を使わずに終わってしまうためです。式は、子どもが埋めた2つの数から
            組み立てて見せています。
          </p>
          <p className="mt-3">
            最後の問題では、1つ分といくつ分を入れかえた絵を並べて出します。
            「3こずつ4さら」と「4こずつ3さら」はどちらも12ですが、絵はまったく別のものになります。
            ここが分かると、文章題でどちらの数が「1つ分」なのかを読み取れるようになります。
          </p>
          <p className="mt-3">
            なお、式の順序（3×4 か 4×3 か）は
            <strong className="font-bold text-foreground">正誤の判定に使っていません。</strong>
            表示は教科書に合わせて「1つ分の数 × いくつ分」の順にしていますが、
            ここで問いたいのは順序ではなく、2つの数がそれぞれ何を表しているかだからです。
          </p>
        </div>
      </div>
    </main>
  );
}
