#!/usr/bin/env python3
"""Carry DG6A cite line ranges from the graded blob (at --from) to the head blob via `git diff -U0` hunks (the reanchor_head.py
diff_mapped rule): a range untouched by any hunk is shifted by the hunks before it, and the quote must sit in the shifted range.
Every cite is carried, not only the failing ones, so a short quote repeated in the file can never pass on the wrong occurrence.
A cite whose range a hunk touches, or whose quote is not in the carried range, is reported as unmapped and left as it was.
Only line_start/line_end can change; the output is the input JSON re-serialised with indent 2 (byte-identical for DG6A r3).

Goal-five merge landing (dg5-land, 2026-11-27): r3 (b0fa10397b75...) graded at 1e11fe17a7, carried to the rebased head:
  python3 -B dg6a_cite_carry.py --repo <worktree> --from 1e11fe17a7 --grade DG6A.self-grade.r3.json \
      --out reports/event-authority-20261104/DG6A.self-grade.json --report dg6a-carry-report.json
  -> mapped 136, unchanged 496, unmapped 0 (pm-ea-lead 1127065059).
usage: dg6a_cite_carry.py --repo <tree> --from <rev> --grade <in.json> --out <out.json> --report <report.json>   (writes only --out/--report)"""
import argparse, json, re, subprocess, copy
ap = argparse.ArgumentParser(); ap.add_argument('--repo'); ap.add_argument('--from', dest='frm'); ap.add_argument('--grade'); ap.add_argument('--out'); ap.add_argument('--report')
a = ap.parse_args()
grade = json.load(open(a.grade)); new = copy.deepcopy(grade)
def head_lines(p): return open(f'{a.repo}/{p}', encoding='utf-8').read().splitlines()
hunks_cache = {}
def hunks(p):
    if p not in hunks_cache:
        d = subprocess.run(['git', '-C', a.repo, 'diff', '-U0', '--no-color', f'{a.frm}:{p}', f'HEAD:{p}'], capture_output=True, text=True).stdout
        hs = []
        for m in re.finditer(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', d, re.M):
            os_, oc, ns, nc = int(m[1]), int(m[2] or 1), int(m[3]), int(m[4] or 1)
            hs.append((os_, oc, ns, nc))
        hunks_cache[p] = hs
    return hunks_cache[p]
def carry(p, s, e):
    shift = 0
    for os_, oc, ns, nc in hunks(p):
        o_lo, o_hi = (os_ + 1, os_) if oc == 0 else (os_, os_ + oc - 1)   # oc==0: pure insertion after line os_
        if oc == 0:
            if os_ < s: shift += nc
            elif s <= os_ < e: return None                                  # insertion inside the range
        else:
            if o_hi < s: shift += nc - oc
            elif o_lo > e: pass
            else: return None                                                # range touched
    return s + shift, e + shift
rep = dict(mapped=0, unchanged=0, unmapped=[])
cache = {}
for ri, row in enumerate(new['families']):
    refs = list(row['disposition_evidence']) + [r for c in row['cells'].values() for r in c['evidence']]
    for ref in refs:
        p = ref['path']
        if p not in cache: cache[p] = head_lines(p)
        L = cache[p]
        m = carry(p, ref['line_start'], ref['line_end'])
        if m and ref['quote'] in '\n'.join(L[m[0] - 1:m[1]]):
            if m == (ref['line_start'], ref['line_end']): rep['unchanged'] += 1
            else: rep['mapped'] += 1; ref['line_start'], ref['line_end'] = m
        elif m is None and 1 <= ref['line_start'] <= ref['line_end'] <= len(L) and ref['quote'] in '\n'.join(L[ref['line_start'] - 1:ref['line_end']]):
            rep.setdefault('touched_but_quote_in_place', []).append(dict(path=p, line_start=ref['line_start'], quote=ref['quote'][:120]))
        else:
            rep['unmapped'].append(dict(event_type=row['event_type'], path=p, line_start=ref['line_start'], line_end=ref['line_end'], carried=m, quote=ref['quote'][:160]))
open(a.out, 'w').write(json.dumps(new, indent=2, ensure_ascii=False) + '\n')
json.dump(rep, open(a.report, 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: (v if not isinstance(v, list) else len(v)) for k, v in rep.items()}))
