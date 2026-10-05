import json, random

# Stable vs deterministic ordering on tiny synthetic rows with tied sort keys.
rows_a = [{"rid": 1, "key": "x"}, {"rid": 2, "key": "y"}, {"rid": 3, "key": "x"}]
rows_b = rows_a[:]          # different physical order, same logical content
rows_b.reverse()

by_key_only_a = sorted(rows_a, key=lambda r: r["key"])
by_key_only_b = sorted(rows_b, key=lambda r: r["key"])
tie_order_differs = [r["rid"] for r in by_key_only_a] != [r["rid"] for r in by_key_only_b]

by_key_rid_a = sorted(rows_a, key=lambda r: (r["key"], r["rid"]))
by_key_rid_b = sorted(rows_b, key=lambda r: (r["key"], r["rid"]))
tie_break_identical = by_key_rid_a == by_key_rid_b

# Python's sorted() is stable: equal keys preserve *input* order, so the output
# order depends on physical row order unless an explicit tie-break is declared.
result = {
    "sort_by_key_only_orders": {"input_a": [r["rid"] for r in by_key_only_a],
                                 "input_b": [r["rid"] for r in by_key_only_b]},
    "key_only_order_depends_on_physical_order": tie_order_differs,
    "key_plus_rid_tiebreak_order": [r["rid"] for r in by_key_rid_a],
    "key_plus_rid_identical_across_inputs": tie_break_identical,
}
print(json.dumps(result, indent=2))