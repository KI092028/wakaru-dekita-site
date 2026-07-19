import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-white print:hidden">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground transition-colors">
            このサイトについて
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            お問い合わせ
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground">© 2026 わかる・できる</p>
      </div>
    </footer>
  );
}
