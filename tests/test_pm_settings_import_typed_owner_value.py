"""Focused causal tests for the Settings import typed owner/value companion.

Carried from the reviewed v5 stage: the DL-095 reset joins, the two admitted
source kinds with their byte-digest and source-value joins (including the
REVIEW-PROBE-V4-SNAPSHOT-MAPPING source-value join), credential and
owner_destination exclusion, before/after hash bindings, and the deterministic
projected settlement.

New under SSYS-007.A (v8/v9): the registry's typed classification of record
for the sixteen owner-table rows, the typed value-form admission join, the
independently selected owner-read boundary (held fixed while the submitted
witness is co-mutated to a foreign Project, stale revision/root, or stale
source/destination value), destination-owned environment-bound custody, the
portable remote-owner branch, and run-scoped exclusion.  Like v5 this runs no
import, preview, apply, snapshot service, clock, or transport; the owner read
is supplied by this static test double, which is not native issuer
authentication.
"""
import copy
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from gate_loader import load_gate, HOOK_PATH  # noqa: E402

ROOT = HERE.parent
GATE = load_gate()

SCHEMA_PATH = "Plans/settings_system_contracts.schema.json"
SCHEMA = json.loads((ROOT / SCHEMA_PATH).read_text())
PACK = json.loads((ROOT / "Plans/settings_system_contract_fixtures.json").read_text())
INVENTORY_PATH = ROOT / "Plans/settings_inventory.json"
INVENTORY = json.loads(INVENTORY_PATH.read_text())
INVENTORY_SCHEMA = json.loads((ROOT / "Plans/settings_inventory.schema.json").read_text())

VALUES = {case["case_id"]: case["record"] for case in PACK["valid_cases"]}
NEGATIVES = {case["case_id"]: case for case in PACK["negative_cases"]}
OWNER_READS = {
    case["case_id"]: case["owner_read"]
    for case in PACK["valid_cases"]
    if "owner_read" in case
}
SETTINGS_CONTRACT_IDS = set(PACK["command_contracts"])
REGISTRY = GATE.Registry()

WITNESS_DEF = "settings_import_replace_resolution_witness"
IMPORT_FAMILY_DEFINITIONS = {
    WITNESS_DEF,
    "settings_transaction_preview",
    "settings_transaction_preview_existing_project",
    "settings_transaction_preview_request_existing_project",
    "project_settings_snapshot",
    "settings_export_manifest",
    "settings_export_artifact_evidence",
    "settings_migration_preview",
}
WITNESS = VALUES["valid-import-replace-witness-web-category"]
EXPORT_WITNESS = VALUES["valid-import-replace-witness-web-export"]

sys.path.insert(0, str(ROOT / "scripts"))
import pm_settings_import_semantics  # noqa: E402


def validator(definition):
    return GATE.validator_for(SCHEMA, {"$ref": "#/$defs/" + definition}, REGISTRY)


def semantics(definition, value, owner_read=None):
    return GATE.contract_semantic_failures(
        SCHEMA_PATH, definition, value, settings_owner_read=owner_read
    )


def witness_semantics(record, owner_read=None):
    return pm_settings_import_semantics.witness_failures(
        record, INVENTORY_PATH, owner_read=owner_read
    )


def recompute_eligible(chosen):
    out = []
    for category in chosen:
        for row in INVENTORY["settings"]:
            setting_id = row["id"]
            if not setting_id.startswith(category + "."):
                continue
            if pm_settings_import_semantics.classify_setting(row) == "ordinary":
                out.append(setting_id)
    return sorted(out)


class SettingsImportTypedOwnerValueTests(unittest.TestCase):
    def test_schema_is_strict_draft_2020_12(self):
        from jsonschema import Draft202012Validator

        Draft202012Validator.check_schema(SCHEMA)
        Draft202012Validator.check_schema(INVENTORY_SCHEMA)
        Draft202012Validator(INVENTORY_SCHEMA).validate(INVENTORY)

    # ---------------------------------------------------- SSYS-007.A table

    def test_ssys007a_table_of_record_is_the_registry_classification(self):
        expected = {
            "ai.accounts.opencode-cli-path": "local_environment",
            "code.execution.docker-binary-path": "local_environment",
            "system.advanced.cli-path-cursor": "local_environment",
            "system.advanced.cli-path-claude": "local_environment",
            "branching.worktrees.worktree-base-dir": "local_environment",
            "web.fetch.ca-bundle": "local_environment",
            "ai.accounts.github-oauth-loopback": "local_environment",
            "planning.interview.wizard-project-path": "run_scoped",
            "safety.protection.custom-patterns-path": "value_dependent",
            "code.terminal.cwd": "value_dependent",
            "code.editing.lsp-root-override": "value_dependent",
            "code.execution.compose-file": "value_dependent",
            "code.execution.build-context": "value_dependent",
            "code.execution.dockerfile-path": "value_dependent",
            "code.execution.unraid-repo-path": "value_dependent",
            "media.io.artifacts-location": "value_dependent",
        }
        for setting_id, kind in expected.items():
            row = next(item for item in INVENTORY["settings"] if item["id"] == setting_id)
            self.assertEqual(row.get("management_kind"), kind, setting_id)
            self.assertEqual(
                pm_settings_import_semantics.classify_setting(row), kind, setting_id
            )
        self.assertIsNone(
            next(
                item for item in INVENTORY["settings"]
                if item["id"] == "ai.accounts.github-oauth-loopback"
            ).get("portable_value_forms")
        )
        forms = {
            "safety.protection.custom-patterns-path": ["project_root_relative"],
            "code.terminal.cwd": ["symbolic_default"],
            "code.editing.lsp-root-override": ["symbolic_default"],
            "code.execution.compose-file": ["project_root_relative"],
            "code.execution.build-context": ["project_root_relative"],
            "code.execution.dockerfile-path": ["project_root_relative"],
            "code.execution.unraid-repo-path": [
                "project_root_relative",
                "portable_remote_reference",
            ],
            "media.io.artifacts-location": ["project_root_placeholder"],
        }
        for setting_id, admitted in forms.items():
            row = next(item for item in INVENTORY["settings"] if item["id"] == setting_id)
            self.assertEqual(row["portable_value_forms"], admitted, setting_id)

    def test_typed_classification_is_required_machine_evidence(self):
        items = INVENTORY_SCHEMA["properties"]["settings"]["items"]
        field = items["properties"]["management_kind"]
        self.assertEqual(
            field["enum"],
            [
                "ordinary",
                "credential",
                "local_environment",
                "owner_destination",
                "value_dependent",
                "run_scoped",
                "unresolved",
            ],
        )
        conditional = next(
            rule for rule in items["allOf"]
            if "management_kind" in rule.get("then", {}).get("required", [])
        )
        self.assertIn("management_kind", conditional["then"]["required"])
        non_action_types = items["allOf"][0]["if"]["properties"]["type"]["enum"]
        self.assertNotIn("action", non_action_types)
        ordinary = copy.deepcopy(next(row for row in INVENTORY["settings"]
                                      if row.get("management_kind") == "ordinary"))
        from jsonschema import Draft202012Validator
        validator = Draft202012Validator(items)
        self.assertEqual(list(validator.iter_errors(ordinary)), [])
        ordinary.pop("management_kind")
        self.assertTrue(any("management_kind" in str(error)
                            for error in validator.iter_errors(ordinary)))
        typed = [row for row in INVENTORY["settings"] if "management_kind" in row]
        untyped = [row for row in INVENTORY["settings"] if "management_kind" not in row]
        self.assertTrue(all(row["type"] == "action" for row in untyped))
        self.assertEqual(len(typed) + len(untyped), 887)
        for row in INVENTORY["settings"]:
            if row.get("management_kind") == "value_dependent":
                self.assertTrue(row.get("portable_value_forms"), row["id"])

    def test_management_kind_join_is_the_machine_owner_classification(self):
        rows = {row["id"]: row for row in INVENTORY["settings"]}
        joined = sorted(
            rid for rid, row in rows.items()
            if row.get("management_kind") == "owner_destination"
        )
        self.assertEqual(
            joined,
            [
                "code.editing.formatter-catalog",
                "code.editing.formatter-custom",
                "code.editing.formatters-enabled",
                "memory.assembly.dry-method-guard",
            ],
        )
        for rid in joined:
            self.assertEqual(
                pm_settings_import_semantics.classify_setting(rows[rid]),
                "owner_destination",
            )

    def test_credential_class_is_the_typed_owner_field(self):
        derived = sorted(
            row["id"] for row in INVENTORY["settings"]
            if pm_settings_import_semantics.classify_setting(row) == "credential"
        )
        self.assertEqual(
            derived,
            [
                "ai.accounts.anthropic-api-key",
                "ai.accounts.cursor-api-key",
                "ai.accounts.gemini-api-key",
                "ai.accounts.github-token",
                "ai.accounts.minimax-api-key",
                "ai.accounts.openai-api-key",
                "ai.accounts.opencode-server-auth",
                "code.execution.dockerhub-token",
                "web.fetch.proxy-credentials",
                "web.providers.firecrawl-api-key",
            ],
        )

    def test_local_run_scoped_and_value_dependent_classes_are_typed(self):
        classes = {
            row["id"]: pm_settings_import_semantics.classify_setting(row)
            for row in INVENTORY["settings"]
        }
        locals_ = sorted(rid for rid, cls in classes.items() if cls == "local_environment")
        self.assertIn("web.fetch.ca-bundle", locals_)
        self.assertIn("ai.accounts.github-oauth-loopback", locals_)
        self.assertEqual(len(locals_), 7)
        self.assertEqual(len(classes), 887)
        self.assertEqual(
            sorted(rid for rid, cls in classes.items() if cls == "run_scoped"),
            ["planning.interview.wizard-project-path"],
        )
        self.assertEqual(
            len([1 for cls in classes.values() if cls == "value_dependent"]), 8
        )
        self.assertNotIn("owner_undecided", set(classes.values()))
        self.assertEqual(sum(1 for cls in classes.values() if cls == "action"), 68)
        self.assertEqual(sum(1 for cls in classes.values() if cls == "ordinary"), 789)
        self.assertNotIn("unclassified", set(classes.values()))
        self.assertEqual(classes["ai.accounts.credential-storage"], "ordinary")
        self.assertEqual(classes["web.providers.firecrawl-url"], "ordinary")
        self.assertEqual(classes["web.providers.web-api-keys"], "action")

    def test_prose_never_drives_classification(self):
        payload = json.loads(INVENTORY_PATH.read_text())
        for row in payload["settings"]:
            row["desc"] = "altered prose " + str(row.get("desc", ""))
            row["search"] = ["altered"] + list(row.get("search", []))
        with tempfile.TemporaryDirectory() as tmp:
            other = Path(tmp) / "settings_inventory.json"
            other.write_text(json.dumps(payload, indent=2) + "\n")
            altered = json.loads(other.read_text())
            classes = {
                row["id"]: pm_settings_import_semantics.classify_setting(row)
                for row in altered["settings"]
            }
            self.assertEqual(
                classes["safety.protection.custom-patterns-path"], "value_dependent"
            )
            self.assertEqual(classes["ai.accounts.opencode-server-auth"], "credential")
            failures = pm_settings_import_semantics.witness_failures(WITNESS, other)
            self.assertEqual(failures, ["inventory_binding_hash_mismatch"])

    def test_opencode_server_auth_is_typed_credential_and_refused(self):
        row = next(
            item for item in INVENTORY["settings"]
            if item["id"] == "ai.accounts.opencode-server-auth"
        )
        self.assertEqual(row["management_kind"], "credential")
        mutated = copy.deepcopy(WITNESS)
        preview = mutated["preview_record"]
        preview["exact_setting_ids"] = sorted(preview["exact_setting_ids"] + [row["id"]])
        preview["proposed_values_by_setting_id"][row["id"]] = row["default"]
        reset = {
            "setting_id": row["id"],
            "value_before": "destination-whatever",
            "value_after": row["default"],
        }
        preview["import_resets"] = sorted(
            preview["import_resets"] + [reset], key=lambda item: item["setting_id"]
        )
        mutated["resolved_import_resets"] = copy.deepcopy(preview["import_resets"])
        failures = witness_semantics(mutated)
        self.assertIn("import_reset_touches_credential_setting", failures)
        self.assertIn("import_exact_ids_not_the_replace_scope", failures)

    def test_owner_destinations_never_enter_the_replace_denominator(self):
        code_eligible = recompute_eligible(["code"])
        memory_eligible = recompute_eligible(["memory"])
        for row in INVENTORY["settings"]:
            if row.get("management_kind") == "owner_destination":
                prefix = row["id"].split(".", 1)[0]
                eligible = code_eligible if prefix == "code" else memory_eligible
                self.assertNotIn(row["id"], eligible)
        self.assertNotIn("memory.assembly.dry-method-guard", memory_eligible)
        self.assertEqual(len(recompute_eligible(["web"])), 46)

    # --------------------------------------------------- independent reads

    def test_value_dependent_scopes_fail_closed_without_the_owner_read(self):
        witness = VALUES["valid-import-replace-witness-safety-relative"]
        self.assertEqual(
            witness_semantics(witness, owner_read=None),
            ["import_exact_ids_not_the_replace_scope", "owner_read_unavailable"],
        )
        self.assertEqual(
            witness_semantics(witness, owner_read=OWNER_READS["valid-import-replace-witness-safety-relative"]),
            [],
        )

    def test_owner_read_boundary_refuses_co_mutated_witnesses(self):
        expected = {
            "invalid-import-replace-witness-owner-read-absent": [
                "import_exact_ids_not_the_replace_scope",
                "owner_read_unavailable",
            ],
            "invalid-import-replace-witness-owner-read-foreign-source-project": [
                "owner_read_identity_mismatch",
                "owner_read_root_binding_mismatch",
            ],
            "invalid-import-replace-witness-owner-read-stale-destination-revision": [
                "owner_read_identity_mismatch",
                "owner_read_root_binding_mismatch",
                "owner_read_value_form_mismatch",
            ],
            "invalid-import-replace-witness-owner-read-stale-source-value": [
                "owner_read_value_form_mismatch",
            ],
        }
        for case_id, rules in expected.items():
            with self.subTest(case=case_id):
                case = NEGATIVES[case_id]
                self.assertEqual(list(validator(WITNESS_DEF).iter_errors(case["record"])), [])
                self.assertEqual(
                    witness_semantics(case["record"], owner_read=case.get("owner_read")),
                    rules,
                )

    def test_typed_value_form_joins_fail_closed(self):
        expected = {
            "invalid-import-replace-witness-value-form-binding-missing": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_touches_destination_owned_value",
                "witness_value_form_binding_missing",
            ],
            "invalid-import-replace-witness-value-form-not-admitted": [
                "owner_read_value_form_mismatch",
                "witness_value_form_not_owner_admitted",
            ],
            "invalid-import-replace-witness-value-form-absolute-contradiction": [
                "owner_read_value_form_mismatch",
                "witness_post_apply_projection_settlement_mismatch",
                "witness_value_form_shape_contradiction",
            ],
            "invalid-import-replace-witness-value-form-foreign-root": [
                "owner_read_value_form_mismatch",
                "witness_value_form_root_binding_mismatch",
            ],
            "invalid-import-replace-witness-value-form-stale-revision": [
                "owner_read_value_form_mismatch",
                "witness_value_form_revision_mismatch",
            ],
            "invalid-import-replace-witness-value-form-destination-current-changed": [
                "witness_value_form_destination_current_changed",
            ],
            "invalid-import-replace-witness-value-form-wrong-classification": [
                "witness_value_form_not_owner_admitted",
            ],
            "invalid-import-replace-witness-value-form-binding-duplicate-foreign-first": [
                "witness_value_form_binding_duplicate"
            ],
            "invalid-import-replace-witness-value-form-binding-duplicate-foreign-last": [
                "owner_read_value_form_mismatch",
                "witness_value_form_binding_duplicate",
                "witness_value_form_root_binding_mismatch",
            ],
        }
        for case_id, rules in expected.items():
            with self.subTest(case=case_id):
                case = NEGATIVES[case_id]
                self.assertEqual(list(validator(WITNESS_DEF).iter_errors(case["record"])), [])
                self.assertEqual(
                    witness_semantics(case["record"], owner_read=case.get("owner_read")),
                    rules,
                )

    def test_duplicate_value_form_bindings_are_refused_before_overwrite(self):
        # REVIEW-DIFFERENT-SOL-V10 blocking counterexample: a schema-valid
        # foreign-root record sharing the validated binding's setting_id must
        # never be silently overwritten (or silently overwrite) inside the
        # helper's mapping; the refusal fires before any admission join.
        base = VALUES["valid-import-replace-witness-safety-relative"]
        owner_read = OWNER_READS["valid-import-replace-witness-safety-relative"]
        for position in (0, 1):
            with self.subTest(position=position):
                witness = copy.deepcopy(base)
                foreign = copy.deepcopy(witness["value_form_bindings"][0])
                foreign["source_project_root_sha256"] = "0" * 64
                witness["value_form_bindings"].insert(position, foreign)
                self.assertEqual(
                    list(validator(WITNESS_DEF).iter_errors(witness)),
                    [],
                    "the duplicated witness must stay schema-valid (uniqueItems only rejects identical objects)",
                )
                self.assertEqual(
                    witness_semantics(witness, owner_read=owner_read),
                    (
                        ["witness_value_form_binding_duplicate"]
                        if position == 0
                        else [
                            "owner_read_value_form_mismatch",
                            "witness_value_form_binding_duplicate",
                            "witness_value_form_root_binding_mismatch",
                        ]
                    ),
                )

    # --------------------------------------------- portable + custody scope

    def test_portable_project_relative_and_symbolic_positives_hold(self):
        witness = VALUES["valid-import-replace-witness-safety-relative"]
        binding = witness["value_form_bindings"][0]
        self.assertEqual(binding["setting_id"], "safety.protection.custom-patterns-path")
        self.assertEqual(binding["value_form"], "project_root_relative")
        self.assertEqual(witness_semantics(witness, OWNER_READS["valid-import-replace-witness-safety-relative"]), [])
        code = VALUES["valid-import-replace-witness-code-remote-symbolic"]
        forms = {record["setting_id"]: record for record in code["value_form_bindings"]}
        self.assertEqual(forms["code.execution.unraid-repo-path"]["value_form"], "portable_remote_reference")
        self.assertEqual(forms["code.editing.lsp-root-override"]["value_form"], "symbolic_default")
        self.assertEqual(forms["code.terminal.cwd"]["value_form"], "symbolic_default")
        self.assertEqual(
            code["source_snapshot"]["values_by_setting_id"]["code.execution.unraid-repo-path"],
            "https://git.example.com/templates/unraid-app.git",
        )
        self.assertEqual(witness_semantics(code, OWNER_READS["valid-import-replace-witness-code-remote-symbolic"]), [])
        media = VALUES["valid-import-replace-witness-media-placeholder-import"]
        self.assertEqual(witness_semantics(media, OWNER_READS["valid-import-replace-witness-media-placeholder-import"]), [])

    def test_destination_owned_value_stays_untouched_and_omission_resets_portable(self):
        code = VALUES["valid-import-replace-witness-code-remote-symbolic"]
        preview = code["preview_record"]
        self.assertNotIn("code.execution.compose-file", preview["exact_setting_ids"])
        self.assertNotIn("code.execution.compose-file", preview["proposed_values_by_setting_id"])
        excluded = {item["setting_id"]: item for item in preview["excluded_settings"]}
        self.assertIn("code.execution.compose-file", excluded)
        self.assertEqual(excluded["code.execution.compose-file"]["reason_code"], "host_environment_mismatch")
        for entry in code["resolved_import_resets"]:
            self.assertNotEqual(entry["setting_id"], "code.execution.compose-file")
        for rid in ("code.editing.formatters-enabled", "code.editing.formatter-catalog",
                    "code.editing.formatter-custom", "code.execution.dockerhub-token",
                    "code.execution.docker-binary-path"):
            self.assertNotIn(rid, preview["exact_setting_ids"])
            self.assertIn(rid, excluded)
        self.assertEqual(witness_semantics(code, OWNER_READS["valid-import-replace-witness-code-remote-symbolic"]), [])
        media = VALUES["valid-import-replace-witness-media-placeholder-reset"]
        resets = {entry["setting_id"]: entry for entry in media["resolved_import_resets"]}
        self.assertIn("media.io.artifacts-location", resets)
        self.assertEqual(
            resets["media.io.artifacts-location"]["value_after"],
            "${PROJECT_ROOT}/.puppet-master/artifacts/",
        )
        self.assertEqual(witness_semantics(media, OWNER_READS["valid-import-replace-witness-media-placeholder-reset"]), [])

    def test_run_scoped_row_stays_outside_durable_replace_state(self):
        witness = VALUES["valid-import-replace-witness-planning-ordinary"]
        preview = witness["preview_record"]
        wizard = "planning.interview.wizard-project-path"
        self.assertNotIn(wizard, preview["exact_setting_ids"])
        self.assertIn(
            wizard, {item["setting_id"] for item in preview["excluded_settings"]}
        )
        self.assertEqual(witness_semantics(witness, OWNER_READS["valid-import-replace-witness-planning-ordinary"]), [])
        case = NEGATIVES["invalid-import-replace-witness-run-scoped-reset"]
        self.assertEqual(
            witness_semantics(case["record"], owner_read=case.get("owner_read")),
            [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_before_value_unbound",
                "import_reset_touches_run_scoped_setting",
                "preview_exclusion_missing_for_owner_excluded_id",
                "witness_post_apply_projection_settlement_mismatch",
            ],
        )

    def test_destination_owned_value_negatives_hold(self):
        expected = {
            "invalid-import-replace-witness-destination-owned-value-imported": [
                "import_exact_ids_not_the_replace_scope",
                "witness_post_apply_projection_settlement_mismatch",
            ],
            "invalid-import-replace-witness-destination-owned-value-reset": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_before_value_mismatch",
                "import_reset_touches_destination_owned_value",
                "owner_read_value_form_mismatch",
                "preview_exclusion_missing_for_destination_owned_value",
            ],
        }
        for case_id, rules in expected.items():
            with self.subTest(case=case_id):
                case = NEGATIVES[case_id]
                self.assertEqual(
                    witness_semantics(case["record"], owner_read=case.get("owner_read")),
                    rules,
                )

    # ------------------------------------------------------- carried joins

    def test_carried_v5_web_witnesses_still_pass(self):
        self.assertEqual(witness_semantics(WITNESS), [])
        self.assertEqual(witness_semantics(EXPORT_WITNESS), [])

    def test_snapshot_source_value_join_rejects_divergent_values(self):
        mutant = copy.deepcopy(WITNESS)
        setting_id = "web.fetch.cache-size"
        self.assertEqual(
            mutant["source_snapshot"]["values_by_setting_id"][setting_id],
            mutant["preview_record"]["proposed_values_by_setting_id"][setting_id],
        )
        mutant["source_snapshot"]["values_by_setting_id"][setting_id] = 999
        source_hash = pm_settings_import_semantics.canonical_digest(
            mutant["source_snapshot"], "content_sha256"
        )
        mutant["source_snapshot"]["content_sha256"] = source_hash
        mutant["preview_record"]["import_source_snapshot_sha256"] = source_hash
        failures = witness_semantics(mutant)
        self.assertIn("witness_source_snapshot_value_mismatch", failures)

    def test_witness_admits_exactly_two_owner_evidenced_source_kinds(self):
        enum = SCHEMA["$defs"][WITNESS_DEF]["properties"]["source_kind"]["enum"]
        self.assertEqual(enum, ["project_settings_snapshot", "settings_export_v1"])
        self.assertEqual(set(pm_settings_import_semantics.ADMITTED_SOURCE_KINDS), set(enum))
        for kind in ("legacy_global_snapshot", "legacy_singleton_settings", "legacy_browser_concept_fixture"):
            with self.subTest(kind=kind):
                mutated = copy.deepcopy(WITNESS)
                mutated["source_kind"] = kind
                self.assertFalse(validator(WITNESS_DEF).is_valid(mutated))
                self.assertIn("witness_source_kind_not_admitted", witness_semantics(mutated))

    def test_export_source_witness_joins_values_ids_and_bytes(self):
        manifest = EXPORT_WITNESS["export_manifest"]
        migration = EXPORT_WITNESS["migration_preview"]
        preview = EXPORT_WITNESS["preview_record"]
        artifact = EXPORT_WITNESS["export_artifact"]
        self.assertEqual(manifest["project_id"], preview["source_project_id"])
        self.assertEqual(migration["source_sha256"], manifest["content_sha256"])
        digest, length = pm_settings_import_semantics.canonical_bytes_digest(artifact)
        self.assertEqual(digest, manifest["content_sha256"])
        self.assertEqual(length, manifest["byte_length"])
        source_keys = set(migration["mappable_setting_ids"])
        self.assertEqual(set(artifact["values_by_setting_id"]), source_keys)
        eligible = recompute_eligible(EXPORT_WITNESS["chosen_category_ids"])
        resets = [entry["setting_id"] for entry in EXPORT_WITNESS["resolved_import_resets"]]
        self.assertEqual(resets, [rid for rid in eligible if rid not in source_keys])

    def test_before_and_after_hashes_bind_real_bytes(self):
        preview = WITNESS["preview_record"]
        self.assertEqual(preview["before_sha256"], WITNESS["destination_snapshot"]["content_sha256"])
        projected = WITNESS["projected_post_apply_snapshot"]
        self.assertEqual(preview["after_sha256"], projected["content_sha256"])

    def test_witness_definition_shape_is_closed_and_bound(self):
        definition = SCHEMA["$defs"][WITNESS_DEF]
        self.assertTrue(definition["additionalProperties"] is False)
        for field in ("project_root_bindings", "value_form_bindings"):
            self.assertIn(field, definition["properties"])
            self.assertNotIn(field, definition["required"])
        self.assertEqual(list(validator(WITNESS_DEF).iter_errors(WITNESS)), [])
        self.assertEqual(list(validator(WITNESS_DEF).iter_errors(EXPORT_WITNESS)), [])

    def test_every_semantic_negative_proves_exactly_its_rule(self):
        expected = {
            "invalid-import-replace-witness-empty-resets-despite-omission": [
                "import_reset_missing_omitted_id"
            ],
            "invalid-import-replace-witness-wrong-default": ["import_reset_default_mismatch"],
            "invalid-import-replace-witness-false-before-value": ["import_reset_before_value_mismatch"],
            "invalid-import-replace-witness-extra-not-omitted-id": [
                "import_reset_id_not_omitted_by_source",
                "witness_source_snapshot_value_mismatch",
            ],
            "invalid-import-replace-witness-reset-touches-excluded-credential": [
                "import_reset_touches_credential_setting"
            ],
            "invalid-import-replace-witness-inventory-absent-id": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_before_value_unbound",
                "import_reset_id_not_in_inventory",
                "import_reset_missing_omitted_id",
            ],
            "invalid-import-replace-witness-unrelated-source-snapshot": [
                "witness_source_snapshot_bytes_digest_mismatch",
                "witness_source_snapshot_hash_mismatch",
            ],
            "invalid-import-replace-witness-stale-source-revision": [
                "witness_source_snapshot_hash_mismatch",
                "witness_source_snapshot_revision_mismatch",
            ],
            "invalid-import-replace-witness-unrelated-destination-project": [
                "witness_destination_snapshot_bytes_digest_mismatch",
                "witness_destination_snapshot_project_mismatch",
                "witness_post_apply_projection_malformed",
            ],
            "invalid-import-replace-witness-unrelated-registry-snapshot": [
                "inventory_binding_hash_mismatch"
            ],
            "invalid-import-replace-witness-resolved-set-differs-from-preview": [
                "import_reset_missing_omitted_id",
                "witness_reset_set_differs_from_preview",
            ],
            "invalid-import-replace-preview-reset-outside-exact-set": [
                "import_reset_outside_exact_ids",
                "import_reset_without_bound_after_value",
            ],
            "invalid-import-replace-preview-reset-after-mismatch": [
                "import_reset_after_value_mismatch"
            ],
            "invalid-import-replace-preview-reset-in-excluded": [
                "import_reset_outside_exact_ids",
                "import_reset_touches_excluded_setting",
                "import_reset_without_bound_after_value",
            ],
            "invalid-import-replace-witness-changed-source-bytes-stale-digest": [
                "witness_source_snapshot_bytes_digest_mismatch",
                "witness_source_snapshot_value_mismatch",
            ],
            "invalid-import-replace-witness-snapshot-source-value-mapping": [
                "witness_source_snapshot_value_mismatch"
            ],
            "invalid-import-replace-witness-changed-destination-bytes-stale-digest": [
                "witness_destination_snapshot_bytes_digest_mismatch"
            ],
            "invalid-import-replace-witness-omitted-credential-undisclosed": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_touches_credential_setting",
                "preview_exclusion_missing_for_owner_excluded_id",
            ],
            "invalid-import-replace-preview-exclusion-not-owner-backed": [
                "preview_exclusion_not_owner_backed"
            ],
            # the v9 fail-closed value-dependent scope join adds the
            # independently-selected-owner-read and disclosure codes to the
            # two code-category masquerades; the DRY-guard case is in the
            # memory scope, which has no value-dependent rows
            "invalid-import-replace-witness-owner-managed-formatter-masquerade": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_touches_owner_destination_setting",
                "owner_read_unavailable",
                "preview_exclusion_missing_for_owner_excluded_id",
                "preview_exclusion_not_owner_backed",
            ],
            "invalid-import-replace-witness-owner-destination-catalog-masquerade": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_touches_owner_destination_setting",
                "owner_read_unavailable",
                "preview_exclusion_missing_for_owner_excluded_id",
                "preview_exclusion_not_owner_backed",
            ],
            "invalid-import-replace-witness-owner-managed-dry-guard-masquerade": [
                "import_exact_ids_not_the_replace_scope",
                "import_reset_touches_owner_destination_setting",
                "preview_exclusion_missing_for_owner_excluded_id",
            ],
            "invalid-import-replace-witness-changed-artifact-bytes-stale-digest": [
                "witness_source_export_artifact_bytes_mismatch",
                "witness_source_export_value_mismatch",
            ],
            "invalid-import-replace-witness-export-artifact-value-mapping": [
                "witness_source_export_value_mismatch"
            ],
            "invalid-import-replace-witness-export-manifest-wrong-source": [
                "witness_source_export_manifest_mismatch"
            ],
            "invalid-import-replace-witness-migration-preview-mismatch": [
                "witness_source_export_migration_mismatch"
            ],
            "invalid-import-replace-witness-before-hash-unbound": [
                "preview_before_destination_hash_mismatch"
            ],
            "invalid-import-replace-witness-after-hash-unbound": [
                "preview_after_projection_hash_mismatch"
            ],
            "invalid-import-replace-witness-projected-settlement-drift": [
                "witness_post_apply_projection_settlement_mismatch"
            ],
            "invalid-import-replace-preview-reset-touches-opencode-server-auth": [
                "import_reset_outside_exact_ids",
                "import_reset_touches_excluded_setting",
                "import_reset_without_bound_after_value",
            ],
        }
        for case_id, rules in expected.items():
            with self.subTest(case=case_id):
                case = NEGATIVES[case_id]
                definition = case["schema_ref"].rsplit("/", 1)[-1]
                self.assertEqual(
                    list(validator(definition).iter_errors(case["record"])),
                    [],
                    f"{case_id} must be structurally valid",
                )
                self.assertEqual(semantics(definition, case["record"]), rules)

    def test_reset_set_is_exactly_the_recomputed_omission_set(self):
        eligible = recompute_eligible(WITNESS["chosen_category_ids"])
        source_keys = set(WITNESS["source_snapshot"]["values_by_setting_id"])
        expected = [setting_id for setting_id in eligible if setting_id not in source_keys]
        actual = [entry["setting_id"] for entry in WITNESS["resolved_import_resets"]]
        self.assertEqual(actual, expected)
        self.assertEqual(WITNESS["preview_record"]["exact_setting_ids"], eligible)

    def test_inventory_hash_binding_rejects_an_unrelated_registry_snapshot(self):
        tampered = copy.deepcopy(WITNESS)
        tampered["inventory_sha256"] = "0" * 64
        self.assertEqual(
            witness_semantics(tampered),
            ["inventory_binding_hash_mismatch"],
        )

    def test_unset_seams_stay_untouched(self):
        source_enum = set(SCHEMA["$defs"]["source_by_setting_id"]["additionalProperties"]["enum"])
        self.assertEqual(
            source_enum,
            {"default", "explicit", "copied", "restored_default", "imported", "migrated"},
        )
        self.assertEqual(len(SCHEMA["$defs"]["settings_import_mode"]["enum"]), 2)
        self.assertEqual(
            SETTINGS_CONTRACT_IDS,
            {
                "cmd.settings.open",
                "cmd.settings.transaction.preview",
                "cmd.settings.transaction.apply",
                "cmd.settings.transaction.rollback",
                "cmd.settings.export",
            },
        )

    # ------------------------------------------------- additive enrollment

    def test_installed_gate_retains_required_pairs_and_additive_wiring(self):
        gate_text = HOOK_PATH.read_text()
        self.assertEqual(len(GATE.CONTRACT_PAIRS), GATE.EXPECTED_CONTRACT_PAIR_COUNT)
        self.assertEqual(len(set(GATE.CONTRACT_PAIRS)), len(GATE.CONTRACT_PAIRS))
        # every current hook is retained (Doctor, Search, Notifications, ...)
        for sibling in (
            "pm_doctor_application_update_read",
            "pm_doctor_query_semantics",
            "pm_settings_search_semantics",
            "pm_usage_ledger_query_semantics",
            "pm_guided_tour_semantics",
            "pm_jj_operation_recovery",
            "pm_forge_review_checkout_selected_semantics",
        ):
            self.assertIn(f"from {sibling} import", gate_text)
        # The Settings branch retains the prior draft/search consumers and
        # adds the typed import join; exact source-line spelling may change
        # when another reviewed contract pair is additively enrolled.
        self.assertIn("settings_owner_read=None,", gate_text)
        self.assertIn("from pm_settings_import_semantics import settings_import_semantic_failures", gate_text)
        self.assertIn("settings_draft_semantic_failures(definition_name, value)", gate_text)
        self.assertIn("settings_search_semantic_failures(definition_name, value)", gate_text)
        self.assertIn("settings_import_semantic_failures(", gate_text)
        for required_pair in (
            ("Plans/browser_capture_contracts.schema.json", "Plans/browser_capture_contract_fixtures.json"),
            ("Plans/search_rebuild_index.schema.json", "Plans/search_rebuild_index_fixtures.json"),
        ):
            self.assertIn(required_pair, GATE.CONTRACT_PAIRS)

    def test_full_pack_sweep_through_the_gate_code_paths(self):
        positives = {}
        positive_definition = {}
        for case in PACK["valid_cases"]:
            definition = case["schema_ref"].rsplit("/", 1)[-1]
            errors = list(validator(definition).iter_errors(case["record"]))
            self.assertEqual(errors, [], f"{case['case_id']}: {errors[:1]}")
            self.assertEqual(
                semantics(definition, case["record"], case.get("owner_read")),
                [],
                case["case_id"],
            )
            positives[case["case_id"]] = case["record"]
            positive_definition[case["case_id"]] = definition
        for case in PACK["negative_cases"]:
            value = GATE.materialize_invalid(case, positives)
            selector = dict(case)
            if "schema_ref" not in case and "definition" not in case:
                base = selector.get("base_valid", selector.get("left_valid"))
                self.assertIn(base, positive_definition, case["case_id"])
                selector["definition"] = positive_definition[base]
            definition, _ = GATE.select_definition(SCHEMA, selector, value, require_valid=False)
            accepted = validator(definition).is_valid(value)
            rule = case.get("semantic_rule")
            if rule is None:
                self.assertFalse(accepted, case["case_id"])
                continue
            self.assertTrue(accepted, case["case_id"])
            if definition in IMPORT_FAMILY_DEFINITIONS:
                # This suite targets the import companion's causal rules.
                self.assertIn(rule, semantics(definition, value, case.get("owner_read")), case["case_id"])
            # Other owner semantic negatives are exercised by the full
            # installed aggregate gate, which imports real sibling helpers.


if __name__ == "__main__":
    unittest.main()
