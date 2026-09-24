"""Deterministic Forge option contract probes; no live provider or auth proof is claimed."""
from __future__ import annotations
import copy
from dataclasses import replace, asdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import unittest
import sys
import time
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from pm_forge_creation_options import (
    PROVIDER_CATEGORIES, VALUE_KINDS, CreationOptionContext,
    structural_errors, catalog_semantic_failures,
    validate_creation_options, _bounded_pattern,
)
from jsonschema import Draft202012Validator


def build_creation_option_defs():
    definitions = json.loads((ROOT / "Plans/forge_integration_contracts.schema.json").read_text())["$defs"]
    return {key: value for key, value in definitions.items()
            if key.startswith("creation_") or key in ("non_secret_ref", "sha256")}


def fixture_digest(value):
    # This fixture-only canonical subset contains no floats. Production injects
    # the existing owner digest implementation, not this test convenience.
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def descriptor(field_id, category, kind="boolean"):
    value = dict(field_id=field_id, category=category, owner_ref="owner:forge", effect_phase="create_api",
                 capability_ref="capability:fixture", permission_ref="permission:fixture", supported=True,
                 required_selection=False, data_classification="non_secret", value_kind=kind, choices=[], resource_kind=None,
                 minimum=None, maximum=None, min_length=None, max_length=None, pattern=None, min_items=None, max_items=None)
    if kind in ("catalog_choice", "catalog_choice_list"):
        value["choices"] = ["fixture-choice-a", "fixture-choice-b"]
    if kind in ("resource_ref", "resource_ref_list"):
        value["resource_kind"] = "policy"
    if kind == "protected_ref":
        value.update(resource_kind="credential_grant", data_classification="protected_write_only")
    if kind == "integer":
        value.update(minimum=1, maximum=9)
    if kind == "text":
        value.update(min_length=2, max_length=8, pattern="[a-z]+")
    if kind in ("catalog_choice_list", "resource_ref_list"):
        value.update(min_items=1, max_items=2)
    return value


def value_for(kind):
    return {
        "boolean": dict(kind=kind, value=True),
        "text": dict(kind=kind, value="chosen"),
        "integer": dict(kind=kind, value=3),
        "catalog_choice": dict(kind=kind, choice_id="fixture-choice-a"),
        "catalog_choice_list": dict(kind=kind, choice_ids=["fixture-choice-a"]),
        "resource_ref": dict(kind=kind, resource_kind="policy", ref="policy:fixture"),
        "resource_ref_list": dict(kind=kind, resource_kind="policy", refs=["policy:fixture"]),
        "protected_ref": dict(kind=kind, resource_kind="credential_grant", ref="grant:fixture"),
    }[kind]


def fixtures(provider="github", kinds=False):
    identity = dict(provider=provider, provider_variant="fixture-variant", normalized_host="https://fixture.invalid", instance_id="instance:fixture")
    # Explicit synthetic descriptor data; these are not claims about real vendor
    # API field IDs, option support, provider role names or universal limits.
    fields = [descriptor("fixture-field-" + category, category) for category in PROVIDER_CATEGORIES[provider]]
    if kinds:
        fields += [descriptor("fixture-kind-" + kind, PROVIDER_CATEGORIES[provider][0], kind) for kind in VALUE_KINDS]
    catalog = dict(schema_id="pm.forge.creation_field_catalog.v1", catalog_id="catalog:fixture", catalog_revision=2,
                   **identity, owner_ref="owner:forge", adapter_schema_ref="adapter:fixture", adapter_schema_revision=3,
                   api_compatibility_ref="api:fixture", capability_snapshot_ref="snapshot:fixture",
                   issued_at_utc="2026-09-24T00:00:00Z", expires_at_utc="2026-09-25T00:00:00Z",
                   category_inventory=list(PROVIDER_CATEGORIES[provider]), fields=fields, cross_field_constraints=[])
    selections = dict(schema_id="pm.forge.creation_option_selections.v1", selection_id="selection:fixture", **identity,
                      catalog_ref=catalog["catalog_id"], catalog_revision=2, catalog_sha256=fixture_digest(catalog),
                      fields=[{k: f[k] for k in ("field_id", "category", "owner_ref", "effect_phase", "capability_ref", "permission_ref")}
                              | {"value": value_for(f["value_kind"])} for f in fields])
    context = CreationOptionContext(**identity, catalog_ref=catalog["catalog_id"], catalog_revision=2,
                                    adapter_schema_ref=catalog["adapter_schema_ref"], adapter_schema_revision=3,
                                    api_compatibility_ref=catalog["api_compatibility_ref"], capability_snapshot_ref=catalog["capability_snapshot_ref"],
                                    catalog_owner_ref="owner:forge", now_utc=datetime(2026, 9, 24, 12, tzinfo=timezone.utc),
                                    admitted_capability_refs=frozenset(["capability:fixture"]),
                                    admitted_permission_refs=frozenset(["permission:fixture"]),
                                    allowed_effects=frozenset([("owner:forge", "create_api")]),
                                    admitted_resource_refs=frozenset([("policy", "policy:fixture"), ("credential_grant", "grant:fixture")]))
    return selections, catalog, context


def evaluate(selections, catalog, context):
    # Fixture resolver is explicitly not production provenance authentication.
    def resolve(ref):
        if ref != catalog["catalog_id"]:
            raise LookupError(ref)
        return catalog
    return validate_creation_options(selections, resolve_catalog=resolve, digest_record=fixture_digest, context=context)


class CreationOptionsTests(unittest.TestCase):
    def test_pathological_pattern_is_bounded_and_failure_is_closed(self):
        started = time.monotonic()
        self.assertEqual('budget', _bounded_pattern('(a+)+$', 'a' * 50000 + '!', started + 5))
        self.assertLess(time.monotonic() - started, 3)
        self.assertEqual('budget', _bounded_pattern('[a-z]+', 'chosen', time.monotonic() - 1))
        self.assertEqual('budget', _bounded_pattern('x' * 16385, None, time.monotonic() + 5))
        with mock.patch('pm_forge_creation_options.subprocess.run', side_effect=OSError('worker unavailable')):
            self.assertEqual('unavailable', _bounded_pattern('[a-z]+', 'chosen', time.monotonic() + 5))

    def test_catalog_and_selection_share_a_pattern_budget(self):
        selection, catalog, context = fixtures(kinds=True)
        with mock.patch('pm_forge_creation_options._bounded_pattern', return_value='ok') as bounded:
            self.assertEqual([], evaluate(selection, catalog, context))
            self.assertGreaterEqual(len(bounded.call_args_list), 2)
            deadlines = [call.args[2] for call in bounded.call_args_list]
            self.assertEqual(1, len(set(deadlines)))
        with mock.patch('pm_forge_creation_options._bounded_pattern', return_value='budget'):
            self.assertTrue(any('pattern_budget' in error for error in evaluate(selection, catalog, context)))

    def test_reference_primitive_matches_actual_forge_owner(self):
        owner = json.loads((ROOT / "Plans/forge_integration_contracts.schema.json").read_text())
        self.assertEqual({"$ref": "#/$defs/non_secret_ref"}, build_creation_option_defs()["creation_option_nonsecret_ref"])
        for ref in ("file:private", "secret:raw", "api-key:raw", "cookie:raw", "private-key:raw", "x" * 513):
            self.assertTrue(structural_errors("creation_option_nonsecret_ref", ref))

    def test_context_snapshot_is_closed_secondary_shape(self):
        _, _, context = fixtures()
        snapshot = asdict(context)
        snapshot["now_utc"] = context.now_utc.isoformat()
        for key in ("admitted_capability_refs", "admitted_permission_refs"):
            snapshot[key] = sorted(snapshot[key])
        for key in ("allowed_effects", "admitted_resource_refs"):
            snapshot[key] = [list(pair) for pair in sorted(snapshot[key])]
        self.assertEqual([], structural_errors("creation_option_context", snapshot))
        snapshot["caller_verified"] = True
        self.assertTrue(structural_errors("creation_option_context", snapshot))

    def test_schema_graph_closed_and_all_provider_categories(self):
        defs = build_creation_option_defs()
        Draft202012Validator.check_schema({"$defs": defs})
        for definition in defs.values():
            if definition.get("type") == "object":
                self.assertIs(definition["additionalProperties"], False)
        for provider in PROVIDER_CATEGORIES:
            with self.subTest(provider=provider):
                selection, catalog, context = fixtures(provider)
                self.assertEqual([], evaluate(selection, catalog, context))
                bad = copy.deepcopy(catalog)
                bad["fields"] = bad["fields"][1:]
                selection["catalog_sha256"] = fixture_digest(bad)
                self.assertIn("catalog_provider_category_coverage", evaluate(selection, bad, context))

    def test_all_value_kinds_and_causal_value_rejections(self):
        selection, catalog, context = fixtures(kinds=True)
        self.assertEqual([], evaluate(selection, catalog, context))
        mutations = {
            "text": ("value", "x", "text_min_length"),
            "integer": ("value", 10, "integer_maximum"),
            "catalog_choice": ("choice_id", "absent", "choice_not_in_resolved_catalog"),
            "catalog_choice_list": ("choice_ids", [], "list_min_items"),
            "resource_ref": ("ref", "policy:unresolved", "selection_resource_not_admitted"),
            "resource_ref_list": ("refs", ["policy:unresolved"], "selection_resource_not_admitted"),
            "protected_ref": ("ref", "grant:unresolved", "selection_resource_not_admitted"),
        }
        for kind, (key, value, code) in mutations.items():
            with self.subTest(kind=kind):
                bad = copy.deepcopy(selection)
                next(f for f in bad["fields"] if f["field_id"] == "fixture-kind-" + kind)["value"][key] = value
                self.assertEqual([], structural_errors("creation_option_selections", bad))
                self.assertTrue(any(code in e for e in evaluate(bad, catalog, context)))
        bad = copy.deepcopy(selection)
        next(f for f in bad["fields"] if f["field_id"] == "fixture-kind-boolean")["value"] = {"kind": "integer", "value": 1}
        self.assertTrue(any("value_kind_mismatch" in e for e in evaluate(bad, catalog, context)))

    def test_all_current_identity_and_owner_evidence_joins(self):
        selection, catalog, context = fixtures()
        for key in ("provider", "provider_variant", "normalized_host", "instance_id", "catalog_ref", "catalog_revision"):
            with self.subTest(key=key):
                bad = copy.deepcopy(selection)
                bad[key] = 3 if key == "catalog_revision" else ("gitlab" if key == "provider" else "different:identity")
                self.assertEqual([], structural_errors("creation_option_selections", bad))
                self.assertIn("selection_current_" + key + "_mismatch", evaluate(bad, catalog, context))
        for key in ("adapter_schema_ref", "adapter_schema_revision", "api_compatibility_ref", "capability_snapshot_ref", "owner_ref"):
            bad = copy.deepcopy(catalog)
            bad[key] = 4 if key == "adapter_schema_revision" else "different:identity"
            current = copy.deepcopy(selection)
            current["catalog_sha256"] = fixture_digest(bad)
            expected = "catalog_owner_mismatch" if key == "owner_ref" else "catalog_current_" + key + "_mismatch"
            self.assertIn(expected, evaluate(current, bad, context))
        bad = copy.deepcopy(selection)
        bad["catalog_sha256"] = "0" * 64
        self.assertIn("catalog_digest_mismatch", evaluate(bad, catalog, context))
        for time in (datetime(2026, 9, 23, tzinfo=timezone.utc), datetime(2026, 9, 25, tzinfo=timezone.utc)):
            self.assertIn("catalog_not_current", evaluate(selection, catalog, replace(context, now_utc=time)))

    def test_capability_permission_phase_and_descriptor_joins(self):
        selection, catalog, context = fixtures()
        for field, code in (("admitted_capability_refs", "selection_capability_not_admitted"),
                            ("admitted_permission_refs", "selection_permission_not_admitted"),
                            ("allowed_effects", "selection_owner_phase_not_admitted")):
            self.assertTrue(any(code in e for e in evaluate(selection, catalog, replace(context, **{field: frozenset()}))))
        for key, value in (("category", "repository_policy"), ("owner_ref", "owner:other"), ("effect_phase", "post_create"),
                           ("capability_ref", "capability:other"), ("permission_ref", "permission:other")):
            bad = copy.deepcopy(selection)
            bad["fields"][0][key] = value
            self.assertEqual([], structural_errors("creation_option_selections", bad))
            self.assertTrue(any("selection_descriptor_" + key + "_mismatch" in e for e in evaluate(bad, catalog, context)))

    def test_unknown_duplicate_missing_unsupported(self):
        selection, catalog, context = fixtures()
        bad = copy.deepcopy(selection)
        bad["fields"][0]["field_id"] = "absent"
        self.assertIn("selection_unknown_field:absent", evaluate(bad, catalog, context))
        bad = copy.deepcopy(selection)
        bad["fields"].append(copy.deepcopy(bad["fields"][0]))
        self.assertIn("selection_duplicate_field_id", evaluate(bad, catalog, context))
        for key in ("supported", "required_selection"):
            modified = copy.deepcopy(catalog)
            modified["fields"][0][key] = key == "required_selection"
            bad = copy.deepcopy(selection)
            bad["catalog_sha256"] = fixture_digest(modified)
            if key == "required_selection":
                bad["fields"] = bad["fields"][1:]
            expected = "required_selection_missing:" if key == "required_selection" else "selection_unsupported:"
            self.assertTrue(any(expected in e for e in evaluate(bad, modified, context)))

    def test_cross_field_rules_and_predicates(self):
        selection, catalog, context = fixtures()
        first, second = [f["field_id"] for f in catalog["fields"][:2]]
        for relation in ("requires", "excludes", "same_value"):
            for comparison in ("present", "equals"):
                with self.subTest(relation=relation, comparison=comparison):
                    modified = copy.deepcopy(catalog)
                    modified["cross_field_constraints"] = [dict(constraint_id="constraint:fixture", when=dict(field_id=first, comparison=comparison,
                        value=None if comparison == "present" else {"kind": "boolean", "value": True}), relation=relation, other_field_id=second)]
                    good = copy.deepcopy(selection)
                    good["catalog_sha256"] = fixture_digest(modified)
                    if relation == "excludes":
                        good["fields"] = [f for f in good["fields"] if f["field_id"] != second]
                    self.assertEqual([], evaluate(good, modified, context))
                    bad = copy.deepcopy(good)
                    if relation == "requires":
                        bad["fields"] = [f for f in bad["fields"] if f["field_id"] != second]
                    elif relation == "excludes":
                        bad["fields"].append(copy.deepcopy(selection["fields"][1]))
                    else:
                        bad["fields"][1]["value"]["value"] = False
                    self.assertIn("selection_cross_field:constraint:fixture", evaluate(bad, modified, context))
                    if comparison == "equals":
                        bad["fields"][0]["value"]["value"] = False
                        self.assertNotIn("selection_cross_field:constraint:fixture", evaluate(bad, modified, context))

    def test_no_generic_payload_or_raw_protected_value(self):
        selection, catalog, context = fixtures(kinds=True)
        for target, key, value in ((selection, "patch", {"anything": True}), (selection["fields"][0], "provider_patch_ref", "patch:fake")):
            target[key] = value
            self.assertTrue(structural_errors("creation_option_selections", selection))
            del target[key]
        protected = next(f for f in selection["fields"] if f["value"]["kind"] == "protected_ref")
        protected["value"] = {"kind": "text", "value": "raw-material"}
        self.assertTrue(any("value_kind_mismatch" in e for e in evaluate(selection, catalog, context)))
        bad = copy.deepcopy(catalog)
        next(f for f in bad["fields"] if f["value_kind"] == "protected_ref")["value_kind"] = "text"
        self.assertTrue(any("catalog_secret_value_kind" in e for e in catalog_semantic_failures(bad)))

    def test_resolver_failure_is_not_reference_success(self):
        selection, catalog, context = fixtures()
        def unavailable(ref):
            raise LookupError(ref)
        self.assertIn("catalog_resolution_failed", validate_creation_options(selection, resolve_catalog=unavailable, digest_record=fixture_digest, context=context))
        def wrong(ref):
            out = copy.deepcopy(catalog)
            out["catalog_id"] = "catalog:other"
            return out
        self.assertIn("catalog_resolved_identity_mismatch", validate_creation_options(selection, resolve_catalog=wrong, digest_record=fixture_digest, context=context))


if __name__ == "__main__":
    unittest.main(verbosity=2)
