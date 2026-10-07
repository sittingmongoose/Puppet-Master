# M14 mechanical renderer — frozen prerequisite v1.0.0

Python 3 standard library only. One candidate-authored JSON document is the sole
semantic input. The renderer produces Markdown: a decision view containing every
finding's exact summary, disposition, and complete governing conditions; complete
evidence, conditions, options, optional leads, validation, uncertainty, and sources
views; complete record details; and the exact original input text. All projections
retain authored order and identities. No ranking, selection, adjudication, source
fetching, source-ID rebinding, truncation, or generated substantive text occurs.
Markdown fences protect content containing markup. Finding links use deterministic
SHA-256 anchors derived from exact IDs, without changing the IDs.

## Small format contract

Author one JSON object with a nonempty `findings` array. Each finding is an object
with these required fields:

- `id`: unique, stable, case-sensitive string, 1–64 characters, first character
  alphanumeric and remaining characters alphanumeric or `_ . : -` (no spaces).
- `summary` and `disposition`: nonblank candidate-authored strings. The candidate
  states accepted/amended/rejected/unresolved status as appropriate; the host does
  not infer or change it.
- `evidence`, `conditions`, `options`, `optional_leads`, `validation`, `uncertainty`,
  `sources`: authored text, list, or object. Missing fields, nulls, blank strings,
  and scalar booleans/numbers fail. An explicit empty list/object is permitted to
  record absence; this is not certification that brief obligations are satisfied.

Unknown fields at any depth and at document level are retained in the full detail
and exact-input views. Put source identity/version/hash/locator bindings in
`sources`, and keep any existing `sourcebinding` or other fields verbatim.
Proposed versus performed validation, evidence limitations, negative conditions,
open choices, and optional leads must be authored explicitly. The concise summary
is authored by the candidate; the host does not summarize evidence. Required
conditions remain visible in full beside every summary, even if this makes the
view longer. There is no imposed synchronized catalog or separate schema file.

The check establishes structural retention only. It cannot detect a substantive
omission, misleading summary, ungrounded claim, or false validation status. The
candidate performs the case's preservation check. No field receives a host-created
scientific default. No research subject examples or answers are provided here.

## Fixed case path map and usage

Base: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5`

- Frozen case definition: `cases/D-M14-A/case-card.json`
- Frozen input bindings: `cases/D-M14-A/INPUT_MAP.json`
- Authoritative candidate set: `cases/D-M14-A/outputs/treatment/semantic_findings.md`
  (UTF-8 JSON text under the already declared stage filename; no Markdown wrapper).
- Mechanical Markdown projection: `cases/D-M14-A/outputs/treatment/mechanical_projection.md`
- Candidate preservation check: `cases/D-M14-A/outputs/treatment/preservation_check.md`
- Candidate final delivery: `cases/D-M14-A/outputs/treatment/final.md`
- Renderer: `helpers/m14-renderer/render.py`

Actual invocation after the candidate has authored the set:

```bash
python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/m14-renderer/render.py /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/outputs/treatment/semantic_findings.md --output /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/outputs/treatment/mechanical_projection.md
```

The output parent must already exist. Files are created exclusively: existing
outputs and inputs cannot be overwritten. Exit 0 means structurally valid rendering;
exit 2 reports rejection on stderr. Invalid input is checked before output creation.
`-` accepts stdin or emits stdout. `--version` prints version and renderer hash.
Keep the exact semantic set and projection in final delivery; the projection already
includes the exact input. Do not manually repair rendered content: revise the single
semantic set and rerender to a new output, then repeat candidate preservation checks.

This helper map fixes the logical case filenames; it does not edit campaign state
or authorize dispatch. If dispatch uses isolated job-stage paths, the root must bind
those exact paths in its stage input map before dispatch and pass them as CLI
arguments. Source bindings from the frozen input map remain unchanged. Supply only
the generic contract/renderer required for this stage, not a helper source corpus,
sibling answers, reviews, or campaign history.

Control remains one competent narrative with the same required decision,
alternatives, evidence, conditions, optional leads, validation, uncertainty, and
source-traceability scope. Treatment authoring, renderer preparation/qualification,
invocation, tool latency, failed attempts/retries, and preservation-check cost must
be recorded and charged under the campaign's treatment accounting; this helper
receipt grants no free budget or latency extension. It makes no experimental claim.

## Frozen version and receipt

Renderer version: `m14-renderer-1.0.0`.

- `render.py` SHA-256: `80e925fe69e7ccc2d58297fd48ab857795545d6d94572b653bffc5803ace9ef0`
- `check.py` SHA-256: `439ed8101fe602d408912af8b2ca1ac1a11fe3ff57c5388536b3213422499415`
- Case card SHA-256: `67bc9697bc4abc6bc6b0169e5fee607444d326646eaccf308b7c9ce2587084e3`
- Input map SHA-256: `d4d2d080347e39a13a63ea50aed387fae0cb2aeb74f2ec295155c6062292cfd9`

Before dispatch, capture the version and check receipt, including the README hash:

```bash
python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/m14-renderer/render.py --version
python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/m14-renderer/check.py
```

Qualification: four focused checks PASS. They exercise placeholder-only field and
unknown-field retention, exact UTF-8/CRLF input retention, sourcebinding equality,
all finding identities/view links and full conditions, distinct punctuation IDs,
every missing required field, duplicate identities and JSON keys, invalid constants,
empty input sets, CLI output equality, no write on rejection, refusal to overwrite,
and the frozen case/input-map hashes. Fixtures exist only in memory or an automatically
removed temporary directory inside this helper. The receipt prints hashes of all
three retained files. Any change requires a new version/hash capture before dispatch.
No candidate outputs/reviews or scientific answer/key were read or authored.
