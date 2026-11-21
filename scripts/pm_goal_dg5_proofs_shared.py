"""DG5 written proofs for shared pm_goal_test_* rows (all five families + adapter source).

Loaded by pm_goal_dg5_justified.written_proofs and re-bound there to the exact
source bytes of every cited site. A proof closes its row only while every
dependency row is closed in the same family (matrix least fixpoint).
"""
ST = 'scripts/pm_goal_test_storage.py'
SITE = 'dg5/site/pm_goal_test_storage.py:'
OA = 'scripts/pm_goal_test_owner_adapters.py'
OSITE = 'dg5/site/pm_goal_test_owner_adapters.py:'
FAMILIES = ['goal.updated', 'goal.cancelled', 'goal_run.started', 'goal_run.cancelled',
            'goal_run.certified', 'shared-adapter']

PROOFS = {
    SITE + '517': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '518'],
        sites=[(ST, 517), (ST, 518)],
        argument=(
            'decode_frame at :517 requires not (end-offset < 8 and the buffer is a prefix of '
            'MAGIC); the next statement (:518) refuses unless the first eight bytes equal MAGIC. '
            'A buffer shorter than eight bytes can never equal the eight-byte MAGIC, so with '
            ':517 cut every input it refuses still refuses at :518 (the wire-fixture '
            'truncated_prefix and frame_prefix_two_bytes cases witness the chain). :517 '
            'selects the exact prefix_truncated code and never gates acceptance alone.')),
    SITE + '520': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '525', SITE + '530'],
        sites=[(ST, 520), (ST, 525), (ST, 530)],
        argument=(
            'decode_frame at :520 requires at least PREFIX (48) bytes. With :520 cut a '
            'shorter buffer gives a prefix shorter than 48 bytes, and :539 is never '
            'reached: a genuine truncation fails the prefix CRC at :525, and a buffer '
            'whose CRC was forged to match still refuses at :530, because prefix[44:48] '
            'of a short prefix can never be four bytes (every 8..47-byte truncation and '
            'every resealed 44..47-byte prefix refused at :525 or :530). :520 selects the '
            'exact prefix_truncated code and never gates acceptance alone.')),
    SITE + '537': dict(
        kind='entailed-by-genuine-frame-bounds',
        families=FAMILIES,
        depends_on=[SITE + '539', SITE + '581'],
        sites=[(ST, 59), (ST, 60), (ST, 426), (ST, 537), (ST, 539), (ST, 581)],
        argument=(
            'Frame caps at :537 bound declared header_len by HEADER_CAP=4096 and payload_len '
            'by PAYLOAD_CAP=16777216 (pm_goal_test_storage.py:59-60). A genuine encoder frame '
            'cannot reach them: event_header (pm_goal_test_storage.py:426) builds the fixed '
            'eight-field header of schema-bounded strings, and a data payload is one '
            'schema-valid pm.event.v0 record whose string fields are schema-capped, so both '
            'canonical lengths stay orders of magnitude below the caps. A non-genuine frame '
            'declaring over-cap lengths either has fewer bytes than declared (frame_truncated '
            'at :539) or carries that many bytes, which then cannot decode to the bounded '
            'header/event shapes and refuses at the header/payload validation sites '
            '(event_record at :581). With :537 cut no complete read accepts such a frame; '
            'it is a resource bound, not an acceptance gate.')),
    SITE + '577': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '470'],
        sites=[(ST, 577), (ST, 581), (ST, 468), (ST, 470)],
        argument=(
            'decode_frame at :577 requires the decoded data payload to be a dict; the next '
            'statement validates it as an event record (validate_event_record, '
            'pm_goal_test_storage.py:468), whose first check at :470 refuses any '
            'non-dict, and converts that refusal at :581. A non-dict payload therefore '
            'still refuses at :470 (surfacing at :581) with :577 '
            'cut (the decode_payload_shape chain witnesses exactly this), so :577 selects '
            'the exact payload_shape code and never gates acceptance alone.')),
    OSITE + '303': dict(
        kind='reduce-or-refuse',
        families=FAMILIES,
        depends_on=[],
        sites=[(OA, 292), (OA, 302), (OA, 303)],
        argument=(
            'OriginalHandle.__reduce__ unconditionally refuses handle/not_serializable '
            'at :303 and the class defines no __reduce_ex__ or __getstate__, so pickle '
            'has no other serialization path. With :303 cut, __reduce__ returns None and '
            'pickle raises PicklingError (__reduce__ must return a string or tuple; the '
            'handle_not_serializable CUT_EXCEPTION witnesses exactly this), so no '
            'execution serializes a handle; :303 states the exact refusal.')),
    OSITE + '416': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[OSITE + '429'],
        sites=[(OA, 408), (OA, 416), (OA, 429)],
        argument=(
            'exact_json check() refuses a float leaf by name at :416; with :416 cut the '
            'same float reaches the final else require at :429 (v is None or type(v) is '
            'bool), which no float satisfies, and refuses custody/exact_json/type (the '
            'exact_json_float chain witnesses exactly this). Every value :416 refuses is '
            'a float, so :416 selects the exact float code and never gates acceptance '
            'alone.')),
    SITE + '1462': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '1464'],
        sites=[(ST, 1462), (ST, 1464)],
        argument=(
            'append dedupe at :1462 requires the scoped-identity hit to be the same '
            'event_id; the next check at :1464 requires the whole producer25 (the event '
            'minus storage fields, event_id included) to be byte-identical. A candidate '
            'with a different event_id under an existing scoped identity necessarily has '
            'a different producer25, so with :1462 cut it still refuses at :1464 (the '
            'same_key_other_event_id chain witnesses exactly this); :1462 selects the '
            'precise conflict code and never gates acceptance alone. It closes by this '
            'proof once :1464 is closed.')),
    SITE + '1463': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '1464'],
        sites=[(ST, 1463), (ST, 1464)],
        argument=(
            'append dedupe at :1463 requires the event_id hit to carry the same scoped '
            'identity (partition, event_type, idempotency_key are producer25 fields); '
            'the next check at :1464 requires the whole producer25 byte-identical. A '
            'candidate with another idempotency_key under an existing event_id necessarily '
            'differs in producer25, so with :1463 cut it still refuses at :1464 (the '
            'same_event_id_other_key chain witnesses exactly this); :1463 selects the '
            'precise conflict code and never gates acceptance alone. It closes by this '
            'proof once :1464 is closed.')),
    SITE + '1564': dict(
        kind='entailed-by-custody-construction',
        families=FAMILIES,
        depends_on=[SITE + '1426'],
        sites=[(ST, 1544), (ST, 1564), ('Plans/event_append_receipt_contracts.schema.json', 492), (ST, 1426)],
        argument=(
            '_custody_row (:1544-1564) builds the custody_v2 row only from an event just '
            'returned by read_event (frame-validated against the whole EventRecord root: '
            'event_id, event_type and idempotency_key already satisfy the identical '
            'string bounds; redaction_profile does not, since EventRecord admits three '
            'values and custody_v2 only no_secrets, but every append path required the '
            'candidate redaction_profile to be no_secrets at :1426, '
            'append/candidate/redaction_profile, before the event was stored), the '
            'indexed scope partition and group digest, '
            'the verbatim first_append_receipt (constructed in the AppendReceipt shape '
            'custody_v2 references), a computed segment-ref binding, and digests computed '
            'by NR.producer_digest / NR.full_value_commitment over that same event '
            '(custody_v2, event_append_receipt_contracts.schema.json:492). Every field is '
            'a schema constant, a computed digest, or a verbatim copy already bounded '
            'at its source (redaction_profile by :1426), so no complete issue_first_receipt call can make '
            'this row refuse alone.')),
    SITE + '1633': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '1624'],
        sites=[(ST, 1622), (ST, 1624), (ST, 1631), (ST, 1633), (ST, 1634)],
        argument=(
            'read_event at :1633 requires the event index entry to exist, then delegates '
            'to read_frame, whose first check at :1624 requires the identical index '
            'entry lookup (self.events.get(event_id)) to succeed. With :1633 cut, an '
            'absent event still refuses read/event_unavailable at :1624 in the same call '
            '(the read_event_absent chain witnesses exactly this), so :1633 selects the '
            'read_event code and never gates acceptance alone. It closes by this proof '
            'once :1624 is closed.')),
    SITE + '441': dict(
        kind='entailed-by-stored-part-cap',
        families=FAMILIES,
        depends_on=[SITE + '473'],
        sites=[(ST, 61), (ST, 441), (ST, 1486), (ST, 1487)],
        argument=(
            'encode_event_frame at :441 caps the canonical payload at '
            'PAYLOAD_CAP=16777216 (ST:60). The payload bytes are canonical(event) '
            'verbatim, and every append first requires the identical bytes to fit '
            'STORED_PART_CAP=16384 (ST:61) at :1487, right after the whole EventRecord '
            'validation at :1486. The tighter cap always refuses first by three orders '
            'of magnitude, so no complete append call can make :441 refuse alone. It '
            'closes by this proof once :473 is closed.')),
    SITE + '470': dict(
        kind='code-selection',
        families=FAMILIES,
        depends_on=[SITE + '473'],
        sites=[(ST, 470), (ST, 473)],
        argument=(
            'validate_event_record at :470 requires the event to be a dict before the '
            'whole EventRecord schema at :471-473, whose root type is object: a non-dict '
            'event fails the identical type predicate there (the event_record_type chain '
            'witnesses exactly this). With :470 cut, no non-dict event is accepted; it '
            'selects the precise type code and closes once :473 is closed.')),
}


# Withdrawn written proofs (lead pm-ea-lead 1121101954-8459 (1), after the proof audit of 2026-11-21, and
# (4): no written proof credits a row until an adversarial probe has been run and recorded with it). They are
# kept for the record and are deliberately outside PROOFS, so no tool loads them as proofs:
# pm_goal_dg5_justified.written_proofs and keycheck.py read only PROOFS. Do not move one back without a new
# argument and a recorded probe whose cut run refuses.
WITHDRAWN = {
    'dg5/site/pm_goal_test_storage.py:1534': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Refuted premise: a readback of genuine frames is not always '
            'clean. The EventRecord event_type pattern admits pm.seglog.group_commit (= CONTROL_TYPE); a plain '
            'TestOwnerStorage.append of such a candidate fails control_header_mismatch on readback, so :1534 is the '
            'only refusal (intact: append/readback; cut: IndexError on a fresh segment or index/duplicate_event_id '
            'after an earlier group; probe_1534.py). Rows held in all four families.'
        ),
        proof=dict(
            kind='entailed-by-canonical-round-trip',
            families=FAMILIES,
            depends_on=[],
            sites=[(ST, 435), (ST, 445), (ST, 512), (ST, 1531), (ST, 1534)],
            argument=(
                'append at :1534 requires the readback scan of the bytes just written in '
                'the same call to end exactly at the new watermark with the identical '
                'commit dict. The scan decodes frames produced by the canonical encoders '
                '(:435/:445) with their exact inverses in decode_frame (:512): any byte '
                'defect refuses at a frame or commit-shape site during the scan, and a '
                'clean scan returns the identical commit by canonical round-trip. The only '
                'other scan endings are the injected Crash faults (torn frames), which are '
                'interruptions, not acceptances. No complete append call can make this row '
                'refuse alone.')),
    ),
    # Round 3 (pm-ea-lead 1121124828-43f4 (b)): moved here unchanged from PROOFS; each reason names its final list, the reviews and
    # the route by which the row now closes (a kill or OPEN). Withdrawn proofs never credit.
    'dg5/site/pm_goal_test_storage.py:1450': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 audit SOUND; '
            'round 2 S-B UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a single-defect negative.'
        ),
        proof=dict(
            kind='code-selection',
            families=FAMILIES,
            depends_on=[SITE + '1534'],
            sites=[(ST, 1450), (ST, 1501), (ST, 492), (ST, 1534)],
            argument=(
                'append at :1450 requires durability_class in (ordinary, barrier) before '
                'writing; the identical predicate on the identical commit field is re-checked '
                'at :492 when the just-written commit frame is decoded by the readback scan '
                '(:1531-1535) in the same call, before any index or state commit. With :1450 '
                'cut, an unknown durability class still fails _commit_shape at :492 on '
                'readback and the append raises unindexed (the durability_class_unknown chain '
                'witnesses exactly this), so :1450 selects the append-boundary code and never '
                'gates acceptance alone. It closes by this proof once :492 is closed.')),
    ),
    'dg5/site/pm_goal_test_storage.py:1477': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 audit SOUND; '
            'round 2 S-B UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a single-defect negative.'
        ),
        proof=dict(
            kind='code-selection',
            families=FAMILIES,
            depends_on=[SITE + '1056'],
            sites=[(ST, 1477), (ST, 1056), (ST, 1535)],
            argument=(
                'append at :1477 requires the fresh candidates event ids distinct within the '
                'group; the same group is indexed frame by frame at :1056 (_index_group, '
                'called from the readback at :1535 in the same call), where the second frame '
                'with an already-indexed event_id refuses index/duplicate_event_id. With '
                ':1477 cut, duplicate ids in one group still refuse there before _commit_state '
                '(the duplicate_in_group chain witnesses exactly this), so :1477 selects the '
                'append-boundary code and never gates acceptance alone. It closes by this '
                'proof once :1056 is closed.')),
    ),
    'dg5/site/pm_goal_test_storage.py:1726': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND; '
            'round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a single-defect negative.'
        ),
        proof=dict(
            kind='code-selection',
            families=FAMILIES,
            depends_on=[SITE + '1728'],
            sites=[(ST, 1726), (ST, 1728), (ST, 1737)],
            argument=(
                'read_pack at :1726 requires the pack record to exist and be durable; a '
                'withdrawn pack has durable=False and its file unlinked at withdraw (:1737), '
                'and an absent pack has no file either, so with :1726 cut the same call '
                'still refuses pack/present at :1728 on the next line (the pack_withdrawn '
                'and pack_absent chains witness exactly this). :1726 selects the precise '
                'unavailable code and never gates acceptance alone; it closes once :1728 '
                'is closed.')),
    ),
    'dg5/site/pm_goal_test_storage.py:440': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND; '
            "round 2 ADJ UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's own code "
            '(rule C).'
        ),
        proof=dict(
            kind='entailed-by-event-schema',
            families=FAMILIES,
            depends_on=[SITE + '473'],
            sites=[(ST, 426), (ST, 440), (ST, 1486)],
            argument=(
                'encode_event_frame at :440 caps the canonical header at HEADER_CAP=4096. '
                'The header is event_header (:426): one integer plus seven EventRecord string '
                'fields, each already bounded (maxLength 256 or a computed short string) by '
                'the whole EventRecord validation every append runs before encoding, so the '
                'encoded header is structurally far below the cap. It closes by this proof '
                'once the EventRecord validation row :473 is closed.')),
    ),
    'dg5/site/pm_goal_test_storage.py:553': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 SOUND; '
            "round 2 S-B UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's own code "
            '(rule C).'
        ),
        proof=dict(
            kind='decode-or-refuse',
            families=FAMILIES,
            depends_on=[],
            sites=[(ST, 550), (ST, 551), (ST, 553), (ST, 555)],
            argument=(
                'decode_frame binds header only when decode_canonical(header_raw) succeeds '
                '(:551); on StorageRefusal the except branch refuses header_codec at :553. '
                'With :553 cut, header is unbound and the next use at :555 raises '
                'UnboundLocalError (the decode_header_codec CUT_EXCEPTION witnesses exactly '
                'this), so no execution accepts a frame whose header does not decode; :553 '
                'converts the codec refusal to the exact header_codec code.')),
    ),
    'dg5/site/pm_goal_test_storage.py:572': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 SOUND; '
            "round 2 S-B UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's own code "
            '(rule C).'
        ),
        proof=dict(
            kind='decode-or-refuse',
            families=FAMILIES,
            depends_on=[],
            sites=[(ST, 569), (ST, 570), (ST, 572), (ST, 574)],
            argument=(
                'decode_frame binds value only when decode_canonical(payload_raw) succeeds '
                '(:570); on StorageRefusal the except branch refuses payload_codec at :572. '
                'With :572 cut, value is unbound and the next use (_commit_shape at :574 or '
                'the payload checks) raises UnboundLocalError (the decode_payload_codec '
                'CUT_EXCEPTION witnesses exactly this), so no execution accepts a frame whose '
                'payload does not decode; :572 converts the codec refusal to the exact '
                'payload_codec code.')),
    ),
    # Round 3 follow-up 1 (pm-ea-lead 1121132345-c739): FINAL-LIST-113.r4 withdrawals after the S2-SURV
    # review, moved here unchanged.
    'dg5/site/pm_goal_test_storage.py:187': dict(
        reason=(
            'Withdrawn in proof maintenance round 3, follow-up 1 (pm-ea-lead 1121132345-c739), on FINAL-LIST-113.r4 '
            '(sha256 6a2c1422...). Review S2-SURV '
            '(event-authority-20261104/reviews/PROOF-REVIEW-R2/S2-SURV/REVIEW.md): UNSOUND, refuted premise. Two '
            'appends (level 1), an application event, then the same event_id and idempotency_key with project_id set: '
            ':473 never runs on the dedupe branch, and the cut is caught at :1464 with append/conflict/producer25, a '
            'different code. The real cover on the dedupe branch (:1464) is missing from depends_on; recorded here, '
            'the withdrawn proof is kept unchanged. r4 why: addendum 7: break is a note; SOUND survives a dispute. r4 '
            'route: kill: KILLED_CODE (addendum 10); cut refuses at :1464 with another code.'
        ),
        proof=dict(
            kind='code-selection',
            families=FAMILIES,
            depends_on=[SITE + '473'],
            sites=[(ST, 186), (ST, 187), (ST, 473)],
            argument=(
                'scope_partition at :187 requires an application-scoped event to carry no '
                'project_id, during append dedupe. The whole EventRecord validation later in '
                'the same append (:473, via validate_event_record) bounds the identical '
                'scope_kind/project_id pair by the identical predicate (application scope '
                'requires a null project). With :187 cut, an application candidate carrying '
                'a project still refuses there before any frame is written (the '
                'scope_application_project chain witnesses exactly this), so :187 selects '
                'the precise scope code and never gates acceptance alone.')),
    ),
    'dg5/site/pm_goal_test_storage.py:189': dict(
        reason=(
            'Withdrawn in proof maintenance round 3, follow-up 1 (pm-ea-lead 1121132345-c739), on FINAL-LIST-113.r4 '
            '(sha256 6a2c1422...). Review S2-SURV '
            '(event-authority-20261104/reviews/PROOF-REVIEW-R2/S2-SURV/REVIEW.md): UNSOUND, refuted premise. append '
            'with project scope and project_id None or 7 (level 1): the cut is caught at :163 with '
            "key/component_type; re-appending a stored event_id with project_id '' is caught at :1463 with "
            'append/conflict/scoped_identity; :473 never runs. S2-SURV defects, recorded here (the withdrawn proof is '
            'kept unchanged): depends_on names :473, which is not a goal_run.started row; and the goal.cancelled '
            "proof of :163 depends on :189 while :189's non-string case is covered only by :163, so the two proofs "
            'covered each other. This withdrawal ends that mutual cover: :189 now closes only by its own kill, and '
            'the :163 proof (on neither final list) depends on a row that a kill must close. r4 why: addendum 7: '
            'break is a note; SOUND survives a dispute. r4 route: kill: KILLED_CODE (addendum 10); cut refuses at '
            ':163 / :1463 with other codes.'
        ),
        proof=dict(
            kind='code-selection',
            families=FAMILIES,
            depends_on=[SITE + '473'],
            sites=[(ST, 189), (ST, 473)],
            argument=(
                'scope_partition at :189 requires the candidate project_id to be a non-empty '
                'string during append dedupe; the whole EventRecord validation later in the '
                'same append (:473) bounds the identical project_id field by type string '
                'plus minLength 1. With :189 cut, an empty project_id still refuses there '
                'before any frame is written, so :189 selects the precise scope code and '
                'never gates acceptance alone. It closes by this proof once :473 is closed.')),
    ),
}
