#!/usr/bin/env python3
"""Mutation proof (lead point 2 / standing check 11): weaken one guard at a time and show the suite fails.

For each selected guard row, the observation it reads is forced to pass (the guard is weakened), the
row's single-defect witness is rebuilt and run through the complete checker, and the witness must no
longer be refused at that row (it is accepted or refused elsewhere). The guard is then restored and the
witness must again be refused at exactly that row. A guard whose removal does not change its witness's
outcome is not a real guard. Exit 0 only when every weakened guard flips its witness and restores.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_events as m  # noqa: E402
import pm_w3d_bsd_spec as spec  # noqa: E402

# (family slug, phase, row) — diverse guards across the refusal path.
TARGETS = [
    ('advice_emitted', 'admission', 'AD03_replay_writer'),
    ('advice_emitted', 'envelope', 'EN02_occurred_clock'),
    ('advice_emitted', 'envelope', 'EN05_sequence_uint64'),
    ('advice_emitted', 'identity', 'ID07_operation_recipe'),
    ('advice_emitted', 'pack', 'PK02_pack_digest'),
    ('advice_emitted', 'receipt', 'RC08_full_value'),
    ('advice_emitted', 'history', 'HI01_receipt_present'),
    ('advice_emitted', 'history', 'HI07_no_receipt_created'),
    ('assignment_started', 'eligibility', 'EL01_not_off'),
    ('finding_reconfirmed', 'source', 'SR09_sem_newer_generation'),
    ('policy_changed', 'source', 'SR08_sem_revision_cas'),
    ('review_started', 'source', 'SR24_start_admission_identity'),
]


def find_witness(fam, phase, row):
    for case in m.all_cases(fam):
        if case['kind'] == 'negative' and case.get('row') == row and case.get('phase') == phase:
            return case
    return None


def main():
    original_observe = m.observe
    results = []
    ok = True
    with m.exact_integer_digits():
        for slug, phase, row in TARGETS:
            fam = spec.BY_SLUG[slug]
            phase_name = m.rows_spec.phase_name(phase, fam) if phase in ('payload', 'source', 'admission', 'joins', 'eligibility') else phase
            witness = find_witness(fam, phase_name, row)
            if witness is None:
                results.append(dict(slug=slug, row=row, status='NO_WITNESS'))
                ok = False
                continue
            # baseline: witness refused at exactly this row
            base = m.run_path(witness['path'], m.build(fam, witness['muts'], variant=witness.get('variant'),
                                                        empty=witness.get('empty', False)))
            baseline_ok = base is not None and base[0] == phase_name and base[1] == row
            # weaken: force this row's observation to pass
            def weakened(phase_arg, W, _row=row, _orig=original_observe):
                obs = _orig(phase_arg, W)
                if _row in obs:
                    obs[_row] = True
                return obs
            m.observe = weakened
            mut = m.run_path(witness['path'], m.build(fam, witness['muts'], variant=witness.get('variant'),
                                                      empty=witness.get('empty', False)))
            m.observe = original_observe
            flipped = (mut is None) or (mut[0] != phase_name) or (mut[1] != row)
            # restore: witness refused at exactly this row again
            restored = m.run_path(witness['path'], m.build(fam, witness['muts'], variant=witness.get('variant'),
                                                           empty=witness.get('empty', False)))
            restore_ok = restored is not None and restored[0] == phase_name and restored[1] == row
            good = baseline_ok and flipped and restore_ok
            ok = ok and good
            results.append(dict(slug=slug, row=row, baseline_refused_at_row=baseline_ok,
                                weakened_flips_witness=flipped,
                                weakened_outcome=(None if mut is None else [mut[0], mut[1]]),
                                restored_refused_at_row=restore_ok, status='pass' if good else 'FAIL'))
    print(json.dumps(dict(status='pass' if ok else 'fail', guards=len(results), results=results), indent=1))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())