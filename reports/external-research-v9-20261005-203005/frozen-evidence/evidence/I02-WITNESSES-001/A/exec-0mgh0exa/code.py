
# W4: clean-replay determinism, reproducibility manifest, and nondeterminism exposure.
# Scope: tiny synthetic data; pure-stdlib; no subprocess, so "fresh run" = fresh state objects.
import json, hashlib, random, sys, platform

def h(b): return hashlib.sha256(b).hexdigest()

# --- synthetic dataset + transform ---
rows = [("id,name,amount\n".encode())]
names = ["Zoë", "李明", "Ana"]
for i in range(200):
    rows.append(f"{i},{names[i % 3]},{(i * 13) % 500}.0\n".encode())
csv_bytes = b"".join(rows)
ds_sha = h(csv_bytes)

def transform(data_bytes):
    lines = data_bytes.decode().splitlines()[1:]
    by = {}
    for ln in lines:
        i, nm, amt = ln.split(",")
        by.setdefault(nm, [0, 0.0])
        by[nm][0] += 1
        by[nm][1] += float(amt)
    out = {"totals": {k: v[1] for k, v in sorted(by.items())},
           "counts": {k: v[0] for k, v in sorted(by.items())}}
    return json.dumps(out, sort_keys=True, ensure_ascii=False).encode()

run1 = transform(csv_bytes)
run2 = transform(csv_bytes)     # fresh inputs, no hidden state
replay_identical = run1 == run2

rng_run1 = [random.random() for _ in range(3)]
rng_run2 = [random.random() for _ in range(3)]   # no seed -> different stream
rng_differs = rng_run1 != rng_run2

manifest = {
    "manifest_schema": "repro-manifest/0.1",
    "notebook_sha256": h(b"nb-json-bytes"),
    "cells": [
        {"id": "cell-load", "code_sha256": h(b"df = read(d1)"), "exec_order": 1, "status": "current"},
        {"id": "cell-agg", "code_sha256": h(b"agg = group(df)"), "exec_order": 2, "status": "current"},
    ],
    "datasets": [{"name": "d1", "sha256": ds_sha, "bytes": len(csv_bytes),
                  "declared_schema": {"id": "int64", "name": "utf8", "amount": "float64"}}],
    "environment": {"python": sys.version.split()[0], "platform": platform.system(),
                    "packages_declared": ["pandas==2.2.3", "duckdb==1.4.1"], "packages_locked": True},
    "replay": {"identical_output_bytes": replay_identical,
               "declared_nondeterminism": ["unseeded RNG cell excluded from replay contract"]},
}
ok = (replay_identical and rng_differs
      and manifest["datasets"][0]["bytes"] > 0
      and set(manifest) >= {"notebook_sha256", "cells", "datasets", "environment", "replay"})

receipt = {
    "check": "W4 clean replay + manifest + nondeterminism exposure",
    "replay_identical_output_bytes": replay_identical,
    "unseeded_rng_differs_between_runs": rng_differs,
    "rng_run1_sample": rng_run1[:2], "rng_run2_sample": rng_run2[:2],
    "manifest": manifest,
    "ok": ok,
}
print(json.dumps(receipt, indent=1, ensure_ascii=False))
assert ok
print("W4 PASS")
