export default function AboutPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">このサイトについて</h1>
      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">コンセプト</h2>
          <p>
            「先生の道具箱」は、教員向けのシンプルなお助けツールサイトです。
            忙しい先生が、登録不要ですぐ使えるツールを届けることを目指しています。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">対象ユーザー</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>小学校・中学校の教員</li>
            <li>学級担任</li>
            <li>特別支援学級担任</li>
            <li>校務を効率化したい教員</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">設計方針</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>登録・ログイン不要</li>
            <li>データはサーバーに保存しない</li>
            <li>PCでの使いやすさを優先</li>
            <li>必要最小限の操作で完結する設計</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
