"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { borrowedValue, type ColumnPlan } from "@/lib/column/plan";
import type { ColumnStep, ColumnStepKind } from "@/lib/column/steps";

/**
 * たし算・ひき算のひっ算の盤面。
 *
 * 進んだところまでしか書かない。完成した式を見せて埋めさせるのではなく、
 * 1手ずつ自分で書き足していく形にすることで、手順そのものが身につくようにしている。
 *
 * いちばん上の行は、たし算では「くり上がりの1」、ひき算では「借りたあとの数」が入る。
 * 紙のひっ算で同じ場所に書くものなので、行を分けていない。
 */

type Props = {
  plan: ColumnPlan;
  steps: ColumnStep[];
  stepIndex: number;
  /** いま打っている途中の数字 */
  input: string;
  /** 間違えて止まっている状態か */
  wrong: boolean;
  onColumnTap: (index: number) => void;
};

const CELL = "flex h-10 items-center justify-center text-2xl font-bold tabular-nums";

function Cell({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={cn(CELL, className)}>{children}</span>;
}

/** 入力中・誤答の見せ方は他の単元とそろえる。 */
function Pending({ input, wrong }: { input: string; wrong: boolean }) {
  if (wrong) return <span className="text-danger line-through decoration-2">{input}</span>;
  return (
    <span className={cn("text-primary", input === "" && "text-muted-foreground/40")}>
      {input === "" ? "?" : input}
    </span>
  );
}

export function ColumnBoard({ plan, steps, stepIndex, input, wrong, onColumnTap }: Props) {
  // 左から右へ並べるので、位の大きい方から
  const order = plan.columns.map((c) => c.index).reverse();
  const current: ColumnStep | undefined = steps[stepIndex];

  const find = (kind: ColumnStepKind, index: number) =>
    steps.findIndex((s) => s.kind === kind && s.index === index);
  const done = (kind: ColumnStepKind, index: number) => {
    const i = find(kind, index);
    return i !== -1 && i < stepIndex;
  };
  const isCurrent = (kind: ColumnStepKind, index: number) =>
    current?.kind === kind && current.index === index;

  const choosingCarry = current?.kind === "carry";

  return (
    <div
      className="mx-auto grid w-fit"
      style={{ gridTemplateColumns: `auto repeat(${plan.width}, 2.5rem)` }}
    >
      {/* くり上がり・くり下がりを書く行 */}
      <Cell />
      {order.map((col) => {
        // この位の上に入るのは、右どなりの位から送られてきたもの
        const carryDone = plan.op === "+" && done("carry", col - 1);
        const borrowDone = plan.op === "−" && col >= 1 && done("borrow", col - 1);

        if (choosingCarry) {
          return (
            <button
              key={`m-${col}`}
              type="button"
              onClick={() => onColumnTap(col)}
              className={cn(
                CELL,
                "rounded-lg border-2 border-dashed border-primary/60 text-base text-primary/50",
                "transition-colors hover:bg-primary/10"
              )}
              aria-label={`${col + 1}けた目の上に くり上がりを書く`}
            >
              1
            </button>
          );
        }

        let content: ReactNode = null;
        if (carryDone) content = <span className="text-base text-primary">1</span>;
        else if (borrowDone) content = <span className="text-base text-primary">{borrowedValue(plan, col - 1)}</span>;
        else if (plan.op === "−" && isCurrent("borrow", col - 1))
          content = (
            <span className="text-base">
              <Pending input={input} wrong={wrong} />
            </span>
          );

        return <Cell key={`m-${col}`}>{content}</Cell>;
      })}

      {/* 上の数。借りた位は取り消し線を引く（紙で消すのと同じ） */}
      <Cell />
      {order.map((col) => {
        const lent = plan.op === "−" && plan.columns[col].lent && done("borrow", col - 1);
        return (
          <Cell key={`a-${col}`} className={cn(lent && "text-muted-foreground line-through")}>
            {plan.columns[col].top}
          </Cell>
        );
      })}

      {/* 下の数と、ひっ算の横線 */}
      <Cell className="pr-1.5 text-muted-foreground">{plan.op}</Cell>
      {order.map((col) => (
        <Cell key={`b-${col}`} className="border-b-2 border-foreground">
          {col < plan.operandWidth ? plan.columns[col].bottom : ""}
        </Cell>
      ))}

      {/* 答え */}
      <Cell />
      {order.map((col) => {
        let content: ReactNode = null;
        if (done("write", col)) content = plan.columns[col].answer;
        else if (isCurrent("write", col)) content = <Pending input={input} wrong={wrong} />;

        return (
          <Cell
            key={`r-${col}`}
            className={cn(isCurrent("write", col) && "rounded bg-primary/10")}
          >
            {content}
          </Cell>
        );
      })}
    </div>
  );
}
