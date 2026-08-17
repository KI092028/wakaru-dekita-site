/**
 * 端末に残っている記録を、単元ごとに1行の要約にする。
 *
 * 記録の形は単元ごとにちがう（マスの表・手ごとのつまずき・書きかけの文章）ので、
 * 画面側で分岐せずに済むよう、ここで同じ形にそろえてから渡す。
 */

import { COLUMN_ADVICE_PRIORITY, COLUMN_STEP_KINDS, COLUMN_STEP_LABEL } from "@/lib/column/steps";
import { ADVICE_PRIORITY, NO_ERRORS, STEP_LABEL, type StepKind } from "@/lib/division/steps";
import { PREFECTURES } from "@/lib/geo/prefectures";
import { loadGeoProgress, masteredCount as geoMastered } from "@/lib/geo/progress";
import { count, layoutText, type Orientation } from "@/lib/manuscript/layout";
import {
  MULTIPLY_ADVICE_PRIORITY,
  MULTIPLY_STEP_KINDS,
  MULTIPLY_STEP_LABEL,
} from "@/lib/multiply/steps";
import { loadRecord, weakness } from "@/lib/practice/record";
import {
  PROTRACTOR_ADVICE_PRIORITY,
  PROTRACTOR_STEP_KINDS,
  PROTRACTOR_STEP_LABEL,
} from "@/lib/protractor/steps";
import { loadProgress, masteredCount, TOTAL_CELLS } from "@/lib/quiz/progress";
import { RATE_ADVICE_PRIORITY, RATE_STEP_KINDS, RATE_STEP_LABEL } from "@/lib/rate/steps";
import type { StoredItem } from "./keys";

export type Summary =
  | { kind: "map"; done: number; total: number; unit: string }
  | {
      kind: "practice";
      sets: number;
      perfect: number;
      problems: number;
      /** いちばん引っかかっている手の名前。判断材料が足りなければ null */
      weak: string | null;
      /**
       * 「1回でできた」を出してよいか。
       *
       * 単位量あたりは、**正答率を出さない約束**になっている
       * （公式を覚えて計算できてしまうことが、そもそもこの単元の問題だから
       * → design-guidelines.md 1.3）。ここで一律に出すと、その約束が崩れる。
       */
      showsPerfect: boolean;
    }
  | { kind: "draft"; chars: number; sheets: number };

/** 手順型の単元ごとの、手の種類と名前。 */
const PRACTICE: Record<
  string,
  { kinds: readonly string[]; label: Record<string, string>; priority: readonly string[]; showsPerfect: boolean }
> = {
  "column-add-sub": {
    kinds: COLUMN_STEP_KINDS,
    label: COLUMN_STEP_LABEL,
    priority: COLUMN_ADVICE_PRIORITY,
    showsPerfect: true,
  },
  "column-decimal": {
    kinds: COLUMN_STEP_KINDS,
    label: COLUMN_STEP_LABEL,
    priority: COLUMN_ADVICE_PRIORITY,
    showsPerfect: true,
  },
  "column-multiply": {
    kinds: MULTIPLY_STEP_KINDS,
    label: MULTIPLY_STEP_LABEL,
    priority: MULTIPLY_ADVICE_PRIORITY,
    showsPerfect: true,
  },
  "long-division": {
    kinds: Object.keys(NO_ERRORS) as StepKind[],
    label: STEP_LABEL,
    priority: ADVICE_PRIORITY,
    showsPerfect: true,
  },
  "long-division-2": {
    kinds: Object.keys(NO_ERRORS) as StepKind[],
    label: STEP_LABEL,
    priority: ADVICE_PRIORITY,
    showsPerfect: true,
  },
  angle: {
    kinds: PROTRACTOR_STEP_KINDS,
    label: PROTRACTOR_STEP_LABEL,
    priority: PROTRACTOR_ADVICE_PRIORITY,
    showsPerfect: true,
  },
  "per-unit": {
    kinds: RATE_STEP_KINDS,
    label: RATE_STEP_LABEL,
    priority: RATE_ADVICE_PRIORITY,
    showsPerfect: false,
  },
};

/**
 * 1件ぶんの要約。**まだ何もしていなければ null。**
 *
 * 呼び出しはブラウザの中から（useEffect の中）。
 */
export function summarize(item: StoredItem): Summary | null {
  if (item.kind === "map") {
    if (item.slug === "times-table") {
      const progress = loadProgress();
      if (Object.keys(progress).length === 0) return null;
      return { kind: "map", done: masteredCount(progress), total: TOTAL_CELLS, unit: "マス" };
    }
    const progress = loadGeoProgress();
    if (Object.keys(progress).length === 0) return null;
    return { kind: "map", done: geoMastered(progress), total: PREFECTURES.length, unit: "県" };
  }

  if (item.kind === "draft") {
    const raw = readJson(item.key);
    if (raw === null) return null;
    const text = typeof raw.text === "string" ? raw.text : "";
    if (text === "") return null;
    const orientation: Orientation = raw.orientation === "horizontal" ? "horizontal" : "vertical";
    const counts = count(text, layoutText(text, orientation));
    return { kind: "draft", chars: counts.chars, sheets: counts.sheets };
  }

  const spec = PRACTICE[item.slug];
  if (!spec) return null;
  const record = loadRecord(item.key, spec.kinds);
  if (record.sets === 0) return null;

  const worst = weakness(record, spec.kinds, spec.priority);
  return {
    kind: "practice",
    sets: record.sets,
    perfect: record.perfect,
    problems: record.problems,
    weak: worst ? (spec.label[worst.kind] ?? worst.kind) : null,
    showsPerfect: spec.showsPerfect,
  };
}

function readJson(key: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
