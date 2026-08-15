# R6 decomposed weak-model experiment

This directory is a disposable experiment bound to the unfinished frozen R5
Plans fixture. It is not production machinery, a current-Plans audit, a release
gate, or permission to compile Plans.

R6 preserves all R5 evidence unchanged. It changes only two work-unit boundaries
identified by the R5 postmortem:

- S10B tension filtering is removed from the large topic synthesis. A
  deterministic admission rule excludes unsupported candidates, and each
  admitted candidate receives one small typed subject verdict. A deterministic
  reducer restores candidate order and joins the result to the core synthesis.
- S50 direct authority values are projected mechanically from keyed predecessor
  decisions with declared value types. The subject receives only the compact
  cross-topic semantic edge judgment.

Every subject call is a fresh first attempt. A failed revision remains failed;
later revisions, if needed, live in separate sibling directories.
