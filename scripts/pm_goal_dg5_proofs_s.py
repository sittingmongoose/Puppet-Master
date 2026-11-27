"""DG5 written proofs for goal_run.started (owner: helper B, SPLIT.md section 2).

PROOFS = {row: dict(kind, argument, depends_on=[rows], sites=[(path, line)],
families=['goal_run.started'])}. pm_goal_dg5_justified re-binds each proof to
the exact source bytes of its cited sites; the matrix closes a proof row only
once every dependency is closed (least fixpoint grounded in killed rows).
"""
READERS = 'scripts/pm_goal_dg_s_readers.py'
START = 'scripts/pm_goal_dg_s_start.py'
R837 = 'dg5/site/pm_goal_dg_s_readers.py:837'
R258 = 'dg5/site/pm_goal_dg_s_readers.py:258'

PROOFS = {
    'dg5/site/pm_goal_dg_s_readers.py:834': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=[R837, R258],
        sites=[(READERS, 834), (READERS, 837), (READERS, 258), (READERS, 191), (READERS, 224),
               (READERS, 200), (START, 1109)],
        argument=(
            "In every read_current that reaches h_current_start, the original was acquired first by "
            "original_started, whose :258 require makes every relations() check true for the presented "
            "retained graph. relations binds the transition-after commitment to the authenticated event: "
            "payload/after_revision (goal_run_revision == after.body_revision, :224) and "
            "native/body_revision (after == before + 1, :191), binds candidate/commit/origin/head "
            "after_body selectors to after.body, and resolve/after_body (:200) resolves that selector "
            "against Storage custody. The update carrying the commitment is digest-pinned by "
            "d01_origin/update and head/update, whose own selectors are resolved in the same acquisition, "
            "so the presented commitment is the issued one; at issuance StartOwner.body_commitment sets "
            "body_revision from the very body its body selector names (pm_goal_dg_s_start.py:1109). With "
            ":837 passing, the presented native body is byte-identical to that after body (digest join), "
            "so its record revision equals after.body_revision and :834 cannot refuse. Any defect that "
            "makes :834's comparison false therefore refuses at :258 or :837 first in the same complete "
            "call; :834 has no single-defect witness through read_current.")),
    'dg5/site/pm_goal_dg_s_readers.py:835': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=[R837, R258],
        sites=[(READERS, 835), (READERS, 837), (READERS, 258), (READERS, 189), (READERS, 190),
               (READERS, 200), (START, 1109)],
        argument=(
            "Same acquisition as :834: relations (required at :258) binds the after commitment's status "
            "to 'running' and its activation state to 'active' (native/after_status :189, "
            "native/after_activation :190), the commitment is digest-pinned to issuance as for :834, and "
            "at issuance its status fields are copied from the body its selector names "
            "(pm_goal_dg_s_start.py:1109-1110). :835 compares the presented native body's own status and "
            "activation state, both inside the body record that :837 digests live: any body whose status "
            "or activation state differs from the after body's differs in bytes, so :837 refuses in the "
            "same complete call. With :837 passing the presented body is the after body, whose status is "
            "'running' and activation state 'active', so :835 cannot refuse alone through read_current.")),
}

STORAGE = 'scripts/pm_goal_test_storage.py'
WORLD_PY = 'scripts/pm_goal_dg_s_world.py'
PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:848': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_start.py:847'],
        sites=[(START, 848), (START, 847), (START, 183)],
        argument=(
            "848 compares the stored StartControl epoch to 0 on the same cell value that :847 has just "
            "required, with only pending_candidate nulled, to be identical to the birth StartControl, "
            "whose record epoch is fixed at 0 when NativeOwner.birth_run issuing it "
            "(pm_goal_dg_s_start.py:183). Any epoch other than 0 therefore refuses at :847 first in the "
            "same entry_joins call; with :847 passing the epoch is 0, so :848 has no single-defect "
            "witness through commit_start.")),
    'dg5/site/pm_goal_dg_s_start.py:849': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_start.py:847'],
        sites=[(START, 849), (START, 847), (START, 185)],
        argument=(
            "Same cell and same :847 identity as :848: the birth StartControl record is issued with "
            "committed_start=None (pm_goal_dg_s_start.py:185), and :847's base nulls only "
            "pending_candidate, so a non-None committed_start refuses at :847 before :849 is evaluated. "
            "With :847 passing, committed_start is None and :849 cannot refuse through commit_start.")),
    'dg5/projector/now/date-time': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(READERS, 632), (STORAGE, 741), (STORAGE, 745)],
        argument=(
            "The only value ever passed at readers:632 is the return of Storage._tick(), which returns "
            "format_ms(clock_last_ms); format_ms itself returns only text already accepted by "
            "NR.storage_time at 'clock/format' (pm_goal_test_storage.py:741-745), the same shared "
            "storage-time grammar readers:632 applies. A formatting refusal therefore happens inside "
            "_tick in shared Storage code and never reaches :632, so the re-check cannot refuse in any "
            "complete family call.")),
    'dg5/site/pm_goal_dg_s_world.py:306': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(WORLD_PY, 306), (START, 560)],
        argument=(
            "Context.identity() is reached in this family's complete calls only from entry_joins of a "
            "world built by StartWorld.issue_sources, whose step 2 binds ctx.workgraph_sha256 from the "
            "installed graph (pm_goal_dg_s_start.py:560) before native birth and long before any "
            "commit_start or reader entry can run. Binder.bind likewise only substitutes an identity "
            "when the hash is already bound. No complete family call can present a Context whose "
            "workgraph_sha256 is still None, so :306 cannot refuse.")),
})

SOURCE = 'scripts/pm_goal_test_source.py'
PROOFS.update({
    'dg5/site/pm_goal_dg_s_readers.py:655': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:654', R258],
        sites=[(READERS, 655), (READERS, 654), (READERS, 651), (READERS, 321), (SOURCE, 365)],
        argument=(
            ":655 is evaluated only after :654 has required the projection complete. "
            "GenericSource.project reports complete only with no halt and no snapshot defect "
            "(pm_goal_test_source.py:365). The snapshot was acquired from the same Storage immediately "
            "before original_started succeeded at readers:651, so the start frame is retained and "
            "readable; acquisition scans every retained segment group in sequence and appends each "
            "non-defect row, and any defect truncating or preceding that row makes the projection "
            "incomplete at :654 first. The projector's select matches the event's ctx project/run, "
            "which relations (:258) binds, the retained map is keyed by that event id, and the reducer "
            "sets state['started'] for exactly that row (readers:321). A complete projection therefore "
            "always has a started state, and :655 cannot be the first refusal in replay.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:1360': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 1360), (START, 1343), (START, 1357)],
        argument=(
            "recover_start is passive by construction: after snapshotting commit_generation at :1342 "
            "it only reads Storage cells, the reservation state and first custody "
            "(pm_goal_dg_s_start.py:1343-1357), issuing no transaction, append or pack write on any "
            "path, and its own docstring and the S1 recover cases pin that it never writes. No Storage "
            "generation can move between the snapshot and the :1360 comparison inside one recover_start "
            "call, so the check cannot refuse.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:1025': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 1025), (START, 980), (START, 1020), (STORAGE, 1485), (STORAGE, 65), (STORAGE, 1862)],
        argument=(
            "The stored event compared at :1025 is the very candidate commit_start appended at :1020, "
            "read back through the append handle. Storage append builds the stored event as the "
            "candidate plus exactly observed_at_utc, persisted_at_utc and sequence_id "
            "(pm_goal_test_storage.py:1485), and producer25 drops exactly those three STORAGE_FIELDS "
            "(:65, :1862). The candidate has just passed the TypedProducerSubmission and event-record "
            "validations at :980-983, so every field is a plain JSON value preserved byte-for-byte by "
            "the canonical frame encoding. producer25(stored) is therefore the submission by "
            "construction, and :1025 cannot refuse in a complete commit_start call.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_readers.py:516': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:524', 'dg5/site/pm_goal_dg_s_readers.py:527',
                    'dg5/site/pm_goal_dg_s_readers.py:511'],
        sites=[(READERS, 516), (READERS, 500), (READERS, 511), (READERS, 524), (READERS, 527),
               (READERS, 435)],
        argument=(
            "decode_checkpoint validates the wrapper, then applies the same fits_checkpoint measure "
            "encode_checkpoint applies to the wrapper it selects for the identical logical checkpoint "
            "(readers:500-511, :435-437). If the presented wrapper does not fit at :516, then in the "
            "cut run one of three later sites must refuse instead: if its physical_key is not "
            "checkpoint_key()/the logical key, :524 refuses; if the key matches and the content kind "
            "is inline, the selected encode of the same logical under the same key has the same size "
            "and therefore switches to payload_reference, so :527 refuses on kind; if the content "
            "kind is payload_reference and even that wrapper does not fit (key-dominated size), the "
            "selected encode builds the same-shaped reference wrapper and :511 refuses on it. Hence "
            "no presented wrapper can make :516 the only refusal in a complete decode_checkpoint "
            "call; it is entailed by the key, deterministic-kind and encode-size sites.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:984': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 984), (START, 1020), (STORAGE, 1421), (STORAGE, 1426)],
        argument=(
            "The only append path in a complete commit_start is the one-event "
            "AppendOwner.append_original at start:1020, and Storage.append validates every candidate "
            "through _candidate (pm_goal_test_storage.py:1421), which applies the shared NUMRULE "
            "current-append-policy predicate to replay_policy (:1426) and refuses "
            "projector_replay_only with replay_only_not_appendable. A submission that fails :984 "
            "therefore refuses again at that Storage candidate check later in the same complete call "
            "(the fresh discovery chain for S1/producer_replay_only_policy stops exactly there with "
            "no_progress), so :984 has no single-defect witness.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_readers.py:77': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_world.py:458'],
        sites=[(READERS, 77), (READERS, 79), (WORLD_PY, 458), (WORLD_PY, 459)],
        argument=(
            "The value guarded at :77 is the StartControl committed_start selector, resolved on the "
            "very next acquisition step at readers:79. When it is None (the only state in which :77's "
            "committed-start conjunct fails; the operation-id conjunct is read from the same birth "
            "record), resolve_selector refuses at world:458 on selector type, and with that site cut "
            "the following line subscripts the None selector. The ef0 discovery chain for "
            "S4/retained_before_any_start stops exactly there (exception after widening to :458), so "
            ":77 cannot be the sole refusal of a complete retained acquisition.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_readers.py:839': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:258', 'dg5/site/pm_goal_dg_s_readers.py:928',
                    'dg5/site/pm_goal_dg_s_readers.py:933'],
        sites=[(READERS, 839), (READERS, 838), (READERS, 928), (READERS, 933), (READERS, 258)],
        argument=(
            ":839 compares the StartControl cell read in h_current_start (:838) with the retained "
            "control from the original acquired earlier in the same read_current call, so it can "
            "fail only if that cell changed between the two acquisitions or was substituted at rest. "
            "A substitution at rest is caught when the final boundary re-acquires the original: "
            "either its relations bundle refuses at :258 (epoch, owner, scope, committed and origin "
            "selector joins on exactly this control), or the re-acquired bundle differs from the "
            "first and :928 refuses. A transient change restored before the final boundary instead "
            "makes the second h_current_start rebuild a different current value, so :933 refuses. "
            "The ef0 chain for S4/current_start_control_changed (substituted operation id) stops in "
            "exactly that final re-acquisition, so :839 has no single-defect witness through "
            "read_current.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_readers.py:101': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(READERS, 101), (READERS, 98), (START, 1020), (STORAGE, 1577)],
        argument=(
            "original_append is called only with the retained commit's event id, and that event "
            "exists in Storage only because commit_start appended it through "
            "AppendOwner.append_original (:1020), which issues and privately retains first custody "
            "for every appended member before returning (pm_goal_test_storage.py:1577). Storage "
            "exposes no custody-deletion operation; custody rows are only added by first-receipt "
            "issuance and persisted in the state manifest. A retained commit for the event therefore "
            "implies its first custody is present, so :101 cannot refuse in a complete family call.")),
    'dg5/site/pm_goal_dg_s_readers.py:814': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(READERS, 814), (SOURCE, 281), (SOURCE, 310), (STORAGE, 1594)],
        argument=(
            "Both sides of :814 are deep copies of the same private Storage custody row: the generic "
            "row's custody is copied from the acquired source custody dict in GenericSource.acquire "
            "(pm_goal_test_source.py:281), which Storage.acquire_source deep-copies from its own "
            "custody dict, and the original's exact_custody is Storage.first_custody's deep copy of "
            "that same entry (pm_goal_test_storage.py:1594-1596). Rows whose custody diverges from "
            "the frame-derived receipt, group digest, identity, commitment or producer digest are "
            "already returned as snapshot defects by _custody_defect and never reach h_generic as "
            "rows (pm_goal_test_source.py:310-331). No modeled transition between the original and "
            "generic acquisitions rewrites a custody row, so the copies cannot differ here.")),
    'dg5/site/pm_goal_dg_s_readers.py:816': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(READERS, 816), (SOURCE, 278), (STORAGE, 1631), (SOURCE, 200)],
        argument=(
            "The generic row's event is the value decoded from the segment frame during acquisition "
            "scan (pm_goal_test_source.py:278-281), and the original's event is Storage.read_event's "
            "decode of the same frame bytes at the same offset and length "
            "(pm_goal_test_storage.py:1631-1635). A substituted frame at rest changes the segment "
            "digest against the manifest retained inventory, which token recomputation refuses "
            "unless the scan itself found a tail defect (pm_goal_test_source.py:194-202), in which "
            "case the row is not in the snapshot at all. When the row is present, both decoders "
            "therefore yield the identical event value, so :816 cannot refuse.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:908': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/start/producer/schema'],
        sites=[(START, 908), (START, 980), (START, 1065)],
        argument=(
            "The runtime actor value checked at :908 is copied unchanged into both actor_ref fields "
            "of the producer submission (producer_submission and :1065), and that submission is "
            "validated against TypedProducerSubmission at :980 before any append. Its actor_ref "
            "fields carry the same string/non-empty predicate (string type with minLength in the "
            "producer and payload schemas), so an empty or non-string actor that fails :908 refuses "
            "at the producer schema row later in the same commit_start call. The fresh discovery "
            "chain for S1/runtime_actor_empty stops exactly through that schema row and the "
            "downstream argument schemas, so :908 has no single-defect witness.")),
})

PROOFS.update({
    'dg5/producer/goal_run_revision/number': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 931), (START, 1142), (START, 1058)],
        argument=(
            "producer_submission computes goal_run_revision as NR.uint64(before + 1) at :931 on a "
            "schema-validated native body revision, so the only refusal is the uint64 ceiling "
            "(before = 2^64-1) or a non-integer a birth schema already excludes. With :931 cut the "
            "out-of-range integer is placed in the submission payload, and the same commit_start "
            "call then digests that submission for the candidate producer_semantic_digest at :1142 "
            "through the shared exact-integer/JCS route, which refuses the identical value "
            "(smoke3 chain: jcs_binary64/jcs_decimal, no_progress). The row therefore has no "
            "single-defect witness; its exact refusal is witnessed by the authored ceiling case.")),
    'dg5/native/activation_revision/number': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 243), (START, 1144), (WORLD_PY, 70)],
        argument=(
            "after_images increments the activation revision at :243 on a schema-validated body, so "
            "only the uint64 ceiling can refuse. With :243 cut the resulting 2^64 revision sits in "
            "the after body that candidate() immediately digests for its candidate_body selector "
            "(:1144) through W.cdigest (world:70), whose physical canonical encoding refuses "
            "integers outside uint64 range (smoke3 chain: physical_integer_range, no_progress). "
            "The exact refusal is witnessed by the authored ceiling case, and no cut of :243 alone "
            "lets the call accept.")),
    'dg5/d01/revision/number': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 1200), (START, 1207), (WORLD_PY, 70)],
        argument=(
            "publication_union computes the D01 update/head revision as NR.uint64(pointer revision "
            "+ 1) at :1200 from a schema-validated pointer record, so only the ceiling can refuse. "
            "With :1200 cut, that 2^64 revision is written into the update and head records at "
            ":1207/:1229 and immediately digested for their selectors and the retained bundle "
            "through W.cdigest (world:70), whose physical canonical encoding refuses integers "
            "outside uint64 range (smoke3 chain: physical_integer_range, no_progress). No "
            "single-defect witness exists; the authored ceiling case witnesses the exact refusal.")),
})

PROOFS.update({
    'dg5/native/advance/number': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 259), (START, 262), (WORLD_PY, 70)],
        argument=(
            "NativeOwner.advance increments the current body revision at :259 on a "
            "schema-validated stored body, so only the uint64 ceiling can refuse. With :259 cut "
            "the resulting 2^64 revision is immediately digested for the new control wrapper "
            "(control_wrapper body_record_sha256, :262) and written through the physical canonical "
            "encoding behind W.cdigest (world:70), which refuses integers outside uint64 range - "
            "the smoke4 chain stops at exactly that physical-integer-range refusal. The authored "
            "ceiling case witnesses the exact :259 refusal, and no cut of :259 alone lets the "
            "advance complete.")),
})


# Started proofs admitted through the Started matrix intakes (correction goal_run.started-005 base) and
# landed here so they load as PROOFS (lead pm-ea-lead 1121094214-9517 (2)). Each entry is the record's
# kind, families, depends_on, sites and argument verbatim; every cited line is current at the lane head.
PROOFS.update({
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/cutover/original/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/cutover/original/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 710),
        ],
        argument=(
            'The original append document checked at 105 is assigned unchanged as original_append in the '
            'enclosing object at 254. The schema checked at 256 requires the same append definition. Both '
            'accepted and refused examples record the same JSON at both sites. Disabling only the early check '
            'exposes the same first validation message at 256. Restoring the early check restores the '
            'original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/d01/current_source/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/issue/current_source/schema'],
        sites=[
            (START, 404),
            (START, 405),
            (START, 406),
            ('scripts/pm_goal_test_owner_adapters.py', 460),
            ('scripts/pm_goal_test_owner_adapters.py', 462),
        ],
        argument=(
            'The same JSON is passed to the original issuer before the caller can return. Both calls reach '
            'the identical installed schema. The accepted example gives the same document at both checks. '
            'With only the early check disabled, the same invalid document reaches the issuer with exactly '
            'the same validation message. Restoration brings back the original early refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/goal/current_argument/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/issue/CurrentGoalArgument/schema'],
        sites=[
            (START, 345),
            (START, 346),
            (START, 347),
            ('scripts/pm_goal_test_owner_adapters.py', 460),
            ('scripts/pm_goal_test_owner_adapters.py', 462),
        ],
        argument=(
            'The same JSON is passed to the original issuer before the caller can return. Both calls reach '
            'the identical installed schema. The accepted example gives the same document at both checks. '
            'With only the early check disabled, the same invalid document reaches the issuer with exactly '
            'the same validation message. Restoration brings back the original early refusal.'
        ),
    ),
    # from inspection_append_intake (methodb-reference goal_run.started-stage2-22/intake-batch-17)
    'dg5/inspect_original/final/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/inspect_original/final/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 883),
        ],
        argument=(
            'The inspection forwards the exact append document validated at line 105 unchanged in the '
            'required original_append member checked at line 256. That member uses the same installed '
            'definition. The accepted example supplies identical JSON to both checks. Disabling only the '
            'first check moves the same validation message to the enclosing check, and restoring the first '
            'check restores its original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/inspect_original/final/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=[],
        sites=[
            (READERS, 94),
            (READERS, 253),
            (READERS, 255),
            (READERS, 256),
            (READERS, 878),
            (READERS, 883),
            (READERS, 884),
            (READERS, 888),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'The retained document at 94 is unchanged in the enclosing object at 255–256, whose required '
            'native_start member uses the same definition. The other copy in the comparison at 884 still '
            'passes the enclosing schema at 256, and equality requires the same JSON types and values. Each '
            'test observes the unaffected check or the schema-valid comparison operand while only the '
            'selected site is disabled and observes the exact original refusal after restoration.'
        ),
    ),
    # from inspection_append_intake (methodb-reference goal_run.started-stage2-22/intake-batch-17)
    'dg5/inspect_original/original/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/inspect_original/original/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 804),
        ],
        argument=(
            'The inspection forwards the exact append document validated at line 105 unchanged in the '
            'required original_append member checked at line 256. That member uses the same installed '
            'definition. The accepted example supplies identical JSON to both checks. Disabling only the '
            'first check moves the same validation message to the enclosing check, and restoring the first '
            'check restores its original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/inspect_original/original/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=[],
        sites=[
            (READERS, 94),
            (READERS, 253),
            (READERS, 255),
            (READERS, 256),
            (READERS, 878),
            (READERS, 883),
            (READERS, 884),
            (READERS, 888),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'The retained document at 94 is unchanged in the enclosing object at 255–256, whose required '
            'native_start member uses the same definition. The other copy in the comparison at 884 still '
            'passes the enclosing schema at 256, and equality requires the same JSON types and values. Each '
            'test observes the unaffected check or the schema-valid comparison operand while only the '
            'selected site is disabled and observes the exact original refusal after restoration.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/project/lower_original/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/project/lower_original/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 662),
        ],
        argument=(
            'The original append document checked at 105 is assigned unchanged as original_append in the '
            'enclosing object at 254. The schema checked at 256 requires the same append definition. Both '
            'accepted and refused examples record the same JSON at both sites. Disabling only the early check '
            'exposes the same first validation message at 256. Restoring the early check restores the '
            'original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/project/original/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/project/original/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 651),
        ],
        argument=(
            'The original append document checked at 105 is assigned unchanged as original_append in the '
            'enclosing object at 254. The schema checked at 256 requires the same append definition. Both '
            'accepted and refused examples record the same JSON at both sites. Disabling only the early check '
            'exposes the same first validation message at 256. Restoring the early check restores the '
            'original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/current_goal/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/issue/CurrentGoalArgument/schema', 'dg5/goal/current_argument/schema'],
        sites=[
            (READERS, 854),
            (READERS, 855),
            (READERS, 925),
            (READERS, 934),
            (START, 345),
            (START, 346),
            (START, 347),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'h_current_goal (854-855) validates the object current_argument() has just returned, and '
            'current_argument validated that identical object against the same CurrentGoalArgument '
            'definition in the same goal bank at s_start 345-346 (goal/current_argument) and issued it at '
            '347; nothing changes it before 855, so that owner check is the decisive cover. The other Goal '
            'copy is constructed and validated by the original owner and reader. The final comparison at '
            '934 requires type-exact equality with that schema-valid copy, a second cover. The example records '
            'both operands and verifies that the original Goal argument issuer and reader use the same '
            'installed schema. Disabling just this check leaves the bad copy for the comparison, and '
            'restoring it restores the same early validation message.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/current_start/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_current/root/schema', 'dg5/d01/current_source/schema'],
        sites=[
            (START, 404),
            (START, 405),
            (START, 406),
            (READERS, 845),
            (READERS, 846),
            (READERS, 848),
            (READERS, 849),
            (READERS, 923),
            (READERS, 933),
            (READERS, 935),
            (READERS, 937),
        ],
        argument=(
            'The workflow at 846–847 embeds the unchanged D01 document validated at 404–405. The installed '
            'CurrentStartSource requires that exact D01 definition and the whole-call tests match both D01 '
            'documents to their enclosing workflow. The D01 tests exercise all 1,266 rules of the same '
            'definition; the workflow tests exercise the other 68 against the original installed schema. The '
            'other workflow copy is acquired again, checked by the same schema, and compared using type-exact '
            'equality at 933. The final result at 935–937 requires the identical workflow definition. The '
            'accepted example records the exact document at the result check. With only the selected check '
            'disabled the final comparison refuses the changed copy. Restoration reproduces the original '
            'validation message.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/final/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_current/root/schema', 'dg5/read_current/final/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 928),
            (READERS, 935),
            (READERS, 937),
        ],
        argument=(
            'The append document checked at 105 goes unchanged into the required original_append member at '
            '254 and is checked again against the same definition at 256 (read_current/final/root) with no '
            'code between that reads it; that is the immediate cover. The current reader result also '
            'requires the same nested definition and the final comparison '
            'requires both original documents to be type-exact equal. The valid example records the same JSON '
            'in the result, and the invalid example gives the same validation message after disabling only '
            'the early check.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/final/current_goal/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/issue/CurrentGoalArgument/schema'],
        sites=[
            (READERS, 854),
            (READERS, 855),
            (READERS, 925),
            (READERS, 934),
            (START, 345),
            (START, 347),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'The other Goal copy is constructed and validated by the original owner and reader. The final '
            'comparison at 934 requires type-exact equality with that schema-valid copy. The example records '
            'both operands and verifies that the original Goal argument issuer and reader use the same '
            'installed schema. Disabling just this check leaves the bad copy for the comparison, and '
            'restoring it restores the same early validation message.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/final/current_start/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_current/root/schema', 'dg5/d01/current_source/schema',
                    'dg5/site/pm_goal_dg_s_readers.py:933'],
        sites=[
            (START, 404),
            (START, 405),
            (START, 406),
            (READERS, 845),
            (READERS, 846),
            (READERS, 848),
            (READERS, 849),
            (READERS, 923),
            (READERS, 933),
            (READERS, 935),
            (READERS, 937),
        ],
        argument=(
            'The workflow at 846–847 embeds the unchanged D01 document validated at 404–405. The installed '
            'CurrentStartSource requires that exact D01 definition and the whole-call tests match both D01 '
            'documents to their enclosing workflow. The D01 tests exercise all 1,266 rules of the same '
            'definition; the workflow tests exercise the other 68 against the original installed schema. The '
            'other workflow copy is acquired again, checked by the same schema, and compared using type-exact '
            'equality at 933. The final result at 935–937 requires the identical workflow definition. The '
            'accepted example records the exact document at the result check. With only the selected check '
            'disabled the final comparison refuses the changed copy. Restoration reproduces the original '
            'validation message.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/final/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_current/root/schema'],
        sites=[
            (READERS, 94),
            (READERS, 253),
            (READERS, 255),
            (READERS, 256),
            (READERS, 914),
            (READERS, 928),
            (READERS, 935),
            (READERS, 937),
        ],
        argument=(
            'The retained document at 94 is unchanged in the required native_start member at 255–256. The '
            'reader requires type-exact equality of the two original documents at 928 and checks the same '
            'required OriginalStarted object in the result at 935–937. The valid example records the same '
            'JSON there. Disabling only the retained site produces the same validation message at 256, and '
            'disabling only the enclosing site causes the comparison to refuse.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/original/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_current/original/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 928),
            (READERS, 935),
            (READERS, 937),
        ],
        argument=(
            'The append document checked at 105 goes unchanged into the required original_append member at '
            '254 and is checked again against the same definition at 256 (read_current/original/root) with '
            'no code between that reads it; that is the immediate cover. The current reader result also '
            'requires the same nested definition and the final comparison '
            'requires both original documents to be type-exact equal. The valid example records the same JSON '
            'in the result, and the invalid example gives the same validation message after disabling only '
            'the early check.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_current/original/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_current/root/schema'],
        sites=[
            (READERS, 94),
            (READERS, 253),
            (READERS, 255),
            (READERS, 256),
            (READERS, 914),
            (READERS, 928),
            (READERS, 935),
            (READERS, 937),
        ],
        argument=(
            'The retained document at 94 is unchanged in the required native_start member at 255–256. The '
            'reader requires type-exact equality of the two original documents at 928 and checks the same '
            'required OriginalStarted object in the result at 935–937. The valid example records the same '
            'JSON there. Disabling only the retained site produces the same validation message at 256, and '
            'disabling only the enclosing site causes the comparison to refuse.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_historical/final/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_historical/final/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 895),
            (READERS, 900),
            (READERS, 901),
            (READERS, 905),
            (READERS, 906),
        ],
        argument=(
            'The append document checked at 105 is inserted as required original_append at 254 and rechecked '
            'against the same definition at 256 (read_historical/final/root), the immediate cover. The '
            'historical result at 905–906 requires that same nested '
            'append document. The final read must be type-exact equal to the original read at 901, so the '
            'result schema covers both append copies on a successful call. The complete call records the '
            'unchanged valid append at the result check and reproduces the exact first validation message at '
            '256 with the early check disabled. Restoring the early check restores its original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_historical/final/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_historical/root/schema'],
        sites=[
            (READERS, 94),
            (READERS, 253),
            (READERS, 255),
            (READERS, 256),
            (READERS, 895),
            (READERS, 901),
            (READERS, 902),
            (READERS, 905),
            (READERS, 906),
        ],
        argument=(
            'The retained document checked at 94 is inserted unchanged at 255. The enclosing schema at 256 '
            'requires the same retained definition. The historical output at 905–906 requires the same '
            'enclosing definition, and the comparison at 902 requires both original copies to be type-exact '
            'equal. With only the retained site disabled the same invalid document reaches the enclosing '
            'schema. With only the enclosing site disabled the comparison refuses the changed copy. Both '
            'original validation messages return when their site is restored.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_historical/original/append/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_historical/original/root/schema'],
        sites=[
            (READERS, 105),
            (READERS, 253),
            (READERS, 254),
            (READERS, 256),
            (READERS, 895),
            (READERS, 900),
            (READERS, 901),
            (READERS, 905),
            (READERS, 906),
        ],
        argument=(
            'The append document checked at 105 is inserted as required original_append at 254 and rechecked '
            'against the same definition at 256 (read_historical/original/root), the immediate cover. The '
            'historical result at 905–906 requires that same nested '
            'append document. The final read must be type-exact equal to the original read at 901, so the '
            'result schema covers both append copies on a successful call. The complete call records the '
            'unchanged valid append at the result check and reproduces the exact first validation message at '
            '256 with the early check disabled. Restoring the early check restores its original refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/read_historical/original/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/read_historical/root/schema'],
        sites=[
            (READERS, 94),
            (READERS, 253),
            (READERS, 255),
            (READERS, 256),
            (READERS, 895),
            (READERS, 901),
            (READERS, 902),
            (READERS, 905),
            (READERS, 906),
        ],
        argument=(
            'The retained document checked at 94 is inserted unchanged at 255. The enclosing schema at 256 '
            'requires the same retained definition. The historical output at 905–906 requires the same '
            'enclosing definition, and the comparison at 902 requires both original copies to be type-exact '
            'equal. With only the retained site disabled the same invalid document reaches the enclosing '
            'schema. With only the enclosing site disabled the comparison refuses the changed copy. Both '
            'original validation messages return when their site is restored.'
        ),
    ),
    # from retained_reader_schema_intake (methodb-reference goal_run.started-stage2-22/intake-batch-16)
    'dg5/read_retained_native/final/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:870'],
        sites=[
            (READERS, 94),
            (READERS, 800),
            (READERS, 867),
            (READERS, 869),
            (READERS, 870),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'Both retained copies pass the same installed validation at line 94. The caller compares the two '
            'at line 870 using type-exact equality. A schema-invalid copy cannot equal the other schema-valid '
            'copy. The tests confirm the other copy passed the original validator and reached the comparison '
            'unchanged. Disabling just the selected validation makes the comparison refuse, and restoration '
            'repeats the exact original validation message.'
        ),
    ),
    # from retained_reader_schema_intake (methodb-reference goal_run.started-stage2-22/intake-batch-16)
    'dg5/read_retained_native/retained/root/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:870', 'dg5/read_retained_native/final/root/schema'],
        sites=[
            (READERS, 94),
            (READERS, 800),
            (READERS, 867),
            (READERS, 869),
            (READERS, 870),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'Both retained copies pass the same installed validation at line 94: this first copy through '
            'h_retained (867, 800), the final copy at 869 (read_retained_native/final/root). With this check '
            'disabled, an invalid value already stored before the call is refused by the final '
            "acquisition's own line 94 check, a different code, and a copy that changed between the two "
            'acquisitions is refused by the type-exact comparison at line 870. The tests confirm the other '
            'copy passed the original validator and reached the comparison '
            'unchanged. Disabling just the selected validation makes the comparison refuse, and restoration '
            'repeats the exact original validation message.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/representation/record/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:486'],
        sites=[
            (READERS, 281),
            (READERS, 483),
            (READERS, 484),
            (READERS, 485),
            (READERS, 486),
            ('scripts/pm_goal_test_owner_adapters.py', 83),
        ],
        argument=(
            'The reader validates the reconstructed document at 484. At 485 it derives and validates the '
            'expected document using the same Projection definition at 281. At 486 it requires type-exact '
            'equality with the validated document. A successful return can therefore only contain a '
            'reconstructed document that satisfies the same schema. Disabling the early check leaves the '
            'invalid document unchanged and produces the exact comparison refusal. Both comparison operands '
            'and both original validation messages are recorded by the complete-call test.'
        ),
    ),
    # from current_stage7_checker_intake; methodb-pilot b7b7fba92d
    # scripts/pm_goal_dg5_methodb_stage7_started_dependencies.py PENDING
    'dg5/site/pm_goal_dg_s_start.py:1004': dict(
        kind='entailed-by-pending-prepared-check',
        families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_start.py:973'],
        sites=[
            (START, 965),
            (START, 969),
            (START, 971),
            (START, 972),
            (START, 973),
            (START, 1001),
            (START, 1004),
        ],
        argument=(
            'Both checks use the same local pending and prepared values assigned at :969 and :971. When '
            'prepared is absent, a nonempty pending fails :973 before reaching :1004. The same '
            'other-operation request refuses at :973 alone and at :1004 alone, with '
            'start/pending_other_operation in both cases. Restoration returns to :973.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/commit/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/start/retained_native/schema'],
        sites=[
            (START, 1172),
            (START, 1174),
            (START, 1175),
            (START, 1269),
            (START, 1270),
            (START, 1272),
        ],
        argument=(
            'The StorageCommit document checked at 1174 is placed unchanged in the required '
            'RetainedNativeStart.commit member at 1269–1270 and checked at 1272 in the same publication '
            'routine. The selector at 1175 uses the document without changing it. In v3 and native v7 that '
            'required member resolves to the identical StorageCommit definition. If the complete call reaches '
            '1272 after bypassing the early check, this same document must satisfy the same definition there. '
            'The three exact-root replays bind the two checks to the same accepted and invalid documents, the '
            'same first validation message after bypass, and the restored early refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/control/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/start/retained_native/schema'],
        sites=[
            (START, 1179),
            (START, 1269),
            (START, 1270),
            (START, 1271),
            (START, 1272),
        ],
        argument=(
            'The control document checked at 1179 is held unchanged as a required member of '
            'RetainedNativeStart at 1269–1271. The check at 1272 requires the same schema definition. The '
            'isolated example records the original message again at the later check, and the early message '
            'returns when the early check is restored. The accepted call records the same member at both '
            'sites.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/origin/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/start/retained_native/schema'],
        sites=[
            (START, 1191),
            (START, 1192),
            (START, 1269),
            (START, 1270),
            (START, 1272),
        ],
        argument=(
            'The StorageOrigin document checked at 1191 is placed unchanged in the required '
            'RetainedNativeStart.origin member at 1269–1270 and checked at 1272 in the same publication '
            'routine. The selector at 1192 uses the document without changing it. In v3 and native v7 that '
            'required member resolves to the identical StorageOrigin definition. If the complete call reaches '
            '1272 after bypassing the early check, this same document must satisfy the same definition there. '
            'The three exact-root replays bind the two checks to the same accepted and invalid documents, the '
            'same first validation message after bypass, and the restored early refusal.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/original_d01_head/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/start/retained_native/schema'],
        sites=[
            (START, 1268),
            (START, 1269),
            (START, 1270),
            (START, 1271),
            (START, 1272),
        ],
        argument=(
            'The original_d01_head document checked at 1268 is held unchanged as a required member of '
            'RetainedNativeStart at 1269–1271. The check at 1272 requires the same schema definition. The '
            'isolated example records the original message again at the later check, and the early message '
            'returns when the early check is restored. The accepted call records the same member at both '
            'sites.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/original_d01_origin/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/start/retained_native/schema'],
        sites=[
            (START, 1268),
            (START, 1269),
            (START, 1270),
            (START, 1271),
            (START, 1272),
        ],
        argument=(
            'The original_d01_origin document checked at 1268 is held unchanged as a required member of '
            'RetainedNativeStart at 1269–1271. The check at 1272 requires the same schema definition. The '
            'isolated example records the original message again at the later check, and the early message '
            'returns when the early check is restored. The accepted call records the same member at both '
            'sites.'
        ),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/original_d01_update/schema': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=['dg5/start/retained_native/schema'],
        sites=[
            (START, 1268),
            (START, 1269),
            (START, 1270),
            (START, 1271),
            (START, 1272),
        ],
        argument=(
            'The original_d01_update document checked at 1268 is held unchanged as a required member of '
            'RetainedNativeStart at 1269–1271. The check at 1272 requires the same schema definition. The '
            'isolated example records the original message again at the later check, and the early message '
            'returns when the early check is restored. The accepted call records the same member at both '
            'sites.'
        ),
    ),
})


# Withdrawn written proofs (lead pm-ea-lead 1121101954-8459 (1), after the proof audit of 2026-11-21, and
# (4): no written proof credits a row until an adversarial probe has been run and recorded with it). They are
# kept for the record and are deliberately outside PROOFS, so no tool loads them as proofs:
# pm_goal_dg5_justified.written_proofs and keycheck.py read only PROOFS. Do not move one back without a new
# argument and a recorded probe whose cut run refuses.
WITHDRAWN = {
    'dg5/site/pm_goal_dg_s_start.py:1406': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Accepting mutant through the family edit channel: :1405 '
            "reads the reservation named by the commit record's operation_id, which the publication_union commit edit "
            '(:1172) can retarget, and nothing before :1406 binds it to op. A commit edit to an operation reserved in '
            'the same Storage refuses lower/reservation_receipted with :1406 intact; with :1406 cut commit_start is '
            'accepted and the other reservation goes reserved to published (probe_s1406.py reserved).'
        ),
        proof=dict(
            kind='entailment', families=['goal_run.started'],
            depends_on=['dg5/site/pm_goal_dg_s_start.py:1022'],
            sites=[(START, 1406), (START, 1020), (START, 1022), (STORAGE, 1571), (STORAGE, 1579)],
            argument=(
                "commit_original is reached only after :1022 has required the append outcome 'appended' "
                "for this operation. AppendOwner.append_original then issues first custody for the "
                "appended reservation, and Storage.issue_first_receipt moves an appended reservation to "
                "'receipted' before returning (pm_goal_test_storage.py:1571-1581); the first-receipt and "
                "original_append steps in between perform no reservation transition. The reservation "
                "commit_original re-reads is therefore still 'receipted', so :1406 cannot be the first "
                "refusal in a complete commit_start call.")),
    ),
    # Round 3 (pm-ea-lead 1121124828-43f4 (b)): moved here unchanged from PROOFS; each reason names its final list, the reviews and
    # the route by which the row now closes (a kill or OPEN). Withdrawn proofs never credit.
    'dg5/native/body_revision/number': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND, '
            'shard3 SOUND; round 2 ADJ UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=dict(
            kind='entailment', families=['goal_run.started'],
            depends_on=['dg5/producer/goal_run_revision/number'],
            sites=[(START, 240), (START, 931), (START, 977), (START, 1000), (START, 826)],
            argument=(
                "Every complete call that reaches NativeOwner.after_images does so inside commit_start: "
                "producer_submission (called at :977) first computes goal_run_revision as NR.uint64 of the "
                "same native before revision + 1 at :931, and only then candidate() (:1000) calls "
                "after_images, whose :240 computes NR.uint64 of that identical value. The prepared-submission "
                "path skips producer_submission only for an operation whose earlier commit_start already ran "
                "it at the same before revision, which :826 re-binds to the birth body on the retry. So "
                "whenever :240 runs, before + 1 is already known uint64-representable and :240 cannot be the "
                "first refusal.")),
    ),
    'dg5/site/pm_goal_dg_s_readers.py:792': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard2 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=dict(
            kind='construction', families=['goal_run.started'],
            depends_on=[],
            sites=[(READERS, 792), (READERS, 783), (READERS, 763)],
            argument=(
                "In every reader body, Storage generations move only inside the named synchronous hooks: "
                "the helpers acquire, read, decode and issue in-memory originals, and perform no Storage "
                "transaction. StartedReaders._hook brackets each hook call with the exact commit-generation "
                "and cell-generation deltas and adds them to self._delta (readers:763-769), and _passive "
                "snapshots both generations before the body runs (readers:783-784). The finally comparison "
                "at :792 is therefore an identity over the modeled hook transitions of this family: the "
                "measured generation movement is exactly the sum the hooks were charged, so it cannot "
                "refuse in a complete reader call.")),
    ),
    'dg5/site/pm_goal_dg_s_readers.py:917': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            "(refuted premise), M-B-2 SOUND. 113.r2 route: kill: a negative expecting the guard's own code (rule C)."
        ),
        proof=dict(
            kind='entailment', families=['goal_run.started'],
            depends_on=['dg5/site/pm_goal_dg_s_readers.py:812', 'dg5/site/pm_goal_dg_s_readers.py:920'],
            sites=[(READERS, 917), (READERS, 812), (READERS, 920), (SOURCE, 283), (SOURCE, 293)],
            argument=(
                "An incomplete generic snapshot in read_current carries a defect recorded by acquire: a "
                "custody defect on a row returns the snapshot before that row is appended "
                "(pm_goal_test_source.py:283-286) and a scan tail returns it at the defective segment "
                "(:293-297). If the defect is at or before the start row, the start row is absent and "
                ":812 refuses inside h_generic before :917 is reached. If the defect is after the start "
                "row, the snapshot rows and coverage stop short of the projected generation's processed "
                "prefix or its token has since moved, so the stale-generic-token comparison at :920 "
                "refuses later in the same call. The segment-tail shape of this argument is exactly why "
                "the garbage-tail supplement case was withdrawn: bytes past the segment watermark are "
                "not part of the snapshot at all. Hence :917 has no single-defect witness.")),
    ),
    'dg5/site/pm_goal_dg_s_start.py:1326': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard2 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (refuted premise). 113.r2 route: OPEN (rule 3): re-close only on a '
            'KILLED later check.'
        ),
        proof=dict(
            kind='construction', families=['goal_run.started'],
            depends_on=[],
            sites=[(START, 1326), (START, 959), (START, 1020)],
            argument=(
                "dedupe() is entered only from commit_start's head, which has just read the same "
                "reservation and required its state to be 'published' (:959-961); the only intervening "
                "step is request-schema validation, which writes nothing. The reservation for a start "
                "operation is created by the single-candidate append at :1020 ([submission]), so a "
                "published start reservation holds exactly one event id. The re-read at :1326 therefore "
                "always finds the published reservation with one event, and the check cannot refuse.")),
    ),
    # from current_reference_row_intake; argument and sites verbatim in the start-argument overlay
    # goal-methodb-w2/stage-5/argument-rule-groups/overlay/pm_goal_dg5_proofs_s.py (sha256 369e0fdf94e1...)
    'dg5/start/original_append/schema': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-R2B. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2b P-B-1 '
            "CANNOT_DECIDE, P-B-2 UNSOUND. R2B route: kill: Method B's negative under rule C (addendum 9)."
        ),
        proof=dict(
            kind='entailment',
            families=['goal_run.started'],
            depends_on=['dg5/start/publication_result/schema'],
            sites=[
                (START, 1026),
                (START, 1029),
                (START, 1030),
                (START, 1036),
                (START, 1040),
                (START, 1042),
            ],
            argument=(
                'The FullOriginalAppend document checked at 1029 is assigned to the required '
                'PublicationResult.original_append member at 1040 and checked at 1042 in the same commit_start '
                'call. Publication processing uses this document to build other values, and leaves its JSON '
                'intact. In v3 and native v7 the required member resolves to the identical FullOriginalAppend '
                'definition. If the call reaches the result check after bypassing the early one, the same '
                'document must satisfy that definition. The three exact-root replays record the byte-equal '
                'documents, exact validation message, and restored early refusal.'
            ),
        ),
    ),
}
