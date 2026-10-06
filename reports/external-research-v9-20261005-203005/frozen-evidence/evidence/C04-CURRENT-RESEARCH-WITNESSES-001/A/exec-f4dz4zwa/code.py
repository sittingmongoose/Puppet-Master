import json
def merge(base, mine, theirs):
    merged, conflicts = {}, []
    for k in sorted(set(base) | set(mine) | set(theirs)):
        b, m, t = base.get(k), mine.get(k), theirs.get(k)
        if m == t:
            merged[k] = m if m is not None else b
        elif m == b:
            merged[k] = t
        elif t == b:
            merged[k] = m
        else:
            conflicts.append({"field": k, "base": b, "mine": m, "theirs": t})
    return merged, conflicts
base = {"name": "Plot A", "note": "birch", "lat": 52.52, "lon": 13.40}
mine = dict(base); theirs = dict(base)
mine["note"] = "birch, moss"
theirs["name"] = "Plot A (renamed)"
theirs["lat"] = 52.521
c1_distinct = merge(base, mine, theirs)
mine2 = dict(base); theirs2 = dict(base)
mine2["note"] = "v1 text"; theirs2["note"] = "v2 text"
c2_conflict = merge(base, mine2, theirs2)
mine3 = dict(base); theirs3 = dict(base); del theirs3["note"]
mine3["note"] = "v1 text"
c3_del_vs_edit = merge(base, mine3, theirs3)
out = {"case1_disjoint_edits": c1_distinct,
       "case2_same_field_edited_both": c2_conflict,
       "case3_theirs_deleted_mine_edited": c3_del_vs_edit}
print(json.dumps(out, indent=1))