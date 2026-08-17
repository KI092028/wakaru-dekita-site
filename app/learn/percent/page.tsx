import type { Metadata } from "next";

import { PercentGame } from "@/components/percent/percent-game";

export const metadata: Metadata = {
  title: "割合・百分率 | わかる・できる",
  description:
    "5年生の割合を、式ではなく数直線で。もとにする量を自分で見つけ、その上に100%を置くと割合の目もりが生まれます。「10%増量」が100%より右にあることも目で見えます。登録不要・完全無料。",
};

export default function PercentPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">割合・百分率</h1>
        <p className="mb-8 text-center text-muted-foreground">
          式は 書かないよ。もとにする量を さがして、その上に 100% を 置こう。
        </p>
        <PercentGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            この単元では、公式（くらべる量 ÷ もとにする量）を使わせていません。
            つまずきの本体は計算ではなく、
            <strong className="font-bold text-foreground">
              どれが「もとにする量」なのかを文から決められないこと
            </strong>
            だからです。
          </p>
          <p className="mt-3">
            割合の目もりは、100% を置くまで数直線に出てきません。
            割合が「はじめから紙に書いてある目もり」ではなく、
            もとにする量を決めたことで生まれる目もりであることを、操作の順序で見せています。
          </p>
          <p className="mt-3">
            また、線はもとにする量より長くとってあります。
            「10%増量」が 100% の右にあることを目で確かめられるようにするためです。
            令和7年度の全国学力・学習状況調査では、この「10%増量」の意味を問う設問の正答率が
            41.3% で、誤答には「0.1倍」「10倍」が並んでいました。
          </p>
        </div>
      </div>
    </main>
  );
}
