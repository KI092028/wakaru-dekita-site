const points = [
  { title: "登録・課金なし", desc: "会員登録やクレジットカード情報の入力は一切求めません。" },
  { title: "広告への配慮", desc: "お子さまが安心して使えるよう、過度な広告表示を避けています。" },
  { title: "端末を選ばない", desc: "スマホ・タブレット・PCのブラウザだけで、インストール不要ですぐ使えます。" },
];

export function ParentTrust() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-2 text-center text-2xl font-bold">保護者の方へ</h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          お子さまに安心して使っていただけるよう、シンプルな設計を心がけています。
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border bg-white p-6">
              <h3 className="mb-2 font-bold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
