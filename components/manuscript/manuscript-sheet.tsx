"use client";

import { cn } from "@/lib/utils";
import { COLUMNS, ROWS, type Layout, type Orientation, type Sheet } from "@/lib/manuscript/layout";

/**
 * 原稿用紙の1枚。縦15マス × 横20マス。
 *
 * SVG で描いている。**A4に印刷したときのマスの大きさをそろえたい**ので、
 * 画面の幅に合わせて伸び縮みする文字組みではなく、比率の決まった図にしてある。
 *
 * 縦書きのときは、行が右から左へ進む。マスの並びそのものは同じで、
 * どの行がどの列になるかだけが変わる。
 */

type Props = {
  sheet: Sheet;
  layout: Layout;
  orientation: Orientation;
  /** 何枚目か（1から） */
  index: number;
  total: number;
};

/**
 * 縦書きのときに、90度まわして書く字。
 * 長音符（ー）を立てたままにすると、縦書きでは「｜」に見えず読めない。
 */
const ROTATE_WHEN_VERTICAL = "ー〜～―－…‥";

/** マス1つの大きさ。A4に置いたときにおよそ9mmになる比率 */
const CELL = 10;
const GAP = 1.2;
const PAD = 6;

export function ManuscriptSheet({ sheet, layout, orientation, index, total }: Props) {
  const vertical = orientation === "vertical";
  // 紙の上では、いつも横20マス × 縦15マス
  const width = COLUMNS * CELL + PAD * 2;
  const height = ROWS * CELL + PAD * 2;

  return (
    <figure className="wd-sheet">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full"
        role="img"
        aria-label={`原稿用紙 ${index}まい目（ぜんぶで ${total}まい）`}
      >
        <rect x={0} y={0} width={width} height={height} className="fill-white" />

        {sheet.lines.map((line, lineIndex) =>
          line.map((cell, cellIndex) => {
            // 縦書きは、行が右から左へ。行番号がそのまま右からの列になる
            const col = vertical ? COLUMNS - 1 - lineIndex : cellIndex;
            const row = vertical ? cellIndex : lineIndex;
            const x = PAD + col * CELL;
            const y = PAD + row * CELL;

            return (
              <g key={`${lineIndex}-${cellIndex}`}>
                <rect
                  x={x + GAP / 2}
                  y={y + GAP / 2}
                  width={CELL - GAP}
                  height={CELL - GAP}
                  className="fill-none stroke-muted-foreground/50"
                  strokeWidth={0.3}
                />
                {cell.char !== null && (
                  <text
                    x={x + CELL / 2}
                    y={y + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={cell.hung ? CELL * 0.5 : CELL * 0.72}
                    className="fill-foreground"
                    transform={
                      vertical && cell.hung === null && ROTATE_WHEN_VERTICAL.includes(cell.char)
                        ? `rotate(90 ${x + CELL / 2} ${y + CELL / 2})`
                        : undefined
                    }
                  >
                    {cell.hung ? `${cell.char}${cell.hung}` : cell.char}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      <figcaption className="mt-1 text-center text-[10px] text-muted-foreground print:mt-0.5">
        {index} / {total} まい目（{layout.lineCount}行 × {layout.lineLength}マス・
        {orientation === "vertical" ? "縦書き" : "横書き"}）
      </figcaption>
    </figure>
  );
}

/** 画面に出す全部の枚数。印刷では1枚ずつページを分ける。 */
export function ManuscriptSheets({
  layout,
  orientation,
}: {
  layout: Layout;
  orientation: Orientation;
}) {
  return (
    <div className={cn("space-y-6 print:space-y-0")}>
      {layout.sheets.map((sheet, i) => (
        <div key={i} className="wd-sheet-page">
          <ManuscriptSheet
            sheet={sheet}
            layout={layout}
            orientation={orientation}
            index={i + 1}
            total={layout.sheets.length}
          />
        </div>
      ))}
    </div>
  );
}
