# I-METHOD-04/control/critic-v2 — independent critique

**Status:** DIAGNOSTIC_UNQUALIFIED. This is a scientific review of the admitted proposal, not a product-quality or speed result. No application, media conversion, or synthetic-media validation was run.

**Handoff:** Keep the research-v2 proposal as the working draft and carry forward the supported findings below. Preserve the corrections and unresolved choices in the fresh final; do not turn conditional or unresolved findings into agreement.

## 1. Overall assessment

The proposal substantially covers frozen P1–P6. It is strong on preserving original bytes, separating observations from corrections, requiring explicit derivative choices, distinguishing package fixity from audio-data checksums, and refusing to treat Payload-Oxum as cryptographic validation. Its rejection of bagit-python v1.9.0 as a BagIt 1.0 writer is supported by the pinned code and RFC. Its account of the pool-constructor regression is appropriately narrower than the upstream fix.

Retain the proposed plan as a complete planning artifact, with these corrections before treating it as a stable recommendation:

1. If BagIt is selected, follow RFC 8493’s recommendation to enable SHA-512 by default, or record why SHA-256 is the compatibility choice. The proposal hard-codes SHA-256 without explaining the choice.
2. Describe reopen results as manifest/path discrepancies. A validator can report a missing manifest path and an unlisted new path; it cannot establish that they are one file intentionally renamed.
3. Tighten the copy contract around changed or removed source media. Specify which byte observation is authoritative, how a source change during copying is detected, and what “complete” means after interruption and restart.
4. Keep BagIt as a conditional format option until the product establishes an interoperability need and a path policy. Current evidence supports BagIt as a useful candidate, but the frozen brief does not require interchange with BagIt consumers.

These are corrections and open decisions, not reasons to discard the draft. The research validates no implementation or preservation-quality claim.

## 2. O1–O6 audit

| Obligation | Finding | Critic disposition |
|---|---|---|
| O1 — open discovery | Brief-led findings go beyond the initial plan: Archivematica is a workflow analogy, BWF MetaEdit a metadata-validation analogy, and BagIt a package-format candidate. Cited documents support bounded claims about fixity, derivatives, metadata, and package completeness. | Retain with a scope label. This is useful discovery, not a survey of local ingest applications or audio components. Do not imply parser, decoder, encoder, playback, or desktop-workflow options were compared. |
| O2 — pinned code and governing context | The proposal pins bagit-python v1.9.0 to a commit and inspects make_bag, Bag.validate, _validate_contents, _validate_entries, and _encode_filename alongside RFC 8493. | Retain. State explicitly that full validation must not use fast=True or completeness_only=True. Neither proves manifest hash equality. |
| O3 — issue/fix/regression/release | The #173 / #183 history is pertinent. The pinned release contains the merged close/join change and test_validate_pool_error; that test simulates Pool construction raising. | Retain, with the caveat strengthened. No pinned regression test here exercises pool.map() raising after Pool construction, and the pinned close/join calls occur after a successful map rather than in a finally block. Do not call that exceptional path fixed. The #153 / #154 file-URI change is accurate but peripheral because this product should reject fetch.txt. |
| O4 — every in-scope decision | The draft separately disposes P1–P6 and does not infer coverage outside the supplied slice. | Retain. Attach the path and checksum corrections below to P1/P4/P6. |
| O5 — fresh criticism | This review independently checks the material claims and records agreement and disagreement. | Carry this critique forward in substance. Preserve unresolved checksum, format/interoperability, path, and copy-race choices. |
| O6 — complete proposed-change artifact | The research draft supplies replacement sections for P1–P6, alternatives, already-covered matters, rejected leads, uncertainties, and a proposed/executed distinction. | Retain as a complete proposal, not validated design. Add §3 corrections and preserve §4 open choices. Do not collapse proposed tests into executed evidence. |

## 3. Evidence-supported corrections

### 3.1 BagIt checksum default

RFC 8493 §2.4 says implementations should support SHA-256 and SHA-512 and should enable SHA-512 by default when creating new bags. The research plan instead fixes manifest-sha256.txt and tagmanifest-sha256.txt, and P1 also specifies SHA-256 for copy comparison. SHA-256 is valid and usable, but the BagIt default recommendation is a material condition the proposal omits.

**Correction:** for BagIt output, default to SHA-512, optionally adding SHA-256 for compatibility if needed. If product owners prefer SHA-256 alone, record the compatibility rationale and test that profile. Keep the copy digest decision separate from the BagIt-format default; the RFC recommendation does not settle the copy digest. [S01 §2.4]

### 3.2 A path mismatch does not prove a rename

RFC 8493 defines payload manifests as path-to-checksum lists and requires every v1.0 payload file to be listed. Full reopen can identify missing manifest entries, unlisted payload files, and checksum mismatches. It cannot infer that a missing path and an unlisted path are the same file intentionally renamed.

**Correction:** report “expected path missing,” “unlisted path present,” or “checksum differs at path.” A product layer may suggest a rename pairing, but label it as a heuristic and keep both raw findings. Change P6’s rename case to check both path discrepancies without claiming BagIt proves a rename. [S01 §§2.1.3, 3]

### 3.3 Copying from removable media

The proposal requires source and destination hashes, a temporary destination name, and visible incomplete states. These are good additions, but it does not state when each digest is taken or how it handles a disconnected or changed source. If the source changes during the copy, hashes taken at different times can make comparison ambiguous.

**Correction:** define the byte stream and observation the copy attests to. At minimum, hash bytes as read and the completed destination bytes, fail closed on read/write errors, and record when a second stability check was unavailable. Specify recovery after disconnect, partial write, restart, or destination flush failure. Do not imply matching hashes prove durable storage after power loss unless the implementation performs and verifies the needed flush/readback. Add synthetic cases for removal/read failure, source change during copy, destination write failure, and restart with a partial temporary file. These are design proposals; none was executed here.

### 3.4 State the validator contract precisely

At the pinned commit, Bag.validate defaults to fast=False and completeness_only=False. fast=True returns after Payload-Oxum; completeness_only=True returns after completeness checks without comparing hashes. The pinned test test_validate_flipped_bit shows a same-size byte change is caught by ordinary validation but passes fast and completeness-only validation. [S02 Bag.validate / _validate_contents; S03 test_validate_flipped_bit]

**Correction:** preserve the proposed “full checksum validation” requirement. Check every manifested payload and tag file against the chosen manifest. Do not equate “complete,” Oxum match, or fast/completeness-only operation with fixity verification. BagIt validation does not establish that audio is decodable, a derivative sounds acceptable, or original embedded metadata is correct.

### 3.5 Pool cleanup remains a test question

The live #173 issue describes multiprocessing failures involving Pool setup/map and worker cleanup. PR #183 merged in 2024, and v1.9.0 lists it. The pinned _validate_entries now calls close() and join() after pool.map(); the regression test patches the Pool constructor to raise and checks the original RuntimeError escapes. The pinned code does not put close/join in a finally block. The research draft correctly limits the shipped fix to the evidenced successful-map and constructor-error paths. [S03, S04, S07, S08, S16]

**Disposition:** keep the map-failure case as a proposed adopter check, not an upstream regression claim. If parallel validation is not required for 100 files, single-process validation remains a simpler alternative; performance and lifecycle trade-offs were not measured.

## 4. Full P1–P6 disposition

| Plan | Existing coverage to preserve | Critic’s correction or open point |
|---|---|---|
| P1 — batch capture | Keep WAV/BWF, FLAC, MP3, source immutability, original paths, copy fixity, and interrupted-copy states. Staging and per-file states are useful additions. | Preserve the exact original source path in the record. Define handling for unrepresentable names, target case/normalization collisions, and source disappearance. Any storage-path mapping must be visible, deterministic, reversible, and must not overwrite or silently discard an original. |
| P2 — inspection | Observation/correction separation is already present and should remain. Read-only inspection and visible parser/version/error distinctions are useful additions. | Keep BWF rules optional and scoped. No evidence here validates one metadata parser for all formats or the waveform/playback mechanism; those remain choices, not findings. |
| P3 — derivatives | Explicit request, user settings, preview, derivative link, original preservation, and failure/interruption disposition are already in P3. Tool/version/settings and stable source identity are useful additions. | Define “preview”: a settings/property preview differs from listening to a generated preview copy. Keep codec, channel handling, and quality/file-size trade-offs unresolved. LOC preservation-master preferences do not select an access-copy recipe. |
| P4 — package | Preserve originals, derivative references, provenance, fixity, transformation settings/tool version, and reopen checks. BagIt 1.0 is plausible; a custom versioned directory manifest is a stated fallback. | Use SHA-512 by default for BagIt unless there is a recorded reason for SHA-256. Report path discrepancies, not inferred renames. Reject fetch.txt for this product as a product policy, while noting the format itself permits it. |
| P5 — components/environment | Offline Windows/Linux, no upload, and no source metadata edits for display are frozen constraints. Separate parser, playback, transform, and package adapters are sensible options. | Do not treat BagIt or bagit-python as a selected dependency. No decoder, encoder, playback, or format-inspection component was researched to pinned code. Require version, license/distribution, mutation, malformed-input, and network evidence before selection. |
| P6 — acceptance | Preserve synthetic interrupted-copy, malformed-metadata, unusual-channel, conversion, and package-fixity cases. Same-size mutation, path edge cases, offline reopen, and 1/100-item checks are useful additions. | Adjust rename expectations as in §3.2; add source-change/removal/write-failure cases as in §3.3; add BagIt SHA-512/default-profile and percent-encoding cases. These remain proposed. |

The proposed P1/P2/P3/P4/P6 corrections mostly make frozen requirements testable; label them as additions rather than missing user requirements. P2’s separation of observations and corrections, P3’s explicit request and original retention, P4’s provenance/fixity/settings/reopen intent, and P6’s baseline synthetic cases are already covered.

## 5. Retained, rejected, optional, and uncertain findings

### Retain

- RFC 8493 as a format candidate: it handles opaque payload bytes, uses manifests, and defines complete versus valid bags. Whole-file package fixity is distinct from audio-bitstream integrity. [S01]
- Staged local workflow and explicit derivative/provenance states.
- BWF MetaEdit only as an analogy for visible, optional BWF-specific checks; not as justification for automatic edits or general FLAC/MP3 behavior. [S11–S13]
- Archivematica as a larger-workflow analogy, not a scope-matched application recommendation. Its manual-normalization limitations (one-to-one mapping and filename assumptions) support stable explicit source/derivative relationships, but do not justify inheriting its workflow wholesale. [S14, S15]
- The statement that there was no build, media processing, benchmark, or conversion validation.

### Reject or keep rejected

- Reject Payload-Oxum-only “valid” status. RFC 8493 calls it an optimization and requires standard checksum validation before declaring validity. [S01 §2.2.2]
- Reject embedded BWF audio-data MD5 as the only original/package fixity; it covers audio data, not every file byte. [S12]
- Reject automatic embedded-metadata edits during inspection and a default access-copy conversion recipe.
- Reject bagit-python v1.9.0 make_bag() on removable originals: the pinned implementation moves the directory’s children into data/ and writes BagIt-Version 0.97. Do not treat it as a BagIt 1.0 writer. [S02, S04]
- Reject this pinned writer for BagIt 1.0 filenames containing literal percent signs: RFC 8493 requires percent encoding of %, CR, and LF in manifest paths; pinned _encode_filename encodes CR/LF only. Issue #157 was open in the direct review-time public view. Scope this rejection to this pinned version and behavior, not every release or every validator. [S01 §2.1.3, S02, S18]
- Reject fetch.txt/deferred payload for this offline, complete-local product. That is a product constraint, not a claim that BagIt disallows it.

### Optional / low priority

- Keep #153/#154 file-URI support as accurate history, but not a core product requirement while the plan rejects fetch.txt. At review time #153 is closed, #154 is merged and listed in v1.9.0, while conformance-suite PR #14 remains open. [S04–S06, S17]
- Consider additional interoperability profiles only if a stakeholder establishes a consumer requirement. The supplied plan does not justify broadening discovery to many formats merely for completeness.

### Uncertain / product decisions still needed

- Whether BagIt interoperability justifies BagIt over the custom directory manifest, and which checksum profile to expose.
- Windows/Linux path normalization, collision handling, unrepresentable names, and the visible mapping/recovery contract.
- Format-identification and metadata parser, audio decoder/encoder/playback components, pinned versions, and distribution terms.
- Meaning of derivative “preview,” listening-copy profile(s), channel handling, partial-file retention, cancellation, and retry semantics.
- Source-stability and destination-durability guarantees after interruption or power loss.
- Whether 100 files require parallel validation; no performance threshold or test is claimed.

No material over-rejection was found: the draft rejects one named writer/version for evidenced 0.97 and percent-encoding behavior and otherwise leaves the writer undecided. Do not broaden that into “BagIt is unusable” or “bagit-python cannot validate packages.”

## 6. Validation and evidence limits

**Directly checked:** the full frozen brief and P1–P6 plan; full admitted research artifact and complete source map; exact dispatch config; byte-copied primary-source captures from this same arm; RFC requirements; pinned code/tests; and live issue/PR/release status for selected component history. Copied source lengths and SHA-256 values were checked against the predecessor map. Direct public checks covered RFC 8493, pinned bagit.py, v1.9.0 release notes, issues #153/#157/#173, PRs #154/#183, and conformance PR #14. IDs/URLs are in [source-map.json](source-map.json); local captures are under sources/.

**What executed checks establish:** the copied bytes match their recorded source-map lengths and SHA-256 values, and the pinned source/public history was available for review. They do not establish that the application can copy, parse, convert, package, reopen, or preserve audio correctly.

**Proposed, not run:** the research plan’s synthetic acceptance cases and this critique’s source-change/removal/write-failure, SHA-512 profile, path-mismatch, and pool-map-failure cases. No tests, builds, local media processing, or downloaded-code execution were performed.

## 7. Criticism disposition for the fresh final

Preserve these as accepted corrections:

1. Specify SHA-512 as BagIt creation default or record the reason for SHA-256.
2. Report manifest path discrepancies without claiming a semantic rename.
3. Specify source-change, disconnect, write-failure, and restart behavior for staged copy; distinguish fixity from durability.
4. Keep the pool-map exceptional cleanup path unproven and test it if parallel validation is adopted.

Preserve these as unresolved disagreements/product choices:

1. BagIt is a candidate, not a demonstrated requirement; choose it only after confirming interoperability value and path constraints.
2. File-URI fetch support is component history, not a desk requirement while fetch.txt is rejected.
3. Parser, codec, playback, and transform choices remain open and have no pinned-code evidence.
4. “Preview” and partial-derivative policy need a product decision.

Preserve these accepted research conclusions:

- The v1.9.0 in-place make_bag() and manifest percent-encoding behavior disqualify that writer for the proposed BagIt 1.0 use.
- Full validation must compare hashes; Payload-Oxum and completeness-only checks do not.
- The cited analogies are bounded and do not make a component recommendation.

## 8. Operations and accounting

- **Dispatch bound:** dispatch-config.json sets a 900-second stage allowance, fixed critic deadline 2026-10-07T21:17:00.069991+00:00, frozen whole-arm deadline 2026-10-07T21:47:52.249474+00:00, 1,200-second final reserve, and no-reset rule. Prospective preparation T0 remains 2026-10-07T20:47:52.249474+00:00; this review did not reset or extend it. The Goal was created at 2026-10-07T21:02:37Z and this artifact was completed within the fixed critic stage.
- **First useful critic finding:** the pinned regression test covers Pool-constructor failure, not pool.map() failure after Pool creation; direct review of the pinned test/code and issue began at approximately 21:05Z. Public tool events do not expose exact per-request timestamps.
- **Inputs read:** exact input map (1,808 bytes), dispatch config (1,146), brief (5,140), plan (1,718), full research-v2 artifact (26,789), and full research-v2 source map (9,785): 46,386 bytes total across these six local inputs. No INPUTS.md, parent history, campaign/evaluator packet, other arm, scored answer, or unrelated local files were read.
- **Source bytes:** 18 exact own-arm predecessor captures copied byte-for-byte under this candidate’s sources/, total 2,535,372 bytes per the captured source map. Independent public checks are separately disclosed in source-map.json; inherited capture times are not represented as fresh retrieval times. No captured code was executed.
- **Operations:** created one fresh native Goal with no token budget; confirmed the same identity active; sent exactly one activation-only notice to the specified supervisor thread; read the fixed dispatch config and admitted inputs; independently opened the named public primary sources; copied and hash-checked this arm’s predecessor source bytes; wrote this full critique and source map. No nested delegation, semantic cache/oracle/bundle, repository/canonical edit, issue/PR/message, external runner, installer, worktree, or third-party contact was used.
- **Full output:** this complete critique is artifact.md; its local primary-source captures are linked from source-map.json. No partial native-output fallback or summary substitute was used.
- **Separate accounting:** input bytes = 46,386; captured/copied public-source bytes = 2,535,372; web transfer/cache bytes = null (not exposed); stage-specific reasoning tokens = null; billing = null. A native Goal snapshot at approximately 2026-10-07T21:07:57Z reported aggregate tokensUsed=129721 and timeUsedSeconds=320; these are Goal counters, not critic-stage counters, and are reported separately without summing. No cost amount is inferred.

