> Exported evaluator review. Original SHA-256: `6cf8b73937624d1b80d184030dc22d33d549e320c5f1274e3bd5f0eff76e12fe`. Source locators and hashes below identify original artifacts; `artifact:` identifiers are nonclickable identities and do not imply included payloads. Declared transformations are in [the reviewer export receipt](reviewer-export-receipt.json). Original private/provisional wording is preserved as historical review context.

# D4 J8 staging-export review

**PASS — no blockers for this known J8 export.** The review covers export fidelity, custody, sanitization and local links. It makes no final landing, comparison-union, source/fact, semantic or campaign-completion claim.

Checked the exporter (retained external artifact `artifact:campaign/next-goal-20260909/d4/evaluator/export_completed_comparison.py`; payload omitted), [staged J8 notes](../evidence/comparisons/J0008-compare/notes.md), both source tables and the export receipt against completed native J8 originals. Verification ran **2026-09-09T10:50:07.540000+00:00–2026-09-09T10:50:39.552889+00:00**. The named inputs and exports were unchanged across that check. Exporter SHA-256: `1a4e881a9bb371ff6eca855ca03c90add715d1e58811c056f753364cf6f059d8`.

## Fidelity and links

The staged notes are **byte-for-byte identical** to native notes after only these declared link-target replacements:

| Native target | Staged target | Occurrences |
| --- | --- | ---: |
| `evidence-index.md` | `sources.md` | 2 |
| `research-evidence/sources/S00001/text.txt` | `../../../fixtures/baseline/Viewer.md` | 1 |

Both notes files have **250 lines**. Thus wording, ordering, examples and line numbers are preserved outside those three link occurrences; this conclusion is stronger than a line-count-only check. The source tables are newly generated receipt summaries, not a claimed verbatim copy of native `evidence-index.md`.

Independent **CommonMark token parsing** found 69 link occurrences across notes and sources Markdown. All **seven local link occurrences** resolve to files within `landing-draft`; none has an unresolved fragment. The baseline target hashes to `5f4d4db8e1f07c16278f15c9fd6bf827360867e61a56d917367e7e3b551d222d`, matching the frozen Viewer identity and both J8 Plan-read receipts. No HTML link/image-attribute escape was found. Public URL availability was not retested.

## Custody and evidence labels

- **8/8 configured input hashes match.** Assigned IDs match the delivery and export receipt. Native notes match both outcome and delivery hashes; exported notes and source JSON match the export receipt.
- Retained native metadata agrees on comparison phase, completed status, one identical started/completed turn ID, error-free turn completion, Goal/thread identities, job workspace and objective after outer trimming. The attachment record exists and the process exit code is zero. This checks the export's metadata guards without reopening a raw-session audit.
- **68/68 retained raw source files match their receipt hashes.** All 68 staged source rows exactly match the allowed receipt-derived fields. All **31 declared normalized-text hashes** match, and exported retained text hashes match current files.
- **S00044, S00051 and S00057 remain `ERROR`**, with explicit failed-acquisition use limits. Their matching empty raw-file hashes do not imply successful acquisition. Every Markdown table operation/status matches the JSON and original receipt.
- The source table explicitly distinguishes metadata/source acquisition from viewer runtime acceptance. It does not upgrade fetches, metadata reads or failed acquisitions into runtime proof.

The staged directory contains exactly the four requested export files. Sanitized receipt fields exclude raw local paths, commands with arguments, native thread/session objects and cache locations. Scans found no host filesystem paths, raw-session markers or extra native-session files. Public URLs use GitHub/API/raw GitHub, NGFF, EBI and Zarr documentation hosts, with no credentials in user-info or checked query keys.

## Guard/parser limits for this export

The exporter is not a generic Markdown sanitizer: its link regex and host/URL checks cover a restricted form. This is **not material here**, because the independent parser, broader path scans and exact-byte check pass on J8's actual text.

The exporter allows missing raw files and does not independently validate normalized text when a receipt lacks an expected normalized hash. Neither produces a false claim here: all raw files exist, the checked identities match, and no new source/runtime truth is inferred from an identity hash.

Native guards use summary metadata and attachment existence rather than reconstructing execution; this review additionally checked the actual turn/thread relationships. The exporter itself does not hash `sources.md` in its receipt or verify the staged baseline bytes. Both were independently checked and their identities are retained in this review. These are limits on future/general use, not blockers for the current exported bytes.

[JSON review](comparison-export-review.json) records each input/source check, local target, relevant native/export hash and the bounded disposition of these limitations.

Key staged identities:

| File | SHA-256 |
| --- | --- |
| `notes.md` | `f8237bfbe25ff2f9a1b29a2ceb628ca79acfdadbc1c26a5d45e8eb7a9787fbbf` |
| `sources.md` | `49c08f1dcadab74e10ea782e3fca2e1f3dfc15191e1e947461101abb2cf25507` |
| `sources.json` | `35b81b8310f77ea7cdf3556724e4db25977a449e4a0f2c2fce5ec47ea1b0431c` |
| `export-receipt.json` | `447857e66cf9b69e3036f95ace53b36c3c5f289715b6942e284054787a75a88e` |

Only this review Markdown and JSON were written. The exporter and collector were not executed. No private controls, D5, live campaign, inputs, native evidence, staged export or Plans were changed. All owned command sessions, including the source-hash verification session, exited.

