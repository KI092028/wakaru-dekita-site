"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JapanMap, MapLegend, RegionZoomBar } from "@/components/geo/japan-map";
import { cn } from "@/lib/utils";

import {
  REGIONS,
  REGION_LABEL,
  fullName,
  type Prefecture,
  type Region,
} from "@/lib/geo/prefectures";
import {
  MODE_ASK,
  answerNote,
  buildGeoQuestions,
  poolFor,
  promptFor,
  judge,
  scopeLabel,
  type GeoQuestion,
  type GeoVerdict,
} from "@/lib/geo/quiz";
import {
  clearGeoProgress,
  loadGeoProgress,
  type GeoMode,
  masteredCount,
  nearMasteryCount,
  recordGeoAnswer,
  saveGeoProgress,
  totalOf,
  type GeoProgress,
} from "@/lib/geo/progress";

/**
 * 都道府県をさがすゲーム。
 *
 * 名前が出るので、地図の上でその県を押す。
 *
 * **正解・不正解の2つで終わらせない。** となりの県を押したのと、
 * まったく違う地方を押したのは同じ「不正解」ではないので、
 * 同じ地方なら「おしい」、別の地方なら方角を返す。
 *
 * 地図そのものが記録の表示になっている。おぼえた県から色がついていくので、
 * 白いところが残りの県になる。
 */

type Phase = "choosing" | "asking" | "judged" | "finished";

type Props = {
  /**
   * 何をさがすゲームか。
   *
   * 地図・方角の返し・記録の仕組みはそのまま共有し、
   * **出す文と、出す県の範囲だけを変える。**
   * 県の位置は分かっていても県庁所在地は言えない、ということが普通に起きるので、
   * 記録だけは別に持つ（→ lib/geo/progress.ts）。
   */
  mode?: GeoMode;
};

export function GeoGame({ mode = "prefecture" }: Props = {}) {
  const [progress, setProgress] = useState<GeoProgress | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [questions, setQuestions] = useState<GeoQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("choosing");
  const [picked, setPicked] = useState<Prefecture | null>(null);
  const [verdict, setVerdict] = useState<GeoVerdict | null>(null);
  const [score, setScore] = useState(0);
  const [missedHere, setMissedHere] = useState(false);
  const [masteredAtStart, setMasteredAtStart] = useState(0);
  /**
   * 地図に塗る色は、問題のはじめの状態で止めておく。
   *
   * 記録をそのまま塗ると、まちがえた瞬間に**正解のマスが「にがて」の色になって
   * 答えが見えてしまう。** 記録そのものは動かし、色だけ次の問題まで据え置く。
   */
  const [mapProgress, setMapProgress] = useState<GeoProgress>({});
  /**
   * いま寄せて見ている地方。
   *
   * 全国から出題するときだけ意味がある。北海道から沖縄までを1画面に入れると
   * 小さい県は指で押せないので、**全国表示でのタップは「寄る」だけ**にしてある。
   * 答えるのは寄ったあと（→ components/geo/japan-map.tsx）。
   */
  const [zoom, setZoom] = useState<Region | null>(null);

  // 記録の読み出しは描画後（静的書き出しなので、初回描画と食い違わせない）
  useEffect(() => {
    setProgress(loadGeoProgress(mode));
  }, []);

  if (progress === null) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-16 text-center text-muted-foreground">
          じゅんびしています…
        </CardContent>
      </Card>
    );
  }

  function start(next: Region | null) {
    if (progress === null) return;
    setRegion(next);
    setQuestions(buildGeoQuestions(progress, next, mode));
    setIndex(0);
    setScore(0);
    setPicked(null);
    setVerdict(null);
    setMissedHere(false);
    setMasteredAtStart(masteredCount(progress, next));
    setMapProgress(progress);
    setZoom(null);
    setPhase("asking");
  }

  const question = questions?.[index] ?? null;

  function pick(prefecture: Prefecture) {
    if (phase !== "asking" || question === null || progress === null) return;
    const result = judge(question.answer, prefecture);
    setPicked(prefecture);
    setVerdict(result);

    if (result.kind === "correct") {
      // 一度でも外した問題は、得点にも記録にも入れない（打ち直しと同じ扱い）
      if (!missedHere) {
        setScore((s) => s + 1);
        const next = recordGeoAnswer(progress, question.answer.code, true);
        saveGeoProgress(mode, next);
        setProgress(next);
      }
      // 正解の県が大きく見えるように、その地方へ寄せておく
      setZoom(question.answer.region);
      setPhase("judged");
    } else {
      if (!missedHere) {
        const next = recordGeoAnswer(progress, question.answer.code, false);
        saveGeoProgress(mode, next);
        setProgress(next);
      }
      setMissedHere(true);
    }
  }

  function next() {
    if (questions === null || progress === null) return;
    setMapProgress(progress);
    setPicked(null);
    setVerdict(null);
    setMissedHere(false);
    // 前の問題の地方に寄ったままだと、そこから探してしまう。ぜんたいに戻す
    setZoom(null);
    if (index + 1 >= questions.length) setPhase("finished");
    else {
      setIndex((i) => i + 1);
      setPhase("asking");
    }
  }

  function reset() {
    clearGeoProgress(mode);
    setProgress({});
    setMapProgress({});
  }

  if (phase === "choosing") {
    return <ScopePicker progress={progress} mode={mode} onStart={start} onReset={reset} />;
  }

  if (phase === "finished") {
    return (
      <Result
        progress={progress}
        mode={mode}
        region={region}
        score={score}
        total={questions?.length ?? 0}
        masteredAtStart={masteredAtStart}
        onRetry={() => start(region)}
        onChangeScope={() => setPhase("choosing")}
      />
    );
  }

  const correct = verdict?.kind === "correct";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {index + 1} / {questions?.length} もん目
            </span>
            <span>{scopeLabel(region)}</span>
          </div>

          <p className="mb-1 text-center text-sm text-muted-foreground">
            {region === null && zoom === null
              ? "まず 地方に よろう。おした ところの 地方が 大きくなります"
              : "地図の上で さがして タップ"}
          </p>
          <p className="mb-4 text-center text-3xl font-bold">
            {question ? promptFor(question.answer, mode) : ""}
          </p>

          {/* 出題が全国のときだけ、寄る先をえらべるようにする */}
          {region === null && (
            <RegionZoomBar zoom={zoom} onZoom={(next) => phase === "asking" && setZoom(next)} />
          )}

          {/* 地図だけはカードの左右いっぱいまで広げる。
              せまい画面では、カードの余白ぶん（48px）がそのまま県の大きさに回る */}
          <div className="-mx-4 sm:mx-0">
            <JapanMap
              region={region}
              zoom={zoom}
              onZoom={setZoom}
              progress={mapProgress}
              interactive={phase === "asking"}
              onPick={pick}
              picked={correct ? null : picked}
              reveal={phase === "judged" ? question?.answer ?? null : null}
            />
          </div>

          <div className="mt-4 min-h-[5.5rem] text-center">
            {phase === "judged" ? (
              <>
                <p className="wd-pop-in mb-1 text-lg font-bold text-success">
                  {missedHere ? "そこだよ！" : "せいかい！"}
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  {question && (answerNote(question.answer, mode) ?? `${REGION_LABEL[question.answer.region]}地方`)}
                </p>
                <Button size="lg" onClick={next}>
                  {index + 1 >= (questions?.length ?? 0) ? "けっかを見る" : "つぎの もんだいへ"}
                </Button>
              </>
            ) : verdict && verdict.kind !== "correct" ? (
              <>
                <p className="mb-1 text-lg font-bold text-danger">
                  {verdict.kind === "sameRegion" ? "ちかい！" : "ちがうよ"}
                </p>
                <p className="text-sm font-medium">{verdict.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">もういちど さがしてみよう</p>
              </>
            ) : (
              <p className="pt-4 text-xs text-muted-foreground">
                {region === null && zoom === null
                  ? "だいたいの ところで いいよ。おした 地方が 大きくなります"
                  : "小さい県は、まわりを 押しても とれるように なっています"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <MapLegend />
        </CardContent>
      </Card>
    </div>
  );
}

/** どの範囲でやるかを選ぶ。地方ごとの進みぐあいもここに出す。 */
function ScopePicker({
  progress,
  mode,
  onStart,
  onReset,
}: {
  progress: GeoProgress;
  mode: GeoMode;
  onStart: (region: Region | null) => void;
  onReset: () => void;
}) {
  const scope = (region: Region | null) => poolFor(region, mode);
  const inScope = (region: Region | null, p: { code: number }) =>
    scope(region).some((q) => q.code === p.code);
  const countIn = (region: Region | null) =>
    scope(region).filter((p) => progress[String(p.code)]?.mastered).length;
  const all = countIn(null);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card className="border-primary/30">
        <CardContent className="py-6">
          <p className="mb-1 text-center text-sm text-muted-foreground">
            おぼえた {mode === "capital" ? "県庁所在地" : "都道府県"}
          </p>
          <p className="mb-4 text-center text-4xl font-bold text-primary">
            {all} <span className="text-xl text-foreground">/ {scope(null).length}</span>
          </p>
          <JapanMap region={null} progress={progress} interactive={false} />
          <div className="mt-3">
            <MapLegend />
          </div>

          {/* 何度もやり直せるように。消えると困る記録なので、1回たしかめる */}
          {all > 0 && (
            <div className="mt-4 border-t pt-3 text-center">
              {confirming ? (
                <>
                  <p className="mb-2 text-xs text-danger">
                    おぼえた {all} 県の きろくを ぜんぶ 消します。もどせません
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onReset();
                        setConfirming(false);
                      }}
                    >
                      消す
                    </Button>
                    <Button size="sm" onClick={() => setConfirming(false)}>
                      やめる
                    </Button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="text-xs text-muted-foreground underline hover:text-danger"
                >
                  きろくを ぜんぶ 消して はじめから
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <h2 className="mb-1 text-center text-sm font-bold">どこを れんしゅうする？</h2>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            地方をえらぶと、その地方だけが 大きく出ます
          </p>

          <Button size="lg" className="mb-3 w-full" onClick={() => onStart(null)}>
            日本全国（{scope(null).length}）
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {REGIONS.map((region) => {
              const done = countIn(region);
              const total = scope(region).length;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => onStart(region)}
                  className={cn(
                    "rounded-xl border-2 px-3 py-3 text-left transition-colors",
                    done === total
                      ? "border-primary/60 bg-primary/5"
                      : "border-input hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <span className="block text-sm font-bold">{REGION_LABEL[region]}</span>
                  <span className="text-xs text-muted-foreground">
                    {done} / {total}
                    {done === total && total > 0 && " ぜんぶ おぼえた"}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Result({
  progress,
  mode,
  region,
  score,
  total,
  masteredAtStart,
  onRetry,
  onChangeScope,
}: {
  progress: GeoProgress;
  mode: GeoMode;
  region: Region | null;
  score: number;
  total: number;
  masteredAtStart: number;
  onRetry: () => void;
  onChangeScope: () => void;
}) {
  const scope = poolFor(region, mode);
  const mastered = scope.filter((p) => progress[String(p.code)]?.mastered).length;
  const near = scope.filter((p) => {
    const cell = progress[String(p.code)];
    return cell !== undefined && !cell.mastered && cell.streak >= 1;
  }).length;
  const scopeTotal = scope.length;
  const gained = mastered - masteredAtStart;

  return (
    <Card className="mx-auto max-w-lg border-primary/30">
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {scopeLabel(region)}・けっか
        </p>
        <p className="mb-1 text-5xl font-bold text-primary">
          {score} <span className="text-2xl text-foreground">/ {total} もん</span>
        </p>
        <p className="mb-5 text-sm text-muted-foreground">1回で 見つけられた 県</p>

        <div className="mb-5 rounded-xl bg-muted/60 px-4 py-3 text-sm">
          {gained > 0 ? (
            <p>
              あたらしく <span className="text-base font-bold text-primary">{gained}</span> 県 おぼえた！
            </p>
          ) : near > 0 ? (
            // 連続2回せいかいで「おぼえた」になるので、1セット目は必ず0になる
            <p>
              あと1回 せいかいすると おぼえた に なる 県が{" "}
              <span className="font-bold text-foreground">{near}</span> 県 あるよ
            </p>
          ) : (
            <p>もう一度 まわすと、おぼえた 県が ふえていくよ</p>
          )}
          <p className="mt-1 text-muted-foreground">
            {scopeLabel(region)}：{mastered} / {scopeTotal} 県
          </p>
        </div>

        <div className="mb-6">
          <JapanMap region={region} progress={progress} interactive={false} showAllNames />
        </div>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={onRetry}>
            もういちど（{scopeLabel(region)}）
          </Button>
          <Button size="lg" variant="outline" onClick={onChangeScope}>
            ほかの地方を えらぶ
          </Button>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          きろくはこの端末のブラウザにだけ保存されます。
          <br />
          ほかの端末には引きつがれません。
        </p>
      </CardContent>
    </Card>
  );
}
