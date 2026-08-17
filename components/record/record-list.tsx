"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clearAllStored, clearStored, storedItems, type StoredItem } from "@/lib/storage/keys";
import { summarize, type Summary } from "@/lib/storage/summary";

/**
 * じぶんの記録。
 *
 * ## なぜ1か所にまとめるか
 *
 * 記録は単元ごとにばらばらの場所に入っていて、いま10か所ある。
 * どこに何が残っているのか、**使っている本人がいちばん分からない。**
 * 単元が増えるほどひどくなるので、増える前に窓を1つ作っておく。
 *
 * ## 消せるようにしておく
 *
 * 記録はこの端末の中にしかないので、消せるのもこの端末からだけ。
 * ブラウザの設定から消すよう案内するのは、案内として不親切。
 * 単元ごとにも、まとめても消せるようにする。
 *
 * ## 何もしていない単元は出さない
 *
 * 記録のない単元まで並べると、やっていないことの一覧になる。
 * ここは「できたこと」を見る場所なので、触った単元だけを出す。
 */
export function RecordList() {
  // null = まだ読んでいない。静的書き出しなので初回描画では読めない
  const [rows, setRows] = useState<{ item: StoredItem; summary: Summary }[] | null>(null);
  const [confirming, setConfirming] = useState(false);

  const reload = useCallback(() => {
    const next: { item: StoredItem; summary: Summary }[] = [];
    for (const item of storedItems) {
      const summary = summarize(item);
      if (summary) next.push({ item, summary });
    }
    setRows(next);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (rows === null) {
    return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-6 text-muted-foreground">
            この端末には まだ 記録が ありません。
            <br />
            どれか ひとつ やってみると、ここに たまっていきます。
          </p>
          <Button asChild>
            <Link href="/learn">たんげんを えらぶ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {rows.map(({ item, summary }) => (
          <Card key={item.key}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/learn/${item.slug}`}
                  className="text-base font-bold underline-offset-4 hover:text-primary hover:underline"
                >
                  {item.label}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  <SummaryLine summary={summary} />
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`「${item.label}」の 記録を 消します。よろしいですか？`)) {
                    clearStored(item.key);
                    reload();
                  }
                }}
                className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-danger hover:underline"
              >
                この記録を消す
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed p-5 text-center">
        {confirming ? (
          <div>
            <p className="mb-4 text-sm font-bold">
              {rows.length}この 単元の 記録を、ぜんぶ 消します。もとには もどせません。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  clearAllStored();
                  setConfirming(false);
                  reload();
                }}
              >
                ぜんぶ 消す
              </Button>
              <Button onClick={() => setConfirming(false)}>やめる</Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-danger hover:underline"
          >
            この端末の 記録を ぜんぶ 消す
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryLine({ summary }: { summary: Summary }) {
  if (summary.kind === "map") {
    return (
      <>
        <span className="font-bold tabular-nums text-foreground">
          {summary.done} / {summary.total}
        </span>
        <span> {summary.unit} おぼえた</span>
      </>
    );
  }

  if (summary.kind === "draft") {
    return (
      <>
        書きかけが あります（
        <span className="font-bold tabular-nums text-foreground">{summary.chars}</span> 字・
        {summary.sheets} まい）
      </>
    );
  }

  return (
    <>
      <span className="font-bold tabular-nums text-foreground">{summary.sets}</span>
      <span> 回 やった</span>
      {summary.showsPerfect && summary.problems > 0 && (
        <span>
          {" "}
          ・1回でできたのは{" "}
          <span className="font-bold tabular-nums text-foreground">
            {summary.perfect} / {summary.problems}
          </span>{" "}
          問
        </span>
      )}
      {summary.weak && <span> ・まよいやすいのは「{summary.weak}」</span>}
    </>
  );
}
