"use client";

import { cn } from "@/lib/utils";

/**
 * 画面内に置く数字キーパッド。3単元で共通。
 *
 * 端末のキーボードを出さないのは、低学年には操作が難しく、
 * 画面の半分が覆われて問題文が見えなくなるため。
 *
 * 右下の大きいボタンは「いま何をするか」がそのままラベルになる。
 * 分数で分子だけ埋まっているあいだは「ぶんぼへ」、両方そろったら「けってい」。
 */

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

type Props = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  /** 入力がそろっていないあいだは押せない */
  primaryEnabled: boolean;
  disabled?: boolean;
};

export function NumberPad({
  onDigit,
  onBackspace,
  onPrimary,
  primaryLabel,
  primaryEnabled,
  disabled = false,
}: Props) {
  const keyClass =
    "h-14 rounded-2xl border-2 border-input bg-background text-2xl font-bold transition-colors " +
    "hover:border-primary hover:bg-primary/5 active:bg-primary/10 " +
    "disabled:opacity-40 disabled:hover:border-input disabled:hover:bg-background";

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {KEYS.map((key) => (
        <button key={key} type="button" className={keyClass} onClick={() => onDigit(key)} disabled={disabled}>
          {key}
        </button>
      ))}

      <button
        type="button"
        className={cn(keyClass, "text-base")}
        onClick={onBackspace}
        disabled={disabled}
        aria-label="1文字けす"
      >
        けす
      </button>

      <button type="button" className={keyClass} onClick={() => onDigit("0")} disabled={disabled}>
        0
      </button>

      <button
        type="button"
        className={cn(
          "h-14 rounded-2xl text-base font-bold text-primary-foreground transition-colors",
          "bg-primary hover:bg-primary/90 active:bg-primary/80",
          "disabled:bg-muted disabled:text-muted-foreground"
        )}
        onClick={onPrimary}
        disabled={disabled || !primaryEnabled}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
