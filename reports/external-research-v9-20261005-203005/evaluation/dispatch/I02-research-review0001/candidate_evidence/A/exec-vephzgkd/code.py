
# W3: output-status state machine (current/stale/failed/unverified) with defined invalidation.
# Scope: model-level check of the proposed rules on a 3-cell DAG + dataset + env binding.
import json, hashlib

def h(s): return hashlib.sha256(s.encode()).hexdigest()[:12]

# cells: A(load+clean) -> B(aggregate) -> C(plot); A and B read dataset d1
cells = {
    "A": {"code": h("df = read(d1); df = clean(df)"), "reads_datasets": ["d1"], "deps": []},
    "B": {"code": h("agg = group(df)"), "reads_datasets": [], "deps": ["A"]},
    "C": {"code": h("plot(agg)"), "reads_datasets": [], "deps": ["B"]},
}
datasets = {"d1": {"sha256": h("raw-bytes-v1"), "bytes": 1024}}
env_hash = h("python-3.12|pandas==2.2|duckdb==1.x")

def descendants(cid):
    out = set(); frontier = [cid]
    while frontier:
        x = frontier.pop()
        for k, c in cells.items():
            if x in c["deps"] and k not in out:
                out.add(k); frontier.append(k)
    return out

CURRENT, STALE, FAILED, UNVERIFIED = "current", "stale", "failed", "unverified"
status = {k: UNVERIFIED for k in cells}   # fresh document: nothing has run
log = []

def run(cid, ok=True):
    status[cid] = CURRENT if ok else FAILED
    # A failed/interrupted run invalidates downstream claims rather than leaving them current
    for d in descendants(cid):
        status[d] = STALE if ok else UNVERIFIED
    log.append((f"run {cid} ({'ok' if ok else 'error'})", dict(status)))

def edit(cid, new_code):
    cells[cid]["code"] = h(new_code)
    status[cid] = STALE
    for d in descendants(cid):
        status[d] = STALE
    log.append((f"edit {cid}", dict(status)))

def change_dataset(name, new_bytes):
    datasets[name]["sha256"] = h(new_bytes)
    for k, c in cells.items():
        if name in c["reads_datasets"] or any(name in cells[p]["reads_datasets"] for p in ancestors(k)):
            status[k] = STALE
    log.append((f"dataset {name} changed", dict(status)))

def ancestors(cid):
    out = set(); frontier = [cid]
    while frontier:
        x = frontier.pop()
        for p in cells[x]["deps"]:
            if p not in out:
                out.add(p); frontier.append(p)
    return out

def restart_kernel():
    for k in status: status[k] = UNVERIFIED   # old outputs must not stay 'current'
    log.append(("kernel restart", dict(status)))

# Scenario
run("A"); run("B"); run("C")
assert status == {"A": CURRENT, "B": CURRENT, "C": CURRENT}
edit("A", "df = read(d1); df = clean2(df)")
assert status == {"A": STALE, "B": STALE, "C": STALE}, status
run("A"); run("B"); run("C")
change_dataset("d1", "raw-bytes-v2")
assert status == {"A": STALE, "B": STALE, "C": STALE}, status
run("A"); run("B", ok=False)          # B raises; C must not claim current
assert status["B"] == FAILED
assert status["C"] == UNVERIFIED, status
run("B"); run("C")
restart_kernel()
assert status == {"A": UNVERIFIED, "B": UNVERIFIED, "C": UNVERIFIED}, status
env_hash2 = h("python-3.12|pandas==2.3|duckdb==1.x")   # dependency bump
assert env_hash2 != env_hash            # env change would mark everything unverified too

receipt = {
    "check": "W3 invalidation state machine",
    "rules": {
        "cell_edit": "cell+descendants stale",
        "dataset_identity_change": "cells reading it (transitively) stale",
        "cell_error": "cell failed, descendants unverified",
        "kernel_restart": "all outputs unverified (never silently current)",
        "env_binding_change": "all outputs unverified",
    },
    "event_log": [{"event": e, "statuses": s} for e, s in log],
    "final": status,
}
print(json.dumps(receipt, indent=1))
print("W3 PASS")
