import { cn } from "@/lib/utils";
import { TABLE_SIZE, cellStatus, type Progress } from "@/lib/quiz/progress";

const STATUS_STYLE = {
  untouched: "bg-muted border-border",
  learning: "bg-primary/25 border-primary/40",
  mastered: "bg-success/80 border-success",
  weak: "bg-danger/15 border-danger",
} as const;

const LEGEND = [
  { status: "mastered", label: "マスター" },
  { status: "learning", label: "れんしゅう中" },
  { status: "weak", label: "にがて" },
  { status: "untouched", label: "まだ" },
] as const;

const numbers = Array.from({ length: TABLE_SIZE }, (_, i) => i + 1);

/** 九九81マスの習得状況を表で示す。 */
export function TimesTableGrid({ progress }: { progress: Progress }) {
  return (
    <div>
      <div className="grid grid-cols-[1.25rem_repeat(9,minmax(0,1fr))] gap-[3px]">
        <span aria-hidden />
        {numbers.map((b) => (
          <span key={`head-${b}`} className="text-center text-[10px] leading-4 text-muted-foreground">
            {b}
          </span>
        ))}

        {numbers.map((a) => (
          <div key={`row-${a}`} className="contents">
            <span className="flex items-center justify-center text-[10px] text-muted-foreground">{a}</span>
            {numbers.map((b) => (
              <span
                key={`${a}x${b}`}
                title={`${a} × ${b}`}
                className={cn("aspect-square rounded-[3px] border", STATUS_STYLE[cellStatus(progress, a, b)])}
              />
            ))}
          </div>
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {LEGEND.map(({ status, label }) => (
          <li key={status} className="flex items-center gap-1">
            <span className={cn("h-3 w-3 rounded-[3px] border", STATUS_STYLE[status])} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
