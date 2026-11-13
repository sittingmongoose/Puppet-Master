"""DR guard table checkpoint_store: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('bundle_checkpoint_key', 'key', 'token_checkpoint_key', 'checkpoint_storage', 'storage', 'token_storage', 'source_storage')


def C03a_bundle_key(value, context):
    return 'checkpoint_mismatch' if value['bundle_checkpoint_key'] != value['key'] else None


def C03b_token_key(value, context):
    return 'checkpoint_mismatch' if value['token_checkpoint_key'] != value['key'] else None


def C03c_checkpoint_store(value, context):
    return 'checkpoint_mismatch' if value['checkpoint_storage'] != value['storage'] else None


def C03d_token_store(value, context):
    return 'checkpoint_mismatch' if value['token_storage'] != value['storage'] else None


def C03e_source_store(value, context):
    return 'checkpoint_mismatch' if value['source_storage'] != value['storage'] else None


def store_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C03a_bundle_key', g.Invariant('/bundle_checkpoint_key', 'equals the key of the custody storage instance'), 'checkpoint_mismatch', C03a_bundle_key),
        g.Guard('C03b_token_key', g.Invariant('/token_checkpoint_key', 'equals the key of the custody storage instance'), 'checkpoint_mismatch', C03b_token_key),
        g.Guard('C03c_checkpoint_store', g.Invariant('/checkpoint_storage_instance_id', 'equals the custody storage instance'), 'checkpoint_mismatch', C03c_checkpoint_store),
        g.Guard('C03d_token_store', g.Invariant('/token_storage_instance_id', 'equals the custody storage instance'), 'checkpoint_mismatch', C03d_token_store),
        g.Guard('C03e_source_store', g.Invariant('/source_storage_instance_id', 'equals the custody storage instance'), 'checkpoint_mismatch', C03e_source_store),
    ])

    def check(value):
        table.require('C03a_bundle_key', value, context)
        table.require('C03b_token_key', value, context)
        table.require('C03c_checkpoint_store', value, context)
        table.require('C03d_token_store', value, context)
        table.require('C03e_source_store', value, context)
        return True
    return g.Case(table, check, context)
