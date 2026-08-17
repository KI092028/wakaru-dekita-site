import type { Metadata } from "next";

import { GeoGame } from "@/components/geo/geo-game";

export const metadata: Metadata = {
  title: "県庁所在地 | わかる・できる",
  description:
    "「盛岡市はどこの県庁所在地？」を白地図の上でさがすゲーム。県名とちがう18県だけを出します。おしいときは方角が返ります。登録不要・完全無料。",
};

export default function CapitalsPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">県庁所在地</h1>
        <p className="mb-8 text-center text-muted-foreground">
          町の 名前が 出るので、どこの 県か 地図で さがそう。
        </p>
        <GeoGame mode="capital" />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            出題するのは、県庁所在地の名前が都道府県名とちがう
            <strong className="font-bold text-foreground">18の道府県だけ</strong>
            です。同じ名前の29県を混ぜると、半分以上が「県名をそのまま言えばよい問題」になり、
            覚えるところを練習しないまま正解が積み上がってしまうためです。
          </p>
          <p className="mt-3">
            記録は都道府県のゲームとは別に持っています。県の位置は分かっていても
            県庁所在地は言えない、ということは普通に起こるので、
            混ぜるとどちらを覚えたのか分からなくなるからです。
          </p>
          <p className="mt-3">
            白地図は
            <a
              href="https://github.com/VictorCazanave/svg-maps"
              className="mx-1 underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noreferrer noopener"
            >
              svg-maps/japan
            </a>
            （CC BY 4.0）を利用しています。
          </p>
        </div>
      </div>
    </main>
  );
}
