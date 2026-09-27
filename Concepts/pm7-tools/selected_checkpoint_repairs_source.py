"""Narrow authored bridge from the selected pre-T50 checkpoint to current T44/T46/T46P repairs.

The historical full pipeline is not the selected concept: its Guided Tour and Home
scripts differ from the published checkpoint.  Keep those scripts byte-identical
while carrying only reviewed source repairs into the selected publication chain.
Every anchor must occur exactly once so a later checkpoint change fails closed.
"""
import re

import full_thread_performance_source as performance
import systems_integration_source as systems


def once(doc, old, new, label):
    if doc.count(old) != 1:
        raise ValueError(f"selected checkpoint repair anchor {label}: {doc.count(old)} matches")
    return doc.replace(old, new, 1)


def source_line(source, prefix):
    lines = [line for line in source.splitlines() if line.startswith(prefix)]
    if len(lines) != 1:
        raise ValueError(f"authored source line {prefix}: {len(lines)} matches")
    return lines[0]


def replace_line(doc, prefix, authored_source):
    old = source_line(doc, prefix)
    new = source_line(authored_source, prefix)
    return once(doc, old, new, prefix)


def apply(doc):
    # T44 exact search selections, without replacing the checkpoint's independently reviewed inventory.
    doc = once(doc,
        "      case 'provider-model':\n        selectProviderView(p.providerId || 'claude-code','models',true);\n        return;",
        "      case 'provider-model':\n        state.searchExactTarget={kind:p.kind,providerId:p.providerId,id:p.id};\n        if(window.PM51&&window.PM51.revealProviderModel&&window.PM51.revealProviderModel(p.providerId,p.id))return;\n        selectProviderView(p.providerId || 'claude-code','overview',true);\n        return;", "provider model")
    for kind, tab, domain, workspace in (
        ('sync-client', 'clients', 'projects', 'project-sync'),
        ('sync-location', 'remote', 'projects', 'project-sync'),
        ('history-session', 'sessions', 'projects', 'project-history'),
        ('artifact', 'artifacts', 'projects', 'project-history'),
    ):
        state_tab = 'projectSync' if kind.startswith('sync-') else 'projectHistory'
        old = f"      case '{kind}':\n        state.{state_tab}Tab = '{tab}';\n        navigate('{domain}', '{workspace}');\n        return;"
        reveal = "        if(window.PM51&&window.PM51.revealHistoryObject&&window.PM51.revealHistoryObject(p.kind,p.id))return;\n" if kind in ('history-session', 'artifact') else ''
        new = f"      case '{kind}':\n        state.searchExactTarget={{kind:p.kind,id:p.id}};\n{reveal}        state.{state_tab}Tab = '{tab}';\n        navigate('{domain}', '{workspace}');\n        return;"
        doc = once(doc, old, new, kind)

    # T46P fixtures: outcome is distinct from the ObservableWork enum.
    for prefix in ("    {fixture_id:'cancel-requested'", "    {fixture_id:'terminal-unknown'", "    const work=PM7_PERFORMANCE_WORK_FIXTURES.map"):
        doc = replace_line(doc, prefix, performance.PERFORMANCE_MODEL_SOURCE)

    # T46 NamedPlan scope controls are inserted into the same systems IIFE, preserving the existing run.
    script = systems.GLOBAL_SCRIPT
    start = script.index("  /* The browser fixture keeps stable Named Plan")
    end = script.index("  shellWidth=shell?", start)
    doc = once(doc, "  shellWidth=shell?", script[start:end] + "  shellWidth=shell?", "NamedPlan scope")

    # EGOLITE retained metadata must match the authored source, not a stale Git fallback claim.
    old = '"detail":"Content, compare, push, thread, and reviewer gaps use Git data/transport or typed CLI; 1 MiB and complete-commit cases never truncate"'
    new = '"detail":"Git content, compare, and push gaps use admitted Git data/transport or typed CLI. Hosting thread and reviewer mutations require hosting authority; 1 MiB and complete-commit cases never truncate"'
    if new not in systems.EGOLITE_RETAINED_CONTRACT_DATA:
        raise ValueError("authored EGOLITE detail changed")
    doc = once(doc, old, new, "EGOLITE ORI-020")
    return doc
