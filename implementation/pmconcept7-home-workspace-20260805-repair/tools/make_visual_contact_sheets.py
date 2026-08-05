#!/usr/bin/env python3
"""Build labeled contact sheets for the PMConcept7 repair visual matrix."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--screenshots", type=Path, required=True)
    parser.add_argument("--outdir", type=Path, required=True)
    parser.add_argument("--per-sheet", type=int, default=12)
    args = parser.parse_args()

    paths = sorted(args.screenshots.glob("*.png"))
    if len(paths) != 72:
        raise SystemExit(f"expected 72 screenshots, found {len(paths)}")

    args.outdir.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default()
    cell_w, cell_h = 480, 300
    label_h = 22
    columns = 3
    rows = (args.per_sheet + columns - 1) // columns

    for sheet_index, offset in enumerate(range(0, len(paths), args.per_sheet), start=1):
        group = paths[offset : offset + args.per_sheet]
        canvas = Image.new("RGB", (columns * cell_w, rows * (cell_h + label_h)), "#111318")
        draw = ImageDraw.Draw(canvas)
        for index, path in enumerate(group):
            image = Image.open(path).convert("RGB")
            image.thumbnail((cell_w, cell_h), Image.Resampling.LANCZOS)
            column = index % columns
            row = index // columns
            x = column * cell_w + (cell_w - image.width) // 2
            y = row * (cell_h + label_h) + (cell_h - image.height) // 2
            canvas.paste(image, (x, y))
            draw.text(
                (column * cell_w + 7, row * (cell_h + label_h) + cell_h + 4),
                path.stem,
                fill="#f4f6fa",
                font=font,
            )
        canvas.save(args.outdir / f"contact-sheet-{sheet_index:02d}.jpg", quality=88, optimize=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
