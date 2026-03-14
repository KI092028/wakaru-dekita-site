import { SeatingApp } from "@/components/seating/seating-app";

export default function SeatingPage() {
  return (
    <main className="flex-1 bg-muted/30 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">席替え自動作成アプリ</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                名簿と条件を入れるだけで、席配置案をすばやく作成できます。
              </p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                公開中
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                登録不要
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                保存なし
              </span>
            </div>
          </div>
        </div>
        <SeatingApp />
      </div>
    </main>
  );
}
