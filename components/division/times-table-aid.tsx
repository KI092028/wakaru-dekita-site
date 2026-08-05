"use client";

/**
 * 除数の段の九九を、必要なときだけ開いて見られるようにする。
 *
 * 九九がパッと出ないままひっ算に取り組むと、手順を覚えることに使う余力が
 * 九九の思い出しに全部持っていかれる。ここでは手順の習得を目的にしているので、
 * 九九は「見てよい」ことにする。九九そのものは九九の単元で練習する。
 *
 * ただし既定は閉じておく。開かずに解けるならそれが一番よい。
 */
export function TimesTableAid({ divisor }: { divisor: number }) {
  return (
    <details className="rounded-xl border border-input bg-muted/40 px-4 py-2 text-sm">
      <summary className="cursor-pointer select-none font-bold text-muted-foreground">
        {divisor} のだんを 見る
      </summary>
      <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1.5 tabular-nums sm:grid-cols-5">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <li key={n} className="text-center">
            {divisor} × {n} = <span className="font-bold">{divisor * n}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
