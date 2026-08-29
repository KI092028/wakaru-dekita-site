import type { Metadata } from "next";
import Link from "next/link";

import { ClockGame } from "@/components/clock/clock-game";

export const metadata: Metadata = {
  title: "時こく・時間 | わかる・できる",
  description:
    "時計の針を自分で回して、「10時40分の30分後」を通ってみる練習。長い針が12をこえると短い針も次の時に入るので、時のくり上がりが目で見えます。登録不要・完全無料。",
};

export default function TimePage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">時こく・時間</h1>
        <p className="mb-8 text-center text-muted-foreground">
          長い針を 回して、じぶんで 12を またいでみよう。
        </p>
        <ClockGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            「10時40分の30分後」を
            <strong className="font-bold text-foreground">10時70分</strong>
            と答えるつまずきは、60分で1時間くり上がることが、ひっ算のくり上がりと
            結びついていないために起こります。答えを見せるだけでは直りにくいので、
            ここでは針を自分で回して、12をまたぐところを通ってもらいます。
          </p>
          <p className="mt-3">
            短い針は、分に合わせて連続で動かしています。10時40分の短い針は
            10をぴったり指しているのではなく、10と11の間の3分の2のところにあります。
            ここが分かっていないと、12をまたいだときに時が変わったことに気づけません。
          </p>
          <p className="mt-3">
            針は5分きざみで止まります。指先で1分（6度）の精度を出すのは難しく、
            また「5とびで読む」のは2年生で習うやり方そのものだからです。
            文字盤の外がわには、5とびの分を小さく添えてあります。
          </p>
        </div>
      </div>
    </main>
  );
}
