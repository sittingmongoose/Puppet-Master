"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def restore_time(value, context):
    record = value['restore_time']
    if record['applies'] is not True:
        return None
    if record['left'] <= record['right']:
        return 'restore_time_refused'
    return None

def restore_epoch(value, context):
    record = value['restore_epoch']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'restore_epoch_refused'
    return None

def restore_capability(value, context):
    record = value['restore_capability']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'restore_capability_refused'
    return None

def anchor_monotone(value, context):
    record = value['anchor_monotone']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'anchor_monotone_refused'
    return None

def floor_unavailable(value, context):
    record = value['floor_unavailable']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'floor_unavailable_refused'
    return None

def restore_digest(value, context):
    record = value['restore_digest']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'restore_digest_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('restore_time', g.Invariant('/restore_time', 'New Hold/Boot operation is accepted after the post-restore session opens.'), 'restore_time_refused', restore_time),
        g.Guard('restore_epoch', g.Invariant('/restore_epoch', 'Boot operation uses the new recovery epoch.'), 'restore_epoch_refused', restore_epoch),
        g.Guard('restore_capability', g.Invariant('/restore_capability', 'Fresh capability binds this exact accepted operation, not a copied group.'), 'restore_capability_refused', restore_capability),
        g.Guard('anchor_monotone', g.Invariant('/anchor_monotone', 'Older restore never rolls the external Boot anchor back.'), 'anchor_monotone_refused', anchor_monotone),
        g.Guard('floor_unavailable', g.Invariant('/floor_unavailable', 'An older restore never re-establishes earliest completeness.'), 'floor_unavailable_refused', floor_unavailable),
        g.Guard('restore_digest', g.Invariant('/restore_digest', 'Fresh-operation capability binds the complete accepted-operation digest.'), 'restore_digest_refused', restore_digest),
    ])

    def check(value):
        table.require('restore_time', value, context)
        table.require('restore_epoch', value, context)
        table.require('restore_capability', value, context)
        table.require('anchor_monotone', value, context)
        table.require('floor_unavailable', value, context)
        table.require('restore_digest', value, context)
        return True
    return g.Case(table, check, context)
