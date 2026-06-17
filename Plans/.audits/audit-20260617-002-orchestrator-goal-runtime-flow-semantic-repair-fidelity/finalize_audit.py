#!/usr/bin/env python3
import json
from collections import Counter
from pathlib import Path


AUDIT_DIR = Path(__file__).resolve().parent
LEDGER_ID = "pldg-20260616-002-orchestrator-goal-runtime-flow"
BASELINE = "ea1a0d1d4d99888aaf37b8f84b567bfc9301cb96"
CURRENT = "3bcc0a3a41cf35ecc1abcf8a3a84882ddc8a04bc"


def read_json(name):
    with (AUDIT_DIR / name).open() as f:
        return json.load(f)


def read_jsonl(name):
    rows = []
    with (AUDIT_DIR / name).open() as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_json(name, data):
    with (AUDIT_DIR / name).open("w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")


def main():
    audit = read_json("audit_report.json")
    ledger = read_json("ledger_consistency.json")
    validators = read_json("validator_results.json")
    risks = read_jsonl("semantic_risks.jsonl")
    changed = read_jsonl("changed_plan_fidelity.jsonl")
    claims = read_jsonl("planunit_source_claims.jsonl")
    atoms = read_jsonl("atom_fidelity_matrix.jsonl")
    owners = read_jsonl("owner_routing_findings.jsonl")

    final_status = "BLOCKED" if validators["status"] == "fail" or audit["forbidden_artifacts"]["status"] != "pass" else "PASS_WITH_WARNINGS" if risks or ledger["status"] != "pass" else "PASS"
    risk_counts = Counter(row["category"] for row in risks)
    severity_counts = Counter(row["severity"] for row in risks)
    atom_counts = Counter(row["overall_status"] for row in atoms)
    claim_counts = Counter(row["status"] for row in claims)

    lead_findings = [
        "MS-109 leaks ledger atom ids into canonical_text and overstates where atom-0031/atom-0032 are carried.",
        "CV-288 and SP-215 add typed VerificationFinding fields, but reciprocal lineage and acceptance criteria do not fully force those fields.",
        "SP-215 omits Permissions_System from implementation surfaces/owner hints while persisting write_mode and authority-check refs.",
        "OSI-428 is present canonically, but generated .plan_index source_location points to an unrelated earlier fenced-code comment heading.",
        "atom-0035, atom-0041, atom-0049, atom-0053, atom-0094, and atom-0098 retain missing_or_drift semantic warnings.",
        "q-0007 through q-0009 are coherent post-seal ledger-only follow-ups, but their open status uses post_seal_followup_not_compiled rather than the audit prompt's literal deferred/not_for_plan/source_lineage_only exception labels.",
    ]

    audit.update(
        {
            "final_status": final_status,
            "validator_status": validators["status"],
            "validator_summary": validators["summary"],
            "semantic_risk_summary_final": dict(risk_counts),
            "semantic_risk_severity_summary_final": dict(severity_counts),
            "atom_matrix_summary_final": dict(atom_counts),
            "planunit_claim_summary_final": dict(claim_counts),
            "lead_findings": lead_findings,
            "next_safe_action": "Open a separate repair-only pass for the warnings. Do not repair inside this audit.",
            "compact_repair_prompt": (
                "Repair pldg-20260616-002 post-repair semantic audit warnings only. "
                "Do not broaden scope. Remove ledger atom ids from MS-109 canonical_text; narrow or fix the atom-0031/0032 moved-lineage claim and avoid non-standard PlanUnit keys unless the PlanUnit schema is intentionally changed. "
                "Add/align reciprocal lineage and acceptance criteria for typed VerificationFinding fields in CV-288/SP-215/GRS-027, including affected artifact/path/span and prior repair strategies where supported. "
                "Add Permissions_System to SP-215 surfaces/hints for write_mode/authority refs. "
                "Fix OSI-428 .plan_index source_location by regenerating index, then regenerate shards/evidence/spec-lock through governance scripts only. "
                "Address atom-0035/0041/0049/0053/0094/0098 drift or explicitly disposition as deferred/source_lineage_only/not_for_plan. "
                "Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or build tasks."
            ),
        }
    )
    write_json("audit_report.json", audit)

    changed_summary_lines = []
    for row in changed:
        if row["added_planunits"] or row["deleted_planunits"] or row["changed_planunits"] or row["semantic_drift_status"] == "review_required":
            changed_summary_lines.append(
                f"- `{row['doc']}`: added={row['added_planunits']}; deleted={row['deleted_planunits']}; changed={row['changed_planunits']}; status={row['semantic_drift_status']}."
            )

    owner_lines = []
    for row in owners:
        if row["status"] != "no_wrong_owner_blocker_detected":
            owner_lines.append(f"- {row['severity']}: `{row['finding_id']}` - {row['details']}")

    validator_lines = []
    for row in validators["commands"]:
        mutation = "mutated" if row["mutated_worktree"] else "no mutation"
        validator_lines.append(f"- `{row['name']}`: {row['status']} ({mutation}).")

    subagent_lines = [f"- {row['group']}: {row['status']} - {row['summary']}" for row in audit.get("subagent_summary", [])]

    final_report = f"""# {AUDIT_DIR.name}

Status: {final_status}

## Inferred Range

- ledger_id: `{LEDGER_ID}`
- baseline_ref: `{BASELINE}`
- current_ref: `{CURRENT}`
- Range inference: `HEAD^..HEAD` is the smallest contiguous recent committed repair group ending at `HEAD` and touching the target ledger, changed live Plans docs, `.plan_index`, `.plan_migration`, shards, evidence, and `Spec_Lock.json`.

## Changed Files

- Changed files in range: {audit['changed_files_count']}; full inventory is in `audit_report.json`.
- Changed live Plans docs: {', '.join(f'`{path}`' for path in audit['changed_live_plan_docs'])}.
- Changed PlanUnits: {', '.join(f'`{unit}`' for unit in audit['changed_plan_unit_ids'])}.
- Added PlanUnits: none.
- Deleted PlanUnits: none.

## PlanUnit Deltas

{chr(10).join(changed_summary_lines)}

## Exact-Detail Fidelity

Atom matrix summary: `{dict(atom_counts)}`.

No clean semantic PASS. High-signal remaining drift/loss:

- `atom-0035`: controller/planner/reviewer roles are missing from compiled target blocks.
- `atom-0041`: high-end controller/planner decomposition into `WorkGraph` and bounded `WorkNode` work is not substantively present in `EP-098`.
- `atom-0049`: validator failure, verifier unavailable, repair budget exhaustion, and degraded outcome are not substantively preserved.
- `atom-0053`: defect signature details narrow affected artifact/path/span to affected artifact.
- `atom-0094`: repair adds typed `VerificationFinding` fields beyond the bounded atom exact field set support.
- `atom-0098`: `F3-395` drops `gui_impact_matrix` and several exact GUI surface tokens.
- Several broad doc-path and planning-matrix tokens are classified `source_lineage_only`, especially `atom-0078`, `atom-0080`, `atom-0081`, `atom-0096`, `atom-0097`, and `atom-0099`.

## Reciprocal Lineage

PlanUnit claim summary: `{dict(claim_counts)}`.

- `CV-288` and `SP-215`: typed `VerificationFinding` details need fuller reciprocal atom lineage; exact `status` / `failed | passed | blocked` tokens are compressed.
- `MS-109`: canonical text names raw atom ids and falsely says `atom-0031`/`atom-0032` are carried by `EP-098`, `GRS-026`, and `GRS-027`; direct lineage confirms them in `OSI-428`, not those other units.
- `OSI-428`: canonical unit exists, but generated `.plan_index` `source_location` is wrong.
- `MS-109` uses non-standard `moved_owner_lineage`, outside the PlanUnit required field list.

## Owner Routing

No wrong-owner blocker was found, but owner impact is incomplete:

{chr(10).join(owner_lines)}

## Ledger And Governance

- Ledger status: `{ledger['status']}`.
- Manifest, current, registry entry, ledger registry, compile queue, and ledger health agree on sealed/governance-sealed status.
- `q-0007`, `q-0008`, and `q-0009` are open but marked `post_seal_followup_not_compiled`; this is coherent as ledger-only continuation, but it does not match the audit prompt's literal deferred/not_for_plan/source_lineage_only exception labels.
- `.plan_index` includes all 22 compiled PlanUnits, 5065 PlanUnits, and 18075 acceptance units; node readiness remains `blocked_compiler_contract_incomplete`.
- Dependency graph is non-executable: no unresolved dependency refs, but build order is empty with cycle blockers and must not be consumed as a WorkNode/NodeSeed schedule.

## Validators

All required validators passed with no worktree mutation:

{chr(10).join(validator_lines)}

YAML-dependent validators used `PYTHONPATH=Plans/.audits/audit-20260616-008-orchestrator-goal-runtime-flow-post-repair/.pydeps`.

## Forbidden Artifacts

No range-created WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, final/production build tasks, implementation files, Rust/Slint scaffold, or old Rust/Iced app resurrection were found.

Current-tree warnings only: this audit folder contains audit-local helper scripts, and a tracked PyYAML bundle exists from an older audit dependency workaround. Generated shard `manifest.json` files are governance manifests, not final node manifests.

## Subagent Summary

{chr(10).join(subagent_lines)}

## Next Safe Action

Open a separate repair-only pass for the warnings. Do not repair inside this audit.

Compact repair prompt:

```text
{audit['compact_repair_prompt']}
```
"""
    (AUDIT_DIR / "FINAL_REPORT.md").write_text(final_report)


if __name__ == "__main__":
    main()
