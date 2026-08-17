import type { Metadata } from "next";

import { RoundGame } from "@/components/round/round-game";

export const metadata: Metadata = {
  title: "がい数（四捨五入） | わかる・できる",
  description:
    "「百の位までのがい数」で、どの位を見ればよいかを自分でタップして決める練習。位の名前を数字のすぐ下に置いてあります。登録不要・完全無料。",
};

export default function RoundingPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">がい数（四捨五入）</h1>
        <p className="mb-8 text-center text-muted-foreground">
          四捨五入で 見る位を、じぶんで さがそう。
        </p>
        <RoundGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            この単元のつまずきは計算ではなく、
            <strong className="font-bold text-foreground">どの位を見ればよいかが決まらない</strong>
            ことです。「百の位までのがい数に」と言われて百の位を四捨五入してしまう——
            見るのはその1つ下、十の位のほうです。
          </p>
          <p className="mt-3">
            そこで、答えを打つ前に見る位を自分でタップしてもらいます。
            ここを外したまま先へ進むと切り上げ・切り捨ても答えも全部ずれるので、
            この手を独立させると、どこで間違えたのかが分かれます。
          </p>
          <p className="mt-3">
            「上から2けたのがい数」は位の名前が出てこないぶんさらに難しいので、
            後半の2問に置いています。また「5は切り上げ」は数の大小からは出てこない
            約束ごとなので、見る位がちょうど5になる問題を毎回1問入れています。
          </p>
        </div>
      </div>
    </main>
  );
}
