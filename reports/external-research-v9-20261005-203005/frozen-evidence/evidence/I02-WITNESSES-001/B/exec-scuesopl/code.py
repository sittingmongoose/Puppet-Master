import hashlib, json

def h(s):
    return hashlib.sha256(s.encode()).hexdigest()[:12]

# Mini provenance model: cells a -> b; each saved output records its input hashes.
world = {"dataset:sensor": h("sensor.csv@v1"),
         "env": h("python=3.11.9|duckdb==1.1.3")}
cells = {"a": "df = read('sensor.csv')",
         "b": "daily = df.groupby('day').sum()"}
DEPS = {"a": ["dataset:sensor", "env"], "b": ["cell:a", "env"]}

state = {}

def record_run(cell, ok=True):
    inputs = {d: (cells[d[5:]] if d.startswith("cell:") else world[d]) for d in DEPS[cell]}
    state[cell] = {"inputs": inputs,
                   "status": "current" if ok else "failed",
                   "execution_count": len(state) + 1}
    if not ok:
        state[cell]["error"] = "ValueError: column 'day' not found"

def recompute_statuses():
    for cell_id, rec in state.items():
        if rec["status"] == "failed":
            continue
        for d in DEPS[cell_id]:
            cur = cells[d[5:]] if d.startswith("cell:") else world[d]
            if rec["inputs"].get(d) != cur:
                rec["status"] = "stale"
                rec["stale_because"] = d
                break

log = []
record_run("a"); record_run("b")
log.append(("baseline clean run of a,b", {c: s["status"] for c, s in state.items()}))

cells["a"] = "df = read('sensor.csv')  # filter nulls"
recompute_statuses()
log.append(("after editing cell a", {c: s["status"] for c, s in state.items()}))

world["dataset:sensor"] = h("sensor.csv@v2")
recompute_statuses()
log.append(("after source dataset mutated on disk", {c: s["status"] for c, s in state.items()}))

state["a"]["status"] = "unverified"; state["b"]["status"] = "unverified"
log.append(("after kernel restart (session id lost; outputs kept)", {c: s["status"] for c, s in state.items()}))

record_run("a", ok=False)
log.append(("after re-run of a fails", {c: s["status"] for c, s in state.items()}))

# Manifest integrity: sha256 bookkeeping round-trip over tiny synthetic files.
file_sources = {"sensor.csv": "sensor.csv@v2",
                "nb.ipynb": "cells:" + "|".join(cells.values())}
files = {k: h(v) for k, v in file_sources.items()}
reloaded = json.loads(json.dumps(files, sort_keys=True))
manifest_ok = all(reloaded[k] == h(file_sources[k]) for k in file_sources)

print(json.dumps({"status_timeline": [{"event": e, "statuses": st} for e, st in log],
                  "failed_error_captured": state["a"].get("error"),
                  "stale_reasons_recorded": {c: state[c].get("stale_because") for c in state if state[c].get("stale_because")},
                  "manifest_hash_roundtrip_ok": manifest_ok}, indent=2))