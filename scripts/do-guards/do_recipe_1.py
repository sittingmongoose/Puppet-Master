"""DO guard suite `recipe_1` (sweep part 2A). Original identity recipe: SP-1101 custody resolution and the disclosed label and evidence joined against it (number_rule_for_record, retained records; sweep part 2B).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

LEGACY_RECIPE = 'ea-do-json-v1'
CURRENT_RECIPE = 'ea-do-rfc8785-v2'


def recipe_supported(value, context):
    # Sweep part 2B (SP-1101): the original resolves through the RetainedDispatcher to sealed custody whose recipe
    # tuple has a frozen verifier that recomputes it; the reason is the dispatcher's refusal.
    return 'historical_original_recipe' if value['custody_refusal'] is not None else None


def recipe_disclosed(value, context):
    # The disclosed label is a copy of the custody's recipe; it selects nothing.
    if value['recipe'] is None:
        return None
    return 'historical_original_recipe' if (type(value['disclosed_recipe']) is not str
                                            or value['disclosed_recipe'] != value['recipe']) else None


def recipe_evidence_verified(value, context):
    proof = value['recipe_evidence']
    return 'historical_original_recipe' if type(proof) is not dict or proof.get('verified') is not True else None


def recipe_evidence_value(value, context):
    proof = value['recipe_evidence']
    if type(proof) is not dict or value['recipe_expected_value'] is None:
        return None
    return 'historical_original_recipe' if proof.get('value') != value['recipe_expected_value'] else None


def recipe_evidence_source_ref(value, context):
    proof = value['recipe_evidence']
    if type(proof) is not dict:
        return None
    return 'historical_original_recipe' if proof.get('source_ref') != value['recipe_expected_source_ref'] else None


def recipe_evidence_source_sha256(value, context):
    proof = value['recipe_evidence']
    if type(proof) is not dict or value['recipe_expected_source_sha256'] is None:
        return None
    return 'historical_original_recipe' if proof.get('source_sha256') != value['recipe_expected_source_sha256'] else None


ROWS = (
    ('recipe_supported', '/historical_reader_state/original_source_ref', 'resolves through SP-1101 sealed custody to a frozen recipe that verifies it',
     'historical_original_recipe', recipe_supported, ('custody_refusal',), 'recipe'),
    ('recipe_disclosed', '/historical_reader_state/original_identity_recipe', "equals the sealed custody's recipe",
     'historical_original_recipe', recipe_disclosed, ('recipe', 'disclosed_recipe'), 'recipe'),
    ('recipe_evidence_verified', '/historical_reader_state/original_recipe_evidence/verified', 'is exactly true',
     'historical_original_recipe', recipe_evidence_verified, ('recipe_evidence',), 'recipe'),
    ('recipe_evidence_value', '/historical_reader_state/original_recipe_evidence/value', "equals the witness recomputed from the event and the custody's recipe",
     'historical_original_recipe', recipe_evidence_value, ('recipe_evidence', 'recipe_expected_value'), 'recipe'),
    ('recipe_evidence_source_ref', '/historical_reader_state/original_recipe_evidence/source_ref', "equals 'writer-recipe:' + event_id",
     'historical_original_recipe', recipe_evidence_source_ref, ('recipe_evidence', 'recipe_expected_source_ref'), 'recipe'),
    ('recipe_evidence_source_sha256', '/historical_reader_state/original_recipe_evidence/source_sha256', 'equals the SHA-256 of the packed recomputed witness',
     'historical_original_recipe', recipe_evidence_source_sha256, ('recipe_evidence', 'recipe_expected_source_sha256'), 'recipe'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('recipe_supported', g.Invariant('/historical_reader_state/original_source_ref', 'resolves through SP-1101 sealed custody to a frozen recipe that verifies it'), 'historical_original_recipe', recipe_supported),
        g.Guard('recipe_disclosed', g.Invariant('/historical_reader_state/original_identity_recipe', "equals the sealed custody's recipe"), 'historical_original_recipe', recipe_disclosed),
        g.Guard('recipe_evidence_verified', g.Invariant('/historical_reader_state/original_recipe_evidence/verified', 'is exactly true'), 'historical_original_recipe', recipe_evidence_verified),
        g.Guard('recipe_evidence_value', g.Invariant('/historical_reader_state/original_recipe_evidence/value', "equals the witness recomputed from the event and the custody's recipe"), 'historical_original_recipe', recipe_evidence_value),
        g.Guard('recipe_evidence_source_ref', g.Invariant('/historical_reader_state/original_recipe_evidence/source_ref', "equals 'writer-recipe:' + event_id"), 'historical_original_recipe', recipe_evidence_source_ref),
        g.Guard('recipe_evidence_source_sha256', g.Invariant('/historical_reader_state/original_recipe_evidence/source_sha256', 'equals the SHA-256 of the packed recomputed witness'), 'historical_original_recipe', recipe_evidence_source_sha256),
    ])
    context = None

    def check(complete):
        table.require('recipe_supported', complete, context)
        table.require('recipe_disclosed', complete, context)
        table.require('recipe_evidence_verified', complete, context)
        table.require('recipe_evidence_value', complete, context)
        table.require('recipe_evidence_source_ref', complete, context)
        table.require('recipe_evidence_source_sha256', complete, context)
        return True
    return g.Case(table, check, context)
