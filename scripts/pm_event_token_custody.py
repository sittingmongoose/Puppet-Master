"""Real custody predicates used by the S6 classifier (one five-row table).

Only the equality boundary is isolated by Method B. Parsing, Git/IO and the
semantic classifier have separate end-to-end negatives; they earn no implicit
guard-isolation credit from this table.
"""
import pm_guard_isolation as g


def validator(value, context):
    return 'edition_validator_drift' if value['validator_hash'] != value['receipt_validator_hash'] else None


def artifacts(value, context):
    return 'edition_artifact_drift' if value['artifact_hashes'] != value['receipt_artifact_hashes'] else None


def source_set(value, context):
    return 'edition_source_set_drift' if value['source_paths'] != value['inventory_source_paths'] else None


def source_bytes(value, context):
    return 'edition_source_bytes_drift' if value['source_hashes'] != value['inventory_source_hashes'] else None


def manifest(value, context):
    return 'edition_manifest_drift' if value['source_manifest_hash'] != value['inventory_manifest_hash'] else None


def custody_case():
    table = g.GuardTable([
        g.Guard('validator', g.Invariant('/validator_hash', 'equals receipt validator SHA-256'), 'edition_validator_drift', validator),
        g.Guard('artifacts', g.Invariant('/artifact_hashes', 'equals receipt artifact SHA-256 map'), 'edition_artifact_drift', artifacts),
        g.Guard('source_set', g.Invariant('/source_paths', 'equals inventoried source set'), 'edition_source_set_drift', source_set),
        g.Guard('source_bytes', g.Invariant('/source_hashes', 'equals inventoried source byte lengths and SHA-256'), 'edition_source_bytes_drift', source_bytes),
        g.Guard('manifest', g.Invariant('/source_manifest_hash', 'equals canonical inventoried source-list SHA-256'), 'edition_manifest_drift', manifest),
    ])

    def check(value):
        table.require('validator', value)
        table.require('artifacts', value)
        table.require('source_set', value)
        table.require('source_bytes', value)
        table.require('manifest', value)
        return True

    return g.Case(table, check)
