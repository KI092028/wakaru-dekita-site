"use client";

import { cn } from "@/lib/utils";
import { isFraction } from "@/lib/quiz/fraction";
import type { AnswerInput, Slot } from "@/lib/quiz/answer-input";
import type { Value } from "@/lib/quiz/types";

/**
 * 「= ここ」に入る、入力中の答え。
 *
 * 整数は1枠、分数は分子・分母の2枠。分数の枠はタップで切り替えられる。
 * 見た目は問題文の分数（ValueDisplay）と同じ積み方にそろえてある。
 */

export type SlotPhase = "answering" | "correct" | "wrong" | "retry";

type Props = {
  input: AnswerInput;
  phase: SlotPhase;
  onSelectSlot: (slot: Slot) => void;
};

const BOX =
  "inline-flex min-w-[1.8ch] items-center justify-center rounded-lg border-2 px-1 py-0.5 " +
  "transition-colors";

function boxTone(phase: SlotPhase, active: boolean): string {
  if (phase === "correct") return "border-success text-success";
  if (active) return "border-primary bg-primary/10";
  return "border-input";
}

export function AnswerSlot({ input, phase, onSelectSlot }: Props) {
  if (input.kind === "number") {
    const shown = input.digits === "" ? "?" : input.digits;

    if (phase === "wrong") {
      return <span className="text-danger line-through decoration-2">{shown}</span>;
    }

    return (
      <span
        className={cn(
          "inline-flex min-w-[2.2ch] justify-center border-b-4 pb-0.5",
          phase === "correct" ? "wd-correct border-success text-success" : "border-input",
          input.digits === "" && "text-muted-foreground/40"
        )}
      >
        {shown}
      </span>
    );
  }

  const { numerator, denominator, active } = input;

  if (phase === "wrong") {
    return (
      <span className="inline-flex flex-col items-center align-middle text-[0.72em] leading-none text-danger line-through decoration-2">
        <span className="px-[0.15em]">{numerator}</span>
        <span className="my-[0.14em] h-[0.09em] w-full rounded-full bg-current" />
        <span className="px-[0.15em]">{denominator}</span>
      </span>
    );
  }

  const editable = phase === "answering" || phase === "retry";

  return (
    <span
      className={cn(
        "inline-flex flex-col items-center align-middle text-[0.72em] leading-none",
        phase === "correct" && "wd-correct"
      )}
    >
      <button
        type="button"
        aria-label="ぶんし"
        disabled={!editable}
        onClick={() => onSelectSlot("numerator")}
        className={cn(
          BOX,
          boxTone(phase, editable && active === "numerator"),
          numerator === "" && "text-muted-foreground/40"
        )}
      >
        {numerator === "" ? "?" : numerator}
      </button>

      <span className="my-[0.1em] h-[0.11em] w-full rounded-full bg-current" />

      <button
        type="button"
        aria-label="ぶんぼ"
        disabled={!editable}
        onClick={() => onSelectSlot("denominator")}
        className={cn(
          BOX,
          boxTone(phase, editable && active === "denominator"),
          denominator === "" && "text-muted-foreground/40"
        )}
      >
        {denominator === "" ? "?" : denominator}
      </button>
    </span>
  );
}

/** 正答を読み上げ用に文字へ落とす。 */
export function valueLabel(value: Value): string {
  return isFraction(value) ? `${value.denominator}ぶんの${value.numerator}` : String(value);
}
