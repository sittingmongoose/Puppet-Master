import hashlib, json

def h(s):
    return hashlib.sha256(s.encode()).hexdigest()[:12]

# Mini provenance model: notebook cells a -> b; dependencies recorded per output.
world = {
    "dataset:sensor": h("sensor.csv@v1"),
    "env": h("python=3.11.9|duckdb==1.1.3"),
}
cells = {
    "a": "df = read('sensor.csv')",
    "b": "daily = df.groupby('day').sum()",
}
DEPS = {"a": ["dataset:sensor", "env"], "b": ["cell:a", "env"]}

state = {}  # output_id -> {"inputs": {...}, "status": ...}

def record_run(cell, ok=True):
    inputs = {d: (cells[d[5:]] if d.startswith("cell:") else world.get(d)) for d in DEPS[cell]}
    state[cell] = {"inputs": inputs, "status": "current" if ok else "failed",
                   "execution_count": len([1 for s in state.values()]) + 1}
    if not ok:
        state[cell]["error"] = "ValueError: column 'day' not found"

def recompute_statuses(kernel_session=None, fresh_kernel=False):
    for cell_id, rec in state.items():
        if fresh_kernel:
            rec["status"] = "unverified"
            continue
        if rec["status"] == "failed":
            continue
        for d in DEPS[cell_id]:
            cur = cells[d[5:]] if d.startswith("cell:") else world.get(d)
            if rec["inputs"].get(d) != cur:
                rec["status"] = "stale"
                rec["stale_because"] = d
                break

events = []
events.append(("baseline clean run of a,b", lambda: (record_run("a"), record_run("b"))))
events.append(("edit cell a", lambda: cells.__setitem__("a", "df = read('sensor.csv')  # filter nulls")))
events.append(("source dataset changes on disk", lambda: world.__setitem__("dataset:sensor", h("sensor.csv@v2"))))
events.append(("kernel restart", lambda: None))

log = []
log.append(("after baseline run", {c: s["status"] for c, s in state.items()}))
recompute_statuses(); log.append(("after edit of cell a", {c: s["status"] for c, s in state.items()}))
recompute_statuses(); log.append(("after dataset mutation", {c: s["status"] for c, s in state.items()}))
state["a"]["status"] = "unverified"; state["b"]["status"] = "unverified"
log.append(("after kernel restart (session id lost)", {c: s["status"] for c, s in state.items()}))
record_run("a", ok=False); log.append(("after re-run of a fails", {c: s["status"] for c, s in state.items()}))

# Manifest integrity: hash bookkeeping round-trip (tiny synthetic "files").
files = {"sensor.csv": h("sensor.csv@v2"), "nb.ipynb": h("cells:" + "|".join(cells.values()))}
packed = json.dumps(files, sort_keys=True)
reloaded = json.loads(packed)
manifest_ok = all(reloaded[k] == h(v_src := {"sensor.csv": "sensor.csv@v2", "nb.ipynb": "cells:" + "|".join(cells.values())}[k]) for k in files)

print(json.dumps({"status_timeline": [{"event": e, "statuses": st} for e, st in log],
                  "failed_error_captured": state["a"].get("error"),
                  "manifest_hash_roundtrip_ok": manifest_ok}, indent=2))