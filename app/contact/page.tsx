import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ | わかる・できる",
  description:
    "「わかる・できる」へのご連絡について。学校や家庭で使うのに申請や連絡は要りません。記録が消えた・印刷がうまくいかないなど、よくある困りごとの直し方もまとめています。",
};

/**
 * お問い合わせのページ。
 *
 * ## 「準備中です」だけを置かない
 *
 * 窓口がまだ無いのは事実だが、**それだけを書いたページは、
 * 開いた人を突き放して終わる。**
 *
 * ここに来る人の用は、だいたい次の3つ。
 *
 * 1. 使ってよいか確かめたい  → **連絡は要らない**と先に言えば済む
 * 2. うまく動かない          → 自分で直せることが多い
 * 3. 意見・要望を伝えたい    → いまは受け取れない。そこだけを正直に書く
 *
 * 1 と 2 はここで終わらせられる。窓口ができるまでのあいだ、
 * このページが返せる答えは実際にある。
 */
export default function ContactPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-4 text-3xl font-bold">お問い合わせ</h1>
      <p className="mb-10 leading-relaxed text-muted-foreground">
        先に、<strong className="font-bold text-foreground">連絡しなくてよいこと</strong>
        から書いておきます。多くの場合、このページで済みます。
      </p>

      <div className="space-y-10 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            連絡は要りません（そのままお使いください）
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-foreground">学校の授業で使う。</strong>
              印刷して配る、電子黒板に映す、学習端末で開く——
              申請も連絡も要りません。できることの範囲は{" "}
              <Link href="/teachers/use" className="font-medium text-primary underline underline-offset-4">
                授業での利用について
              </Link>{" "}
              にまとめています
            </li>
            <li>
              <strong className="font-medium text-foreground">家庭での学習に使う。</strong>
              登録も、お金も要りません
            </li>
            <li>
              <strong className="font-medium text-foreground">子どものデータが心配。</strong>
              このサイトは氏名も連絡先も集めていません。学習の記録は
              その端末のブラウザの中だけに残ります（
              <Link href="/privacy" className="font-medium text-primary underline underline-offset-4">
                プライバシーポリシー
              </Link>
              ）
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">こまったときに、先に試せること</h2>

          <div className="space-y-6">
            <div>
              <p className="mb-2 font-medium text-foreground">記録が消えた・保存されない</p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                <li>記録はその端末のブラウザの中だけに保存されます。別の端末や別のブラウザには引き継がれません</li>
                <li>プライベートモード（シークレットウィンドウ）で開いていると、閉じたときに消えます</li>
                <li>ブラウザの「閲覧データの削除」を行うと、いっしょに消えます</li>
                <li>
                  いま何が保存されているかは{" "}
                  <Link href="/record" className="font-medium text-primary underline underline-offset-4">
                    じぶんの記録
                  </Link>{" "}
                  のページで確認できます
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2 font-medium text-foreground">印刷がうまくいかない</p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                <li>
                  印刷用に作ってあるのは{" "}
                  <Link href="/learn/manuscript" className="font-medium text-primary underline underline-offset-4">
                    原稿用紙
                  </Link>{" "}
                  と{" "}
                  <Link href="/teachers/rec" className="font-medium text-primary underline underline-offset-4">
                    学級レク
                  </Link>{" "}
                  のページです
                </li>
                <li>用紙はA4、向きはたて、余白は「標準」でお試しください</li>
                <li>ボタンやメニューは印刷には出ません。出ていない部分があっても不具合ではありません</li>
              </ul>
            </div>

            <div>
              <p className="mb-2 font-medium text-foreground">日本地図の県が小さくて押せない</p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">
                <li>
                  全国が出ているあいだは、地図のどこを押しても
                  <strong className="font-medium text-foreground">その地方まで寄ります。</strong>
                  正確に押す必要はありません
                </li>
                <li>寄ってから県を選びます。地図の上の帯からも地方を選べます</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">ご意見・ご要望について</h2>
          <p className="leading-relaxed">
            「ここが分かりにくい」「こんな単元がほしい」を受け取る窓口は、
            <strong className="font-bold text-foreground">まだ用意できていません。</strong>
            ひとりで作っているサイトのため、
            送っていただいたものを確実に受け取って読める形になってから公開したいと考えています。
            用意でき次第、このページに出します。
          </p>
          <p className="mt-3 leading-relaxed">
            いま作る単元は、教室で見てきたつまずきをもとに決めています。
            そこに現場からの声が入ると選び方が変わるので、
            <strong className="font-bold text-foreground">
              「こんな単元がほしい」はいちばん聞きたいこと
            </strong>
            です。もう少しお待ちください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">商用利用・再配布について</h2>
          <p className="leading-relaxed">
            有償の教材や書籍への転載、サイトの内容をまとめて別のサイトとして公開することは、
            お受けする窓口が用意できていないため、現在はお断りしています。
            学校や家庭での教育目的の利用は、上に書いたとおり自由に行っていただけます。
            詳しくは{" "}
            <Link href="/terms" className="font-medium text-primary underline underline-offset-4">
              利用規約
            </Link>{" "}
            をご覧ください。
          </p>
        </section>
      </div>
    </main>
  );
}
