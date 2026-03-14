export default function TermsPage() {
  return (
    <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">利用規約</h1>
      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">利用について</h2>
          <p>
            当サイトのツールは、教育目的での個人利用を想定しています。
            商用利用や再配布については、事前にお問い合わせください。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">免責事項</h2>
          <p>
            当サイトのツールの利用により生じたいかなる損害についても、運営者は責任を負いません。
            各ツールの出力結果は参考情報としてご利用ください。
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">禁止事項</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>当サイトへの不正アクセスや過度な負荷をかける行為</li>
            <li>当サイトのコンテンツの無断転載・複製</li>
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
