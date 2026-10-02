"""Recompute descriptive arithmetic only; no native/model execution or regrading."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent
v=json.loads((root/'SELECTED_PUBLISHED_VALUES.json').read_text())
c=v['status_categories']
assert sum(r['admissions'] for r in c.values()) == v['admissions']
assert abs(sum(r['seconds'] for r in c.values())-v['occupied_slot_seconds']) < 1e-6
assert sum(r['reported_output'] for r in c.values()) == v['candidate_generated_output_lower_bound']
out={
 'scope':'Descriptive arithmetic on published selected counters, not independent raw-log verification, statistical equivalence, or native qualification.',
 'occupied_candidate_hours':v['occupied_slot_seconds']/3600,
 'candidate_admission_cap_used_pct':100*v['admissions']/v['candidate_start_cap'],
 'occupied_slot_ceiling_used_pct':100*v['occupied_slot_seconds']/v['slot_seconds_cap'],
 'admissions_without_observed_native_goal':v['admissions']-v['observed_native_goals'],
 'literal_category_reconciliation':'all three sums match the published totals',
 'comparisons':{k:{'treatment_to_control_ratio':r['treatment_seconds']/r['control_seconds'],
                   'descriptive_time_reduction_pct':100*(1-r['treatment_seconds']/r['control_seconds']),
                   'boundary':r['boundary']} for k,r in v['comparisons'].items()},
 'not_computed':['actual average parallel occupancy','cash costs','full generated-token totals','causal speedups','semantic quality scores']}
(root/'RECOMPUTED_METRICS.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))
