"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { partStartColumn, type DivisionPlan } from "@/lib/division/plan";
import type { Step, StepKind } from "@/lib/division/steps";

/**
 * わり算のひっ算そのもの。
 *
 * 進んだところまでしか書かない。完成した式を見せて埋めさせるのではなく、
 * 1手ずつ自分で書き足していく形にすることで、手順そのものが身につくようにしている。
 */

type Props = {
  plan: DivisionPlan;
  steps: Step[];
  stepIndex: number;
  /** いま打っている途中の数字 */
  input: string;
  /** 間違えて止まっている状態か */
  wrong: boolean;
  onColumnTap: (column: number) => void;
};

/**
 * 1マスの大きさ。**押せるマス（商を立てる・おろす）と同じ大きさにそろえる。**
 * ひっ算はけたをそろえて見せるものなので、押せるマスだけ大きくはできない。
 * 40px では指で押せないので、列の幅とあわせて 44px にしてある。
 */
const CELL = "flex h-11 items-center justify-center text-2xl font-bold tabular-nums";

/** 数を、右端が endCol になるように桁へ割り付ける。 */
function digitsAt(value: number, endCol: number): Record<number, string> {
  const text = String(value);
  const out: Record<number, string> = {};
  for (let i = 0; i < text.length; i++) out[endCol - text.length + 1 + i] = text[i];
  return out;
}

function Cell({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn(CELL, className)}>{children}</span>;
}

/** 入力中・誤答の見せ方は3単元のドリルとそろえる。 */
function Pending({ input, wrong }: { input: string; wrong: boolean }) {
  if (wrong) return <span className="text-danger line-through decoration-2">{input}</span>;
  return (
    <span className={cn("text-primary", input === "" && "text-muted-foreground/40")}>
      {input === "" ? "?" : input}
    </span>
  );
}

export function DivisionBoard({ plan, steps, stepIndex, input, wrong, onColumnTap }: Props) {
  const columns = plan.digits.map((_, i) => i);
  const current: Step | undefined = steps[stepIndex];

  const indexOf = (kind: StepKind, rungIndex: number) =>
    steps.findIndex((s) => s.kind === kind && s.rungIndex === rungIndex);
  const done = (kind: StepKind, rungIndex: number) => {
    const i = indexOf(kind, rungIndex);
    return i !== -1 && i < stepIndex;
  };
  const isCurrent = (kind: StepKind, rungIndex: number) =>
    current?.kind === kind && current.rungIndex === rungIndex;

  const choosingStart = current?.kind === "start";
  const bringingDown = current?.kind === "bringDown";

  return (
    <div
      className="mx-auto grid w-fit"
      style={{ gridTemplateColumns: `auto repeat(${plan.digits.length}, 2.75rem)` }}
    >
      {/* 商の行 */}
      <Cell />
      {columns.map((col) => {
        const rungIndex = plan.rungs.findIndex((rung) => rung.position === col);
        const rung = rungIndex === -1 ? null : plan.rungs[rungIndex];

        let content: ReactNode = null;
        if (rung && done("quotient", rungIndex)) content = rung.quotient;
        else if (rung && isCurrent("quotient", rungIndex))
          content = <Pending input={input} wrong={wrong} />;

        if (choosingStart) {
          return (
            <button
              key={`q-${col}`}
              type="button"
              onClick={() => onColumnTap(col)}
              className={cn(
                CELL,
                "rounded-t-lg border-2 border-dashed border-primary/60 text-primary/50",
                "transition-colors hover:bg-primary/10"
              )}
              aria-label={`${col + 1}けた目に 商を立てる`}
            >
              ?
            </button>
          );
        }

        return (
          <Cell key={`q-${col}`} className={rung && isCurrent("quotient", rungIndex) ? "rounded-t-lg bg-primary/10" : undefined}>
            {content}
          </Cell>
        );
      })}

      {/* わられる数の行。上の線と左のたて線でひっ算の形をつくる */}
      <Cell className="pr-1.5">{plan.divisor}</Cell>
      {columns.map((col) => {
        const highlighted = current !== undefined && current.rungIndex === 0 && col <= plan.startPosition;

        if (bringingDown) {
          return (
            <button
              key={`d-${col}`}
              type="button"
              onClick={() => onColumnTap(col)}
              className={cn(
                CELL,
                "border-t-2 border-foreground transition-colors hover:bg-primary/10",
                col === 0 && "border-l-2",
                "text-primary underline decoration-dashed underline-offset-4"
              )}
              aria-label={`${col + 1}けた目の ${plan.digits[col]} を おろす`}
            >
              {plan.digits[col]}
            </button>
          );
        }

        return (
          <Cell
            key={`d-${col}`}
            className={cn(
              "border-t-2 border-foreground",
              col === 0 && "border-l-2",
              highlighted && "bg-primary/10"
            )}
          >
            {plan.digits[col]}
          </Cell>
        );
      })}

      {/* 段ごとに「かけた数」と「ひいたのこり」の2行 */}
      {plan.rungs.map((rung, rungIndex) => {
        // まだ来ていない段は場所も取らない。紙のひっ算と同じように下へ伸びていく
        const started = stepIndex >= indexOf("quotient", rungIndex);
        if (!started) return null;

        const partStart = partStartColumn(rung);
        const showProduct = done("multiply", rungIndex) || isCurrent("multiply", rungIndex);
        const productDigits = digitsAt(rung.product, rung.position);
        const remainderDigits = digitsAt(rung.remainder, rung.position);
        const highlightPart = current !== undefined && current.rungIndex === rungIndex + 1;

        return (
          <div key={`rung-${rungIndex}`} className="contents">
            {/* かけた数 */}
            <Cell className="pr-1.5 text-muted-foreground">
              {showProduct && partStart === 0 ? "−" : ""}
            </Cell>
            {columns.map((col) => {
              const inSubtractionLine = col >= partStart && col <= rung.position;
              const underline = done("multiply", rungIndex) && inSubtractionLine;

              let content: ReactNode = null;
              if (col === partStart - 1 && showProduct) content = <span className="text-muted-foreground">−</span>;
              else if (done("multiply", rungIndex)) content = productDigits[col] ?? null;
              else if (isCurrent("multiply", rungIndex))
                content = col === rung.position ? <Pending input={input} wrong={wrong} /> : null;

              return (
                <Cell key={`p-${rungIndex}-${col}`} className={cn(underline && "border-b-2 border-foreground")}>
                  {content}
                </Cell>
              );
            })}

            {/* ひいたのこり ＋ 下ろした数字 */}
            <Cell />
            {columns.map((col) => {
              let content: ReactNode = null;
              if (done("subtract", rungIndex)) content = remainderDigits[col] ?? null;
              else if (isCurrent("subtract", rungIndex))
                content = col === rung.position ? <Pending input={input} wrong={wrong} /> : null;

              if (
                rung.bringDownDigit !== null &&
                col === rung.position + 1 &&
                done("bringDown", rungIndex)
              ) {
                content = <span className="text-primary">{rung.bringDownDigit}</span>;
              }

              const inPart =
                highlightPart &&
                col >= rung.position && // のこり
                col <= rung.position + (rung.bringDownDigit !== null ? 1 : 0);

              return (
                <Cell
                  key={`r-${rungIndex}-${col}`}
                  className={cn(inPart && content !== null && "rounded bg-primary/10")}
                >
                  {content}
                </Cell>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
