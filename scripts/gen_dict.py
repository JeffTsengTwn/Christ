#!/usr/bin/env python3
"""Generate src/dict.js from assets/dict.csv."""

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "assets" / "dict.csv"
OUT_PATH = ROOT / "src" / "dict.js"
COLUMNS = ("key", "zh", "en")


def load_rows(path):
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None or tuple(reader.fieldnames) != COLUMNS:
            raise SystemExit(f"{path}: header must be {','.join(COLUMNS)}")
        rows = []
        seen = set()
        for line, row in enumerate(reader, start=2):
            key = row["key"]
            if not key:
                raise SystemExit(f"{path}:{line}: empty key")
            if key in seen:
                raise SystemExit(f"{path}:{line}: duplicate key {key}")
            seen.add(key)
            rows.append((key, row["zh"], row["en"]))
        return rows


def render(rows):
    data = {
        "zh": {key: zh for key, zh, _en in rows},
        "en": {key: en for key, _zh, en in rows},
    }
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return (
        "// Generated from assets/dict.csv by scripts/gen_dict.py.\n"
        f"export const dict = {body};\n"
    )


def main():
    if not CSV_PATH.is_file():
        raise SystemExit(f"missing {CSV_PATH}")
    OUT_PATH.write_text(render(load_rows(CSV_PATH)), encoding="utf-8")
    print(f"wrote {OUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit(0)
