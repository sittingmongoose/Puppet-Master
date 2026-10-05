import json, random

# Tiny synthetic dataset: 999 "A" rows and exactly 1 rare "B" row.
rows = [{"id": i, "category": "A"} for i in range(999)] + [{"id": 999, "category": "B"}]

def counts(rs):
    d = {}
    for r in rs:
        d[r["category"]] = d.get(r["category"], 0) + 1
    return d

random.seed(411)
sample1 = random.sample(rows, 20)
random.seed(411)
sample2 = random.sample(rows, 20)

full = counts(rows)
samp = counts(sample1)

result = {
    "total_rows": len(rows),
    "preview_rows": len(sample1),
    "truncated_marker": "showing 20 of 1000 rows",
    "full_dataset_counts": full,
    "sample_counts": samp,
    "sample_misses_rare_category_B": "B" not in samp,
    "repeat_preview_with_same_seed_identical": [r["id"] for r in sample1] == [r["id"] for r in sample2],
    "analytic_probability_a_20_row_sample_misses_B": 0.98,
}
print(json.dumps(result, indent=2))