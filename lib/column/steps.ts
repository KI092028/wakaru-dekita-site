import { borrowedValue, type ColumnPlan } from "./plan";

/**
 * 列のひっ算の1手ごとの問いと、間違えたときに返す言葉。
 *
 * つまずきを3つに分けて扱う。
 * 位ごとの計算そのもの（write）／くり上がりの1を書く（carry）／
 * となりから借りる（borrow）は別の力なので、まとめて「不正解」にすると
 * 何ができていないのか本人にも分からない。
 *
 * 多桁のひき算の誤りが、でたらめではなく規則的な手続きの誤り（バグ）である
 * ことは Brown & Burton (1978) が示している。ここで拾っている
 * 「上下をひっくり返してひく」も、その代表例のひとつ。
 */

export type ColumnStepKind = "write" | "carry" | "borrow" | "pad" | "point";

export const COLUMN_STEP_KINDS: ColumnStepKind[] = ["write", "carry", "borrow", "pad", "point"];

export const COLUMN_STEP_LABEL: Record<ColumnStepKind, string> = {
  write: "けたの計算",
  carry: "くり上がり",
  borrow: "くり下がり",
  pad: "けたをそろえる",
  point: "小数点",
};

/**
 * 小数のひっ算のときだけ渡す。
 * けたをそろえる手と、答えの小数点を打つ手が先頭に加わる。
 */
export type DecimalInfo = {
  decimals: number;
  padColumns: number[];
  padTarget: "a" | "b" | null;
};

export type ColumnStep = {
  kind: ColumnStepKind;
  /** 何けた目か（右から0） */
  index: number;
  /** 数字を打つのか、けたをタップするのか */
  input: "number" | "column";
  /** 正解。number なら打つ数、column なら書き込む位 */
  answer: number;
};

/**
 * その位の計算を**まとめて打った値**（1+7+8 を 16 と打つ）。
 * くり上がりのあるたし算のときだけ返す。
 *
 * 頭の中では 16 まで出してから 6 を書き 1 を くり上げるので、
 * 16 と打つのは手順を分かっていない証拠ではなく、むしろ自然な打ち方。
 * これを誤答にすると、正しく計算できた子に「ざんねん」を返すことになる。
 */
export function columnWholeValue(plan: ColumnPlan, step: ColumnStep): number | null {
  if (step.kind !== "write" || plan.op !== "+") return null;
  const column = plan.columns[step.index];
  const full = column.top + column.bottom + column.carryIn;
  return full >= 10 ? full : null;
}

/**
 * 手の並び。位ごとに右から左へ進む。
 * ひき算は「借りてから引く」、たし算は「書いてからくり上げる」の順。
 */
export function buildColumnSteps(plan: ColumnPlan, decimal?: DecimalInfo): ColumnStep[] {
  const steps: ColumnStep[] = [];

  if (decimal) {
    // まず けたをそろえ、つぎに 答えの小数点を決めてから 計算に入る。
    // この単元のつまずきは計算ではなく、そろえる作業そのものにあるため
    for (const column of decimal.padColumns) {
      steps.push({ kind: "pad", index: column, input: "number", answer: 0 });
    }
    // すきまが1つしかない盤（一の位と小数第1位だけ）では選ぶ余地がないので、
    // 手として問わずに最初から打っておく
    if (plan.width >= 3) {
      steps.push({
        kind: "point",
        index: decimal.decimals,
        input: "column",
        answer: decimal.decimals,
      });
    }
  }

  plan.columns.forEach((column, i) => {
    if (plan.op === "−" && column.borrows) {
      steps.push({ kind: "borrow", index: i, input: "number", answer: borrowedValue(plan, i) });
    }

    steps.push({ kind: "write", index: i, input: "number", answer: column.answer });

    // くり上がりの1は、ひとつ左の位の上に書く。
    // いちばん左からあふれる分は、その位の答えとしてそのまま書かせる
    if (plan.op === "+" && column.carryOut === 1 && i + 1 < plan.operandWidth) {
      steps.push({ kind: "carry", index: i, input: "column", answer: i + 1 });
    }
  });

  return steps;
}

const PLACE_NAME = ["一の位", "十の位", "百の位", "千の位"];

export function placeName(index: number): string {
  return PLACE_NAME[index] ?? `${index + 1}けた目`;
}

export function columnStepPrompt(plan: ColumnPlan, step: ColumnStep): string {
  const column = plan.columns[step.index];
  const place = placeName(step.index);

  switch (step.kind) {
    case "pad":
      return "けたが たりないね。あいている ところに 何を 書く？";
    case "point":
      return "答えの 小数点は どこに 打つ？ すきまを タップ";
    case "borrow":
      return `${column.top} から ${column.bottom} は ひけないね。となりの位は いくつに なる？`;
    case "write": {
      if (plan.op === "+") {
        const parts = [column.top, column.bottom, ...(column.carryIn ? [1] : [])];
        return `${place}：${parts.join(" + ")} は いくつ？`;
      }
      const top = column.top - (column.lent ? 1 : 0) + (column.borrows ? 10 : 0);
      return `${place}：${top} − ${column.bottom} は いくつ？`;
    }
    case "carry": {
      const full = column.top + column.bottom + column.carryIn;
      return `${full} の くり上がりの 1 は どこに 書く？ 上のわくを タップ`;
    }
  }
}

/** たし算で「くり上がった分も書いてしまう」など、書く数の誤り。 */
function diagnoseWriteAdd(plan: ColumnPlan, index: number, typed: number): string | null {
  const column = plan.columns[index];

  if (column.carryIn === 1 && typed === (column.top + column.bottom) % 10) {
    return "右の位から くり上がってきた 1 を たしわすれていないかな";
  }
  if (Math.abs(typed - column.answer) === 1) return "あと 1 だけ ちがうよ";
  return null;
}

/** ひき算で最も多い誤り。上下をひっくり返して引く（Brown & Burton の代表的なバグ）。 */
function diagnoseWriteSub(plan: ColumnPlan, index: number, typed: number): string | null {
  const column = plan.columns[index];
  const lentTop = column.top - (column.lent ? 1 : 0);

  if (column.borrows && typed === column.bottom - lentTop) {
    return "上から下を ひくよ。ひけないときは となりから 10 を 借りてくるんだったね";
  }
  if (column.lent && typed === column.top - column.bottom) {
    return `この位は となりに 1 貸したから ${lentTop} になっているよ`;
  }
  if (column.borrows && typed === lentTop + 10 - column.bottom - 10) {
    return "借りてきた 10 を たしてから ひくよ";
  }
  if (typed === 0 && column.answer !== 0) {
    return "ひけないからといって 0 と 書かなくて だいじょうぶ。となりから 借りよう";
  }
  if (Math.abs(typed - column.answer) === 1) return "あと 1 だけ ちがうよ";
  return null;
}

export function diagnoseColumnStep(
  plan: ColumnPlan,
  step: ColumnStep,
  typed: number
): string | null {
  const column = plan.columns[step.index];

  switch (step.kind) {
    case "pad":
      return "あいている位には 0 を 書くよ。12 と 12.0 は 同じ大きさだね";

    case "point":
      if (typed < step.answer) return "もう ひとつ 右だよ。上と下の 小数点と まっすぐ そろえよう";
      return "もう ひとつ 左だよ。上と下の 小数点と まっすぐ そろえよう";
    case "write":
      return plan.op === "+"
        ? diagnoseWriteAdd(plan, step.index, typed)
        : diagnoseWriteSub(plan, step.index, typed);

    case "borrow": {
      const left = plan.columns[step.index + 1];
      if (typed === left.top) return "借りたら、となりの 数は 1 へるよ";
      if (typed === left.top - 2) return "へらしすぎだね。へるのは 1 だけ";
      if (typed === left.top + 1) return "ふえるのではなく、へるよ";
      return null;
    }

    case "carry":
      return `くり上がりの 1 は、${placeName(step.index)} の ひとつ 左（${placeName(step.index + 1)}）の 上に 書くよ`;
  }
}

/**
 * いちばん多かったつまずきに対する見立て。
 * 「ひっ算が苦手」で終わらせず、戻るべき場所を名指しする。
 */
export const COLUMN_ADVICE_PRIORITY: ColumnStepKind[] = [
  "write",
  "borrow",
  "carry",
  "point",
  "pad",
];

export function columnAdviceFor(kind: ColumnStepKind): { text: string; unit?: string } {
  switch (kind) {
    case "write":
      return {
        text: "位ごとの たし算・ひき算で つまずいていたよ。20までの 計算を もう少し れんしゅうすると 楽になる",
        unit: "add-sub",
      };
    case "carry":
      return { text: "くり上がりの 1 を どこに 書くかで まよったみたい。かならず ひとつ 左の位の 上だよ" };
    case "borrow":
      return { text: "くり下がりで つまずいていたよ。「となりから 10 を 借りる」を 声に出しながら やってみよう" };
    case "point":
      return { text: "小数点の 位置で まよったみたい。上と下の 小数点と まっすぐ そろう ところ、と おぼえよう" };
    case "pad":
      return { text: "けたを そろえるところで まよったみたい。あいている位には 0 を 書けば そろうよ" };
  }
}
