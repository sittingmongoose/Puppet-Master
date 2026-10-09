#!/usr/bin/env python3
"""Recompute descriptive ER11 summaries from the public frozen timing rows."""
from pathlib import Path
import json,collections,sys
p=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent/'v2/TIMING.json'
d=json.loads(p.read_text());rows=d['rows'];assert len(rows)==80
started=[r for r in rows if r['requested_at'] is not None]
delivered=[r for r in started if r['final_delivered']]
assessed=[r for r in delivered if r['grade'] is not None]
print(json.dumps({'original_cells':len(rows),'started':len(started),'delivered':len(delivered),'full_source_grades':dict(collections.Counter(r['grade'] for r in assessed))},sort_keys=True))
for b in dict.fromkeys(r['block'] for r in rows):
    c,t=[next(r for r in rows if r['block']==b and r['arm']==a) for a in ('control','treatment')]
    if not all(r['final_delivered'] and str(r['grade'] or '').startswith('PASS') for r in (c,t)):continue
    print(json.dumps({'block':b,'delivery_saving_fraction':1-t['candidate_delivery_s']/c['candidate_delivery_s'],
      'occupied_change_fraction':t['occupied_agent_s']/c['occupied_agent_s']-1 if all(r['occupied_agent_s'] is not None for r in (c,t)) else None,
      'strict_time_eligible':all(r['delivery_within_whole_deadline'] and r['occupied_within_90min'] and all(s['delivery_within_stage_deadline'] for s in r['stages']) for r in (c,t))},sort_keys=True))
print('These are descriptive ratios. Failed/missing/unstarted cells remain above; no billing, quality equivalence, causal provider effect or warm-cache saving is inferred.')
