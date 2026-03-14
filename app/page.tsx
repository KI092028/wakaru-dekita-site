import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex-1 bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-medium text-primary">教員向け・登録不要</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight">
              先生の仕事を、<br />少し軽くする。
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              登録不要ですぐ使える、教員向けのシンプルなお助けツールサイトです。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/apps/seat-shuffle">席替えアプリを使う</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">このサイトについて</Link>
              </Button>
            </div>
          </div>

          {/* Preview card */}
          <div className="hidden md:block">
            <div className="rounded-xl border bg-muted/40 p-6 shadow-sm">
              <p className="mb-4 flex justify-center">
                <span className="rounded border border-dashed px-6 py-1 text-xs text-muted-foreground">
                  教卓（前）
                </span>
              </p>
              <div className="mb-3 grid grid-cols-5 gap-1.5">
                {[
                  "山田", "田中", "佐藤", "鈴木", "高橋",
                  "渡辺", "伊藤", null,   "中村", "加藤",
                  "小林", "木村", "清水", "斎藤", "松本",
                  "橋本", "井上", "木下", "石川", "田村",
                ].map((name, i) => (
                  <div
                    key={i}
                    className={`flex h-8 items-center justify-center rounded border text-xs font-medium ${
                      name === null
                        ? "bg-muted text-muted-foreground"
                        : i < 5
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "bg-white"
                    }`}
                  >
                    {name ?? ""}
                  </div>
                ))}
              </div>
              <p className="text-right text-xs text-muted-foreground">席替えアプリのプレビュー</p>
            </div>
          </div>
        </div>
      </section>

      {/* このサイトでできること */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">このサイトでできること</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "学級経営を助ける",
                desc: "席替えや座席管理など、日々の学級運営をサポートするツールを揃えています。",
              },
              {
                title: "校務を少し早くする",
                desc: "繰り返し発生する業務を効率化して、本来の仕事に集中できる時間を作ります。",
              },
              {
                title: "すぐ使える形で届ける",
                desc: "登録不要。開いてすぐ使えるシンプルな設計で、忙しい先生の負担を増やしません。",
              },
            ].map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 公開中アプリ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-2xl font-bold">公開中アプリ</h2>
          <div className="max-w-sm">
            <Card className="border-primary/30 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-3 flex gap-2">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    公開中
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    登録不要
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold">席替え自動作成</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  名簿と条件を入れるだけで、席配置案をすばやく作成できます。
                </p>
                <Button asChild className="w-full">
                  <Link href="/apps/seat-shuffle">開く</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 今後追加予定 */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-2xl font-bold">今後追加予定</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["学級通信支援", "教材テンプレ", "校務時短ツール"].map((item) => (
              <div key={item} className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">{item}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">準備中</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* このサイトの特徴 */}
      <section id="about" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">このサイトの特徴</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "登録不要",
                desc: "アカウント作成やログインは一切不要。アクセスしてすぐに使い始められます。",
              },
              {
                title: "シンプル操作",
                desc: "必要な情報だけに絞ったUIで、初めてでも迷わずに使えます。",
              },
              {
                title: "教員目線で設計",
                desc: "忙しい先生が使うことを想定して、操作ステップを最小限に設計しています。",
              },
            ].map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
