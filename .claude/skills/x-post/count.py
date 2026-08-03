#!/usr/bin/env python3
"""Xの投稿文の文字数を、Xと同じ重み付けで数える。

Xのカウント規則:
  - 全角（CJK）は1文字＝2
  - 半角英数・記号・改行は1文字＝1
  - URLは実際の長さに関わらず一律23
  - 上限は280

使い方:
    python3 count.py draft.txt
    cat draft.txt | python3 count.py
    python3 count.py --bio draft.txt   # bio用（上限160、重み付けなし）
"""

import re
import sys
import unicodedata

POST_LIMIT = 280
BIO_LIMIT = 160
URL_WEIGHT = 23
URL_RE = re.compile(r"https?://\S+|(?<![\w.])(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/\S*)?")


def weighted_length(text: str) -> tuple[int, int]:
    """(重み付き文字数, 検出したURL数) を返す。"""
    urls = URL_RE.findall(text)
    stripped = URL_RE.sub("", text)
    total = sum(
        2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1 for ch in stripped
    )
    return total + URL_WEIGHT * len(urls), len(urls)


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--bio"]
    is_bio = "--bio" in sys.argv[1:]

    text = open(args[0], encoding="utf-8").read() if args else sys.stdin.read()
    text = text.rstrip("\n")

    if is_bio:
        n = len(text)
        limit, label = BIO_LIMIT, "bio"
    else:
        n, url_count = weighted_length(text)
        limit, label = POST_LIMIT, "投稿"
        if url_count:
            print(f"  URL {url_count}件を各{URL_WEIGHT}文字として計上")

    ok = n <= limit
    print(f"  {label}: {n} / {limit}  {'OK' if ok else f'超過 {n - limit}'}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
