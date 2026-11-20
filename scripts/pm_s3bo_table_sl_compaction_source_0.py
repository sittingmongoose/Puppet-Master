"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sl_cmp_role(value, context):
    record = value['sl_cmp_role']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_role_refused'
    return None

def sl_cmp_effect_plan(value, context):
    record = value['sl_cmp_effect_plan']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_effect_plan_refused'
    return None

def sl_cmp_groups(value, context):
    record = value['sl_cmp_groups']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_groups_refused'
    return None

def sl_cmp_bytes(value, context):
    record = value['sl_cmp_bytes']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_bytes_refused'
    return None

def sl_cmp_translation(value, context):
    record = value['sl_cmp_translation']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_translation_refused'
    return None

def sl_cmp_continuation(value, context):
    record = value['sl_cmp_continuation']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_continuation_refused'
    return None

def sl_cmp_source_successor(value, context):
    record = value['sl_cmp_source_successor']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_source_successor_refused'
    return None

def sl_cmp_final_fence(value, context):
    record = value['sl_cmp_final_fence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sl_cmp_final_fence_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sl_cmp_role', g.Invariant('/sl_cmp_role', 'Only the installed native compaction role with its installation receipt may admit multi-segment compaction or parse the new CURRENT/manifest; a copied role record or adapter string grants nothing.'), 'sl_cmp_role_refused', sl_cmp_role),
        g.Guard('sl_cmp_effect_plan', g.Invariant('/sl_cmp_effect_plan', 'Every physical effect is preceded by its durable original plan under the HMP effect id, and a published artifact is never rewritten.'), 'sl_cmp_effect_plan_refused', sl_cmp_effect_plan),
        g.Guard('sl_cmp_groups', g.Invariant('/sl_cmp_groups', 'Maintenance waits until every existing protected group has issued its first receipts; each lifecycle observation is a one-event barrier group.'), 'sl_cmp_groups_refused', sl_cmp_groups),
        g.Guard('sl_cmp_bytes', g.Invariant('/sl_cmp_bytes', 'Every selected segment is scanned once from byte zero to its durable end, frame generations match their member, identities are unique and closed gaps cover every missing sequence.'), 'sl_cmp_bytes_refused', sl_cmp_bytes),
        g.Guard('sl_cmp_translation', g.Invariant('/sl_cmp_translation', 'Before the carrier seal the source index catches up through the commit_pending receipt; the translation source is the frozen inputs plus the whole carrier; original receipt coordinates never change and removed events keep no current row.'), 'sl_cmp_translation_refused', sl_cmp_translation),
        g.Guard('sl_cmp_continuation', g.Invariant('/sl_cmp_continuation', 'After target CURRENT only the same original maintenance owner with a proved committed edge and its durable obligation may finish; other writes, maintenance, publication and success stay fenced.'), 'sl_cmp_continuation_refused', sl_cmp_continuation),
        g.Guard('sl_cmp_source_successor', g.Invariant('/sl_cmp_source_successor', 'A source successor after a sealed carrier needs proven never-published source and the installed adapter; the carrier is never reopened and source is never chosen after target visibility.'), 'sl_cmp_source_successor_refused', sl_cmp_source_successor),
        g.Guard('sl_cmp_final_fence', g.Invariant('/sl_cmp_final_fence', 'Each publisher derives its afterimage before helpers and runs its final pure check after them with nothing in between; a late refusal preserves genuine earlier effects.'), 'sl_cmp_final_fence_refused', sl_cmp_final_fence),
    ])

    def check(value):
        table.require('sl_cmp_role', value, context)
        table.require('sl_cmp_effect_plan', value, context)
        table.require('sl_cmp_groups', value, context)
        table.require('sl_cmp_bytes', value, context)
        table.require('sl_cmp_translation', value, context)
        table.require('sl_cmp_continuation', value, context)
        table.require('sl_cmp_source_successor', value, context)
        table.require('sl_cmp_final_fence', value, context)
        return True
    return g.Case(table, check, context)
