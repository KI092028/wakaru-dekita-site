import type { Metadata } from "next";
import Link from "next/link";

import { RecordList } from "@/components/record/record-list";

export const metadata: Metadata = {
  title: "じぶんの記録 | わかる・できる",
  description:
    "この端末に残っている学習の記録をまとめて見られます。記録はブラウザの中だけに保存され、サーバーには送られません。単元ごとにも、まとめても消せます。",
};

export default function RecordPage() {
  return (
    <main className="flex-1 bg-white py-16">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="mb-2 text-center text-3xl font-bold">じぶんの記録</h1>
        <p className="mb-10 text-center text-muted-foreground">
          やったことが のこっている 単元だけ ならびます。
        </p>

        <RecordList />

        <div className="mt-10 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="mb-2 font-bold text-foreground">記録の しくみ</p>
          <p>
            記録は、お使いの端末のブラウザの中（localStorage）にだけ保存されます。
            サーバーには送られないので、別の端末や別のブラウザには引き継がれません。
            ブラウザの閲覧履歴を消すと、記録も一緒に消えます。
          </p>
          <p className="mt-2">
            くわしくは
            <Link href="/privacy" className="mx-1 font-medium text-primary underline-offset-4 hover:underline">
              プライバシーポリシー
            </Link>
            をご覧ください。
          </p>
        </div>
      </div>
    </main>
  );
}
