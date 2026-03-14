"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSeating } from "@/lib/seat-shuffle/generate";
import { parseConditions, parseStudents } from "@/lib/seat-shuffle/parse";
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
  const [grid, setGrid] = useState<Array<Array<string | null>>>([]);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const seatCount = useMemo(() => rows * cols - emptySeats, [rows, cols, emptySeats]);

  const fixedNames = useMemo(() => {
    return fixedSeatsText
      .split("\n")
      .map((line) => line.trim().split(/[\s,、]+/)[0])
      .filter(Boolean);
  }, [fixedSeatsText]);

  const frontNames = useMemo(() => {
    return frontRowsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [frontRowsText]);

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
      setGeneratedAt(null);
      return;
    }

    const result = generateSeating(request);
    setErrors([]);
    setWarnings((prev) => [...prev, ...result.warnings]);
    setApplied(result.applied);
    setGrid(result.grid);
    setGeneratedAt(new Date());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* 左カラム：入力パネル */}
      <div className="space-y-4 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>教室設定</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="rows">行数</Label>
              <Input
                id="rows"
                type="number"
                min={1}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="cols">列数</Label>
              <Input
                id="cols"
                type="number"
                min={1}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="empty">空席数</Label>
              <Input
                id="empty"
                type="number"
                min={0}
                value={emptySeats}
                onChange={(e) => setEmptySeats(Number(e.target.value))}
              />
            </div>
            <p className="text-sm text-muted-foreground md:col-span-3">
              利用可能な席: {seatCount} 席
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>児童名簿（1行に1人）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              className="min-h-36"
              placeholder="山田&#10;田中&#10;佐藤"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>条件設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>前列にしたい児童（1行に1人）</Label>
              <Textarea
                value={frontRowsText}
                onChange={(e) => setFrontRowsText(e.target.value)}
                placeholder="山田&#10;田中"
              />
            </div>
            <div>
              <Label>固定席（「名前 行 列」1行ずつ）</Label>
              <Textarea
                value={fixedSeatsText}
                onChange={(e) => setFixedSeatsText(e.target.value)}
                placeholder="山田 1 1"
              />
            </div>
            <div>
              <Label>近づけたい児童ペア（「名前1 名前2」）</Label>
              <Textarea
                value={nearPairsText}
                onChange={(e) => setNearPairsText(e.target.value)}
                placeholder="山田 田中"
              />
            </div>
            <div>
              <Label>離したい児童ペア（「名前1 名前2」）</Label>
              <Textarea
                value={apartPairsText}
                onChange={(e) => setApartPairsText(e.target.value)}
                placeholder="佐藤 鈴木"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={runGenerate} className="flex-1">
                {grid.length > 0 ? "再生成する" : "席を作成する"}
              </Button>
              {grid.length > 0 && (
                <Button variant="outline" onClick={handlePrint}>
                  印刷
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使い方</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. 名簿を入力してください（1行に1人）。</p>
            <p>2. 必要なら条件を追加してください。</p>
            <p>3. 「席を作成する」を押すと席表が生成されます。</p>
            <p>4. もう一度押すと再生成できます。</p>
            <p>5. 「印刷」を押すと席表のみ印刷できます。</p>
          </CardContent>
        </Card>
      </div>

      {/* 右カラム：結果表示 */}
      <div className="space-y-4">
        {/* エラー / 注意（印刷時非表示） */}
        {(errors.length > 0 || warnings.length > 0) && (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>エラー / 注意</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {errors.map((error) => (
                <p key={error} className="rounded-md bg-red-50 p-2 text-red-700">
                  {error}
                </p>
              ))}
              {warnings.map((warning, i) => (
                <p key={`${warning}-${i}`} className="rounded-md bg-yellow-50 p-2 text-yellow-700">
                  {warning}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 席配置プレビュー */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>席配置プレビュー</CardTitle>
            {generatedAt && (
              <span className="text-xs text-muted-foreground">
                作成日: {generatedAt.toLocaleDateString("ja-JP")}
              </span>
            )}
          </CardHeader>
          <CardContent>
            {!grid.length ? (
              <p className="text-sm text-muted-foreground">実行するとここに席表が表示されます。</p>
            ) : (
              <div>
                <div className="mb-3 flex justify-center">
                  <span className="rounded border border-dashed px-8 py-1 text-xs text-muted-foreground">
                    教卓（前）
                  </span>
                </div>
                <div className="space-y-1.5">
                  {grid.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex gap-1.5 justify-center"
                    >
                      {row.map((seat, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`flex h-10 min-w-[3rem] flex-1 max-w-[5rem] items-center justify-center rounded border text-xs font-medium ${
                            seat === null
                              ? "bg-muted text-muted-foreground"
                              : fixedNames.includes(seat)
                                ? "border-orange-300 bg-orange-50 text-orange-800"
                                : frontNames.includes(seat)
                                  ? "border-primary/40 bg-primary/5 text-primary"
                                  : "bg-white"
                          }`}
                        >
                          {seat ?? ""}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground print:hidden">
                  {frontNames.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-3 w-3 rounded border border-primary/40 bg-primary/5" />
                      前列優先
                    </span>
                  )}
                  {fixedNames.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-3 w-3 rounded border border-orange-300 bg-orange-50" />
                      固定席
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-muted" />
                    空席
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 条件反映結果 */}
        {grid.length > 0 && (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>条件反映結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {!applied.length ? (
                <p className="text-sm text-muted-foreground">反映された条件はありません。</p>
              ) : (
                applied.map((item) => (
                  <p key={item} className="text-sm">
                    ・{item}
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
