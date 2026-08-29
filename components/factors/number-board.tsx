"use client";

import { cn } from "@/lib/utils";
import { BOARD_COLUMNS, type FactorKind } from "@/lib/factors/plan";

/**
 * 1〜24 を並べた盤。
 *
 * ## しるしを重ねる
 *
 * 片方の倍数（約数）に しるしを つけ、そのうえで もう片方に つける。
 * **両方に ついた 数**が公倍数（公約数）。
 * 別々の盤に描くと「重なり」が見えないので、1つの盤に重ねる。
 *
 * 重なりは色を混ぜるのではなく、**枠を二重にして塗りを濃くする。**
 * 色の混ざりだけで区別させると、色の見え方に差がある子に伝わらない。
 * 見出しの丸としるしの形もそろえてあるので、色が分からなくても対応がつく。
 */

type Props = {
  max: number;
  /** 1つ目の数につけたしるし */
  markedA: number[];
  /** 2つ目の数につけたしるし */
  markedB: number[];
  kind: FactorKind;
  /** 押せる数。null なら押せない */
  onTap?: (n: number) => void;
  /** 強調する数（えらんだ答え） */
  highlight?: number | null;
};

export function NumberBoard({ max, markedA, markedB, kind, onTap, highlight = null }: Props) {
  return (
    <div
      className="mx-auto grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${BOARD_COLUMNS}, minmax(0, 1fr))`, maxWidth: "22rem" }}
      role="group"
      aria-label={`1から${max}までの数の盤`}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const inA = markedA.includes(n);
        const inB = markedB.includes(n);
        const both = inA && inB;
        const chosen = highlight === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onTap?.(n)}
            disabled={onTap === undefined}
            aria-pressed={inA || inB}
            aria-label={`${n}${both ? `（両方の${kind === "multiple" ? "倍数" : "約数"}）` : ""}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg border-2 text-base font-bold tabular-nums transition-colors",
              "disabled:cursor-default",
              both
                ? "border-success bg-success/25 text-success ring-2 ring-success ring-offset-1"
                : inA
                  ? "border-primary bg-primary/15 text-primary"
                  : inB
                    ? "border-secondary bg-secondary/15 text-secondary"
                    : "border-border bg-background text-muted-foreground",
              chosen && "scale-110 border-success bg-success text-white ring-2",
              onTap !== undefined && !both && "hover:border-primary"
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

/** 盤の見方。どの色が何なのかを、数字といっしょに出す。 */
export function BoardLegend({
  a,
  b,
  kind,
  showBoth,
}: {
  a: number;
  b: number;
  kind: FactorKind;
  showBoth: boolean;
}) {
  const word = kind === "multiple" ? "倍数" : "約数";
  const chip = "inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-bold";
  return (
    <div className="mb-3 flex flex-wrap justify-center gap-2">
      <span className={cn(chip, "border-primary bg-primary/15 text-primary")}>
        {a}の{word}
      </span>
      <span className={cn(chip, "border-secondary bg-secondary/15 text-secondary")}>
        {b}の{word}
      </span>
      {showBoth && (
        <span className={cn(chip, "border-success bg-success/25 text-success")}>
          両方＝公{word}
        </span>
      )}
    </div>
  );
}
