import type { Metadata } from "next";

import { TensGame } from "@/components/tens/tens-game";

export const metadata: Metadata = {
  title: "10のなかま | わかる・できる",
  description:
    "「7といくつで10？」を、10のわくを見ながら速く。9つしかないので全部おぼえきれます。くり上がり・くり下がりの土台。登録不要・完全無料。",
};

export default function TensPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">10のなかま</h1>
        <p className="mb-8 text-center text-muted-foreground">
          ぜんぶで 9つ。ここが 出れば、くり上がりは できる。
        </p>
        <TensGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            さくらんぼ計算でいちばん止まるのが「8はあといくつで10」の手です。
            ここが出れば くり上がりは通りますし、「10から8をひくと」も同じ知識で解けます。
          </p>
          <p className="mt-3">
            <strong className="font-bold text-foreground">9つしかありません。</strong>
            九九の81マスに対してこれだけなので、
            <strong className="font-bold text-foreground">全部おぼえきれる</strong>
            のが強みです。終わりが見えることは、算数が苦手な子にはそれ自体が大きいので、
            9つのなかまをいつも画面に出しています。
          </p>
          <p className="mt-3">
            「7といくつで10？」（たし算で使う）と「10は7といくつ？」（ひき算で使う）の
            両方を出します。数としては同じですが、出てくる場面がちがうためです。
          </p>
          <p className="mt-3">
            まちがえたときは「10まであと◯たりない」「10を◯こえている」と、
            どちらへ動かせばよいかを返します。
          </p>
        </div>
      </div>
    </main>
  );
}
