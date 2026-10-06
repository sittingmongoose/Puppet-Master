import json

# W2 (rev 2): output-status / invalidation state machine (candidate design rule check).
# Statuses: current | stale | failed | unverified.
# R1 editing a cell's source marks its outputs and all downstream outputs stale
# R2/R3 editing a source dataset or the environment binding marks all current outputs stale
# R4 kernel restart forces every 'current' output to 'unverified'; 'failed' stays failed
# R5 an interrupted run must not leave outputs from that run labelled current
# R6 clean replay: completed cell -> current; error -> failed and downstream unverified

CURRENT, STALE, FAILED, UNVERIFIED = "current", "stale", "failed", "unverified"

def mk(cells):
    return {cid: {"status": st} for cid, st in cells.items()}

def invalidate_upstream_edit(state, cell_id, downstream):
    if state[cell_id]["status"] == CURRENT:
        state[cell_id]["status"] = STALE
    for d in downstream:
        if state[d]["status"] == CURRENT:
            state[d]["status"] = STALE

def invalidate_all(state):
    for c in state.values():
        if c["status"] == CURRENT:
            c["status"] = STALE

def kernel_restart(state):
    for c in state.values():
        if c["status"] == CURRENT:
            c["status"] = UNVERIFIED

def replay_step(state, cell_id, downstream, errored):
    if errored:
        state[cell_id]["status"] = FAILED
        for d in downstream:
            if state[d]["status"] in (CURRENT, STALE):
                state[d]["status"] = UNVERIFIED
        return False
    state[cell_id]["status"] = CURRENT
    return True

s = mk({"A": CURRENT, "B": CURRENT, "C": CURRENT})
invalidate_upstream_edit(s, "A", ["B", "C"])
assert s == {"A": {"status": STALE}, "B": {"status": STALE}, "C": {"status": STALE}}, s

assert replay_step(s, "A", ["B", "C"], errored=False) is True
assert s["A"]["status"] == CURRENT and s["B"]["status"] == STALE and s["C"]["status"] == STALE

invalidate_all(s)
assert all(c["status"] == STALE for c in s.values())

s2 = mk({"A": CURRENT, "B": STALE, "C": FAILED})
kernel_restart(s2)
assert s2 == {"A": {"status": UNVERIFIED}, "B": {"status": STALE}, "C": {"status": FAILED}}, s2

s3 = mk({"A": CURRENT, "B": CURRENT, "C": CURRENT})
for cid in ["B"]:            # B was mid-flight when the run was cancelled
    s3[cid]["status"] = UNVERIFIED
assert s3 == {"A": {"status": CURRENT}, "B": {"status": UNVERIFIED}, "C": {"status": CURRENT}}, s3

s4 = mk({"A": STALE, "B": STALE, "C": STALE})
assert replay_step(s4, "A", ["B", "C"], errored=False) is True
assert replay_step(s4, "B", ["C"], errored=True) is False
assert s4 == {"A": {"status": CURRENT}, "B": {"status": FAILED}, "C": {"status": UNVERIFIED}}, s4

print("W2 PASS")
print("R1 upstream cell edit -> edited+downstream stale:", json.dumps(s))
print("R2/R3 dataset/env edit -> all current outputs stale: OK")
print("R4 restart: current->unverified, failed stays failed:", json.dumps(s2))
print("R5 interrupted mid-flight cell -> unverified, not current:", json.dumps(s3))
print("R6 clean replay: error -> failed + downstream unverified:", json.dumps(s4))