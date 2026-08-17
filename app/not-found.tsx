import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * 見つからなかったときのページ。
 *
 * GitHub Pages は 404 のときに 404.html を返す。静的書き出しでは
 * このファイルがそこに書き出されるので、**ここを作っておかないと
 * GitHub の素っ気ない英語の 404 が出る。**
 *
 * 行き止まりにしないこと。ここに来た人は単元を探していた可能性が高いので、
 * 一覧への導線をいちばん大きく置く。
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="mb-4 text-sm font-bold text-primary">404</p>
        <h1 className="mb-4 text-3xl font-bold">ページが 見つかりません</h1>
        <p className="mb-8 text-muted-foreground">
          さがしていた ページは、名前が 変わったか、なくなったのかもしれません。
          <br />
          たんげんの 一覧から さがしてみてください。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/learn">たんげんを えらぶ</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">ホームへ もどる</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
