import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "どこでつまずいたかが分かる",
    desc: "ひっ算や分度器は1手ずつ進めます。「不正解」で終わらせず、くり上がり・位取りなど、どの手で止まったのかを分けて記録します。",
  },
  {
    title: "答えは自分で書く",
    desc: "選択肢から選ぶ形はやめました。思い出して書くほうが力になるためです。まちがえたときは、何をまちがえたのかを1行で返します。",
  },
  {
    title: "登録不要・完全無料",
    desc: "アカウント登録や個人情報の入力は一切不要。学習の記録もお使いの端末の中だけに保存し、サーバーには送りません。",
  },
];

export function Features() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold">選ばれる理由</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
