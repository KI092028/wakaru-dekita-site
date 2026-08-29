"use client";

import { cn } from "@/lib/utils";
import { statusOf, type RomajiProgress } from "@/lib/romaji/progress";
import { ROMAJI_ROWS, ROMAJI_VOWELS, cellAt } from "@/lib/romaji/table";

/**
 * 46字の表。おぼえた字に色がつく。
 *
 * 九九の81マスと同じ考え方。**終わりが見えること**に意味がある。
 * ぜんぶで46字しかない、と分かっているのと分かっていないのとでは、
 * 続くかどうかが変わる。
 *
 * 色は3段階。まだ／1回書けた／おぼえた。
 * 「おぼえた」だけを色づけにすると、10問ぜんぶ正解しても表が変わらない。
 */
export function RomajiTable({
  progress,
  highlight = null,
}: {
  progress: RomajiProgress;
  /** いま出ている字 */
  highlight?: string | null;
}) {
  return (
    <div className="mx-auto max-w-[20rem]">
      <div className="mb-1 grid grid-cols-6 gap-1 text-center text-[10px] font-bold text-muted-foreground">
        <span />
        {ROMAJI_VOWELS.map((v) => (
          <span key={v}>{v}</span>
        ))}
      </div>
      <div className="space-y-1">
        {ROMAJI_ROWS.map((row) => (
          <div key={row} className="grid grid-cols-6 gap-1">
            <span className="flex items-center justify-center text-[11px] font-bold text-muted-foreground">
              {row}
            </span>
            {ROMAJI_VOWELS.map((vowel) => {
              // 「ん」は段がないので、あ段の場所に置く
              const entry = row === "ん" ? (vowel === "a" ? cellAt("ん", "n") : null) : cellAt(row, vowel);
              if (entry === null) return <span key={vowel} />;
              const status = statusOf(progress, entry.kana);
              const now = highlight === entry.kana;
              return (
                <span
                  key={vowel}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md border text-xs font-bold",
                    now
                      ? "border-primary bg-primary text-primary-foreground"
                      : status === "mastered"
                        ? "border-success bg-success/25 text-success"
                        : // 1回書けた字。何も起きない画面にしないための中くらいの色
                          status === "learning"
                          ? "border-success/50 bg-success/10 text-success/80"
                          : "border-border bg-background text-muted-foreground"
                  )}
                  title={entry.main}
                >
                  {entry.kana}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
