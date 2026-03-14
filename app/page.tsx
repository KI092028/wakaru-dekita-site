import Link from "next/link";

import { Button } from "@/components/ui/button";

const sections = {
  canDo: ["登録不要で今すぐ利用", "PCで見やすいシンプル設計", "短時間で実務に使える"],
  apps: ["席替え自動作成アプリ（公開中）"],
  coming: ["当番表作成", "学級通信テンプレート", "行事チェックリスト"],
  features: ["保存なしで気軽に使える", "必要な情報だけに絞ったUI", "今後のアプリ追加を前提にした構成"],
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="font-semibold">わかったできる</p>
          <nav className="text-sm text-muted-foreground">先生向けお助けツール</nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-3 text-sm text-blue-600">教員向けMVP</p>
        <h1 className="mb-4 text-4xl font-bold">先生の仕事を、少し軽くする。</h1>
        <p className="mb-8 max-w-2xl text-muted-foreground">登録不要ですぐ使える、教員向けのシンプルなお助けツールサイトです。</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/seating">席替えアプリを使う</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="#about">このサイトについて</a>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-2">
        <SectionCard title="このサイトでできること" items={sections.canDo} />
        <SectionCard title="公開中アプリ" items={sections.apps} />
        <SectionCard title="今後追加予定" items={sections.coming} />
        <SectionCard title="このサイトの特徴" items={sections.features} id="about" />
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© わかったできる</footer>
    </main>
  );
}

function SectionCard({ title, items, id }: { title: string; items: string[]; id?: string }) {
  return (
    <section id={id} className="rounded-xl border p-6">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>・{item}</li>
        ))}
      </ul>
    </section>
  );
}
