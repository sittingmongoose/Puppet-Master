"""Compare named numeric fields only; keep missing/null/unknown distinct."""
import argparse
import json
import math
from common import read, emit


def field(record, path):
    value = record
    for key in path.split("."):
        if not isinstance(value, dict) or key not in value:
            return {"state": "missing"}
        value = value[key]
    numeric = (isinstance(value, int) and not isinstance(value, bool)) or (
        isinstance(value, float) and math.isfinite(value))
    return {"state": "numeric" if numeric else "unknown", "value": value}


def compare(left, right, fields):
    rows = []
    for path in fields:
        a, b = field(left, path), field(right, path)
        row = {"field": path, "left": a, "right": b, "right_minus_left": None, "left_over_right": None}
        if a["state"] == b["state"] == "numeric":
            try:
                delta = b["value"] - a["value"]
                if isinstance(delta, int) or math.isfinite(delta):
                    row["right_minus_left"] = delta
                else:
                    row["arithmetic_issue"] = "nonfinite derived delta"
                if b["value"] != 0:
                    ratio = a["value"] / b["value"]
                    if math.isfinite(ratio):
                        row["left_over_right"] = ratio
                    else:
                        row["arithmetic_issue"] = "nonfinite derived ratio"
            except OverflowError:
                row["arithmetic_issue"] = "derived arithmetic exceeds finite numeric representation"
        rows.append(row)
    return {"comparison": rows, "interpretation": "arithmetic only; no grade, winner, usage aggregation or interval summation"}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("left")
    p.add_argument("right")
    p.add_argument("fields", nargs="+", help="same-unit numeric fields, dotted paths")
    a = p.parse_args()
    emit(compare(json.loads(read(a.left)), json.loads(read(a.right)), a.fields))


if __name__ == "__main__":
    main()
