import {
  clockText,
  crossesHour,
  deltaText,
  hourOf,
  minuteOf,
  onDial,
  type ClockPlan,
} from "./plan";

/**
 * 時こく・時間の1手ごとの問いと、間違えたときに返す言葉。
 *
 * 手は3つ。
 *
 * 1. `set`     出発の時こくに 針を 合わせる（読むことの裏返し）
 * 2. `advance` ◯分 すすめる・もどす **← 12をまたぐのはここ**
 * 3. `read`    いま何時何分かを 打つ
 */

export type ClockStepKind = "set" | "advance" | "read";

export const CLOCK_STEP_KINDS: ClockStepKind[] = ["set", "advance", "read"];

export const CLOCK_STEP_LABEL: Record<ClockStepKind, string> = {
  set: "時こくに合わせる",
  advance: "すすめる・もどす",
  read: "読む",
};

export const CLOCK_STEP_SHORT: Record<ClockStepKind, string> = {
  set: "合わせる",
  advance: "うごかす",
  read: "読む",
};

/** 助言の優先順。またぎを外していれば、そこを先に見る。 */
export const CLOCK_ADVICE_PRIORITY: ClockStepKind[] = ["advance", "read", "set"];

export function clockStepPrompt(plan: ClockPlan, kind: ClockStepKind): string {
  switch (kind) {
    case "set":
      return `長い針を 動かして、${clockText(plan.start)} に 合わせよう`;
    case "advance":
      return plan.delta >= 0
        ? `そこから ${plan.delta}分 すすめよう`
        : `そこから ${-plan.delta}分 もどそう`;
    case "read":
      return "いま 何時何分？";
  }
}

/** 針の合わせちがい。 */
export function diagnoseSet(plan: ClockPlan, at: number): string {
  const want = onDial(plan.start);
  const got = onDial(at);

  if (got % 60 === want % 60) {
    return `分は 合っているよ。時が ちがうね。${clockText(plan.start)} なので、短い針が ${hourOf(plan.start)} と ${hourOf(plan.start) === 12 ? 1 : hourOf(plan.start) + 1} の 間に 来るよ`;
  }
  return `いまは ${clockText(got)} だね。${clockText(plan.start)} に 合わせよう。長い針が 分、短い針が 時だよ`;
}

/** 動かす量のちがい。**向きちがいをまず名指しする。** */
export function diagnoseAdvance(plan: ClockPlan, moved: number): string {
  const want = plan.delta;

  if (moved === 0) {
    return `まだ 動かしていないよ。長い針を つかんで ${deltaText(want)}の ほうへ 回そう`;
  }
  if (moved > 0 !== want > 0) {
    return want > 0
      ? `もどしているよ。${want}分 すすめるので、右まわりに 回そう`
      : `すすめているよ。${-want}分 もどすので、左まわりに 回そう`;
  }

  const short = Math.abs(want) - Math.abs(moved);
  return short > 0
    ? `いま ${Math.abs(moved)}分 動かしたよ。あと ${short}分`
    : `いま ${Math.abs(moved)}分 動かしたよ。${Math.abs(want)}分 なので ${-short}分 もどりすぎ`;
}

/**
 * 読みちがい。
 *
 * **時をくり上げ忘れた形をいちばんに拾う。**
 * 10時40分の30分後を「10時10分」と読むのがこの単元の代表的な誤りで、
 * 長い針だけを見て短い針を見ていないと必ずこうなる。
 */
export function diagnoseRead(plan: ClockPlan, hour: number, minute: number): string | null {
  const wantHour = hourOf(plan.end);
  const wantMinute = minuteOf(plan.end);
  if (hour === wantHour && minute === wantMinute) return null;

  // 分は合っているが、時をくり上げ忘れた
  if (minute === wantMinute && hour === hourOf(plan.start) && crossesHour(plan)) {
    return `分は 合っているよ。長い針が 12 を こえたので、時が 1つ すすんで ${wantHour}時 だね。短い針を 見てみよう`;
  }

  // 60をこえた分をそのまま言った（10時70分 の形）
  const raw = minuteOf(plan.start) + plan.delta;
  if (raw >= 60 && minute === raw && hour === hourOf(plan.start)) {
    return `${raw}分 とは 言わないね。60分で 1時間 なので、${raw} − 60 = ${raw - 60}。${wantHour}時${wantMinute}分 だよ`;
  }

  if (minute === wantMinute) {
    return `分は 合っているよ。短い針は ${wantHour} と ${wantHour === 12 ? 1 : wantHour + 1} の 間に あるので ${wantHour}時 だね`;
  }
  if (hour === wantHour) {
    return `時は 合っているよ。長い針を 見ると ${wantMinute}分 だね`;
  }
  return `${clockText(plan.end)} だよ。長い針が 分、短い針が 時`;
}

/** 何回もそこで止まっている子への提案。 */
export function clockAdviceFor(kind: ClockStepKind): { text: string } | null {
  switch (kind) {
    case "set":
      return {
        text: "長い針は 1目もりが 5分。12から 5とびで 数えると、いまが 何分か 分かるよ。",
      };
    case "advance":
      return {
        text: "動かす前に、すすめるのか もどすのかを 先に 決めよう。すすめるなら 右まわりだよ。",
      };
    case "read":
      return {
        text: "長い針が 12 を こえたら、時が 1つ すすむ。分だけでなく 短い針も 見るくせを つけよう。",
      };
  }
}
