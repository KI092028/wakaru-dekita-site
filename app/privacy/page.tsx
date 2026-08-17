import Link from "next/link";

import { storedItems } from "@/lib/storage/keys";

/**
 * 保存しているものの一覧は `lib/storage/keys.ts` から作る。
 * ここに手で書くと、単元を足したときに必ず書き忘れる
 * （実際に一度、原稿用紙の追加で書き足すのを忘れかけている）。
 */
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
            学習の記録は、お使いの端末のブラウザ内（localStorage）にのみ保存します。
            この記録がサーバーや外部に送信されることはありません。
            記録するのは学習に関する情報のみで、氏名や連絡先など個人を特定する情報は一切扱いません。
          </p>

          <p className="mb-2 mt-4 font-medium text-foreground">保存している内容</p>
          <ul className="space-y-1.5">
            {storedItems.map((item) => (
              <li key={item.key} className="text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="mx-1.5">…</span>
                <span>{item.what}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4">
            記録は端末・ブラウザごとに保存されるため、別の端末では引き継がれません。
            ブラウザの設定でデータを削除した場合や、閲覧履歴の消去を行った場合には記録も消えます。
          </p>
          <p className="mt-3">
            保存されている記録は
            <Link href="/record" className="mx-1 font-medium text-primary underline-offset-4 hover:underline">
              じぶんの記録
            </Link>
            のページで確認でき、単元ごとにも、まとめても削除できます。
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
