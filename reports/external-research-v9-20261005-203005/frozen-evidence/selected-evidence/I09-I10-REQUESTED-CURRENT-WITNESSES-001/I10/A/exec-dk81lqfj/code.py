import json, hashlib, copy

def sha(b): return hashlib.sha256(b).hexdigest()

def canon(m): return json.dumps(m, sort_keys=True, indent=1).encode()

# In-memory fs emulating: write tmp -> fsync -> atomic rename; a crash can leave a tmp file only.
class FS:
    def __init__(self): self.files = {}
    def write_tmp(self, path, blob): self.files[path + ".tmp"] = blob
    def commit(self, path):
        self.files[path] = self.files.pop(path + ".tmp")
    def get(self, path): return self.files.get(path)

ds_bytes = b"a,b\n1,x\n2,y\n3,\n"
manifest_v1 = {"schema": "repro.manifest/v1", "dataset": {"name": "events", "rows": 3, "sha256": sha(ds_bytes)}, "transform_id": "t-001", "env_id": "py312-lock-7"}
manifest_v2 = dict(manifest_v1, transform_id="t-002")
PATH = "project/.repro/manifest.json"

def recover(fs):
    """Load manifest.json; a torn tmp file is never trusted; commit only happens atomically."""
    events = []
    blob = fs.get(PATH)
    if blob is None:
        events.append("no committed manifest")
        return None, events
    m = json.loads(blob.decode())
    events.append("loaded committed manifest transform_id=%s" % m["transform_id"])
    if PATH + ".tmp" in fs.files:
        torn = fs.get(PATH + ".tmp")
        try:
            json.loads(torn.decode())
            events.append("stale complete tmp ignored (post-commit leftover)")
        except Exception:
            events.append("torn tmp (%d bytes) quarantined, not applied" % len(torn))
        del fs.files[PATH + ".tmp"]
    return m, events

fs = FS()
fs.write_tmp(PATH, canon(manifest_v1)); fs.commit(PATH)
m_loaded, ev1 = recover(fs)

# v2 save crashes after writing 60% of tmp
full2 = canon(manifest_v2)
fs.write_tmp(PATH, full2[: int(len(full2) * 0.6)])   # crash here
m_after_crash, ev2 = recover(fs)

# retried save completes
fs.write_tmp(PATH, full2); fs.commit(PATH)
m_recovered, ev3 = recover(fs)

# stable vs deterministic ordering: sort by non-unique key only (stable) vs total key (deterministic)
recs = [{"k": "b", "rowid": 0}, {"k": "a", "rowid": 1}, {"k": "b", "rowid": 2}]
stable = sorted(recs, key=lambda r: r["k"])
deterministic = sorted(recs, key=lambda r: (r["k"], r["rowid"]))

result = {
    "check": "B: interrupted-save recovery via tmp + atomic commit; ordering semantics",
    "loaded_v1": m_loaded["transform_id"] == "t-001",
    "after_crash_transform_id": m_after_crash["transform_id"],
    "after_crash_still_v1": m_after_crash["transform_id"] == "t-001",
    "after_crash_unchanged_bytes": canon(m_after_crash) == canon(manifest_v1),
    "after_retry_transform_id": m_recovered["transform_id"],
    "events": {"first_load": ev1, "after_crash": ev2, "after_retry": ev3},
    "stable_order_ties_preserve_input": [r["rowid"] for r in stable] == [1, 0, 2],
    "deterministic_total_order": [r["rowid"] for r in deterministic] == [1, 0, 2],
    "stable_differs_from_unspecified": [r["rowid"] for r in stable] == [1, 0, 2],
}
assert result["loaded_v1"] and result["after_crash_still_v1"] and result["after_crash_unchanged_bytes"]
assert result["after_retry_transform_id"] == "t-002"
assert result["stable_order_ties_preserve_input"] and result["deterministic_total_order"]
print(json.dumps(result, ensure_ascii=False, indent=1))
print("EXIT_OK")