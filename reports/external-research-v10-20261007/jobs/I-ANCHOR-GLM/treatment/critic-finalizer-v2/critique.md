# Critique — ER10 I-ANCHOR-GLM treatment critic-finalizer v2 (2026-10-07)

Stage-owned independent critique of the frozen research-v2 draft (`../research-v2/draft.md`) against the integrated brief and frozen sandbox plan v1. Predecessor IDs SRC-01…SRC-11 and CHK-1/CHK-2 are preserved with exact locators from `sources/index.json`, `sources/retrieval-stamps.json`, `sources/executed-checks.json` (fetch window 2026-10-07T18:51:01Z–18:58:10Z; HEAD re-verification 19:06:34–19:06:37Z, all HTTP 200; evidence saved 18:59:15.120Z). New stage-owned IDs CF-01/CF-02 are minted here and never rebound. Executed items are marked **[executed]**; everything else is assessment or proposal. No coordinator subject answers are included.

## CF-01, CF-02 — this stage's independent re-execution **[executed]**

- **CF-01 (CPython 3.14.4 `zipfile`, at 2026-10-07T19:26:01Z, isolated /tmp tempfiles, no sockets/secrets, cleaned up)**: archive with `../../evil_cf.txt` + `ok_inside.txt`; `extractall` landed `evil_cf.txt` inside the destination directory, parent listing contained only the zip and bundle — no escape. Independently confirms CHK-1 (executed-checks.json, atUtc 18:57:23.884Z): CPython strips traversal components (sanitization), it neither escapes nor raises, and silently reshapes a bundle that intended `../shared/x.png`.
- **CF-02 (SQLite 3.46.1 via python3 sqlite3, same run)**: trigram query `美术馆` matched `Musée Rodin 美术馆 Cézanne`; `anne` and `zanne` matched (confirming the draft's corrected-probe history and its note that `sanne` is not a substring); `unicode61 remove_diacritics 2` folded `cezanne`→`Cézanne`; ICU tokenizer absent (`no such tokenizer: icu`). All consistent with CHK-2 (atUtc 18:57:23.888Z, corrections 18:57:50.495Z and 18:58:10.225Z). **New finding the draft missed**: trigram query `美术` (2 chars) returned no match — trigram cannot answer sub-3-character CJK queries (SRC-02 documents the 3-char minimum). See §4.

The predecessor's executed-check hygiene is confirmed: CHK-2's invalid probes (`éez`, `sanne`) were recorded and replaced honestly in the evidence file; proposed-vs-executed discipline in draft §0–§11 is correctly drawn (§10.1's power-cut harness is correctly marked to-run-on-hardware, not executed).

## 1. Consequential primary sources and conditions

- **SRC-01 (Zip Slip)** is consequential and correctly load-bearing: plan v1's unzip-over-active-directory is the vulnerable shape for hand-rolled extraction. Condition to keep: the affected-library list is the 2018 disclosure page's; the durable control is the updater's own traversal regression test (draft §4, §10.2), not library avoidance — supported.
- **SRC-04 (TUF spec v1.0.36, rev 2026-08-05)** carries the integrity argument. Correction-by-addition (still supported): the draft's minimal subset (signature + monotonic + expiry, §2.4) omits **key rotation**. With one offline museum signing key and the root anchor in firmware, a compromised curator key has no recovery path short of re-flashing every kiosk. Disposition: keep the minimal subset for courier-fed kiosks, but record key-escrow + scheduled rotation procedure as an explicit operational requirement now, and full-TUF root rotation as the fleet-scale upgrade path. This is a supported correction to a plan choice, not a new mechanism.
- **SRC-06/SRC-07 (A/B slots)** and **SRC-08 (OSTree)** are used as design analogies with the limitation stated (draft §9: OS-partition mechanics, no kernel/bootloader on the content path) — correct discipline; §2.2's extract-verify-fsync-flip is the right content-scale reduction.
- **SRC-02/SRC-03 (FTS5 docs, 3.34.0 changelog)** support the search replacement. Conditions kept: tokenizer behavior is build-dependent (ICU absent in the pinned build, confirmed twice now: CHK-2, CF-02), and the schema must declare tokenizer options and be tested on the shipping build.
- **SRC-10 (WCAG 2.2)**: kiosk-correct SC set; keep the draft's condition that 1.3.4's fixed-orientation "essential" exemption needs the museum's hardware justification on record.
- **SRC-11 (WebKitGTK 2.54.1)**: weaker than the rest — a directory listing ("release notes not fetched" per the evidence note) is thin pinning for a security-baseline claim. Supported disposition: at packaging time, pin the exact release page + `.asc`/`.sums` artifacts, and track the 2.54.x series for security releases; treat 2.54.1 as observed-stable-as-of-retrieval only.
- **SRC-05 (Uptane)**: draft's use is correctly limited to its stated compromise-resilience philosophy (Director/Image split not fetched — draft §8).
- **SRC-09 (DOMPurify v3.4.16)**: claims match the README evidence (secure default; post-sanitization edits void it; jsdom required server-side; happy-dom unsafe). Release date uncaptured — kept as justified uncertainty (draft §8); does not affect the posture argument.

## 2. Materially different mechanisms and useful alternatives

Draft §3's A/B table is genuinely two-mechanism-deep per row and its rejections are evidence-backed: partition-style slots (SRC-06/07) rejected as heavier than content needs; full TUF roles (SRC-04) deferred as operationally heavy at courier scale; ingest-only sanitization (SRC-09) rejected as fidelity-losing with the sanitizer as single trusted component; ICU/custom tokenizers rejected for compile/footprint cost with ICU absent in the pinned build (CHK-2/CF-02). Useful additions, both supported by already-cited sources: (a) trigram tokenizer also serves LIKE/GLOB index acceleration (SRC-02 keyEvidence) — a free latency win the draft leaves unstated; (b) threshold signing (TUF key-compromise role, SRC-04) is the natural mid-point between one key and full TUF if a second curator exists — record as optional, not required.

## 3. Pinned component/code behavior

Consolidated view (draft §5) verified where locally checkable: CPython 3.14.4 stripping-not-rejecting (CHK-1 + CF-01); SQLite 3.46.1 trigram present, ICU absent, remove_diacritics 2 folding (CHK-2 + CF-02). **Correction to §5's framing**: the remove_diacritics 1→2 fix-entry (draft §4) could not be version-pinned (draft §8 admits), yet §5 lists it under "behavior claims pinned to these exact versions". Supported disposition, requiring no new fetch: pin mode 2 in the shipped schema and add the U+1ED9-style regression query (draft §4/§10) — the disposition is valid because the shipping build (3.46.1) demonstrably has mode 2, not because the landing version is known. §5 should state that reasoning explicitly.

## 4. Issue/fix/regression/release applicability — with one substantive gap

Zip Slip fix-pattern and regression-test applicability (draft §4) are sound; A/B→Virtual A/B evolution (SRC-07) correctly supports versioned-trees-over-partitions for content. **Substantive gap — sub-3-char CJK queries**: CF-02 **[executed]** shows trigram returns no match for `美术`. Museum labels are full of 2-character CJK words (e.g., 陶芸, 彫刻). Draft §2.6 and the trigram row of §3 claim CJK/substring coverage without this boundary; the §10.4 relevance matrix must add a 2-char CJK query class, with dispositions: fall back to `LIKE '%…%'` scan for short queries on the per-edition corpus (bounded size, indexed-table latency acceptable), or prefix-expansion at index time. This is a supported correction to the search proposal, not a replacement of it.

## 5. Discoveries against plan choices (per element)

Keep/correct/reject verdicts in draft §6 all check against evidence: ZIP+manifest kept with signature/hashes/expiry/monotonic (SRC-04); unzip-over-active rejected (SRC-01, CHK-1, CF-01); web view kept but confined (§2.7); scan-text search rejected (SRC-02, CHK-2, CF-02); manifest-version trust rejected (SRC-04 taxonomy); central server kept with preview/approve/sign gate. Every unspecified obligation in plan v1 (integrity, atomicity, hostile content, multilingual search, accessibility, rollback) is covered — with the §4 short-query boundary above as the one coverage correction.

## 6. Supported dispositions, optional leads, uncertainty, validation

- Supported dispositions worth preserving verbatim: "sanitization, not rejection" for CPython zipfile; "assume compromise, minimize damage, assure rapid recovery" scoping for Uptane; OSTree-model-at-content-scale explicitly not a citation of Deployments internals; tokenizer options declared and tested on the shipping build.
- Optional leads (draft §7) are correctly non-required; delta-sync and fleet manifests are the two with real operational payoff.
- Justified uncertainties (draft §8) stand as written; add none and remove none except as affected by §3/§4 above (both now dispositioned).
- Validation additions: §10.4 gains the 2-char CJK class (§4); §10.3 gains a key-compromised-curator recovery drill once the rotation/escrow requirement (§1, SRC-04 item) is adopted; §10.1 stays hardware-scoped and unexecuted.
- Proposed-vs-executed: executed = source retrieval + CHK-1/CHK-2 + CF-01/CF-02; every §2/§10 mechanism and test remains a proposal until §10 runs. This critique adds no unverified factual claims beyond the CF runs above.

*Stage-owned CF-01/CF-02 evidence (this stage, 2026-10-07T19:26:01Z, CPython 3.14.4 / SQLite 3.46.1, isolated, no sockets/secrets, cleaned up) is recorded in this file and in the stage's timings/receipt artifacts; predecessor evidence files were not modified.*
