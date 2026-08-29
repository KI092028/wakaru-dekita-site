"use client";

import { cn } from "@/lib/utils";
import { CONSONANT_KEYS, VOWEL_KEYS } from "@/lib/romaji/table";

/**
 * ローマ字を打つためのキーボード。
 *
 * ## 母音と子音を、分けて並べる
 *
 * 26字をそのまま並べるより、**上の段が母音（a i u e o）、
 * 下が子音**という並びのほうが、ローマ字が「子音＋母音」で
 * できていることが、押すたびに目に入る。
 * 並び方そのものが、この単元で教えたいことになっている。
 *
 * ローマ字に使わない字（q や x）は出さない。押せるのに使い道のないキーは、
 * 迷うだけで何の役にも立たない。
 */

type Props = {
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitEnabled: boolean;
  disabled?: boolean;
};

const keyClass =
  "h-12 min-w-[44px] rounded-xl border-2 border-input bg-background text-xl font-bold lowercase transition-colors " +
  "hover:border-primary hover:bg-primary/5 active:bg-primary/10 " +
  "disabled:opacity-40 disabled:hover:border-input disabled:hover:bg-background";

export function LetterPad({ onLetter, onBackspace, onSubmit, submitEnabled, disabled = false }: Props) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="mb-1 text-center text-[11px] font-bold text-muted-foreground">ぼいん</p>
        <div className="grid grid-cols-5 gap-2">
          {VOWEL_KEYS.map((letter) => (
            <button
              key={letter}
              type="button"
              className={cn(keyClass, "border-primary/50 bg-primary/5 text-primary")}
              onClick={() => onLetter(letter)}
              disabled={disabled}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-center text-[11px] font-bold text-muted-foreground">しいん</p>
        {/* 6列だと1つ43px。母音と同じ5列にそろえる（並びも読みやすくなる） */}
        <div className="grid grid-cols-5 gap-2">
          {CONSONANT_KEYS.map((letter) => (
            <button
              key={letter}
              type="button"
              className={keyClass}
              onClick={() => onLetter(letter)}
              disabled={disabled}
            >
              {letter}
            </button>
          ))}
          <button
            type="button"
            className={cn(keyClass, "text-sm")}
            onClick={onBackspace}
            disabled={disabled}
            aria-label="1文字けす"
          >
            けす
          </button>
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "h-14 w-full rounded-2xl text-base font-bold text-primary-foreground transition-colors",
          "bg-primary hover:bg-primary/90 active:bg-primary/80",
          "disabled:bg-muted disabled:text-muted-foreground"
        )}
        onClick={onSubmit}
        disabled={disabled || !submitEnabled}
      >
        けってい
      </button>
    </div>
  );
}
