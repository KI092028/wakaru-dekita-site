import {
  PREFECTURES,
  REGION_LABEL,
  capitalDiffers,
  capitalName,
  directionTo,
  fullName,
  prefecturesOf,
  type Prefecture,
  type Region,
} from "./prefectures";
import { geoStatus, type GeoMode, type GeoProgress } from "./progress";

/**
 * 出題と、答え合わせの言葉。
 *
 * ## 正解か不正解かの2つで終わらせない
 *
 * 地図で「近い」は意味がある。となりの県を押したのと、まったく違う地方を押したのは
 * 同じ「不正解」ではない。**同じ地方 → おしい**、**別の地方 → 方角を返す**の3段階にする。
 *
 * ## 苦手な県を先に出す
 *
 * 九九マップと同じ順（にがて → あと1回でおぼえた → まだ → おぼえた）。
 * まだの県から順に消化すると、一巡するまで「おぼえた」が増えず、
 * 進んでいる実感が出ないため。
 */

export const QUESTION_COUNT = 10;

export type GeoQuestion = {
  id: string;
  answer: Prefecture;
};

export type GeoVerdict =
  | { kind: "correct" }
  | { kind: "sameRegion"; message: string }
  | { kind: "far"; message: string };

export function judge(answer: Prefecture, picked: Prefecture): GeoVerdict {
  if (picked.code === answer.code) return { kind: "correct" };

  if (picked.region === answer.region) {
    return {
      kind: "sameRegion",
      message: `おしい！ 同じ ${REGION_LABEL[answer.region]}地方だよ。${fullName(picked)}から見て ${directionTo(picked, answer)} のほう`,
    };
  }

  return {
    kind: "far",
    message: `そこは ${REGION_LABEL[picked.region]}地方。もっと ${directionTo(picked, answer)} のほうだよ`,
  };
}

/** 出題の優先順。数が小さいほど先に出す。 */
function priority(progress: GeoProgress, prefecture: Prefecture): number {
  switch (geoStatus(progress, prefecture.code)) {
    case "weak":
      return 0;
    case "learning":
      return 1;
    case "untouched":
      return 2;
    case "mastered":
      return 3;
  }
}

const shuffle = <T,>(list: T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * 1セット分の出題。
 *
 * 「にがて」と「あと1回」を先に、そのあと「まだ」を混ぜる。
 * 範囲の県が10未満のとき（四国・北海道など）は、あるだけ出す。
 */
export function buildGeoQuestions(
  progress: GeoProgress,
  region: Region | null,
  mode: GeoMode = "prefecture"
): GeoQuestion[] {
  const pool = poolFor(region, mode);
  const sorted = shuffle(pool).sort((a, b) => priority(progress, a) - priority(progress, b));
  return sorted
    .slice(0, Math.min(QUESTION_COUNT, pool.length))
    .map((answer, index) => ({ id: `geo-${index}-${answer.code}`, answer }));
}

export const scopeLabel = (region: Region | null): string =>
  region === null ? "日本全国" : `${REGION_LABEL[region]}地方`;


/**
 * その範囲・その遊び方で出す県。
 *
 * **県庁所在地では、名前がちがう18道府県だけを出す。**
 * 同じ名前の29県を混ぜると、半分以上が「県名をそのまま言えばよい問題」になり、
 * 覚えるところを練習していないのに正解が積み上がってしまう。
 */
export function poolFor(region: Region | null, mode: GeoMode): Prefecture[] {
  const inRegion = region === null ? PREFECTURES : prefecturesOf(region);
  return mode === "capital" ? inRegion.filter(capitalDiffers) : inRegion;
}

/** 出題の文。押すのはどちらも地図の上の県。 */
export const promptFor = (answer: Prefecture, mode: GeoMode): string =>
  mode === "capital" ? capitalName(answer) : fullName(answer);

/** 遊び方ごとの言い回し。 */
export const MODE_ASK: Record<GeoMode, string> = {
  prefecture: "どこ？ 地図の 上で さがそう",
  capital: "は どこの 県庁所在地？ 地図の 上で さがそう",
};

/** 正解したときに、あわせて見せておきたいこと。 */
export const answerNote = (answer: Prefecture, mode: GeoMode): string | null =>
  mode === "capital" ? `${capitalName(answer)}は ${fullName(answer)}の 県庁所在地` : null;
