import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "すきま時間で使える",
    desc: "1問10秒〜。おでかけ前や待ち時間など、ちょっとしたすきま時間にサクッと取り組めます。",
  },
  {
    title: "おうち学習にぴったり",
    desc: "宿題の前後や自主学習の時間に。学年に合わせた単元を選んで、ムリなく続けられます。",
  },
  {
    title: "登録不要・完全無料",
    desc: "アカウント登録や個人情報の入力は一切不要。開いてすぐに問題を解き始められます。",
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
