# Offline complete-finding carrier v1

This is a **synthetic development** interface for an offline experiment. It is a new boundary, intentionally separate from the frozen R1b Markdown block parser and native Goal drivers. The investigator writes `draft.json`; a host can render it after freeze without a verifier. A later, separately authorized verifier writes `review.json`. No model is expected to run this Python tool, and the tool does not read sources, make calls, or establish factual truth.

Run from the experiment directory:

```sh
python3 offline-repair-v1/tools/delivery.py render --draft draft.json --out-md draft-report.md --out-json draft-delivery.json
python3 offline-repair-v1/tools/delivery.py assemble --draft draft.json --review review.json --out-md reviewed-report.md --out-json reviewed-delivery.json
```

`delivery.py` also exposes `load(Path)`, `validate_draft(object)`, `assemble(draft, review=None)`, and `render(delivery)` for import. Python standard library only. `render` exits 0 for a structurally valid draft, 1 when assembly has unresolved review content, and 2 for an invalid top-level carrier; it writes both outputs in every case. A draft-only render has every finding marked `UNVERIFIED` and still displays its complete parts. Review assembly produces `REVIEWED_VERIFIER_ASSERTION` only for a finding whose **every** original part has exactly one structurally valid explicit decision. This is mechanical coverage, not truth validation. Any unresolved or defective part makes the whole finding unresolved. Rejected, replaced, removed, and unresolved original parts remain in the history. The JSON delivery is the machine-readable audit output; Markdown is a readable view.

The field sets below are strict. Unsupported fields such as a free-text top-level `additions` are carrier errors and the raw input is retained. New material belongs in typed `new_findings`, with explicit per-part decisions. The only intentionally open payload is `revision_history`, which is retained as history and never rendered as a current assertion.

## Draft shape

`schema` is exactly `offline-finding-draft/v1`. `findings` is a nonempty array. Each finding has a globally unique stable uppercase `id`, nonempty `title`, and nonempty `parts`. Each part has a globally unique stable uppercase `id`, fixed `type`, and nonempty `text`. The fixed types are `assertion`, `condition`, `implication`, `validation_proposal`, `uncertainty`, `source_fit`, `plan_fit`, and `non_finding`. Source references in the investigator draft are leads, not proof. Optional `revision_history` is an array of investigator-authored snapshots or change notes; it is carried through unchanged and does not alter current parts. Models should save actual append snapshots separately if required by the experiment protocol, then cite them in this array.

```json
{
  "schema": "offline-finding-draft/v1",
  "findings": [
    {
      "id": "F-001",
      "title": "Synthetic development finding about a sample index",
      "parts": [
        {"id": "P-001", "type": "assertion", "text": "The sample index describes entries in a fixed local set.", "evidence": [{"kind": "source_text", "source": "SYN-001", "locator": "lines 4-6", "quote": "Illustrative source text, not a case answer."}]},
        {"id": "P-002", "type": "condition", "text": "This applies when the sample index is selected."},
        {"id": "P-003", "type": "implication", "text": "The sample interface would expose the selected entry."},
        {"id": "P-004", "type": "validation_proposal", "text": "Open a synthetic fixture and compare the displayed entries with its index."},
        {"id": "P-005", "type": "uncertainty", "text": "Ordering among equal entries remains to be decided."},
        {"id": "P-006", "type": "source_fit", "text": "The illustrative source discusses local entries."},
        {"id": "P-007", "type": "plan_fit", "text": "The illustrative Plan passage names an entry list."}
      ]
    }
  ],
  "revision_history": [{"snapshot": "synthetic-development-1", "note": "Initial local draft."}]
}
```

Each finding stays together in the report. A validation proposal always displays `UNEXECUTED PROPOSAL`; it is never converted to bookkeeping or passed-test proof. `non_finding` is substantive and needs review just like an assertion. Use `uncertainty` for unknowns and unchecked material. An explicit `keep` of an uncertainty retains that stated uncertainty; it does not resolve the underlying question or assert certainty. An `unresolved` action on any part makes the whole finding unresolved. An issue title alone is a lead or allegation: label it accordingly in a part's text and do not use it to override source text or Plan canon.

## Review shape

`schema` is exactly `offline-finding-review/v1`. `findings` has one record per original finding. Each has its ID and `decisions` with exactly one record per original part. No inherited or default confirmation exists. A decision has `part_id`, `action` (`keep`, `replace`, `remove`, `unresolved`), `basis` (`supported`, `counterevidence`, `absence`, `insufficient`), nonempty `reason`, and source `evidence` for keep/replace/remove. Evidence items have nonempty `kind`, `source`, `locator`, and `quote`. Kinds are `source_text`, `plan_text`, `issue_title`, `search_result`, and `secondary_summary`. `issue_title`, `search_result`, and `secondary_summary` are leads; keep/replace/remove requires at least one direct `source_text` or `plan_text` citation. This is a structural gate, not a judgement that the cited text proves the claim. `keep` requires `supported`; `replace` needs a `replacement` with the **same** part type and nonempty text; `remove` requires `counterevidence` or `absence`; `unresolved` requires `insufficient`. The verifier's evidence is an explicit claim of checking source context, not host-certified truth. If review is missing, malformed, duplicated, incomplete, or references an unknown part ID, the affected finding remains visible and unresolved. A malformed JSON document is retained raw with no asserted claims.

```json
{
  "schema": "offline-finding-review/v1",
  "findings": [
    {
      "id": "F-001",
      "decisions": [
        {"part_id": "P-001", "action": "keep", "basis": "supported", "reason": "The illustrative local passage directly states this limited relation.", "evidence": [{"kind": "source_text", "source": "SYN-001", "locator": "lines 4-6", "quote": "Illustrative checked line."}]},
        {"part_id": "P-002", "action": "keep", "basis": "supported", "reason": "The condition is explicit in the illustrative passage.", "evidence": [{"kind": "source_text", "source": "SYN-001", "locator": "line 7", "quote": "Illustrative condition."}]},
        {"part_id": "P-003", "action": "replace", "basis": "supported", "reason": "The illustrative Plan makes the action narrower.", "evidence": [{"kind": "source_text", "source": "SYN-PLAN", "locator": "line 3", "quote": "Illustrative narrow action."}], "replacement": {"type": "implication", "text": "The sample interface would show the selected entry name."}},
        {"part_id": "P-004", "action": "keep", "basis": "supported", "reason": "This is a proposed check, not an executed result.", "evidence": [{"kind": "source_text", "source": "SYN-PLAN", "locator": "line 3", "quote": "Illustrative entry list."}]},
        {"part_id": "P-005", "action": "unresolved", "basis": "insufficient", "reason": "The fixed illustrative corpus leaves ordering open."},
        {"part_id": "P-006", "action": "keep", "basis": "supported", "reason": "The checked illustrative source concerns local entries.", "evidence": [{"kind": "source_text", "source": "SYN-001", "locator": "lines 4-6", "quote": "Illustrative local entries."}]},
        {"part_id": "P-007", "action": "keep", "basis": "supported", "reason": "The checked illustrative Plan names the list.", "evidence": [{"kind": "source_text", "source": "SYN-PLAN", "locator": "line 3", "quote": "Illustrative entry list."}]}
      ]
    }
  ],
  "new_findings": []
}
```

This example intentionally leaves `P-005` unresolved, so the entire `F-001` stays unresolved. To publish a reviewed finding, the verifier must resolve each part explicitly. A reviewer may add `new_findings` using the same finding shape, each with its own `decisions` array. A new `non_finding` is a typed part of a new finding; it cannot bypass review. All substantive additions receive the same evidence and absence checks.

## Absence and negative claims

Absence is a bounded source argument, not a search result. A decision with `basis: "absence"`, or absence-like prose in its reason, kept original, or replacement, requires `absence` alongside the decision. A reviewed `non_finding` always requires one. The heuristic targets concrete source-absence phrases including “missing,” “no source states,” “no matching entry exists,” “not in evidence,” and “never states.” Type/status phrases such as “not an executed test” do not trigger it. The heuristic can overflag or miss prose; passing lint cannot establish truth or completeness. Reviewers must assess negative claims in additions and non-findings the same way.

```json
{
  "scope": "The fixed synthetic source packet SYN-001 through SYN-003, sections A-C",
  "context": [{"kind": "source_text", "source": "SYN-002", "locator": "section B lines 9-18", "quote": "Illustrative context actually read."}],
  "searches": [{"pattern": "sample entry|entry name", "scope": "SYN-001 through SYN-003", "result": "Illustrative matches reviewed in sections A and B."}],
  "source_evidence": [{"kind": "source_text", "source": "SYN-002", "locator": "section B lines 9-18", "quote": "Illustrative source context supporting the bounded negative statement."}],
  "assessment": "source_supported"
}
```

`scope`, `context`, `searches`, `source_evidence`, and `assessment` are required. `context` cites direct `source_text` or `plan_text`; `source_evidence` contains at least one direct citation too. `assessment` is `source_supported` or `inconclusive`. Inconclusive assessment blocks keep, replace, remove, and additions. Search and heuristic lint alone do not validate absence; the host only checks that cited source context and a bounded search record exist. A verifier may still be wrong. An unsupported removal retains the original, the challenge, and the defect in the visible report; it never promotes the original to confirmed status or silently drops it.

The report's `mechanical_coverage` counts records and dispositions. Its `truth_validation` field is always `not_established_by_assembler`. Consumers must not treat structural success, issue titles, or proposed validation as independent grading or proof.

## I1 current-view projection and acquisition inventory

The I1 investigator comparison uses a current-only first view. This changes presentation of the draft, not the verifier protocol. `render-current` requires all five outputs so the host keeps a current Markdown report and JSON projection separate from the full audit Markdown, assembled audit JSON, and exact raw draft bytes:

```sh
python3 offline-repair-v1/tools/delivery.py render-current \
  --draft draft.json \
  --out-md current.md --out-json current.json \
  --history-md history.md --history-json history.json \
  --raw-draft-out raw-draft.json
```

The `offline-finding-current/v1` projection includes each current finding's ID, title, and **every current typed part** with its text and investigator source leads. It excludes `revision_history`, duplicate original/history records, review records, and raw JSON. Its status is `UNVERIFIED`; validation proposals display `UNEXECUTED PROPOSAL` and uncertainties remain attached. `project_current(draft)` and `render_current(current)` are the importable equivalents. On an invalid draft, current outputs contain only a carrier error with zero asserted claims; the separate history and raw outputs retain the malformed payload for repair. The existing `render` command and `render()` function continue to produce the full audit report.

After private arm assignment, copy the **exact authored control** `out/draft.md` to its assigned `first_view/results/Xn/current.md`, and the **host-rendered maintained** `current.md` to the other arm's `current.md`. Either arm can be X1. The command below illustrates **control=X1, maintained=X2 only after that private assignment**. The helper copies only those two files into `first_view/results`; it copies explicitly enumerated acquisition files under `deferred/X1` and `deferred/X2`, and records their destination paths and SHA-256 hashes in `deferred/INVENTORY.json`. The existing case/key copy workflow supplies `first_view/case` and `first_view/key`. For the control arm, defer the exact raw `out/draft.md` as well as available `out/observations.md`, `out/history.md`, and every available `out/snapshots/*.md`. For the maintained arm, defer `current.json`, full history Markdown/JSON, exact raw `draft.json`, and every available snapshot. Missing early acquisition files are flagged `not_recoverable` in the experiment record, never fabricated. The raw current report alone is a valid minimal deferred artifact if no earlier file survives. Both arms require at least one explicit deferred mapping. The helper never discovers or silently drops files; the caller must enumerate the acquisition inventory. It refuses stray pre-existing files under `first_view` outside `case`, `key`, and the exact X1/X2 current report destinations.

```sh
python3 offline-repair-v1/tools/stage_i1.py \
  --workspace reviewer-workspace \
  --x1-current control/out/draft.md \
  --x2-current maintained/current.md \
  --x1-deferred control/out/draft.md=raw-draft.md \
  --x1-deferred control/out/observations.md=observations.md \
  --x1-deferred control/out/history.md=history.md \
  --x1-deferred control/out/snapshots/prior.md=snapshots/prior.md \
  --x2-deferred maintained/current.json=current.json \
  --x2-deferred maintained/history.md=history.md \
  --x2-deferred maintained/history.json=history.json \
  --x2-deferred maintained/raw-draft.json=raw-draft.json
```

The deferred files are in the **same readable reviewer workspace**. Reading chronology is enforced by the reviewer prompt only; staging is not filesystem access isolation. There is no semantic scrub of the control's authored current report if it includes history despite its instruction. `V-FOLLOWON-1` absence-lint expansion remains deferred and is **not qualified for follow-on verifier use** by this I1 presentation change.
