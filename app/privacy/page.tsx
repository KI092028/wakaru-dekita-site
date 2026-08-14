export default function PrivacyPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">プライバシーポリシー</h1>
      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">情報の収集について</h2>
          <p>
            当サイトでは、アカウント登録や個人情報の入力は一切不要です。
            ドリルの解答結果はブラウザ上でのみ処理され、サーバーには送信・保存されません。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">学習の記録について</h2>
          <p>
            九九ドリルでは「どの九九を覚えたか」を、都道府県では「どの県を覚えたか」を、ひっ算や分度器など手順を1手ずつ進める単元では
            「どの手順でつまずいたか」と取り組んだ回数を、原稿用紙では書きかけの文章を、
            お使いの端末のブラウザ内（localStorage）にのみ保存します。
            この記録がサーバーや外部に送信されることはありません。
            記録するのは学習に関する情報のみで、氏名や連絡先など個人を特定する情報は一切扱いません。
          </p>
          <p className="mt-3">
            記録は端末・ブラウザごとに保存されるため、別の端末では引き継がれません。
            ブラウザの設定でデータを削除した場合や、閲覧履歴の消去を行った場合には記録も消えます。
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
