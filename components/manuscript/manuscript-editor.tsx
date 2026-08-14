"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ManuscriptSheets } from "@/components/manuscript/manuscript-sheet";
import { cn } from "@/lib/utils";
import { CHARS_PER_SHEET, count, layoutText, type Orientation } from "@/lib/manuscript/layout";

/**
 * 原稿用紙。書いた文が、そのままマスに流し込まれる。
 *
 * ## 入力欄とマス目を分けている
 *
 * マスの中に直接書かせる作りにはしていない。
 * 日本語は変換しながら打つので、**変換中の字が1マスずつに散らばると打てなくなる。**
 * ふつうの入力欄に打ってもらい、確定した文をマスへ流し込む。
 *
 * ## 保存
 *
 * 書きかけは端末の中だけに残す。うっかり閉じても消えないようにするため。
 * サーバーには送らない。
 */

const STORAGE_KEY = "wakaru-dekita:manuscript:v1";

export function ManuscriptEditor() {
  const [text, setText] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [loaded, setLoaded] = useState(false);

  // 読み出しは描画後（静的書き出しなので、初回描画と食い違わせない）
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null) {
          const v = parsed as Record<string, unknown>;
          if (typeof v.text === "string") setText(v.text);
          if (v.orientation === "vertical" || v.orientation === "horizontal") {
            setOrientation(v.orientation);
          }
        }
      }
    } catch {
      // 読めなくても書きはじめられるので握りつぶす
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, orientation }));
    } catch {
      // 保存できなくても書きつづけられる
    }
  }, [text, orientation, loaded]);

  const layout = useMemo(() => layoutText(text, orientation), [text, orientation]);
  const counts = useMemo(() => count(text, layout), [text, layout]);

  return (
    <div className="space-y-6">
      {/* 入力と設定。印刷には出さない */}
      <Card className="print:hidden">
        <CardContent className="py-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">書き方</span>
              <div className="flex rounded-full border p-0.5">
                {(["vertical", "horizontal"] as Orientation[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOrientation(value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-bold transition-colors",
                      orientation === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {value === "vertical" ? "縦書き" : "横書き"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()}>
                印刷（A4）
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (text === "" || window.confirm("書いた文を ぜんぶ 消します。よろしいですか？")) {
                    setText("");
                  }
                }}
              >
                消す
              </Button>
            </div>
          </div>

          <label htmlFor="manuscript-input" className="mb-1 block text-sm font-medium">
            文章
          </label>
          <textarea
            id="manuscript-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="ここに 文章を 打つと、下の 原稿用紙に 入ります。&#10;改行すると 次の 行から 始まります。"
            className="w-full rounded-xl border-2 border-input bg-background p-3 text-base leading-relaxed outline-none focus:border-primary"
          />

          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">文字数</dt>
              <dd className="text-lg font-bold tabular-nums text-primary">{counts.chars}</dd>
              <dd className="text-xs text-muted-foreground">
                （空白をのぞくと {counts.withoutSpaces}）
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">段落</dt>
              <dd className="font-bold tabular-nums">{counts.paragraphs}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">用紙</dt>
              <dd className="font-bold tabular-nums">{counts.sheets} まい</dd>
              <dd className="text-xs text-muted-foreground">
                （{CHARS_PER_SHEET}字づめ・いま {counts.usedOnLastSheet} マス目）
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* 原稿用紙。印刷ではここだけが出る */}
      <div className="wd-print-area">
        <ManuscriptSheets layout={layout} orientation={orientation} />
      </div>
    </div>
  );
}
