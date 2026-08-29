import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "授業での利用について | わかる・できる",
  description:
    "「わかる・できる」を学校の授業で使うときの範囲をまとめています。印刷しての配布、電子黒板への投影、学習端末での表示は自由に行っていただけます。",
};

export default function TeachersUsePage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/teachers"
        className="mb-6 -mx-1 inline-block px-1 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← 先生の方へ
      </Link>

      <h1 className="mb-4 text-3xl font-bold">授業での利用について</h1>
      <p className="mb-10 leading-relaxed text-muted-foreground">
        学校で使うときに「これは使っていいのか」で手が止まらないよう、
        できることを先に書いておきます。申請や連絡は不要です。
      </p>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">自由に行っていただけること</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>学級での口頭利用（学級レクをそのまま実施する）</li>
            <li>内容を黒板に板書する</li>
            <li>電子黒板・プロジェクターへの投影</li>
            <li>児童生徒の学習端末での表示</li>
            <li>ページを印刷して配布する</li>
            <li>校内研修の資料に引用する（出典としてサイト名とURLを添えてください）</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">ご遠慮いただきたいこと</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>有償の教材・書籍への転載</li>
            <li>サイトの内容をまとめて複製し、別のサイトとして公開すること</li>
            <li>作成者を偽って配布すること</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">児童のデータについて</h2>
          <p>
            このサイトは<strong className="font-bold text-foreground">アカウント登録を必要とせず</strong>、
            氏名やメールアドレスなどの個人情報を一切集めていません。
            学習の記録を残す単元がありますが、記録は
            <strong className="font-bold text-foreground">その端末のブラウザの中だけ</strong>
            に保存され、サーバーには送られません。
          </p>
          <p className="mt-3">
            詳しくは{" "}
            <Link href="/privacy" className="font-bold text-primary underline">
              プライバシーポリシー
            </Link>{" "}
            をご覧ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">学級レクの内容について</h2>
          <p>
            掲載している遊びは、昔から広く行われているものを、こちらの言葉で書き直したものです。
            進め方や声のかけ方は学級の様子によって変わります。
            そのまま使うより、目の前の子どもに合わせて変えていただくほうがうまくいくと思います。
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        ここに書かれていない使い方で迷ったときは、{" "}
        <Link href="/terms" className="font-bold text-primary underline">
          利用規約
        </Link>{" "}
        もあわせてご確認ください。
      </p>
    </main>
  );
}
