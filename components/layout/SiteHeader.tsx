import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="whitespace-nowrap text-base font-bold text-foreground transition-colors hover:text-primary sm:text-lg"
        >
          わかる・できる
        </Link>
        <nav className="flex items-center gap-4 whitespace-nowrap text-sm sm:gap-6">
          <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
            ホーム
          </Link>
          <Link href="/learn" className="text-muted-foreground transition-colors hover:text-foreground">
            まなぶ
          </Link>
          <Link
            href="/record"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            きろく
          </Link>
          {/* 狭い画面では省略。フッターから辿れる */}
          <Link
            href="/about"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            このサイトについて
          </Link>
        </nav>
      </div>
    </header>
  );
}
