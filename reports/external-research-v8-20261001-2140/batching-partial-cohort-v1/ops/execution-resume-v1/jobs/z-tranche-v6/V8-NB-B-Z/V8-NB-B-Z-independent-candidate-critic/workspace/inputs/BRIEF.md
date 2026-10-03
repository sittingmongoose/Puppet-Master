# Synthetic product brief: offline notebook/workspace observations and copy recovery

Design a small local desktop prototype that compares two explicitly captured saved states of a repository workspace containing one version-4 .ipynb notebook and two ordinary text files. Each snapshot records the notebook's declared minor version and a workspace manifest. One text file may be renamed, another may be untracked. Notebook cells may be reordered or edited; outputs/metadata may change; cell identifiers may be absent or duplicate. These are synthetic test conditions, not claims about notebook or repository guarantees.

The prototype is offline during observation and recovery. Original files, repository metadata and snapshots are read-only. A requested recovery creates a new destination directory; it never resets, checks out over, merges into or rewrites the original workspace. The deliverable is a research-backed revision of the accompanying thin plan, not implementation. Exclude continuous watching, collaborative editing, remote sync, unsaved editor buffers, whole Git history repair and executable notebook evaluation.

Three consequential research questions:

1. Which two existing notebook comparison/versioning or repository recovery components offer useful precedents, and what version-specific behavior supports a minimal approach for this saved-state comparison?
2. How should the prototype distinguish notebook source, output and metadata changes and identify cells when version/identifier conditions differ? How should it represent file renames, untracked files and the limits of the captured states?
3. What real implementation failure relevant to cell matching, saved-state comparison or safe file recovery has a traceable issue → fix → test history, and what scoped engineering lesson and validation follow from it?

Five product obligations, all required:

- N1: Specify a bounded capture/input contract and read-only comparison of two saved states. Report declared notebook versions and unsupported inputs; explain what absent capture data and unsaved changes leave unknown.
- N2: Propose useful notebook change observations separating cell source, outputs and metadata. Define identity/matching behavior and ambiguity under absent/duplicate identifiers and reordered cells, preserving relevant version conditions.
- N3: Define workspace change observations for ordinary text edits, a rename and an untracked file. Separate an observed difference from an inferred rename or chosen equivalence rule; expose unresolved identity.
- N4: Define recovery to a new destination from an explicitly selected captured state, including existing-destination refusal, missing snapshot content, untracked files and name collisions. Explain what is recoverable; never promise recovery of uncaptured content.
- N5: Compare at least two independently discovered existing implementations/components, recommend one bounded approach with a concrete tradeoff, investigate one real relevant issue → fix → test chain, and revise the thin plan with concrete steps and discriminating validation covering N1–N4.

Discover and choose sources yourself from permitted public primary documentation and implementation repositories. No evaluator source list or supplied normative excerpt is part of this case. Cite exact versions/locators for consequential claims, preserve conditions and exceptions, and separate source obligations, engineering inference, prototype choices and proposed/unexecuted tests. A missing obligation or unresolved consequential source dependency prevents a whole-case pass.
