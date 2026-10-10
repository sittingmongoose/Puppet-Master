# Independent ER12 Track B assessment — B-DISC-M-02 / treatment-v1

**Source judgment: FAIL.** The submitted discovery makes two material errors in its central leakage/rotation comparison. F1 confuses Restic's internal plaintext blob identity with store-visible storage identity; F2 presents loss of cross-epoch deduplication as a necessary consequence of true encryption re-keying. Neither result follows from the cited designs. This is a bounded discovery-role judgment, not full-pipeline qualification, a comparison to another arm, or an ER11 rescore.

Reviewer: `codex-er12-bdisc-m02-review-v1`. Review began 2026-10-10 04:42:45 UTC; saved 2026-10-10T04:49:52.212210+00:00. One actual native Goal was activated before substantive source/case inference. This report and its JSON/source map are saved before reviewer native completion. No delegation, candidate feedback/repair, account operations, Git or publication occurred.

## Governing assignment and full inspection

The complete rubric, mapped shared assignment and fixture, role assignment/input map/input freeze, authored [discovery.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/discovery.md), [candidate source-map.json](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/source-map.json), and every member of the candidate `sources/` directory were read in full. The map declares `corpus: null`, so no supplied corpus is missing. The input manifest, saved native activation receipt, own dispatch evidence, root review request and this arm's host terminal observation were also read. No other candidate science or outcome labels, shared roster, or earlier assessment was read.

[inspected-artifacts.json](inspected-artifacts.json) records exact paths, SHA-256, byte counts, read extent and mtimes. [freeze-check.json](freeze-check.json) records all five frozen input comparisons as matching and no changes to inspected candidate artifacts during review. The stage `freeze.json` is an input freeze. No output/terminal-science freeze was present at the three exact inspected target-arm locations; terminal hash immutability therefore remains UNKNOWN. The host observation is separate: `mechanics/task-observations/er12-B-DISC-M-02-treatment-role-v2.json`, `actual_response.structuredContent`, reports completed/result_available and no pending child runs at 04:42:21.697 UTC. It does not prove native Goal completion.

A filename-only search for a terminal-freeze locator enumerated unrelated filenames; no contents or status/outcome labels at those paths were read or used. All semantic evidence comes from the assigned science and independent primary retrievals.

## Material findings

### F1 — Incorrect Restic confirmation oracle

Exact candidate locators:

- [discovery.md, line 11](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/discovery.md:11): “the store sees plaintext hashes, so (inference) a candidate chunk's presence is confirmable — identity doubles as a confirmation oracle.”
- Line 32's Restic leakage cell: “Plaintext-hash oracle; sizes (mitigated)”.
- [Line 42](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/discovery.md:42): “Plaintext-hash IDs say yes, keyed/HMAC IDs say no. Test by hashing a known chunk and looking it up in a trial repository.”

Governing primary: [Restic References, Repository Format](https://restic.readthedocs.io/en/latest/100_references.html#repository-format), [Pack Format](https://restic.readthedocs.io/en/latest/100_references.html#pack-format), and [Unpacked Data Format](https://restic.readthedocs.io/en/latest/100_references.html#unpacked-data-format). Snapshot P1 is restic 0.19.1-dev `latest`; relevant saved [numbered text](primary-evidence/P1-restic-references.txt), lines 89–121, 187–228, 244–268 and 303–309.

The primary distinguishes internal plaintext blob hashes from storage IDs. Pack headers and indexes containing those hashes are encrypted/authenticated. Store-visible filenames identify the stored encrypted bytes, including packs. Thus the untrusted store, lacking repository decryption credentials, cannot simply hash candidate plaintext and compare it to exposed plaintext IDs. A password-bearing client can consult the decrypted index, but that does not demonstrate a store-side oracle. A hypothetical design publishing raw plaintext IDs could have such an oracle; the cited Restic design does not publish those IDs in that way.

This error changes the requested failure boundary, tradeoff comparison and prospective privacy test. It is material even though the sentence is labelled inference. The supported CDC, random-IV authentication and password re-wrap mechanisms remain useful. This finding does not assert that Restic hides all lengths/access patterns or has no other attacks.

### F2 — Unsupported universal consequence of encryption re-keying

Exact candidate locator: [discovery.md, line 43](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/discovery.md:43): “Distinguishes re-wrap-only rotation (cheap, keeps data keys) from true re-keying (expensive, breaks cross-epoch dedup).”

Governing primary: [BorgBackup 1.4.5, Encryption](https://borgbackup.readthedocs.io/en/stable/internals/security.html#encryption), snapshot [P2](primary-evidence/P2-borg-security.txt), lines 113–152. It explicitly assigns independent identity, encryption and authentication keys; the ID formula depends on `id_key` and plaintext, while encryption depends on `enc_key`. The [Tarsnap cryptography page](https://www.tarsnap.com/crypto.html), [P3](primary-evidence/P3-tarsnap-crypto.txt) lines 18–27 and 39–46, likewise separates session encryption from HMAC naming. [Restic Threat Model](https://restic.readthedocs.io/en/latest/100_references.html#threat-model), P1 lines 654–656 and 729–736, distinguishes password changes from leaked-master-key replacement via a new repository/copy or new backup.

Independent reviewer inference from the documented formulas: changing encryption keys alone need not change a chunk's plaintext identity. Re-encryption cost, identity stability, epoch handling, old-key retention and compromise revocation are separate questions. The candidate correctly says changing Borg `id_key` changes identities, but incorrectly promotes that consequence to every true encryption-key change. A preserved identity domain can support deduplication despite encryption changes; this does not claim an existing Borg command implements in-place rotation or that a leaked key can be retroactively revoked for ciphertext an attacker already retained.

The binary proposed drill excludes a consequential design possibility in the exact assigned key-change aspect. It is therefore material. Preserve the correct passphrase-versus-data-key distinction and the specific `id_key` consequence, without granting the broader claim.

## Assigned axes and exact output obligations

### original_obligations_and_scope — PASS_WITH_LIMITATIONS

Discovery artifact present, 973 whitespace-delimited words (942 lexical tokens); four alternatives, two implementation leads, one history/version lead, compact tradeoff comparison, exactly three prospective questions/tests, uncertainty and next step. Five substantive primary pages from three projects meet >=3 sources across >=2 projects. Scope stays on single-user chunk/encryption interaction; UI/scheduling/full restore excluded. Semantic issues are assessed separately in F1/F2.

### consequential_source_conditions — FAIL

Checked storage-ID versus plaintext-ID subjects, encrypted metadata, algorithm/nonce/key roles, KiB/MiB parameters, object/pack versus chunk observability, repository formats and version-limited mitigation, client/state assumptions and compromised-key operations.

### unfamiliar_discovery_alternatives_implementation_history — PASS_WITH_LIMITATIONS

Four-item diversity is reasonable across Rabin CDC, Buzhash/keyed IDs, Tarsnap context-based chunks/session envelopes, and fixed-block baseline. Two leads are inspectable and explicitly uninspected by candidate; reviewer inspected both implementations without executing them. Format-v2 compression is a real historical lead. No penalty for absent Kopia/Duplicacy/Bup comparison or full 2025-paper inspection.

### wrong_corrections_rejections_exact_dispositions — FAIL

No seeded claims, existing plan or critique is supplied; exact plan/critique dispositions are NOT_APPLICABLE. Fixed chunks as a front-insert baseline are justified. Restic is assigned an unsupported leakage failure boundary, materially corrupting the comparative disposition, though no universal winner is selected.

### supported_scope_preservation — PASS_WITH_LIMITATIONS

No upstream pipeline or prior supported draft exists. Preserve evidenced CDC/front-insert benefit, keyed naming, envelope/session-key lead, encrypted metadata, retention-before-GC upload consequence, cheap password re-wrap and separate identity-secret consequences. Do not convert semantic failure into rejection of all useful discoveries or full-pipeline grade.

### prospective_checks_and_actual_validation — FAIL

Front-insert byte-upload comparison is useful and prospective. Oracle lookup needs store-only permissions and the actual store-visible identity domain; it is false for documented Restic when done as proposed. Rotation drill must distinguish wrapping, encryption, identity and chunker keys. Candidate explicitly says no local probe ran; source retrieval is not deployment, recovery or performance validation. No experimental results are fabricated in the science artifact.

The artifact has 973 whitespace-delimited words (942 lexical tokens), within 700–1000 under either count. Four alternatives, two inspectable implementation leads, one historical/version lead, a tradeoff comparison and three questions/prospective tests are present. Five substantive primary pages across Restic, BorgBackup and Tarsnap meet the required source diversity. The candidate reports eight successfully retrieved primary pages plus two failed guessed Restic URLs; its excerpts do not independently authenticate the complete per-tool trace. Failed 404 attempts do not add substantive primary evidence. No missing source-code inspection is invented as a requirement: the assignment asks for implementation leads, and the candidate expressly labels them uninspected.

There is no seeded claim set, existing plan, supplied critique or upstream draft in this role. Exact critique/plan dispositions and full-pipeline preservation are NOT_APPLICABLE. The fixed-block contrast is a reasonable baseline for near-front inserts that shift fixed boundaries; rejecting it for that headline case is supported. A universal best mechanism is neither supplied nor required.

## Consequential source audit and retained discoveries

- **Restic boundaries and units:** the documented Rabin CDC window is 64 bytes, nominal minimum 512 KiB, maximum 8 MiB and target average 1 MiB; these are project defaults, not universal parameters. Files below the nominal minimum are unsplit. The inspected chunker also emits a shorter final EOF tail. Insert resilience is a resynchronization property, not literally full byte reuse for every input.
- **Restic encrypted objects:** AES-256-CTR plus Poly1305-AES authenticates the stored objects. Fresh random IVs and encrypted pack headers/indexes are essential to applicability. The internal hash has a different subject from the hash of a stored pack. F1 remains despite individually correct statements about plaintext hashes existing internally.
- **Restic rotation/version:** password files wrap the same master keys; changing a password does not revoke a leaked master key. Format v2 adds compression for data/tree blobs and index/lock/snapshot objects. Readers reject unsupported repository versions, so the historical lead is useful without proving every old reader can read a new encoding. The cited 0.18.0 randomized-pack mitigation is documented for known-file/chunk-size association attacks; the candidate explicitly leaves full paper preconditions unresolved. The reviewer did not retrieve that paper and does not broaden its conclusion.
- **Borg boundaries and key roles:** Buzhash and fixed chunkers, a repository-wide client chunks cache, keyed plaintext identity, and independent data/authentication/identity secrets are supported. The stated HMAC-SHA-256/keyed BLAKE2b and AES-256-CTR data construction is version-bounded to 1.4.5. Offline passphrase wrapping uses a different construction from data Encrypt-then-MAC; the candidate does not specify it as the data wrapper.
- **Borg conditions:** its confidentiality statement assumes a trusted persistent client security database; independently updating clients can permit nonce reuse through malicious repository replay. One user and absence of cross-user sharing do not themselves establish one client. Stored compressed/encrypted chunk sizes and proximity can leak information even when keyed IDs prevent a direct unkeyed dictionary comparison. No additional deployed clients are invented here.
- **Tarsnap mechanisms:** context-dependent chunks, reused chunk lists, HMAC names, RSA-wrapped random archive/session AES keys and authenticated encrypted metadata are supported. Session-key separation does not establish complete archive isolation because chunks are reused and the RSA key reaches envelopes. Exact key-rotation operations remain unresolved. The documented delete-before-re-add example really incurs extra upload after last-reference removal; this is a useful retention/GC interaction within the bounded aspect.
- **Implementation/history opportunities:** the reviewer inspected the exact Restic chunker source and Tarsnap `tar/multitape/chunkify.c` without execution. Restic uses a min/max-constrained split mask with EOF-tail handling. Tarsnap has HMAC-derived chunker parameters and a different content-cycle rule with a chosen-plaintext safeguard. These verify inspectable leads; the additional code details are reviewer discoveries, not candidate observations. Both moving `master` URLs have commit UNKNOWN; captured-byte hashes fix what was inspected. The v0.18.0 Restic references wrapper only points to included documents and is not evidence of their full tagged contents.

The candidate's acknowledged absence of Kopia/Duplicacy/Bup coverage is not a missing obligation. The useful bounded next step is a front-insert comparison of upload bytes and chunk distributions; a single file provides a discriminator without qualifying all workload mixes.

## Limitations and unknowns

- **L1**, candidate lines 13: Borg confidentiality condition is client concurrency/state, not user count. No cross-user sharing does not itself guarantee one independently updating client. Persistent trusted security state and safe CTR counter reservation also matter. Scope qualification; no multi-client deployment is specified or required, so no invented deployment requirement or independent material failure is imposed.
- **L2**, candidate lines 15, 34: Per-archive AES session keys are evidenced, but archive-isolated blast radius is not established: archive lists reuse chunks, and the RSA unwrap key reaches session keys. The candidate does not explicitly claim complete archive isolation; the exact compromised-key subject remains unresolved. Preserve as a bounded lead; not graded as a separately proven material falsehood.
- **L3**, candidate lines 21, 26: Restic implementation lead lacks an exact code URL; historical compression lead is valid, but unsupported older readers are rejected, so the compatibility inference must be version-bounded. Candidate explicitly says code was not inspected. Locator/qualification limitations, not a requirement to inspect source code or implement a migration.
- **L4**, candidate lines 11, 32, 33, 34, 41, 51: CDC front-insert reuse is expected after resynchronization, not a guarantee of literally full reuse for every byte sequence. Restic nominal minimum has EOF-tail exceptions in the source. One file is a useful discriminating check, not proof that parameters are optimal for all workloads. Keyed IDs block a direct unkeyed dictionary comparison but do not hide all equality/access/size patterns. No run or universal winner is claimed. These are bounded wording and future-test applicability qualifications.

- Candidate actual native Goal terminal completion, authentic engine linkage of the saved activation receipt, exactly-one activation count, activation-before-common-input order, and all-output-save-before-native-completion order are UNKNOWN absent authenticated native tool trace/completion receipt.
- Effective candidate model, reasoning effort/service tier and billing/token spend are UNKNOWN; fixture and frozen request establish requested labels, while T3 response names the routed provider/model without proving billing provenance.
- No terminal science/output hash freeze was found at inspected exact target-arm paths. Existing input freeze hashes all match; host T3 terminal completion is observed separately.
- Candidate per-tool retrieval trace, full harness-truncated primary responses, failed-URL diagnostics and investigation/writing split are not independently authenticated by saved excerpts alone.
- No backup installation, object-store account, production deployment, restoration exercise, performance benchmark or re-key drill was run or required for this discovery role.
- Tarsnap exact rotation procedure, full 2025 chunking-paper preconditions and source-code release/commit versions for moving master remain unknown. Reviewer code captures are leads, not deployed behavior.

## Proposed versus executed validation

The three proposed checks are front-insert upload measurement, confirmation-oracle lookup and a rotation drill. No local candidate probe is reported or saved. Source retrieval and narrative comparison are the executed research activities; no performance, rotation or restore result is claimed. The front-insert check is useful. The store-permission/identity-domain error in the oracle check is F1; the forced re-key/dedup outcome is F2. A client-authenticated index query is not a valid oracle for the permissions of an untrusted store.

The reviewer executed full required local reads, SHA-256/freeze comparisons, independent primary retrieval and static inspection of governing conditions and code leads. No downloaded code, chunker benchmark, backup account, deployed object store, restoration or key-rotation experiment was executed. Such deployments are not required by the discovery assignment.

## Separate delivery, coverage, native, protocol and time record

- **Delivery:** discovery and source map are present and parseable; all four saved `sources/` members were read. T3 completed/no-pending is backed by the host observation.
- **Coverage:** requested structural role obligations are covered, with material semantic errors F1/F2. A delivered role output is not full-pipeline qualification.
- **Native:** the candidate saved an active-state receipt with goal ID `goal-01a1241a-2b24-73b1-a3f6-a7f736014081` and reported creation 04:37:37.188 UTC. There is no inspected authenticated native completion trace/receipt. Exactly-one activation, pre-inference ordering and output-save-before-native-completion are UNKNOWN. T3 completion is separate. The reviewer's own actual Goal/tool observations are kept separately.
- **Effective model/billing:** requested Muse route/effort and the T3 response's routed label are observed; effective model, service tier, token/billing provenance and inference occupancy remain UNKNOWN. No latency or savings claim follows from this judgment.
- **Protocol:** independent semantic review; no candidate help, repair or delegation. Candidate no-assistance declarations are not a complete tool audit; broader candidate method compliance remains UNKNOWN. A failed optional BeautifulSoup import was resolved with standard-library HTMLParser, with no installation. The filename-only freeze search disclosure above does not supply other candidate content or judgments.
- **Time:** request 04:37:26.708 UTC, host observed completed 04:42:21.697 UTC, before deadline 04:52:26.708 UTC. The 294.989 seconds is an upper bound to completed-by-observation from request, not native model occupancy. Investigation/writing split is UNKNOWN. The review is bounded to 25 minutes and finishes after saved judgment.

## Navigable evidence and inspected hashes

[Primary evidence index](primary-evidence/README.md) links original primary URLs and captured HTML/raw/numbered text. [source-map.json](source-map.json) records URL/version/section, retrieval UTC/operation, conditions and findings-to-evidence edges. [assessment.json](assessment.json) is the complete structured judgment. [freeze-check.json](freeze-check.json) keeps output-freeze uncertainty distinct from verified input hashes.

Inspected input/science and supporting evidence hashes:

- [RUBRIC-v1.md](ER12_RUNTIME/assessment/RUBRIC-v1.md) — `a93d0456d53b3519883ec517135688d2bbb4c12eb62f9a0b6fbe1bf2615fe19b`, 2790 bytes, FULL.
- [input-map.json](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/input-map.json) — `f4a640ccb6452e4cd03eb7d98160bf9cf8e4d686203d26f7cd0d0d5486668cec`, 507 bytes, FULL. Frozen-input match: True.
- [assignment.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/assignment.md) — `852ad7871bb8dee4ffc252b7155353eda796e2f71445b19642bc918b43fdaa6f`, 2383 bytes, FULL. Frozen-input match: True.
- [freeze.json](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/freeze.json) — `fe1e33a7f696d49e8d49d63f492e42b1c1dced2be8df2f5f18c1d804f2318c1a`, 2193 bytes, FULL.
- [assignment.md](ER12_RUNTIME/runs/B-DISC-M-02/inputs/assignment.md) — `96c86b7591b7a87ba61dac12c4c21a3daa8c20e9fd4b50e09266471d6d11a1db`, 2642 bytes, FULL. Frozen-input match: True.
- [fixture.json](ER12_RUNTIME/runs/B-DISC-M-02/inputs/fixture.json) — `1b10c5fad028e42ff6e2367e5df37e6f550a4d28a27ead680c77c44d1b60c7f5`, 1033 bytes, FULL. Frozen-input match: True.
- [manifest.json](ER12_RUNTIME/runs/B-DISC-M-02/inputs/manifest.json) — `fe164e06074640cccbda200b67202cb2cc9dad08579ba478a1bbaa768dfcc595`, 241 bytes, FULL. Frozen-input match: True.
- [discovery.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/discovery.md) — `95154750f3d32e40e9dc4292bdc3b253dc143e29fd5a32ced69de1cd70ca136e`, 7046 bytes, FULL.
- [source-map.json](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/source-map.json) — `78bb36f7d093648f17654c43f210de12805d4482f0da99df5d7d99dad21bf26c`, 4992 bytes, FULL.
- [goal-activation-receipt.json](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/records/goal-activation-receipt.json) — `8b1aca2cf30f310fb2750fd797dcb5ee5740fc7031a82068cf0931f67a5e4d99`, 566 bytes, FULL.
- [dispatch.json](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/dispatch.json) — `fff24ae8ab8f70dc6dafc0a8ee37b79823af3ee7ab6056bb7685d021414b042c`, 4381 bytes, FULL.
- [er12-B-DISC-M-02-treatment-role-v2.json](ER12_RUNTIME/mechanics/task-observations/er12-B-DISC-M-02-treatment-role-v2.json) — `b35477ab967fec69ab6748684d816e2e10334ffef388d6ff708880498eb0bb2d`, 10342 bytes, FULL.
- [root-review-request.json](ER12_RUNTIME/assessment/B-DISC-M-02/treatment-v1/root-review-request.json) — `5e54462a5082082a508e8225474a42136c67b0f373cde0b6555af6fe69cf72fa`, 2616 bytes, FULL.
- [borg-internals-security.excerpt.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/sources/borg-internals-security.excerpt.md) — `9972c9d53641286a27c5adb8ac450402ac8ed5f79ab15e4ae50109028bbe36b7`, 2662 bytes, FULL.
- [restic-references.excerpt.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/sources/restic-references.excerpt.md) — `7608005a07ccaf8e87a1f682c11116f06728b373f42379d87aa96e05b713c8e8`, 2883 bytes, FULL.
- [retrieval-log.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/sources/retrieval-log.md) — `c649192991ae8224fd5ad8ede7e0b8fdcdbef1266115f104b54ee40bd4f2c717`, 2108 bytes, FULL.
- [tarsnap-crypto-dedup.excerpt.md](ER12_RUNTIME/runs/B-DISC-M-02/treatment/stages/role/sources/tarsnap-crypto-dedup.excerpt.md) — `0c8e83d23bf5795a0e43e442941a5ce26085f4f8a4ebe43b71c53df1e8ac5fb9`, 3112 bytes, FULL.
