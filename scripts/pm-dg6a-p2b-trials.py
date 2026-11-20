#!/usr/bin/env python3
"""Standing trials for DG6A sweep part 2B: each removes one adopted mechanism; the complete checker must fail.

Usage: python3 scripts/pm-dg6a-p2b-trials.py <trial> <checker script> <family>
Trials: CV1101_predicate_removed (the shared date-time predicate skipped, as a stock validator skips format),
CV253_storage_profile_removed (observed/persisted fall back to the broad profile), SP1101_owner_authentication_removed
(custody returned for any bytes), SP1101_identity_not_recomputed (frozen verifier trusts the event id),
SP1101_legacy_recipe_current_numbers (legacy editions validated with current CV-1100 integers).
Prints one JSON line; caught=true means the complete checker failed (an assertion or a refusal), as it must.
Run from the repository root; it patches only this process.
"""
import importlib.util, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
trial, script, family = sys.argv[1], sys.argv[2], sys.argv[3]
import pm_dg6a_custody as custody
import pm_event_numbers as numbers

def load(path, name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / path)
    m = importlib.util.module_from_spec(spec); sys.modules[name] = m; spec.loader.exec_module(m); return m

def skip_datetime(domain_module):
    domain_module.FORMATS.checkers['date-time'] = (lambda v: True, ())
    domain_module.instant = lambda value, profile=None: type(value) is str

if trial == 'CV1101_predicate_removed':
    skip_datetime(custody.domain)
elif trial == 'CV253_storage_profile_removed':
    custody.domain.FIELD_PROFILES.clear()
elif trial == 'SP1101_owner_authentication_removed':
    original = numbers.RetainedDispatcher.resolve
    def resolve(self, ref, expected, *, disclose, recipe_override=None):
        record = numbers.decode_storage_value(self._owner.raw, profile=numbers.EVENT_VALUE)
        recipe = custody.recipe_of(record)
        if recipe not in custody.RECIPES:
            raise numbers.Refusal('recipe_unknown')
        return numbers.OriginalCustody(expected, recipe, self._owner.raw, self._owner.raw, self._owner.raw)
    numbers.RetainedDispatcher.resolve = resolve
elif trial == 'SP1101_legacy_recipe_current_numbers':
    for edition in custody.EDITIONS.values():
        if edition.legacy:
            edition.validator = custody.domain.validator(edition.schema)
elif trial == 'SP1101_identity_not_recomputed':
    custody.expected_event_id = lambda identity, record: record.get('event_id')
else:
    raise SystemExit('unknown trial')
m = load(script, 'trial_checker')
if trial == 'CV253_storage_profile_removed':
    (m.domain if hasattr(m, 'domain') else m.shared.domain).FIELD_PROFILES.clear()
    if hasattr(m, 'shared'): m.shared.domain.FIELD_PROFILES.clear()
if trial == 'CV1101_predicate_removed':
    skip_datetime(m.domain if hasattr(m, 'domain') else m.shared.domain)
    if hasattr(m, 'shared'): skip_datetime(m.shared.domain)
sys.argv = [script, '--family', family]
try:
    m.main()
except (AssertionError, ValueError, KeyError, TypeError) as error:
    print(json.dumps(dict(trial=trial, family=family, caught=True, error=type(error).__name__, detail=str(error)[:300])))
else:
    print(json.dumps(dict(trial=trial, family=family, caught=False)))
