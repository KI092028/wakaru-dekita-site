"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * 1セット終えたあとの、次にやることのボタン。
 *
 * ## なぜ共通にするか
 *
 * 「もういちど挑戦する」は20の単元にそれぞれ書いてあった。
 * **同じものが20か所にあると、1つ足したいときに20か所直すことになる。**
 * 実際「たんげんいちらんへ戻れない」が分かったのがこの形で、
 * ここを1か所にしておかないと、次に何か足すときも同じことが起きる。
 *
 * ## 「ほかの たんげんを えらぶ」を必ず出す
 *
 * 終わったところが、行き止まりになっていた。
 * もう一度やるか、ヘッダーから戻るしかない。
 * **終わった直後がいちばん「次はどれにしよう」と思うところ**なので、
 * そこに出口を置く。
 */
export function FinishActions({
  onRestart,
  restartLabel = "もういちど挑戦する",
  children,
}: {
  onRestart: () => void;
  restartLabel?: string;
  /** 単元ごとに、あいだに入れたいボタン（都道府県の「ほかの地方を えらぶ」など） */
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[20rem] flex-col gap-2.5">
      <Button size="lg" onClick={onRestart}>
        {restartLabel}
      </Button>
      {children}
      <Button asChild size="lg" variant="outline">
        <Link href="/learn">ほかの たんげんを えらぶ</Link>
      </Button>
    </div>
  );
}
