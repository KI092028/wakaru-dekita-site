import Link from "next/link";

import { SeatingApp } from "@/components/seating/seating-app";
import { Button } from "@/components/ui/button";

export default function SeatingPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">席替え自動作成アプリ</h1>
            <p className="text-sm text-muted-foreground">登録不要・保存なし。条件を入れてすぐ作成できます。</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">トップへ戻る</Link>
          </Button>
        </div>
        <SeatingApp />
      </div>
    </main>
  );
}
