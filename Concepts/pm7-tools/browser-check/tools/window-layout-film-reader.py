#!/usr/bin/env python3
"""Read native paint evidence from a browser-check window-layout-resize film."""

import json
import math
from pathlib import Path
import re


RESIZE_MARK = re.compile(r"(?:normal|sandbox) [a-z]+-(?:light|dark) rep [1-9][0-9]* (?:740|1920)")
FILM_ROW = "WLR-FILM "


def collect_cases(summary, log_lines):
    if summary.get("stopped") or summary.get("killed"):
        raise ValueError("the recording stopped before the check finished")
    marks = {}
    for mark in summary.get("marks", []):
        label = mark["label"]
        if label in marks:
            raise ValueError(f"duplicate film mark: {label}")
        marks[label] = mark

    cases = {}
    for line in log_lines:
        if FILM_ROW not in line:
            continue
        case = json.loads(line.split(FILM_ROW, 1)[1])
        label = case["label"]
        if not RESIZE_MARK.fullmatch(label) or not label.endswith(" 740"):
            raise ValueError(f"invalid shrink label: {label}")
        if label in cases:
            raise ValueError(f"duplicate film case: {label}")
        cases[label] = case

    expected_marks = {label for cell in cases for label in (cell, cell[:-3] + "1920")}
    if not cases or expected_marks != {label for label in marks if RESIZE_MARK.fullmatch(label)}:
        raise ValueError("resize marks and film rows do not match (run the check with --set film=1)")

    def time_of(label):
        mark = marks[label]
        at = mark.get("at")
        if (not isinstance(at, (float, int)) or not math.isfinite(at) or at < 0
                or mark.get("beforeStart") or mark.get("afterStop")):
            raise ValueError(f"unusable film timestamp: {label}")
        return at

    result = []
    for label, case in cases.items():
        shrink, widen = time_of(label), time_of(label[:-3] + "1920")
        if widen <= shrink:
            raise ValueError(f"widen mark does not follow shrink: {label}")
        result.append({**case, "shrink": shrink, "widen": widen})
    result.sort(key=lambda case: case["shrink"])
    if any(a["widen"] >= b["shrink"] for a, b in zip(result, result[1:])):
        raise ValueError("resize intervals overlap")
    return result


def load_cases(run):
    run = Path(run)
    summary = json.loads((run / "summary.json").read_text(encoding="utf-8-sig"))
    with (run / "run.log").open(encoding="utf-8-sig") as log:
        return collect_cases(summary, log)
