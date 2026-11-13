"""Portable, isolated ledger-witness regressions; all fixtures use OS temp."""
from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
import io
import json
from pathlib import Path
import subprocess
import tempfile


def exercise(g, *, scratch=None):
    if scratch is not None:
        scratch = Path(scratch).resolve()
        scratch.mkdir(parents=True, exist_ok=True)
    rows = []

    def case(name, mutate=None, *, status="pass", exit_code=0, flags=(), verify=lambda report: True):
        row = {"id": name, "expected_status": status, "expected_exit": exit_code, "caught": False}
        try:
            with tempfile.TemporaryDirectory(prefix="ledger-witness-", dir=scratch) as directory:
                root = Path(directory)
                ledger = root / "ledger"
                (ledger / "state").mkdir(parents=True)
                (ledger / "records").mkdir()
                fixture = {
                    "root": root, "ledger": ledger,
                    "queue": {"canonical_plan_targets": ["owners.md"], "items": [
                        {"queue_id": "q-1", "source_atom_ids": ["atom-1"], "target_plan_unit_ids": ["AA-001"]}]},
                    "atoms": [{"atom_id": "atom-1", "exact_tokens": ["live token"]}],
                    "reviews": [], "exemptions": [], "flags": list(flags),
                    "owner": owner("AA-001", "Required live token.", ["live token"]),
                }
                if mutate:
                    mutate(fixture)
                write(root / "owners.md", fixture["owner"])
                write(ledger / "state/compile_queue.json", fixture["queue"])
                for name_, values in (("design_atoms", fixture["atoms"]), ("corrections", fixture["reviews"]),
                                      ("compile_witness_exemptions", fixture["exemptions"])):
                    if name_ != "design_atoms" or not fixture.get("omit_atoms"):
                        write(ledger / ("records/" + name_ + ".jsonl"), values, jsonl=True)
                if fixture.get("base"):
                    if fixture.get("base_owner") is not None:
                        write(root / "owners.md", fixture["base_owner"])
                    git(root, "init", "--quiet", "--initial-branch=fixture")
                    git(root, "add", "owners.md")
                    git(root, "-c", "user.name=Witness self-test", "-c", "user.email=witness@example.invalid",
                        "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "fixture base")
                    if fixture.get("changed") or fixture.get("base_owner") is not None:
                        write(root / "owners.md", fixture["owner"] + ("\nRepaired within this unit.\n" if fixture.get("changed") else ""))
                    fixture["flags"] += ["--base", "HEAD"]
                stdout, stderr = io.StringIO(), io.StringIO()
                with redirect_stdout(stdout), redirect_stderr(stderr):
                    if fixture.get("api"):
                        report = g.run(root, Path("ledger"))
                        actual_exit = 0 if report["status"] == "pass" else 2
                    else:
                        actual_exit = g.main(["ledger", "--root", str(root), "--json", *fixture["flags"]])
                        report = json.loads(stdout.getvalue())
                row.update(actual_exit=actual_exit, report=report)
                row["caught"] = actual_exit == exit_code and report["status"] == status and verify(report)
        except Exception as exc:
            row["error"] = type(exc).__name__ + ": " + str(exc)
        rows.append(row)

    def owner(uid, body, tokens):
        return ("## " + uid + " — Owner\n\n" + body + "\n\n```yaml\nplan_unit_id: " + uid +
                "\npreserved_exact_tokens: " + json.dumps(tokens) + "\n```\n")

    def write(path, value, *, jsonl=False):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("".join(json.dumps(row) + "\n" for row in value) if jsonl else
                        json.dumps(value) if isinstance(value, (dict, list)) else value, encoding="utf-8")

    def git(root, *args):
        result = subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(result.stderr)

    def no_targets(f):
        f["queue"]["items"][0].pop("target_plan_unit_ids")

    def disposition_entry(token="old spelling", disposition="ledger_retired", **changes):
        return {"schema_id": "pm.ledger_token_disposition.v1", "queue_id": "q-1", "atom_id": "atom-1", "token": token,
                "target_plan_unit_ids": ["AA-001"], "disposition": disposition, **changes}

    def exempt(f, token="old spelling", disposition="ledger_retired"):
        f["atoms"][0]["exact_tokens"].append(token)
        f["reviews"] = [{"correction_id": "corr-1", "status": "accepted", "linked_atom_ids": ["atom-1"],
                         "exact_tokens": [token], "correction": "Reviewed disposition of this source token.",
                         "token_dispositions": [disposition_entry(token, disposition)]}]
        f["exemptions"] = [{"schema_id": "pm.ledger_compile_witness_exemption.v1", "exemption_id": "ex-1",
                            "queue_id": "q-1", "atom_id": "atom-1", "token": token,
                            "target_plan_unit_ids": ["AA-001"], "disposition": disposition,
                            "reason": "Reviewed source disposition; preserve the active spelling only.",
                            "reviewed_by": "fixture reviewer", "review_ref": "records/corrections.jsonl#corr-1"}]

    case("nonempty-control", verify=lambda r: r["summary"]["registries_checked"] == 1 and r["summary"]["item_tokens"] == 1)
    case("api-relative-ledger-control", lambda f: f.update(api=True))
    case("missing-target-list-is-vacuous", no_targets, status="vacuous", exit_code=2,
         verify=lambda r: r["vacuous"] and all(r["summary"][key] == 0 for key in ("records", "item_tokens", "registries_checked")))
    case("empty-queue-is-vacuous", lambda f: f["queue"].update(items=[]), status="vacuous", exit_code=2)
    case("explicit-allow-empty", no_targets, flags=("--allow-empty",), status="vacuous_allowed_by_--allow-empty",
         verify=lambda r: r["vacuous"] and r["allow_empty"])
    def unscoped_duplicates(f):
        no_targets(f)
        f["queue"]["canonical_plan_targets"].append("references.md")
        write(f["root"] / "references.md", f["owner"])
    case("unscoped-reference-copy-is-not-a-target-finding", unscoped_duplicates,
         flags=("--allow-empty",), status="vacuous_allowed_by_--allow-empty")
    case("missing-owner-is-not-a-pass", lambda f: f["queue"]["items"][0].update(target_plan_unit_ids=["ZZ-999"]),
         status="vacuous_with_findings", exit_code=2, verify=lambda r: any(x["kind"] == "missing_target_unit" for x in r["configuration_findings"]))
    case("allow-empty-cannot-waive-findings", lambda f: f["queue"]["items"][0].update(target_plan_unit_ids=["ZZ-999"]),
         flags=("--allow-empty",), status="vacuous_with_findings", exit_code=2)
    case("retired-token-without-review-still-fails", lambda f: f["atoms"][0]["exact_tokens"].append("old spelling"),
         status="findings", exit_code=2)
    case("held-token-without-review-still-fails", lambda f: f["atoms"][0]["exact_tokens"].append("held token"),
         status="findings", exit_code=2)
    case("reviewed-retired-token-control", exempt,
         verify=lambda r: r["summary"]["item_tokens_exempted"] == 1 and r["summary"]["tokens_missing_from_prose"] == 0)
    case("reviewed-held-token-control", lambda f: exempt(f, "held token", "held"),
         verify=lambda r: r["token_exemptions"][0]["disposition"] == "held")

    def invalid_exemption(field, value):
        def mutate(f):
            exempt(f)
            f["exemptions"][0][field] = value
        return mutate

    for field, value in (("reason", ""), ("reviewed_by", ""), ("review_ref", "records/corrections.jsonl#absent"),
                         ("disposition", "waived"), ("token", "unknown token"), ("atom_id", "atom-other"),
                         ("queue_id", "q-other"), ("target_plan_unit_ids", ["ZZ-999"]),
                         ("review_ref", "../outside.jsonl#corr-1")):
        case("invalid-exemption-" + field + ("-escape" if str(value).startswith("..") else ""),
             invalid_exemption(field, value), status="error", exit_code=1)

    def review_field(field, value):
        def mutate(f):
            exempt(f)
            f["reviews"][0][field] = value
        return mutate

    for field, value in (("status", "pending"), ("linked_atom_ids", ["atom-other"]),
                         ("exact_tokens", ["unrelated"]), ("exact_tokens", "old spelling")):
        case("invalid-review-" + field + ("-string" if isinstance(value, str) and field == "exact_tokens" else ""),
             review_field(field, value), status="error", exit_code=1)

    def refused_because(text):
        return lambda r: text in r["error"]

    def disposition_case(name, reason, entries=None, **fields):
        def mutate(f):
            exempt(f)
            if entries is not None:
                f["reviews"][0]["token_dispositions"] = entries
            f["reviews"][0].update(fields)
        case(name, mutate, status="error", exit_code=1, verify=refused_because(reason))

    # The review's same-token fixture: an accepted record that keeps the exempted token mandatory.
    exact_scope = "exactly one structured token_dispositions entry"
    def active_flat_label(f):
        exempt(f, "required token")
        f["reviews"][0].pop("token_dispositions")
        f["reviews"][0].update(disposition="active", correction="This accepted token remains mandatory in AA-001.")
        f["exemptions"][0]["reason"] = "This accepted token remains mandatory in AA-001."
    case("same-token-active-label-is-not-a-disposition", active_flat_label, status="error", exit_code=1, verify=refused_because(exact_scope))
    def active_structured(f):
        exempt(f, "required token")
        f["reviews"][0]["token_dispositions"] = [disposition_entry("required token", "active")]
        f["reviews"][0]["correction"] = "This accepted token remains mandatory in AA-001."
    case("same-token-active-disposition-refused", active_structured, status="error", exit_code=1, verify=refused_because("keeps this token active"))
    disposition_case("missing-disposition-refused", exact_scope, entries=[])
    disposition_case("held-record-cannot-support-retired-exemption", "differs from its accepted record", entries=[disposition_entry(disposition="held")])
    disposition_case("disposition-for-another-token-refused", exact_scope, entries=[disposition_entry(token="another token")])
    disposition_case("disposition-for-another-atom-refused", exact_scope, entries=[disposition_entry(atom_id="atom-other")])
    disposition_case("disposition-for-another-queue-refused", exact_scope, entries=[disposition_entry(queue_id="q-other")])
    disposition_case("disposition-for-another-scope-refused", exact_scope, entries=[disposition_entry(target_plan_unit_ids=["BB-001"])])
    disposition_case("disposition-wider-than-exemption-refused", exact_scope, entries=[disposition_entry(target_plan_unit_ids=["AA-001", "BB-001"])])
    disposition_case("two-entries-for-one-scope-refused", exact_scope, entries=[disposition_entry(), disposition_entry(disposition="active")])
    disposition_case("unknown-disposition-value-refused", "must be one of", entries=[disposition_entry(disposition="waived")])
    disposition_case("disposition-without-schema-refused", "need schema_id", entries=[{k: v for k, v in disposition_entry().items() if k != "schema_id"}])
    disposition_case("disposition-without-targets-refused", "disposition targets", entries=[{k: v for k, v in disposition_entry().items() if k != "target_plan_unit_ids"}])
    disposition_case("disposition-list-must-be-a-list", "must be a list", entries=disposition_entry())

    def conflict(f, *, status="accepted", disposition="active", path="records/corrections.jsonl", **changes):
        exempt(f)
        other = {"correction_id": "corr-2", "status": status, "token_dispositions": [disposition_entry(disposition=disposition, **changes)]}
        if path == "records/corrections.jsonl":
            f["reviews"].append(other)
        else:
            write(f["ledger"] / path, [other], jsonl=True)
    conflicting = refused_because("gives this token a different disposition")
    case("accepted-active-elsewhere-conflicts", conflict, status="error", exit_code=1, verify=conflicting)
    case("accepted-held-in-another-file-conflicts", lambda f: conflict(f, disposition="held", path="records/decisions.jsonl"), status="error", exit_code=1, verify=conflicting)
    case("conflict-in-another-queue-item-still-conflicts", lambda f: conflict(f, queue_id="q-other"), status="error", exit_code=1, verify=conflicting)
    case("overlapping-scope-conflicts", lambda f: conflict(f, target_plan_unit_ids=["AA-001", "BB-001"]), status="error", exit_code=1, verify=conflicting)
    case("malformed-accepted-record-elsewhere-refused", lambda f: conflict(f, disposition="waived", path="records/decisions.jsonl"), status="error", exit_code=1, verify=refused_because("must be one of"))
    case("pending-record-is-not-a-conflict-control", lambda f: conflict(f, status="pending"), verify=lambda r: r["summary"]["item_tokens_exempted"] == 1)
    case("agreeing-accepted-record-control", lambda f: conflict(f, disposition="ledger_retired"), verify=lambda r: r["summary"]["item_tokens_exempted"] == 1)
    case("other-atom-active-is-not-a-conflict-control", lambda f: conflict(f, atom_id="atom-other"), verify=lambda r: r["summary"]["item_tokens_exempted"] == 1)
    case("other-token-active-is-not-a-conflict-control", lambda f: conflict(f, token="another token"), verify=lambda r: r["summary"]["item_tokens_exempted"] == 1)
    def scoped_owner(f):
        # Retired in AA-001 and active in BB-001: each owner keeps its own result.
        conflict(f, target_plan_unit_ids=["BB-001"])
        f["queue"]["items"][0]["target_plan_unit_ids"].append("BB-001")
        f["owner"] += owner("BB-001", "Required live token. old spelling", ["live token", "old spelling"])
    case("active-in-another-owner-is-not-a-conflict-control", scoped_owner,
         verify=lambda r: r["witness_exact_tokens"][1]["required_owner_units"] == ["BB-001"] and not r["witness_exact_tokens"][1]["fires"])
    def scoped_owner_missing(f):
        scoped_owner(f)
        f["owner"] = owner("AA-001", "Required live token.", ["live token"]) + owner("BB-001", "Required live token.", ["live token"])
    case("retired-in-one-owner-keeps-the-other-owner-required", scoped_owner_missing, status="findings", exit_code=2,
         verify=lambda r: r["witness_exact_tokens"][1]["required_owner_units"] == ["BB-001"] and r["witness_exact_tokens"][1]["fires"])
    case("exemption-reports-its-accepted-disposition", exempt,
         verify=lambda r: r["token_exemptions"][0]["accepted_disposition"]["disposition"] == "ledger_retired")

    def overlap(f):
        exempt(f)
        f["exemptions"].append({**f["exemptions"][0], "exemption_id": "ex-2"})
    case("overlapping-exemptions-refused", overlap, status="error", exit_code=1)

    def self_review(f):
        exempt(f)
        f["exemptions"][0].update(review_ref="records/./compile_witness_exemptions.jsonl#corr-1", correction_id="corr-1",
                                  status="accepted", linked_atom_ids=["atom-1"], exact_tokens=["old spelling"])
    case("canonical-self-review-refused", self_review, status="error", exit_code=1)

    def escaped_record(f):
        exempt(f)
        f["exemptions"][0]["review_ref"] = "records/../state/review.jsonl#corr-1"
        write(f["ledger"] / "state/review.jsonl", f["reviews"], jsonl=True)
    case("record-cone-escape-refused", escaped_record, status="error", exit_code=1)

    def missing_active(f):
        exempt(f)
        f["owner"] = owner("AA-001", "Ordinary body.", [])
    case("retirement-cannot-waive-active-token", missing_active, status="findings", exit_code=2,
         verify=lambda r: r["witness_exact_tokens"][0]["fires"] and r["witness_exact_tokens"][1]["exempted"])

    def retired_registry(f):
        exempt(f)
        f["owner"] = owner("AA-001", "Required live token.", ["live token", "old spelling"])
    case("retirement-cannot-waive-registry-hygiene", retired_registry, status="findings", exit_code=2,
         verify=lambda r: r["witness_registry_hygiene"][0]["entries_absent_from_unit_text"] == ["old spelling"])
    case("registry-is-not-prose-inline", lambda f: f.update(owner=owner("AA-001", "Ordinary body.", ["live token"])),
         status="findings", exit_code=2, verify=lambda r: r["summary"]["tokens_missing_from_prose"] == 1)
    case("registry-is-not-prose-block", lambda f: f.update(owner=owner("AA-001", "Ordinary body.", ["live token"]).replace(
        'preserved_exact_tokens: ["live token"]', 'preserved_exact_tokens:\n  - "live token"')),
        status="findings", exit_code=2, verify=lambda r: r["summary"]["registry_entries_absent_from_text"] == 1)

    def mapping(f, wrong=False):
        f["atoms"].append({"atom_id": "atom-2", "exact_tokens": ["second token"]})
        f["queue"]["items"][0].update(source_atom_ids=["atom-1", "atom-2"], target_plan_unit_ids=["AA-001", "BB-001"],
                                           atom_target_plan_unit_ids={"atom-1": ["BB-001" if wrong else "AA-001"], "atom-2": ["BB-001"]})
        f["owner"] += owner("BB-001", "Required second token.", ["second token"])
    case("per-atom-targets-control", mapping)
    case("per-atom-targets-cannot-borrow-peer", lambda f: mapping(f, True), status="findings", exit_code=2,
         verify=lambda r: r["witness_exact_tokens"][0]["fires"] and not r["witness_exact_tokens"][1]["fires"])

    def partial(f):
        exempt(f)
        f["queue"]["items"][0]["target_plan_unit_ids"].append("BB-001")
        f["owner"] += owner("BB-001", "Second body.", [])
    case("exemption-is-not-token-wide", partial, status="findings", exit_code=2,
         verify=lambda r: r["witness_exact_tokens"][1]["required_owner_units"] == ["BB-001"])

    def split(f):
        f["queue"]["items"][0]["target_plan_unit_ids"].append("BB-001")
        f["owner"] = owner("AA-001", "Required live token.", []) + owner("BB-001", "Second body.", ["live token"])
    case("prose-and-registry-must-share-owner", split, status="findings", exit_code=2,
         verify=lambda r: r["witness_exact_tokens"][0]["fires"] and not r["witness_exact_tokens"][0]["units_with_both"])

    def repairs(f, *, changed=False, uid="AA-001"):
        f["base"], f["changed"] = True, changed
        f["owner"] = owner(uid, "Required live token.", ["live token"])
        f["queue"]["items"][0]["target_plan_unit_ids"] = [uid]
        f["reviews"] = [{"correction_id": "corr-1", "finding_id": "RT-01", "source_atom_ids": ["atom-1"]}]
        write(f["ledger"] / "source_shards/findings.md", "## Record 1 RT-01\nRepairs " + uid + ".\n")
    case("unchanged-repair-is-not-a-pass", repairs, status="findings", exit_code=2,
         verify=lambda r: r["summary"]["named_but_unchanged_since_base"] == 1)
    case("changed-repair-control", lambda f: repairs(f, changed=True))
    def new_unit(f):
        repairs(f)
        f["base_owner"] = "Historical owner text; this unit did not exist.\n"
    case("new-unit-repair-control", new_unit)
    case("digit-prefix-repair-is-not-skipped", lambda f: repairs(f, uid="0PI-001"), status="findings", exit_code=2,
         verify=lambda r: r["witness_repairs_vs_targets"][0]["named_units"] == ["0PI-001"] and r["summary"]["named_but_unchanged_since_base"] == 1)
    case("invalid-base-is-read-error", flags=("--base", "unresolvable-revision"), status="error", exit_code=1)
    case("unknown-source-atom-is-read-error", lambda f: f["queue"]["items"][0].update(source_atom_ids=["absent"]), status="error", exit_code=1)

    # Sol max cycle 6, C6-W1: coverage is actual atom-to-owner mappings; a nominal target is not compilation.
    no_reach = "no_atom_reaches_an_owner"
    def no_source_atoms(f):
        f["queue"]["items"][0].update(source_atom_ids=[])
        f.update(atoms=[], owner=owner("AA-001", "Ordinary body.", []))
    def explicitly_uncompiled(f):
        f["queue"]["items"][0].update(atom_target_plan_unit_ids={"atom-1": []})
        f.update(owner=owner("AA-001", "Ordinary body.", []))
    case("target-with-no-source-atoms-is-vacuous", no_source_atoms, status="vacuous", exit_code=2,
         verify=lambda r: r["vacuity_reason"] == no_reach and r["summary"]["registries_checked"] == 1 and r["summary"]["atoms_reaching_an_owner"] == 0)
    case("target-with-no-source-atoms-explicit-override", no_source_atoms, flags=("--allow-empty",), status="vacuous_allowed_by_--allow-empty",
         verify=lambda r: r["vacuous"] and r["allow_empty"] and r["vacuity_reason"] == no_reach)
    case("every-atom-explicitly-uncompiled-is-vacuous", explicitly_uncompiled, status="vacuous", exit_code=2,
         verify=lambda r: r["vacuity_reason"] == no_reach and r["atoms_without_owner_targets"] == [{"queue_id": "q-1", "atom": "atom-1"}] and r["atom_owner_mappings"] == [])
    case("every-atom-uncompiled-explicit-override", explicitly_uncompiled, flags=("--allow-empty",), status="vacuous_allowed_by_--allow-empty",
         verify=lambda r: r["vacuous"] and r["atoms_without_owner_targets"] == [{"queue_id": "q-1", "atom": "atom-1"}])
    def uncompiled_with_ghost(f):
        explicitly_uncompiled(f)
        f["owner"] = owner("AA-001", "Ordinary body.", ["ghost"])
    case("registry-only-scope-keeps-its-hygiene-finding", uncompiled_with_ghost, status="vacuous_with_findings", exit_code=2,
         verify=lambda r: r["witness_registry_hygiene"][0]["entries_absent_from_unit_text"] == ["ghost"])
    case("allow-empty-cannot-waive-registry-only-finding", uncompiled_with_ghost, flags=("--allow-empty",), status="vacuous_with_findings", exit_code=2)
    def decision_only(f):
        f["queue"]["items"][0].update(target_plan_unit_ids=["DL-001"])
        f["owner"] = "### DL-001 - Decision\n\nBody.\n"
    case("decision-only-mapping-is-vacuous", decision_only, status="vacuous", exit_code=2, verify=lambda r: r["vacuity_reason"] == no_reach)
    def mapped_to_missing(f):
        f["queue"]["items"][0].update(target_plan_unit_ids=["AA-001", "ZZ-999"], atom_target_plan_unit_ids={"atom-1": ["ZZ-999"]})
    case("atom-mapped-only-to-a-missing-owner", mapped_to_missing, status="vacuous_with_findings", exit_code=2,
         verify=lambda r: any(x["kind"] == "missing_target_unit" for x in r["configuration_findings"]) and r["atom_owner_mappings"] == [])
    def missing_atoms(f):
        no_source_atoms(f)
        f["omit_atoms"] = True
    case("missing-required-atoms-file-is-input-error", missing_atoms, status="error", exit_code=1, verify=refused_because("design_atoms.jsonl"))
    case("allow-empty-cannot-waive-missing-atoms-file", missing_atoms, flags=("--allow-empty",), status="error", exit_code=1, verify=refused_because("design_atoms.jsonl"))
    case("present-empty-atoms-file-is-vacuous-not-missing", no_source_atoms, status="vacuous", exit_code=2, verify=lambda r: r["atoms_without_owner_targets"] == [])
    def partial_scope(f):
        f["atoms"].append({"atom_id": "atom-2", "exact_tokens": ["outside token"]})
        f["queue"]["items"][0].update(source_atom_ids=["atom-1", "atom-2"], atom_target_plan_unit_ids={"atom-1": ["AA-001"], "atom-2": []})
    case("partial-scope-stays-pass-and-disclosed-control", partial_scope,
         verify=lambda r: not r["vacuous"] and r["summary"]["atoms_reaching_an_owner"] == 1 and r["atoms_without_owner_targets"] == [{"queue_id": "q-1", "atom": "atom-2"}])
    case("compiled-atom-with-empty-token-list-control", lambda f: f["atoms"][0].update(exact_tokens=[]),
         verify=lambda r: r["summary"]["item_tokens"] == 0 and r["summary"]["atoms_reaching_an_owner"] == 1 and r["vacuity_reason"] is None)
    case("compiled-atom-without-token-field-control", lambda f: f["atoms"][0].pop("exact_tokens"),
         verify=lambda r: r["summary"]["item_tokens"] == 0 and r["summary"]["atoms_reaching_an_owner"] == 1)

    # Sol max cycle 6, C6-W2: uniqueness is validated from every occurrence, before any first-block view.
    def fence(uid, body, tokens):
        return "```yaml\nplan_unit_id: " + uid + "\ncanonical_text: " + body + "\npreserved_exact_tokens: " + json.dumps(tokens) + "\n```\n"
    def ambiguous(*places):
        def verify(r):
            found = [x for x in r["configuration_findings"] if x["kind"] == "ambiguous_owner_unit" and x["unit"] == "AA-001"]
            return len(found) == 1 and [(d["form"], d["line_start"]) for d in found[0]["definitions"]] == list(places)
        return verify
    clean = owner("AA-001", "Required live token.", ["live token"])
    case("duplicate-heading-in-one-document", lambda f: f.update(owner=clean + "\n" + owner("AA-001", "Token is absent here.", [])),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("heading", 10)))
    case("duplicate-heading-cannot-hide-a-registry-error", lambda f: f.update(owner=clean + "\n" + owner("AA-001", "Token is absent here.", ["ghost"])),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("heading", 10)))
    case("duplicate-fence-in-one-document", lambda f: f.update(owner=fence("AA-001", "Required live token.", ["live token"]) + "\n" + fence("AA-001", "Unrelated.", ["ghost"])),
         status="findings", exit_code=2, verify=ambiguous(("fence", 1), ("fence", 7)))
    case("second-metadata-fence-under-one-heading", lambda f: f.update(owner=clean + "\n" + fence("AA-001", "Unrelated.", ["ghost"])),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 10)))
    case("heading-and-a-fence-in-another-section", lambda f: f.update(owner=clean + "\n## Later notes\n\n" + fence("AA-001", "Unrelated.", [])),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 12)))
    case("fence-before-its-heading-is-independent", lambda f: f.update(owner=fence("AA-001", "Earlier copy.", []) + "\n" + clean),
         status="findings", exit_code=2, verify=ambiguous(("heading", 7), ("fence", 1)))
    case("multi-id-fence-is-ambiguous", lambda f: f.update(owner="```yaml\nplan_unit_id: AA-001\nplan_unit_id: BB-001\ncanonical_text: Required live token.\npreserved_exact_tokens: [\"live token\"]\n```\n"),
         status="findings", exit_code=2, verify=ambiguous(("multi_id_fence", 1)))
    def cross_document(f):
        f["queue"]["canonical_plan_targets"].append("other.md")
        write(f["root"] / "other.md", f["owner"])
    case("cross-document-duplicate-names-both-places", cross_document, status="findings", exit_code=2,
         verify=lambda r: [d["path"] for x in r["configuration_findings"] if x["kind"] == "ambiguous_owner_unit" for d in x["definitions"]] == ["other.md", "owners.md"])
    def no_tokens(f, text):
        f["atoms"][0]["exact_tokens"] = []
        f["owner"] = text
    no_ambiguity = lambda r: not r["configuration_findings"]
    case("metadata-fence-under-a-deeper-subheading-control", lambda f: no_tokens(f, "## AA-001 — Owner\n\nBody.\n\n### Detail\n\nMore.\n\n" + fence("AA-001", "Body.", [])), verify=no_ambiguity)
    case("hash-comment-in-a-fence-keeps-the-section-control", lambda f: no_tokens(f, "## AA-001 — Owner\n\n```sh\n# a comment, not a heading\n```\n\n" + fence("AA-001", "Body.", [])), verify=no_ambiguity)
    case("single-heading-with-its-own-fence-control", verify=no_ambiguity)
    case("unterminated-own-fence-control", lambda f: no_tokens(f, "## AA-001 — Owner\n\n```yaml\nplan_unit_id: AA-001\n"), verify=no_ambiguity)
    case("single-headless-fence-control", lambda f: f.update(owner=fence("AA-001", "Required live token.", ["live token"])), verify=no_ambiguity)
    def nested_other_unit(f):
        f["queue"]["items"][0]["target_plan_unit_ids"].append("BB-001")
        f["owner"] = clean + "\n" + fence("BB-001", "Second body.", [])
    case("another-units-fence-inside-a-section-control", nested_other_unit, verify=no_ambiguity)
    case("untargeted-duplicate-is-not-a-finding-control", lambda f: f.update(owner=clean + "\n" + owner("ZZ-001", "One.", []) + "\n" + owner("ZZ-001", "Two.", [])), verify=no_ambiguity)
    def decision_number_reuse(f):
        f["queue"]["items"][0]["target_plan_unit_ids"].append("DL-001")
        f["queue"]["items"][0]["atom_target_plan_unit_ids"] = {"atom-1": ["AA-001"]}
        f["owner"] = clean + "\n### DL-001: Log entry\n\nText.\n\n### DL-001 - Decision unit\n\nText.\n"
    case("decision-log-number-reuse-control", decision_number_reuse, verify=no_ambiguity)

    # Sol max cycle 6, C6-W3: one identifier grammar for owner and repair IDs.
    case("unchanged-short-id-repair-is-not-a-pass", lambda f: repairs(f, uid="AA-01"), status="findings", exit_code=2,
         verify=lambda r: r["witness_repairs_vs_targets"][0]["named_units"] == ["AA-01"] and r["summary"]["named_but_unchanged_since_base"] == 1)
    case("changed-short-id-repair-control", lambda f: repairs(f, changed=True, uid="AA-01"),
         verify=lambda r: r["witness_repairs_vs_targets"][0]["named_units"] == ["AA-01"])
    case("one-digit-id-repair-is-not-skipped", lambda f: repairs(f, uid="AA-1"), status="findings", exit_code=2,
         verify=lambda r: r["summary"]["named_but_unchanged_since_base"] == 1)
    def short_untargeted(f):
        f["owner"] = clean + "\n" + owner("BB-01", "Other unit.", [])
        f["reviews"] = [{"correction_id": "corr-1", "finding_id": "RT-01", "source_atom_ids": ["atom-1"]}]
        write(f["ledger"] / "source_shards/findings.md", "## Record 1 RT-01\nRepairs AA-001 and BB-01.\n")
    case("short-id-named-but-not-targeted-fires", short_untargeted, status="findings", exit_code=2,
         verify=lambda r: r["witness_repairs_vs_targets"][0]["named_but_not_targeted"] == ["BB-01"])
    def candidate_in_sentence(f):
        repairs(f, changed=True)
        write(f["ledger"] / "source_shards/findings.md", "## Record 1 RT-01\nRepairs AA-001 for RT-01.\n")
    case("unresolved-short-candidate-id-is-disclosed-control", candidate_in_sentence,
         verify=lambda r: r["witness_repairs_vs_targets"][0]["named_units"] == ["AA-001"] and r["witness_repairs_vs_targets"][0]["unresolved_short_ids"] == ["RT-01"])

    # Opus pre-check cycle 7, W7-1: the DL-* same-document exception is disclosed, and repairs compare every occurrence.
    def decision_log(f, text):
        f["queue"]["items"][0]["target_plan_unit_ids"].append(text.split()[1].rstrip(":"))
        f["owner"] = clean + "\n" + text
    def repeated(unit, differ):
        def verify(r):
            rows = [x for x in r["repeated_decision_units"] if x["unit"] == unit]
            return (len(rows) == 1 and rows[0]["titles_differ"] is differ and len(rows[0]["definitions"]) == 2 and
                    r["summary"]["repeated_decision_units"] == 1 and not r["configuration_findings"])
        return verify
    case("dl-same-document-repeat-is-disclosed", lambda f: decision_log(f, "### DL-005: Completion and promotion model\n\nx\n\n### DL-005 - Node Graph Execution Model\n\ny\n"),
         verify=repeated("DL-005", True))
    case("dl-same-document-same-decision-control", lambda f: decision_log(f, "### DL-056: Conflict and merge editors are read-only (E-4)\n\nx\n\n### DL-056 - Conflict And Merge Editors Are Read Only\n\ny\n"),
         verify=repeated("DL-056", False))
    DL_BASE = "### DL-059: Branch policies are shown\n\nlog text v1\n\n### DL-059 - Branch Policies Plan Unit\n\nplan text v1\n"
    def dl_repair(after):
        def mutate(f):
            f["base"] = True
            f["queue"]["items"][0]["target_plan_unit_ids"].append("DL-059")
            f["base_owner"] = clean + "\n" + DL_BASE
            f["owner"] = clean + "\n" + after
            f["reviews"] = [{"correction_id": "corr-1", "finding_id": "RT-01", "source_atom_ids": ["atom-1"]}]
            write(f["ledger"] / "source_shards/findings.md", "## Record 1 RT-01\nRepairs DL-059.\n")
        return mutate
    def changed_occurrence(number):
        return lambda r: [x["occurrence"] for x in r["witness_repairs_vs_targets"][0]["changed_occurrences"].get("DL-059", [])] == [number] and not r["witness_repairs_vs_targets"][0]["fires"]
    case("dl-repair-planunit-only-change-is-a-repair", dl_repair(DL_BASE.replace("plan text v1", "plan text v2")), verify=changed_occurrence(2))
    case("dl-repair-log-only-change-is-reported", dl_repair(DL_BASE.replace("log text v1", "log text v2")), verify=changed_occurrence(1))
    case("dl-repair-with-no-occurrence-changed-fires", dl_repair(DL_BASE), status="findings", exit_code=2,
         verify=lambda r: r["witness_repairs_vs_targets"][0]["named_but_unchanged_since_base"] == ["DL-059"])

    # W7-2: an ID that resolves to nothing is treated the same at any digit count; only ledger candidate IDs are set aside.
    def repair_names(text, finding="RT-01"):
        def mutate(f):
            repairs(f, changed=True)
            f["reviews"][0]["finding_id"] = finding
            write(f["ledger"] / "source_shards/findings.md", "## Record 1 RT-01\nRepairs " + text + ".\n")
        return mutate
    def unresolved_fires(uid):
        return lambda r: r["witness_repairs_vs_targets"][0]["named_but_not_targeted"] == [uid] and r["witness_repairs_vs_targets"][0]["named_but_unresolved"] == [uid]
    case("nonexistent-two-digit-repair-id-fires", repair_names("AA-001 and AA-99"), status="findings", exit_code=2, verify=unresolved_fires("AA-99"))
    case("nonexistent-one-digit-repair-id-fires", repair_names("AA-001 and ZZ-9"), status="findings", exit_code=2, verify=unresolved_fires("ZZ-9"))
    case("nonexistent-three-digit-repair-id-fires-control", repair_names("AA-001 and AA-999"), status="findings", exit_code=2, verify=unresolved_fires("AA-999"))
    case("ledger-candidate-id-is-set-aside-control", repair_names("AA-001 for RT-01"),
         verify=lambda r: r["witness_repairs_vs_targets"][0]["unresolved_candidate_ids"] == ["RT-01"])
    case("correction-finding-id-is-set-aside-control", repair_names("AA-001 for XY-123", finding="RT-01, XY-123"),
         verify=lambda r: r["witness_repairs_vs_targets"][0]["unresolved_candidate_ids"] == ["XY-123"] and not r["witness_repairs_vs_targets"][0]["fires"])

    # W7-3: quoted IDs and ~~~ fences are definitions; other forms naming a targeted ID are refused before pass.
    def unsupported(form, line):
        return lambda r: [(x["form"], x["line"]) for x in r["configuration_findings"] if x["kind"] == "unsupported_owner_definition_form"] == [(form, line)]
    quoted_fence = '```yaml\nplan_unit_id: "AA-001"\npreserved_exact_tokens: ["ghost"]\n```\n'
    tilde_fence = '~~~yaml\nplan_unit_id: AA-001\npreserved_exact_tokens: ["ghost"]\n~~~\n'
    case("quoted-plan-unit-id-is-a-definition", lambda f: f.update(owner=clean + "\n" + quoted_fence), status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 10)))
    case("single-quoted-plan-unit-id-is-a-definition", lambda f: f.update(owner=clean + "\n" + quoted_fence.replace('"AA-001"', "'AA-001'")), status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 10)))
    case("quoted-own-metadata-fence-control", lambda f: f.update(owner=clean.replace("plan_unit_id: AA-001", 'plan_unit_id: "AA-001"')), verify=no_ambiguity)
    case("tilde-fence-is-a-definition", lambda f: f.update(owner=clean + "\n" + tilde_fence), status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 10)))
    case("tilde-own-metadata-fence-control", lambda f: f.update(owner=clean.replace("```yaml", "~~~yaml").replace("```\n", "~~~\n")), verify=no_ambiguity)
    case("heading-without-separator-is-refused", lambda f: f.update(owner=clean + "\n## AA-001 (v2)\n\nRewritten without the token.\n"),
         status="findings", exit_code=2, verify=unsupported("heading_without_separator", 10))
    case("level-five-heading-is-refused", lambda f: f.update(owner=clean + "\n##### AA-001 — Again\n\nOther.\n"), status="findings", exit_code=2, verify=unsupported("heading_level_5", 10))
    case("level-one-heading-is-refused", lambda f: f.update(owner="# AA-001 — Title\n\n" + clean), status="findings", exit_code=2, verify=unsupported("heading_level_1", 1))
    case("unparsed-plan-unit-id-line-is-refused", lambda f: f.update(owner=clean + "\n```yaml\nplan_unit_id: AA-001 # copy\n```\n"),
         status="findings", exit_code=2, verify=unsupported("unparsed_plan_unit_id_line", 11))
    case("dotted-sub-id-heading-control", lambda f: f.update(owner=clean + "\n## AA-001.2 — Sub\n\nOther.\n"), verify=no_ambiguity)
    def addendum(f):
        f["queue"]["items"][0]["target_plan_unit_ids"].append("DL-059")
        f["owner"] = clean + "\n### DL-059 - Decision\n\nText.\n\n## DL-059 to DL-065 Accepted Planning Addendum - 2026-09-18\n\nText.\n"
    case("decision-addendum-heading-control", addendum, verify=no_ambiguity)

    # W7-4: a unit's own metadata fence under a deeper subheading is part of its evidence.
    under = "## AA-001 — Owner\n\nRequired live token.\nBODY\n### Notes\n\nMore.\n\n```yaml\nplan_unit_id: AA-001\npreserved_exact_tokens: REG\n```\n"
    case("own-fence-under-subheading-registry-is-checked",
         lambda f: f.update(owner=under.replace("BODY", 'preserved_exact_tokens: ["live token"]\n').replace("REG", '["ghost"]')),
         status="findings", exit_code=2, verify=lambda r: r["witness_registry_hygiene"][0]["entries_absent_from_unit_text"] == ["ghost"])
    case("own-fence-under-subheading-supplies-registry-control", lambda f: f.update(owner=under.replace("BODY", "").replace("REG", '["live token"]')),
         verify=lambda r: r["witness_exact_tokens"][0]["units_with_both"] == ["AA-001"] and not r["configuration_findings"])
    # Tool batch 2, C8-W1: indented and wrapped ATX headings are the same heading; a setext heading naming a target is refused.
    case("tb2-indented-heading-duplicate-is-a-definition", lambda f: f.update(owner=clean + "\n   ## AA-001 — Again\n\nOther.\n"),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("heading", 10)))
    case("tb2-bold-wrapped-heading-duplicate-is-a-definition", lambda f: f.update(owner=clean + "\n## **AA-001** — Again\n\nOther.\n"),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("heading", 10)))
    case("tb2-underscore-wrapped-heading-duplicate-is-a-definition", lambda f: f.update(owner=clean + "\n## __AA-001__ — Again\n\nOther.\n"),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("heading", 10)))
    case("tb2-bracket-wrapped-heading-duplicate-is-a-definition", lambda f: f.update(owner=clean + "\n### [AA-001] — Again\n\nOther.\n"),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("heading", 10)))
    case("tb2-setext-equals-heading-is-refused", lambda f: f.update(owner=clean + "\nAA-001 — Again\n===\n\nOther.\n"),
         status="findings", exit_code=2, verify=unsupported("setext_heading", 10))
    case("tb2-setext-dash-heading-is-refused", lambda f: f.update(owner=clean + "\nAA-001 — Again\nstill the heading\n---\n\nOther.\n"),
         status="findings", exit_code=2, verify=unsupported("setext_heading", 10))
    case("tb2-indented-heading-inside-fence-control", lambda f: f.update(owner=clean + "\n```md\n   ## AA-001 — Example\n```\n"), verify=no_ambiguity)
    case("tb2-four-space-heading-is-code-control", lambda f: f.update(owner=clean + "\n    ## AA-001 — Code\n"), verify=no_ambiguity)
    case("tb2-list-item-over-thematic-break-control", lambda f: f.update(owner=clean + "\n- see AA-001\n---\n"), verify=no_ambiguity)
    # C8-W2: CommonMark fences. A longer fence holds a shorter one; a closer needs the same character, at least the
    # opener's length and no info string; four spaces of indentation make code, not a fence.
    nested = ("## AA-001 — Owner\n\nRequired live token.\n\n````md\n```\nexample\n```\n````\n\n"
              "```yaml\nplan_unit_id: AA-001\npreserved_exact_tokens: [\"live token\"]\n```\n")
    case("tb2-longer-fence-holds-a-shorter-one-control", lambda f: f.update(owner=nested),
         verify=lambda r: not r["configuration_findings"] and r["witness_exact_tokens"][0]["units_with_both"] == ["AA-001"])
    case("tb2-closer-with-info-string-does-not-close", lambda f: f.update(owner=clean + "\n```yaml\nexample: 1\n```yaml\nplan_unit_id: AA-001\n```\n"),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 10)))
    case("tb2-shorter-closer-does-not-close", lambda f: f.update(owner=clean + "\n````yaml\nexample: 1\n```\nplan_unit_id: AA-001\n````\n"),
         status="findings", exit_code=2, verify=ambiguous(("heading", 1), ("fence", 10)))
    case("tb2-heading-inside-longer-fence-is-code-control",
         lambda f: f.update(owner=clean + "\n````md\n```\nexample\n```\n## AA-001 — Example heading inside the fence\n````\n"), verify=no_ambiguity)
    case("tb2-four-space-fence-is-not-a-fence", lambda f: f.update(owner=clean + "\n    ```yaml\n    plan_unit_id: AA-001\n    ```\n"),
         status="findings", exit_code=2, verify=unsupported("plan_unit_id_outside_fence", 11))
    # Tool batch 3, T49 (TOOLBATCH2 pre-check finding 4): CommonMark containers and HTML blocks. A unit heading inside
    # an HTML block or comment, a blockquote or a list item is refused; a fence opened in a list item ends with the
    # item; a list-item fence whose closer is less indented than the item is refused when the lines after it name a
    # target. Each refusal fails on the batch-2 witness (a phantom or a missed unit) and is caught now.
    def has_forms(*pairs):
        return lambda r: set(pairs) <= {(x["form"], x["line"]) for x in r["configuration_findings"] if x["kind"] == "unsupported_owner_definition_form"}
    commented = "<!--\n" + clean + "-->\n"
    case("tb3-unit-inside-html-comment-is-refused", lambda f: f.update(owner=commented),
         status="vacuous_with_findings", exit_code=2, verify=lambda r: has_forms(("heading_in_html_block", 2))(r) and any(x["kind"] == "missing_target_unit" for x in r["configuration_findings"]))
    in_div = "<div>\n## AA-001 — Owner\nRequired live token.\n```yaml\nplan_unit_id: AA-001\npreserved_exact_tokens: [\"live token\"]\n```\n</div>\n"
    case("tb3-unit-inside-html-div-is-refused", lambda f: f.update(owner=in_div),
         status="vacuous_with_findings", exit_code=2, verify=lambda r: has_forms(("heading_in_html_block", 2))(r) and any(x["kind"] == "missing_target_unit" for x in r["configuration_findings"]))
    case("tb3-second-heading-inside-html-block-is-refused", lambda f: f.update(owner=clean + "\n<details>\n## AA-001 — Again\n</details>\n"),
         status="findings", exit_code=2, verify=unsupported("heading_in_html_block", 11))
    case("tb3-heading-in-blockquote-is-refused", lambda f: f.update(owner=clean + "\n> ## AA-001 — Quoted\n"),
         status="findings", exit_code=2, verify=unsupported("heading_in_blockquote", 10))
    case("tb3-heading-on-list-marker-line-is-refused", lambda f: f.update(owner=clean + "\n- ## AA-001 — Listed\n"),
         status="findings", exit_code=2, verify=unsupported("heading_in_list_item", 10))
    case("tb3-heading-in-list-continuation-is-refused", lambda f: f.update(owner=clean + "\n- item\n\n  ## AA-001 — Listed\n"),
         status="findings", exit_code=2, verify=has_forms(("heading_in_list_item", 12)))
    case("tb3-list-fence-ends-with-its-item-control", lambda f: f.update(owner="- item\n\n  ```\n" + clean),
         verify=lambda r: not r["configuration_findings"] and r["witness_exact_tokens"][0]["units_with_both"] == ["AA-001"])
    case("tb3-list-fence-closed-by-outdented-closer-is-refused", lambda f: f.update(owner="- item\n  ```\n  code\n```\n" + clean),
         status="findings", exit_code=2, verify=unsupported("list_fence_closer_outdented", 4))
    case("tb3-list-fence-closed-inside-its-item-control", lambda f: f.update(owner="- item\n\n  ```\n  ## AA-001 — Example\n  ```\n\n" + clean), verify=no_ambiguity)
    case("tb3-html-comment-on-one-line-control", lambda f: f.update(owner="<!-- note -->\n" + clean), verify=no_ambiguity)
    # Tool batch 4, T62 (REVIEW-etools-tb3-opus findings 3 to 6). Each fails on the batch-3 witness (253cc695fe): a phantom
    # unit, a missed unit, an HTML end condition read past its start line, or comment text read as prose; each is read as
    # CommonMark reads it now.
    missing_target = lambda r: any(x["kind"] == "missing_target_unit" for x in r["configuration_findings"])
    # (3) ' b' after a blank line under '- a' ends the item, so the fence after it is top-level and AA-001 inside it is code
    case("tb4-underindented-line-after-blank-ends-the-item", lambda f: f.update(owner="- a\n\n b\n\n  ~~~\n## AA-001 — Owner\n\nRequired live token.\n  ~~~\n"),
         status="vacuous_with_findings", exit_code=2, verify=missing_target)
    # (3) a thematic break, or an indented code line, is no paragraph: a lone tag line after it starts a kind-7 HTML block
    case("tb4-html-tag-after-thematic-break-is-raw-html", lambda f: f.update(owner="***\n<custom-tag>\n" + clean),
         status="findings", exit_code=2, verify=has_forms(("heading_in_html_block", 3)))
    case("tb4-html-tag-after-indented-code-is-raw-html", lambda f: f.update(owner="    code\n<custom-tag>\n" + clean),
         status="findings", exit_code=2, verify=has_forms(("heading_in_html_block", 3)))
    # (4) '>' then a tab, and a tab-indented continuation of a list item, hold a heading: refused, not missed
    case("tb4-heading-after-quote-and-tab-is-refused", lambda f: f.update(owner=clean + "\n>\t## AA-001 — Quoted\n"),
         status="findings", exit_code=2, verify=unsupported("heading_in_blockquote", 10))
    case("tb4-tab-indented-heading-in-list-item-is-refused", lambda f: f.update(owner=clean + "\n- item\n\t## AA-001 — Listed\n"),
         status="findings", exit_code=2, verify=has_forms(("heading_in_list_item", 11)))
    # (4) a lazy continuation line at column 0 keeps the item open: the fence after it is the item's, and ends at AA-001
    case("tb4-lazy-line-keeps-the-item-fence", lambda f: f.update(owner=owner("AA-001", "Owner text.", ["live token"]) + "\n- a\nlazy\n\n  ```\n## BB-001 — Real\n\nRequired live token.\n  ```\n"),
         status="findings", exit_code=2, verify=lambda r: r["witness_exact_tokens"][0]["fires"] and r["witness_exact_tokens"][0]["units_with_token_in_prose"] == [])
    # (5) '<!-->' ends on its own line: the heading after it is a unit, and its text is not AA-001's
    case("tb4-empty-comment-ends-on-its-start-line", lambda f: f.update(owner=owner("AA-001", "Owner text.", ["live token"]) + "\n<!-->\n## BB-001 — Other\n\nRequired live token.\n"),
         status="findings", exit_code=2, verify=lambda r: r["witness_exact_tokens"][0]["fires"] and r["witness_exact_tokens"][0]["units_with_token_in_prose"] == [])
    case("tb4-processing-instruction-ends-on-its-start-line", lambda f: f.update(owner=owner("AA-001", "Owner text.", ["live token"]) + "\n<?>\n## BB-001 — Other\n\nRequired live token.\n"),
         status="findings", exit_code=2, verify=lambda r: r["witness_exact_tokens"][0]["fires"] and r["witness_exact_tokens"][0]["units_with_token_in_prose"] == [])
    # (6) a token only inside an HTML comment is not prose
    case("tb4-token-only-in-html-comment-is-not-prose", lambda f: f.update(owner=owner("AA-001", "Owner text.\n\n<!-- live token -->", ["live token"])),
         status="findings", exit_code=2, verify=lambda r: r["witness_exact_tokens"][0]["fires"] and r["witness_exact_tokens"][0]["units_with_token_in_prose"] == [])
    case("tb4-token-in-prose-beside-a-comment-control", lambda f: f.update(owner=owner("AA-001", "Required live token.\n\n<!-- a note -->", ["live token"])), verify=no_ambiguity)
    return {"schema_id": "pm.ledger_compile_witness.self_test.v1", "status": "pass" if all(row["caught"] for row in rows) else "findings",
            "caught": sum(row["caught"] for row in rows), "tests": rows}
