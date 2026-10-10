# Independent critique — A8-01-treatment

**Scope:** complete frozen brief and released plan, investigator discovery/draft/source map, carried evidence index and evidence notes, plus independent read-only review of governing primary sources.  
**Status:** critique only; no final proposal or repair authored. Research sources were not treated as product validation.  
**Native Goal:** created before substantive review with the frozen objective. Direct native state showed status `active`, thread `01a12408-11d4-7c31-be4f-39a46f80ee8e`; no activation timestamp beyond the tool's `createdAt` value was exposed as a UTC-formatted time.

## Fixed SCW selection

This ordered list was saved after reading the ordinary packet and before new source checks or verdicts. It is fixed; no substitutions.

1. **Recommendation ¶1. Exact claim:** “For a small pilot on ordinary local disk plus the gallery’s existing offsite copy, use a **BagIt v1.0 package per exhibition deposit state**, with one new package whenever an asset correction is approved.” Selected because misreading scale/package unit could change the packaging recommendation. Diagnostic selector: applicability condition, small pilot vs many revisions.
2. **Comparison table, BagIt row. Exact claim:** “BagIt validates completeness/layout and checksums, but does not model succession of corrected asset versions.” Selected because conflating package integrity with version history could change the plan disposition. Selector: product, BagIt vs OCFL.
3. **Bounded released issue ¶1. Exact claim:** “The released OCFL 1.1 change log documents that v1.1.0 clarified the rule so each historical inventory’s manifest references every file in that inventory’s version directory; the [release page](https://github.com/OCFL/spec/releases) identifies the subsequent 1.1.1 release (tag `1.1.1`, commit `c3f88b3`).” Selected because the inventory/version referent controls copy and check scope. Selector: inventory scope, historical vs current.
4. **Reconciliation table, obligation 6. Exact claim:** “Recommend SHA-512 for new BagIt payload manifests, aligning with RFC 8493’s SHOULD default; SHA-256 is also supported and can be chosen if the actual validated workflow favors it.” Selected because confusing recommendation strength with a mandate changes the algorithm decision. Selector: modality, SHOULD vs MUST.
5. **Optional inventory ¶1. Exact claim:** “BagIt’s optional `bag-info.txt` is meant for human use and arbitrary tag files are allowed, but generic BagIt processors ignore custom tag semantics.” Selected because mis-scoping a generic processor’s guarantees could reject or overstate the authorized CSV option. Selector: processor scope, generic vs locally extended.
6. **Changed name or path. Exact claim:** “The BagIt RFC documents that visually identical names may compare unequal across filesystems and recommends tolerant normalization-aware validators.” Selected because platform condition changes path-risk applicability. Selector: applicability, cross-filesystem vs same-filesystem.

## SCW records

Each relation below is judged separately against the same cited evidence; C* is diagnostic only. Relations do not imply a replacement proposal.

### SCW-1 — small-pilot package recommendation

- **C:** Use one BagIt package per exhibition deposit state for the stated small pilot, creating a new package for an approved correction. **C*:** Use that same package-per-deposit recommendation for a gallery with many revisions. **Delta:** applicability condition, “small pilot” → “many revisions.”
- **Evidence:** S01 defines BagIt’s directory/manifest packaging and byte checks; S02 defines a persistent object with continuous version directories and state. The cited standards do not measure staff effort, collection size, restore simplicity, or local storage cost. Both excerpts: `[S01 §1.1, §2.1.3; S02 §§3.3, 3.5]`.
- **Relations:** C **UNDETERMINED**; C* **UNDETERMINED**. The record supports format capabilities, not relative ease or a numerical revision threshold.
- **Disposition:** Qualify as a local recommendation/inference conditional on actual volume, correction frequency, and owner tolerance for duplicate bytes. No evidence-backed replacement identified here.
- **Affected:** Brief 1; package/version choice and owner input on snapshot depth.

### SCW-2 — native version model

- **C:** BagIt validates its enumerated package paths/checksums but does not itself model successor states for corrected assets. **C*:** The same statement about successor-state modeling applies to OCFL. **Delta:** product, “BagIt” → “OCFL.”
- **Evidence:** S01 defines bags as storage/transfer layout and enumerated payload/tag manifests; S02 requires continuous object versions and inventories with per-version state. The format distinction is scope-bearing. `[S01 §§1.1, 2.1.3, 3; S02 §§3.3, 3.5.3]`
- **Relations:** C **ENTAILS**, scoped to BagIt’s specified behavior (custom local tags can record relationships but are not a native version model); C* **CONTRADICTS**, because OCFL defines object version states.
- **Disposition:** Retain, with “native” understood. BagIt snapshots plus a separate register remain one design choice; OCFL is the alternative for native history.
- **Affected:** Brief 1–2; correction handling and disposition of the overwrite-in-place ZIP assumption.

### SCW-3 — historical inventory scope

- **C:** Each historical inventory’s manifest references every file in that inventory’s version directory. **C*:** Each current inventory’s manifest references every file in that inventory’s version directory. **Delta:** inventory scope, “historical” → “current.”
- **Evidence:** S04 change log states the clarification for each historical inventory and its own version directory; S02 §3.3.1 makes the content-directory/version-inventory relation explicit. S03 documents the original ambiguity and #547 closure. `[S02 §3.3.1; S03 issue description/status; S04 v1.1.0 clarification]`
- **Relations:** C **ENTAILS**; C* **ENTAILS**. This is a nondiscriminating result, not evidence that the historical wording is wrong; both inventory scopes have rules.
- **Disposition:** Retain. Preserve the released clarification’s own-version-directory wording and keep the separate inference to copy/validate the whole OCFL object explicitly marked as local-storage guidance.
- **Affected:** Brief 4; historical-copy depth and version-history validation.

### SCW-4 — SHA-512 modality

- **C:** RFC 8493 says tools SHOULD enable SHA-512 by default for new BagIt 1.0 bags. **C*:** RFC 8493 says tools MUST enable SHA-512 by default. **Delta:** requirement modality, SHOULD → MUST.
- **Evidence:** S01 §2.4 / RFC 8493 lines 679–685 distinguishes MUST support for SHA-256 and SHA-512 from SHOULD enable SHA-512 by default. `[S01 §2.4]`
- **Relations:** C **ENTAILS**; C* **CONTRADICTS**.
- **Disposition:** Retain the recommendation as an owner choice; state tool support for both algorithms separately from the default recommendation. A product’s actual behavior remains untested.
- **Affected:** Brief 6; custodian algorithm decision.

### SCW-5 — custom tag semantics

- **C:** `bag-info.txt` is optional human-use metadata; other tag files are allowed, but generic implementations that do not understand a custom tag ignore its contents. **C*:** A processor locally extended to understand this gallery’s CSV assigns standard BagIt semantics to its inventory fields. **Delta:** processor scope, generic/unextended → locally extended.
- **Evidence:** S01 §§2.2.2, 2.2.4 allows human-readable metadata/arbitrary tags and specifies handling of unknown tags; custom CSV field meaning remains local. No gallery-specific processor was identified or tested. `[S01 §§2.2.2, 2.2.4]`
- **Relations:** C **ENTAILS**; C* **UNDETERMINED** by the RFC because an extension would be local behavior.
- **Disposition:** Retain the CSV as optional local content, not a BagIt-provided semantic capability; keep its bytes manifested and validate staff readability in the proposed pilot.
- **Affected:** Brief 5; optional inventory support and interoperability.

### SCW-6 — filename normalization applicability

- **C:** RFC 8493 documents that different filesystems/utilities may normalize names differently, so a path that looks identical may fail exact manifest lookup; it recommends normalization-aware tolerance. **C*:** The same cross-filesystem failure is established for a copy that stays on one unchanged filesystem with no normalizing utility. **Delta:** applicability condition, cross-filesystem → same-filesystem/no-normalizing utility.
- **Evidence:** S01 §§6.1.1–6.1.2 specifically discusses cross-system normalization/case behavior and common utilities; it does not establish a failure under the narrowed C* condition. Do not infer universal safety or risk from silence. `[S01 §§6.1.1–6.1.2]`
- **Relations:** C **ENTAILS**; C* **UNDETERMINED**.
- **Disposition:** Retain cross-platform warning; qualify as platform/transfer-tool dependent. Test the actual mixed-platform names and tools if used.
- **Affected:** Brief 3; path reconciliation and pilot filenames.

## Ordinary full-brief / exact-plan review

| Brief obligation | Assessment and exact-plan disposition |
|---|---|
| **1. Compare two preservation packaging/versioning approaches and analogous identity/custody mechanism.** | **Covered.** BagIt and OCFL have distinct package vs object-history roles; PREMIS-inspired event log and git-annex are useful bounded alternatives. Draft explicitly rejects the plan’s ZIP overwrite contradiction. No need to imply either format is mandatory. |
| **2. Identity, corrections, manifests, integrity vs provenance/completeness.** | **Covered.** Exhibition, asset, version and deposit IDs are separated; digest identity is separated from registrar intent and custody. Keep the “BagIt does not model” statement scoped to the standard’s native model (SCW-2). |
| **3. Bounded copy/restore and named failures.** | **Covered as proposed, not run.** Source/destination checks, separate path-set and digest results, staging restore and failure preservation are clear. A manifest can pass while an intended asset is omitted from both payload and manifest; registrar inventory review is correctly assigned to detect this. No restore or product validation occurred. |
| **4. Released history and ordinary storage impact.** | **Mostly covered.** Issue #538 and v1.1.0 clarification are accurately distinguished from a reported incident. Copying the whole OCFL object is an inference, not the issue’s direct finding. **Material wrong:** in “Bounded released issue…” the draft says 1.1 “requires … per-version inventory sidecars.” OCFL 1.1 §3.7 says a root inventory **MUST** exist, while each version-directory inventory **SHOULD** be included; §3.6 requires a digest sidecar for every inventory file that exists. This upgrades a SHOULD to a MUST and may overstate package requirements. Correct the claim in any later final. |
| **5. Optional human-readable inventory.** | **Covered and retained at the right status.** CSV/README is an authorized optional local choice, not mandatory or standardized; bag-info and custom-tag semantics are correctly bounded. Readability/maintenance remain proposed checks and owner inputs. |
| **6. Ownership and explicit owner choices.** | **Covered.** Registrar owns intended completeness and version relationships; custodian owns copies/restores. SHA-512 recommendation vs SHA-256 owner choice and package depth are distinguished. **Minor incomplete wording:** RFC 8493 says tools MUST support SHA-256 and SHA-512, and SHOULD enable SHA-512 by default. “SHA-256 is also supported” should not obscure the support obligation; neither hash choice nor actual tool behavior was executed. |
| **7. Negative constraints.** | **Preserved.** No originals moved; no account, live write, untested platform replacement, or unsupported authorship/recoverability claim. |
| **8. Coherent proposal, useful discovery, unresolved inputs, validation table.** | **Covered at planning level.** The draft distinguishes research reads from product validation and marks package, CSV, and restore checks proposed/not run. It identifies practical owner inputs. The critic’s finding is a material correction to the fallible draft, not authority to write a final. |

### Other scope risks outside the fixed six

- **SCW_NOT_RUN — OCFL sidecar obligation wording:** material error recorded above under obligation 4; not added to the fixed SCW selection.
- **SCW_NOT_RUN — actual revision volume/storage costs:** no bytes, counts, cadence, or toolchain were provided; the draft correctly leaves these as owner inputs, so no threshold-based product winner is externally established.
- No scope reduction is warranted. No other material false correction found in this review.

## Executed vs proposed

**Executed:** read the complete frozen brief, investigator discovery and draft, investigator source map, released plan and reveal record; navigated the carried source index and all six evidence notes; independently opened the official BagIt RFC 8493, OCFL 1.1 specification and change log, OCFL issue #538 and releases, Library of Congress PREMIS v3.0 PDF, and git-annex manuals. These were read-only source checks.  
**Not executed:** no package or inventory created; no BagIt/OCFL/git-annex/PREMIS implementation or validator run; no file-copy, rename, mismatch injection, staff CSV opening, offsite access, or restore. All pilot checks in the draft remain proposed/NOT_RUN.
