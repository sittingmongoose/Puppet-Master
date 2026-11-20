"""One-leaf owner-snapshot type witnesses; no candidate or custody mutation."""
import copy
from pm_runtime_artifact_round8_cases import observation_source


def boolean_paths(value, path=()):
    if type(value) is bool:
        yield path
    elif type(value) is dict:
        for key, child in value.items():
            yield from boolean_paths(child, (*path, key))
    elif type(value) is list:
        for index, child in enumerate(value):
            yield from boolean_paths(child, (*path, index))


def cases(m, rows, fixtures):
    result = []
    row = next((r for r in rows if r['event_type'] == 'runtime_artifact.restore_point'), None)
    if row is None:
        return result
    family = row['event_type']
    first = fixtures['positive_events'][family]
    successor = fixtures['restore_successor']
    wrong_types = (0, 1, 0.0, 1.0, 'false', 'true', '0', None, [], {}, {'nested': False})
    for lifecycle, candidate, previous in (('first', first, None), ('successor', successor, first)):
        # Include the optional lineage-only boolean, with its required siblings.
        # All required and optional restore booleans then have actual controls.
        for held in (False, True):
            control = copy.deepcopy(candidate)
            point = control['payload']['type_payload']
            point.update(safe_point_id='safe-point-lineage-control',
                         safe_point_semantics='lineage_only', safe_point_restores_files=False)
            point['holds']['has_protected_refs'] = held
            for route in ('inline', 'packed'):
                event = copy.deepcopy(control)
                packs = {}
                if route == 'packed':
                    event['payload']['summary'] = 'x' * 17000
                    event['payload'], event['payload_ref'] = m.storage_form(event['payload'], packs)
                source = dict(proof_valid=True, predecessor_complete=True, snapshot_current=True,
                              canonical_point=copy.deepcopy(point))
                source = observation_source(m, fixtures, row, previous, packs, source)
                def observe(n, source, e=event, p=previous, r=row, packs=packs):
                    return n.observation_admissible(e, p, r, packs, source)
                for path in boolean_paths(point):
                    for index, value in enumerate(wrong_types):
                        bad = copy.deepcopy(source)
                        m.set_path(bad['canonical_point'], path, value)
                        name = '_'.join((lifecycle, route, 'held' if held else 'unheld',
                                         '/'.join(map(str, path)), 'wrong_type', str(index)))
                        result.append(('O03', family, name,
                                       lambda n, s=source, f=observe: f(n, s),
                                       lambda n, s=bad, f=observe: f(n, s)))
                # Non-object snapshots must also fail schema validation first.
                for index, value in enumerate((None, [], 'false', 0, False)):
                    bad = dict(source, canonical_point=value)
                    name = f'{lifecycle}_{route}_{held}_snapshot_shape_{index}'
                    result.append(('O03', family, name,
                                   lambda n, s=source, f=observe: f(n, s),
                                   lambda n, s=bad, f=observe: f(n, s)))
    return result
