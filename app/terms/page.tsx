import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | わかる・できる",
  description:
    "「わかる・できる」の利用規約。学校の授業と家庭での学習には、申請や連絡なしで自由に使っていただけます。",
};

/**
 * 利用規約。
 *
 * **`/teachers/use` と食い違わせない。** あちらは「印刷して配ってよい」と
 * 書いてあるので、ここに「無断複製を禁ずる」とだけ書くと、
 * 管理職がここを読んだ時点で先生の手が止まる。
 * できることは向こうに寄せ、ここからは指し示すだけにする。
 *
 * 「事前にお問い合わせください」とも書かない。**問い合わせ先が無いのに
 * 問い合わせを求めるのは、断っているのと同じ。** いまの扱いを直接書く。
 */
export default function TermsPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">利用規約</h1>
      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">利用について</h2>
          <p className="leading-relaxed">
            当サイトは、学校の授業と家庭での学習に無料で使っていただくために作っています。
            学校での利用——印刷しての配布、電子黒板・プロジェクターへの投影、
            児童生徒の学習端末での表示など——に、
            <strong className="font-bold text-foreground">申請や連絡は必要ありません。</strong>
          </p>
          <p className="mt-3 leading-relaxed">
            できることの範囲は{" "}
            <Link href="/teachers/use" className="font-medium text-primary underline underline-offset-4">
              授業での利用について
            </Link>{" "}
            にまとめています。
          </p>
          <p className="mt-3 leading-relaxed">
            有償の教材・書籍への転載や、サイトの内容をまとめて別のサイト・教材として
            公開することは、お受けする窓口が用意できていないため、現在はお断りしています
            （
            <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
              お問い合わせ
            </Link>
            ）。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">免責事項</h2>
          <p className="leading-relaxed">
            当サイトの利用により生じたいかなる損害についても、運営者は責任を負いません。
            出題内容は学習の参考としてご利用ください。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">禁止事項</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>当サイトへの不正アクセスや過度な負荷をかける行為</li>
            <li>有償の教材・書籍へ転載すること</li>
            <li>サイトの内容をまとめて複製し、別のサイト・教材として公開すること</li>
            <li>作成者を偽って配布すること</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">規約の変更</h2>
          <p>本規約は予告なく変更する場合があります。</p>
        </section>
      </div>
    </main>
  );
}
