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
    return {"schema_id": "pm.ledger_compile_witness.self_test.v1", "status": "pass" if all(row["caught"] for row in rows) else "findings",
            "caught": sum(row["caught"] for row in rows), "tests": rows}
