/**
 * 時こくと時間（2〜3年）。
 *
 * ## つまずきの本体
 *
 * 「10時40分の30分後」が 10時70分 になる。
 * **60分で1時間くり上がる**ことが、ひっ算のくり上がりと結びついていない。
 *
 * 紙の上では、これを直すのに教師が「長い針が12をこえたね」と
 * 横で言うしかない。ここは操作でしか伝わらない場面で、
 * 分度器と同じ理由で画面にする価値がある。
 *
 * ## 短い針も動く
 *
 * もう1つのつまずきは、**時計を進めると短い針も少しずつ動く**ことが
 * 分かっていないこと。10時40分の短い針は 10 と 11 のちょうど間より
 * 少し 11 寄りにある。10 をぴったり指していると思っていると、
 * 12をまたいだときに時が変わったことに気づけない。
 *
 * ここでは短い針を**分に合わせて連続で動かす**。
 * 長い針を回すと短い針もつられて動くので、
 * 12をこえた瞬間に短い針が次の数字に入るのが見える。
 *
 * ## 5分きざみにする
 *
 * 針の先を1分（6度）の精度で指で止めるのは無理がある。
 * 分度器で角の大きさを5の倍数に限ったのと同じ理由で、
 * ここも5分きざみにする。「5とびで読む」のは2年で習うやり方そのもの。
 */

/** 1分＝6度、1時間＝30度。 */
export const MINUTE_DEG = 6;
export const HOUR_DEG = 0.5;

/** 針が止まれるきざみ（分）。 */
export const SNAP_MINUTES = 5;

/** 時計は12時間で一周する。 */
export const CYCLE = 720;

export type ClockPlan = {
  id: string;
  /** 出発の時こく（0:00からの分。0〜719） */
  start: number;
  /** すすめる分。もどす場合は負 */
  delta: number;
  /** 到着の時こく（0〜719） */
  end: number;
  /** 画面に出す文 */
  question: string;
  /** 何を練習する問題か（画面には出さない） */
  stage: string;
};

/** 0〜719 に丸める。時計は12時間で一周するので、24時制は扱わない。 */
export const onDial = (minutes: number): number => ((minutes % CYCLE) + CYCLE) % CYCLE;

/** 「10時40分」。0時は 12時 と読む。 */
export function clockText(minutes: number): string {
  const m = onDial(minutes);
  const hour = Math.floor(m / 60);
  return `${hour === 0 ? 12 : hour}時${m % 60}分`;
}

export const hourOf = (minutes: number): number => {
  const h = Math.floor(onDial(minutes) / 60);
  return h === 0 ? 12 : h;
};

export const minuteOf = (minutes: number): number => onDial(minutes) % 60;

/** 長い針の角度（12時の向きから時計まわり）。 */
export const minuteHandDeg = (minutes: number): number => (onDial(minutes) % 60) * MINUTE_DEG;

/**
 * 短い針の角度。**分に合わせて連続で動く。**
 * 10時40分なら 10 と 11 の間の 3分の2 のところ。
 */
export const hourHandDeg = (minutes: number): number => onDial(minutes) * HOUR_DEG;

/** 針を合わせられたか。文字盤の上での位置が合っていればよい。 */
export const isAtTime = (minutes: number, target: number): boolean =>
  onDial(minutes) === onDial(target);

/**
 * 指定どおり動かせたか。
 *
 * **文字盤の位置ではなく、動かした量そのものを見る。**
 * 30分すすめるところを 30分もどしても文字盤の位置は変わらないので、
 * 位置だけを見ると通ってしまう。ここで見たいのは「12をまたいだか」だから、
 * 進んだ量を積み上げて持っておく必要がある。
 */
export const isMoved = (moved: number, delta: number): boolean => moved === delta;

/** 12 をまたいだか（時がくり上がったか）。 */
export function crossesHour(plan: ClockPlan): boolean {
  return Math.floor(plan.start / 60) !== Math.floor(onDial(plan.start + plan.delta) / 60);
}

/** 「30分後」「20分前」 */
export const deltaText = (delta: number): string =>
  delta >= 0 ? `${delta}分後` : `${-delta}分前`;

/** いちばん近いきざみに丸める。 */
export const snap = (minutes: number): number =>
  Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
