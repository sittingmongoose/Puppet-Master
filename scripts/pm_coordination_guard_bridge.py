"""Run a coordination refusal through its guard table.

Observations are booleans keyed by guard name. The table is the only refusal.
"""
import pm_guard_isolation as g
import pm_coordination_tables as tables


def _names(items):
    names = []
    for item in items:
        names.append(item["error"] if isinstance(item, dict) else item)
    return names


def refused_names(phase, failed_names):
    """Return the failed names, in table order, after each row has refused through the table."""
    sample = tables.CASES[phase]()
    order = list(sample.table.guards)
    unknown = [name for name in failed_names if name not in order]
    if unknown:
        raise RuntimeError("unguarded coordination refusal in " + phase + ": " + ", ".join(unknown))
    failed = []
    seen = set()
    for name in failed_names:
        if name not in seen:
            seen.add(name)
            failed.append(name)
    facts = {name: name not in seen for name in order}
    case = tables.CASES[phase]()
    case.table._bind(facts, None, frozenset())
    refused = []
    for name in order:
        try:
            case.table.require(name, facts)
        except g.GuardRefusal as exc:
            if exc.guard != name or exc.code != case.table.guards[name].refusal_code:
                raise RuntimeError("coordination table refused " + phase + " through an unexpected row") from exc
            refused.append(name)
    if refused != [name for name in order if name in seen]:
        raise RuntimeError("coordination table disagreed with observations in " + phase)
    return refused


def gate_items(phase, items):
    refused = set(refused_names(phase, _names(items)))
    return [item for item in items if (item["error"] if isinstance(item, dict) else item) in refused]


def gate_code(phase, code):
    if code is None:
        if refused_names(phase, []):
            raise RuntimeError("coordination table refused a passing " + phase + " observation")
        return None
    refused = refused_names(phase, [code])
    if refused != [code]:
        raise RuntimeError("coordination table did not refuse " + phase + " " + str(code))
    return code
