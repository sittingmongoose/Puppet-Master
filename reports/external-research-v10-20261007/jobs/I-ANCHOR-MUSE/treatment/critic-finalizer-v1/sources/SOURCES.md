# Stable source ID map — I-ANCHOR-MUSE treatment critic-finalizer-v1

New IDs (C01–C04) are critic-stage evidence reviewed live by the
critic-finalizer. Predecessor IDs S01–S14 are NOT rebound; their locators
are listed below for reference. No other arms, reviews, evaluator answers,
or campaign analyses were read.

New evidence retrieved 2026-10-07 between 18:36:27Z (native goal receipt
save) and 18:36:59Z (v1.9.0 excerpt save), via read-only HTTPS fetch
(curl) plus grep/sed inspection of fetched text. No downloaded code was
executed; no installs, accounts, or purchases.

| ID | Exact URL | Version / range | Retrieved |
|----|-----------|-----------------|-----------|
| C01 | https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py | Tag v1.9.0 (54,632 bytes); `_validate_contents` lines 778–796, `_validate_oxum` 797–830, `validate()` 590–605, `validate_fetch` file-URL branch ~770–776, `DEFAULT_CHECKSUMS` line 128 | 2026-10-07 ~18:36:35Z |
| C02 | https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174 | PR #174 JSON: state=closed, merged_at=null, closed_at=2024-09-18T22:59:32Z | 2026-10-07 ~18:36:40Z |
| C03 | https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177 and .../issues/137 | #177 state=open (updated 2024-05-02); #137 state=open (updated 2024-03-14) | 2026-10-07 ~18:36:40Z |
| C04 | https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py | Tag v1.9.0, argparse block lines 1452–1550: `--validate`, `--fast`, `--completeness-only` definitions and `--fast`/`--completeness-only`-require-`--validate` guards | 2026-10-07 ~18:36:55Z |

## Bounded verbatim evidence (short quotes, fair-use excerpts)

C01 (`_validate_contents` at v1.9.0, saved in
`sources/bagit-v190-validate-excerpt.txt`): the body is, in order,
`if fast and not self.has_oxum(): raise …`, then the comment
`# Perform the fast file count + size check so we can fail early:` with an
UNCONDITIONAL `self._validate_oxum()`, then `if fast: return`, then
`self._validate_completeness()`, then `if completeness_only: return`, then
`self._validate_entries(processes)`. The oxum-first behavior read by the
predecessor at v1.8.1 therefore still ships verbatim at v1.9.0. Predecessor
uncertainty U1 is RESOLVED by direct code read (was: changelog-absence
inference).

C01 (`_validate_oxum` at v1.9.0, new nuance): `oxum = self.info.get(
"Payload-Oxum")` followed by `if oxum is None: return` — bags WITHOUT
Payload-Oxum skip the fail-early gate silently, so the S03/S04 trap bites
exactly the oxum-carrying bags the proposal mandates (P1). Multiple oxum
values log a warning and use the first; malformed values raise BagError.

C01 (`validate_fetch` tail at v1.9.0): file-scheme URLs are accepted
without netloc (`parsed_url.scheme == "file"` branch) — the S06/#154
behavior the draft cited for O1, observed in code rather than changelog.

C01 (line 128): `DEFAULT_CHECKSUMS = ["sha256", "sha512"]` unchanged at
v1.9.0 — confirms the draft's dual-manifest claim at the newer tag.

C02: PR #174 `state: closed`, `merged_at: null` — the 5-line oxum fix was
closed WITHOUT merge on 2024-09-18. Consistent with C01.

C03: #137 and #177 both `state: open` at retrieval — the complaint chain
is live and unaddressed upstream.

C04: `--fast` help: "only test whether the bag directory has the number of
files and total size specified in Payload-Oxum without performing checksum
validation to detect corruption"; `--fast`/`--completeness-only` without
`--validate` are argparse errors. CLI self-description is honest; the trap
is in the library default path, not the CLI help.

## Predecessor source locators (immutable, not re-read as new evidence)

S01–S14 are defined in
`/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-ANCHOR-MUSE/treatment/research-v1/sources/SOURCES.md`
with saved excerpts `bagit-validate-excerpt.txt` (S02 at v1.8.1) and
`pr174.patch` (S05) in the same directory. Critic spot-verified the S02
excerpt's `_validate_contents` shape against C01 (identical structure) and
the S05 patch hunk context against C01 lines 778–796 (applies cleanly in
principle; not applied or executed).

## What was NOT executed

No downloaded code was executed on the host; no installs, no accounts, no
network checks beyond source fetches. All validation (T1–T4, V1–V7) and
all proposals (P1–P10, O1–O4) remain PROPOSED. Read-only commands used:
date/ls/grep/sed/curl over public sources plus mkdir/file writes for this
deliverable.
