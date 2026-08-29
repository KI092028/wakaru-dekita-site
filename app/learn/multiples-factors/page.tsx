import type { Metadata } from "next";
import Link from "next/link";

import { FactorsGame } from "@/components/factors/factors-game";

export const metadata: Metadata = {
  title: "公倍数・公約数 | わかる・できる",
  description:
    "1〜24の盤に2つのしるしを重ねて、公倍数・公約数を目で見つけます。見つけた数はそのまま通分と約分に使います。登録不要・完全無料。",
};

export default function MultiplesFactorsPage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/learn"
          className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground hover:text-foreground"
        >
          ← たんげんいちらんに戻る
        </Link>
        <h1 className="mb-2 text-center text-3xl font-bold">公倍数・公約数</h1>
        <p className="mb-8 text-balance text-center text-muted-foreground">
          しるしを 重ねて、両方に ついた 数を さがそう。
        </p>
        <FactorsGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            この単元は、
            <strong className="font-bold text-foreground">それ自体が目的ではありません。</strong>
            公倍数・公約数だけを取り出して覚えても、子どもには使いどころがないままです。
            実際に要るのは通分（最小公倍数）と約分（最大公約数）のときで、
            そこにつながらないと「習ったけれど何だったか分からない」単元になります。
          </p>
          <p className="mt-3">
            そこで4問のうち後半2問は、盤で見つけた数を
            <strong className="font-bold text-foreground">そのまま分数に使います。</strong>
            前半で見つけ方、後半で何のために見つけたか、という並びです。
          </p>
          <p className="mt-3">
            つまずきは3つあります。
            <strong className="font-bold text-foreground">倍数と約数がごちゃまぜになる</strong>
            こと（どちらも「その数と仲のよい数」に見えます）、
            <strong className="font-bold text-foreground">公倍数と最小公倍数を取りちがえる</strong>
            こと、そして通分のときに
            <strong className="font-bold text-foreground">分母どうしをかけてしまう</strong>ことです。
          </p>
          <p className="mt-3">
            3つ目は答えそのものは合うので見過ごされがちですが、
            分母が大きくなるぶん、たしたあとの約分が重くなります。
            ここで一度「12でよいところを24にしている」と言われるかどうかで、
            6年の分数の計算がだいぶ変わります。この誤答は名前を挙げて返しています。
          </p>
          <p className="mt-3">
            盤のしるしは、色の混ざりだけで区別させていません。
            重なりは枠を二重にして塗りを濃くし、見出しの印と形をそろえてあるので、
            色の見え方に差がある場合でも対応がつきます。
          </p>
        </div>
      </div>
    </main>
  );
}
