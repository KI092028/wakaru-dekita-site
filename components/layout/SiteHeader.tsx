import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
          わかる・できる
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            ホーム
          </Link>
          <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
            まなぶ
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            このサイトについて
          </Link>
        </nav>
      </div>
    </header>
  );
}
