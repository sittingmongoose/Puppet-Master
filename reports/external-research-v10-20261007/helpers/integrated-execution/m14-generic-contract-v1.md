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


Invocation: python3 /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/m14-renderer/render.py OWN_STAGE/semantic.json --output OWN_STAGE/artifact.md. Output parent exists; renderer refuses overwrite. Revise semantic set, rerender to a new versioned path, preserve original versions. Supply source-map.json separately for source bytes/metadata; no synchronized scientific catalogs. Candidate preservation_check.md checks full original scope and all authored fields/conditions, not just renderer exit.
