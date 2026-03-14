"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSeating } from "@/lib/seat-shuffle/generate";
import { parseConditions, parseStudents } from "@/lib/seat-shuffle/parse";
import { printSeating } from "@/lib/seat-shuffle/print";
import { validateSeatRequest } from "@/lib/seat-shuffle/validate";

export function SeatingApp() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [emptySeats, setEmptySeats] = useState(0);

  const [studentsText, setStudentsText] = useState("山田\n田中\n佐藤\n鈴木\n高橋\n渡辺\n伊藤\n小林\n中村\n加藤");
  const [frontRowsText, setFrontRowsText] = useState("");
  const [fixedSeatsText, setFixedSeatsText] = useState("");
  const [nearPairsText, setNearPairsText] = useState("");
  const [apartPairsText, setApartPairsText] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [resultText, setResultText] = useState("");
  const [grid, setGrid] = useState<Array<Array<string | null>>>([]);

  const seatCount = useMemo(() => rows * cols - emptySeats, [rows, cols, emptySeats]);

  const runGenerate = () => {
    const students = parseStudents(studentsText);
    const conditions = parseConditions({
      frontRows: frontRowsText,
      fixedSeats: fixedSeatsText,
      nearPairs: nearPairsText,
      apartPairs: apartPairsText,
    });

    const request = {
      config: { rows, cols, emptySeats },
      students,
      conditions,
    };

    const validation = validateSeatRequest(request);
    setWarnings(validation.warnings);
    if (validation.errors.length > 0) {
      setErrors(validation.errors);
      setApplied([]);
      setGrid([]);
      setResultText("");
      return;
    }

    const result = generateSeating(request);
    setErrors([]);
    setWarnings((prev) => [...prev, ...result.warnings]);
    setApplied(result.applied);
    setGrid(result.grid);
    setResultText(printSeating(result.grid));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>教室設定</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="rows">行数</Label>
              <Input id="rows" type="number" min={1} value={rows} onChange={(e) => setRows(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="cols">列数</Label>
              <Input id="cols" type="number" min={1} value={cols} onChange={(e) => setCols(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="empty">空席数</Label>
              <Input id="empty" type="number" min={0} value={emptySeats} onChange={(e) => setEmptySeats(Number(e.target.value))} />
            </div>
            <p className="text-sm text-muted-foreground md:col-span-3">利用可能な席: {seatCount} 席</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>児童名簿（1行に1人）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={studentsText} onChange={(e) => setStudentsText(e.target.value)} className="min-h-36" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>条件設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>前列にしたい児童（1行に1人）</Label>
              <Textarea value={frontRowsText} onChange={(e) => setFrontRowsText(e.target.value)} />
            </div>
            <div>
              <Label>固定席（「名前 行 列」1行ずつ）</Label>
              <Textarea value={fixedSeatsText} onChange={(e) => setFixedSeatsText(e.target.value)} placeholder="例: 山田 1 1" />
            </div>
            <div>
              <Label>近づけたい児童ペア（「名前1 名前2」）</Label>
              <Textarea value={nearPairsText} onChange={(e) => setNearPairsText(e.target.value)} />
            </div>
            <div>
              <Label>離したい児童ペア（「名前1 名前2」）</Label>
              <Textarea value={apartPairsText} onChange={(e) => setApartPairsText(e.target.value)} />
            </div>
            <Button onClick={runGenerate} className="w-full">席を自動作成する</Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>エラー / 注意表示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!errors.length && !warnings.length && <p className="text-muted-foreground">まだ実行されていません。</p>}
            {errors.map((error) => (
              <p key={error} className="rounded-md bg-red-50 p-2 text-red-700">{error}</p>
            ))}
            {warnings.map((warning, i) => (
              <p key={`${warning}-${i}`} className="rounded-md bg-yellow-50 p-2 text-yellow-700">{warning}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>席配置プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            {!grid.length ? (
              <p className="text-sm text-muted-foreground">実行するとここに席表が表示されます。</p>
            ) : (
              <div className="space-y-2">
                {grid.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
                    {row.map((seat, colIndex) => (
                      <div key={`${rowIndex}-${colIndex}`} className="rounded border p-2 text-center text-sm">
                        {seat ?? "-"}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>条件反映結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!applied.length ? <p className="text-sm text-muted-foreground">反映された条件はありません。</p> : applied.map((item) => <p key={item} className="text-sm">・{item}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>短い使い方メモ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. 名簿を入力し、必要なら条件を追加します。</p>
            <p>2. 「席を自動作成する」を押して結果を確認します。</p>
            <p>3. もう一度押すと再生成できます。</p>
            <Button variant="outline" onClick={() => window.print()}>印刷する</Button>
            {resultText && <pre className="overflow-auto rounded bg-muted p-3 text-xs">{resultText}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
