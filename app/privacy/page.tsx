export default function PrivacyPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">プライバシーポリシー</h1>
      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">情報の収集について</h2>
          <p>
            当サイトでは、アカウント登録や個人情報の入力は一切不要です。
            各ツールに入力されたデータはブラウザ上でのみ処理され、サーバーには送信・保存されません。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">アクセス解析について</h2>
          <p>
            当サイトでは、利用状況の把握のためにアクセス解析ツールを使用する場合があります。
            これらのツールはCookieを使用することがありますが、個人を特定する情報は収集しません。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">ポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更する場合があります。変更後のポリシーはこのページに掲載されます。
          </p>
        </section>
      </div>
    </main>
  );
}
