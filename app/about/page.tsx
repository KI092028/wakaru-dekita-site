export default function AboutPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">このサイトについて</h1>
      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">コンセプト</h2>
          <p>
            「わかる・できる」は、小学生向けの算数ドリルサイトです。
            すきま時間や家庭学習でサクッと取り組める4択クイズを通じて、
            「わかった」「できた」という達成感を積み重ねられることを目指しています。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">対象ユーザー</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>小学1〜6年生のお子さま</li>
            <li>家庭学習の教材を探している保護者の方</li>
            <li>すきま時間に計算練習をしたい方</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">設計方針</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>登録・ログイン不要、完全無料</li>
            <li>入力したデータはサーバーに保存しない</li>
            <li>スマホ・タブレットでも使いやすい設計</li>
            <li>単元を増やしやすい構成で、今後も拡充予定</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
