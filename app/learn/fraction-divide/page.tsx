import type { Metadata } from "next";

import { FracDivGame } from "@/components/fracdiv/fracdiv-game";

export const metadata: Metadata = {
  title: "分数のわり算（なぜひっくり返してかけるのか） | わかる・できる",
  description:
    "÷(4/5) は「4でわって5をかける」。二重数直線の上で2手に分けると、ひっくり返してかける理由がそのまま見えます。登録不要・完全無料。",
};

export default function FractionDividePage() {
  return (
    <main className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">分数のわり算</h1>
        <p className="mb-8 text-balance text-center text-muted-foreground">
          分けて、集める。ひっくり返す 理由が 見えるよ。
        </p>
        <FracDivGame />

        <div className="mx-auto mt-10 max-w-lg rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">おうちの方・先生へ</p>
          <p>
            手順は覚えられます。「わる数の分子と分母を入れかえてかける」。
            だから計算はできます。
            <strong className="font-bold text-foreground">
              なぜそうなるのかを聞かれると、誰も答えられません。
            </strong>
          </p>
          <p className="mt-3">
            理由が分からないまま覚えた手順は、かけ算のときにもひっくり返す、
            わられる数のほうをひっくり返す、文章題でわり算だと気づけない、
            という形でこわれます。中学で文字式になると、まとめて分からなくなります。
          </p>
          <p className="mt-3">
            そこで2手に分けます。「4/5mのおもさが6/5kg。1mでは？」なら、
            <strong className="font-bold text-foreground">
              4つに分けて（÷4）、5つ集める（×5）。
            </strong>
            つまり÷(4/5)は「4でわって5をかける」で、1つの式にまとめると×(5/4)です。
            ひっくり返すのは、この2手をまとめた形でしかありません。
          </p>
          <p className="mt-3">
            子どもがやるのは「4等分する」「5つ集める」だけで、
            どちらも3年生から知っている操作です。
            <strong className="font-bold text-foreground">新しいことは何もしていません。</strong>
          </p>
          <p className="mt-3">
            3問目は、わる数が1より大きい仮分数です。
            「分数でわると必ず大きくなる」という新しい思い込みを作らないために入れています。
            4問目はわる数の分子が1で、÷(1/3)が×3になる、
            ひっくり返す意味がいちばんはっきり見える形です。
          </p>
          <p className="mt-3">
            二重数直線は、単位量あたりの大きさ（5年）と同じ見た目にそろえてあります。
            数の組は、わられる数の分子がわる数の分子でわり切れるものだけを使っています。
            1手目が「分子をわる」で済み、理由を見せる前に約分の話が割り込まないようにするためです。
          </p>
        </div>
      </div>
    </main>
  );
}
