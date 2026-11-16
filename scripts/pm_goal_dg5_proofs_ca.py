"""DG5 written proofs for goal.cancelled (owner: helper C, SPLIT.md).

Each proof is for a row no single-defect authored negative can kill: the check
re-verifies a value the same synchronous call (or the owner schema before it)
already fixes, reads back what the same Storage just wrote, or compares a
deterministic recomputation over unchanged state. Presence justifications for
CUT_EXCEPTION rows are automatic in pm_goal_dg5_justified and are not repeated
here. Nothing here earns kill credit.
"""
C1 = 'scripts/pm_goal_dg_ca_c1.py'
C2 = 'scripts/pm_goal_dg_ca_c2.py'
R3 = 'scripts/pm_goal_dg_ca3_route.py'
N3 = 'scripts/pm_goal_dg_ca3_native.py'
IX = 'scripts/pm_goal_dg_ca3_index.py'
AS = 'scripts/pm_goal_dg_ca_assignment.py'
OWN = 'scripts/pm_goal_dg_ca_owners.py'
ST = 'scripts/pm_goal_test_storage.py'
AD = 'scripts/pm_goal_test_owner_adapters.py'
FAM = ['goal.cancelled']


def _p(argument, sites, depends_on=()):
    return dict(kind='entailment', argument=argument, depends_on=list(depends_on),
                sites=sites, families=FAM)


PROOFS = {
    'dg5/site/pm_goal_dg_ca_c1.py:56': _p(
        "wrapper() requires a non-empty str key only when the selected def requires "
        "physical_key. Every call site that passes such a def supplies a formatted "
        "non-empty key (route.wrap with selection_key/audit key from key(), and "
        "C1.wrapper in issue_assignment_audit with assigner.audit_key); call sites "
        "passing key=None use wrapper defs without physical_key, so the branch is "
        "never taken with an empty or non-str key.",
        [(C1, 45), (C1, 56), (C1, 201), (C1, 390), (AS, 644)]),
    'dg5/site/pm_goal_dg_ca_c1.py:59': _p(
        "wrapper() fills every required field other than record/storage_instance_id/"
        "physical_key from the schema's const. The producer bank is the hash-pinned "
        "W12 successor selection (its bytes are verified at Roots load), and every "
        "wrapper def used by the C1/C2/C4 routes declares const for exactly those "
        "fields (schema_id/schema_version), so 'const' is always present when the "
        "branch is reached with a schema from that bank.",
        [(C1, 59), (C1, 47), ('scripts/pm_goal_own_c3_w12b_roots.py', 24)]),
    'dg5/site/pm_goal_dg_ca_c1.py:322': _p(
        "The statement is acquired only as the issuing AssociationOwner's original "
        "(registry acquire), and AssociationOwner.inventory builds it with the "
        "literal complete=True; no other statement shape can be issued or acquired, "
        "so the completeness re-check cannot refuse alone.",
        [(C1, 320), (C1, 322), (OWN, 730), (OWN, 737)]),
    'dg5/site/pm_goal_dg_ca_c1.py:323': _p(
        "statement['owner_epoch'] is copied from owner.owner_epoch inside inventory() "
        "and compared with the same attribute immediately after acquire in the same "
        "synchronous loop iteration; no epoch-advancing owner call runs between "
        "issue and comparison, so the two reads cannot differ.",
        [(C1, 320), (C1, 323), (OWN, 736)]),
    'dg5/site/pm_goal_dg_ca_c1.py:573': _p(
        "producer['payload_schema_id'] comes from the captured source's producer "
        "metadata, built at capture from the C1.PAYLOAD_SCHEMA literal, and the "
        "registry row is selected by event_type 'goal.cancelled' at Shared load; "
        "Plans/event_family_registry.json records that literal as the family's "
        "payload_schema_id. Source custody (_require_progress) proves the metadata "
        "is the captured original, so the equality is fixed before freeze_event.",
        [(C1, 40), (C1, 358), (C1, 573), (OWN, 113),
         ('Plans/event_family_registry.json', 497)],
        ['dg5/site/pm_goal_dg_ca_c1.py:436']),
    'dg5/site/pm_goal_dg_ca_c1.py:823': _p(
        "replay captures the Storage cell generation, then only sir.accept runs "
        "before the check. Passing :819 means accept took its replay branch "
        "(identical request returns the existing original), which performs no "
        "transact or append, the only operations that advance cell_generation, "
        "so the generation is unchanged.",
        [(C1, 817), (C1, 823), (OWN, 660), (OWN, 663)],
        ['dg5/site/pm_goal_dg_ca_c1.py:819']),
    'dg5/site/pm_goal_dg_ca_c1.py:845': _p(
        "audit_read captures the cell generation after reading the member cell and "
        "then only schema-validates a deepcopy of the record (roots check is "
        "read-only); no transact or append runs between capture and comparison, "
        "so the generation cannot move.",
        [(C1, 841), (C1, 845)]),
    'dg5/site/pm_goal_dg_ca_c1.py:866': _p(
        "read_retained_selection captures the cell generation first, then only "
        "reads the selection/revision/origin cells and schema-validates the audit "
        "record; no transact or append runs in between, so the generation cannot move.",
        [(C1, 853), (C1, 866)]),
    'dg5/site/pm_goal_dg_ca_c2.py:1250': _p(
        "read_current_plan_effects captures the cell generation, then runs only "
        "current-effect reads and custody verification (cell reads and schema "
        "checks); no transact or append runs in between, so the generation cannot move.",
        [(C2, 1246), (C2, 1250)]),
    'dg5/site/pm_goal_dg_ca_c2.py:1257': _p(
        "The request selector is built by effect_selector() inside "
        "read_current_plan_effects and compared with a second effect_selector() "
        "evaluation inside verify_current_custody in the same synchronous call. "
        "effect_selector is a pure function of the route's plan scope and captured "
        "source/request, which nothing mutates between the two evaluations.",
        [(C2, 1187), (C2, 1247), (C2, 1257)]),
    'dg5/site/pm_goal_dg_ca_c2.py:1262': _p(
        "verify_current_custody compares plan/run/schedules/consents from two "
        "evaluations of current_effect_sources() in one synchronous call (the "
        "request's copy and its own recomputation). Those members are pure "
        "functions of stored cells, and between the evaluations only read-only "
        "selector/permission/state checks run, so the two copies cannot differ.",
        [(C2, 1229), (C2, 1248), (C2, 1260), (C2, 1262)]),
    'dg5/site/pm_goal_dg_ca_c2.py:1298': _p(
        "The settlement reaching settle_owner comes only from stored_settled, "
        "which schema-checks the whole SettledResult (including the settlement) "
        "immediately before returning it in the same call, and the settlement "
        "dict itself is constructed only with the literal kind "
        "'bound_plan_settled' in prepare/plan_commit; a different kind is "
        "refused by that schema check first (witnessed: substituting "
        "'none_required' fails the SettledResult const discrimination).",
        [(C2, 831), (C2, 1225), (C2, 1298)]),
    'dg5/site/pm_goal_dg_ca_assignment.py:204': _p(
        "LeasedStorage.append sets last_sequence to reserved_sequence_id-1 "
        "immediately before super().append, whose allocator assigns "
        "last_sequence+1 to the single candidate; the post-append re-check "
        "compares that assigned sequence with the same reserved id. The "
        "sequence-reused guard (:199) and selected offset guard (:197) close "
        "the allocator state this depends on.",
        [(AS, 199), (AS, 200), (AS, 204)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:199',
         'dg5/site/pm_goal_dg_ca_assignment.py:197']),
    'dg5/site/pm_goal_dg_ca_assignment.py:205': _p(
        "super().append writes the single candidate at the active segment's "
        "watermark in the selected segment; :197 has just required that "
        "watermark and generation equal the reservation's byte_offset and "
        "segment_generation, and nothing else can append under the held fence "
        "(:193), so the stored offset/generation equal the reservation's.",
        [(AS, 193), (AS, 197), (AS, 205)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:197']),
    'dg5/site/pm_goal_dg_ca_assignment.py:416': _p(
        "publish_audit writes the audit bytes with put_pack (content-addressed "
        "by blake3, atomically written) and immediately reads the same reference "
        "back with read_pack, which re-reads that exact content-addressed path "
        "and verifies byte size and digest through NUMRULE before returning, "
        "so the readback bytes are the bytes just packed.",
        [(AS, 414), (AS, 416), (ST, 1711), (ST, 1723)]),
    'dg5/site/pm_goal_dg_ca_assignment.py:377': _p(
        "evaluate() is only ever called on the audit's exact_event_encoding_template "
        "after resolve_audit schema-checks the whole StorageAssignmentAudit; that "
        "schema closes EncodingTerm source_slot to the slots append binds "
        "(observed/persisted timestamps and cancellation_receipt_sha256 - a bogus "
        "slot is schema-refused at resolve, witnessed in the supplement smoke), "
        "and append passes exactly those slots at both evaluate calls.",
        [(AS, 377), (AS, 438), (AS, 713), (AS, 731)]),
    'dg5/site/pm_goal_dg_ca_assignment.py:733': _p(
        "The stored event is super().append's encoding of the frozen producer, "
        "already required at :716 to equal the template evaluated with the "
        "pre-append slots; the only template leaves not fixed there are the "
        "reserved sequence and the two Storage times, which the :733 evaluation "
        "takes from the stored event itself, and :204 closes the sequence. A "
        "suite negative also cannot target it: any refusal here happens after "
        "the append, so the harness's preserved-effects rule cannot pass it.",
        [(AS, 713), (AS, 716), (AS, 731), (AS, 733)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:716',
         'dg5/site/pm_goal_dg_ca_assignment.py:204']),
    'dg5/site/pm_goal_dg_ca_assignment.py:745': _p(
        "The first-append receipt's segment_name is issued by Storage for the "
        "segment it appended to - the selected segment held under the fence "
        "(:196) - and reservation_source recorded selected_segment_name from "
        "that same segment record at reserve time; the segment record is not "
        "renamed between reserve and append. Post-append, so no preserved-"
        "effects suite negative can target it either.",
        [(AS, 461), (AS, 196), (AS, 745)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:196']),
    'dg5/site/pm_goal_dg_ca_assignment.py:750': _p(
        "check_domain_membership tests the receipt's sequence/offset/durable "
        "end/manifest/segment generations against the numeric domains derived "
        "in numeric_domains as singletons (or the reserved domain) of exactly "
        "the reserved values, and :204/:205 close that the receipt carries "
        "those reserved values. Post-append, so no preserved-effects suite "
        "negative can target it either.",
        [(AS, 522), (AS, 750)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:204',
         'dg5/site/pm_goal_dg_ca_assignment.py:205']),
    'dg5/site/pm_goal_test_owner_adapters.py:398': _p(
        "type(handle) is OriginalHandle is entailed by the next check "
        "handle in self._handles (:399): handles enter _handles only through "
        "_issue, which mints OriginalHandle instances, so anything passing "
        ":399 has the exact type, and anything failing :398 also fails :399. "
        ":398 can therefore never refuse alone; :399 closes by presence.",
        [(AD, 398), (AD, 399)],
        ['dg5/site/pm_goal_test_owner_adapters.py:399']),
    'dg5/site/pm_goal_dg_ca_assignment.py:600': _p(
        "The header measured is S.event_header of the expected producer: exactly "
        "seven short strings (event_id, event_type, schema_id/version, "
        "payload_schema_id, scope_kind, project_id), each a schema const or an "
        "owner-minted id of fixed short format in the schema-checked producer "
        "metadata (an oversize actor/id is refused by the GoalCancelRequestV2/"
        "ProducerInput schemas before reserve, witnessed in the supplement "
        "smoke). Even at a uniform 512 characters per member the canonical "
        "header measures 3107 bytes, under the 4096 cap; genuine ids measure 193.",
        [(AS, 597), (AS, 600), (ST, 426)]),
    'dg5/site/pm_goal_dg_ca_c1.py:628': _p(
        "In append_original the stored event is Storage's encoding of the exact "
        "producer value passed to append (required frozen at :611), and Storage "
        "validates the candidate's producer25 template at append; producer25 of "
        "the read-back event therefore equals that producer. The check runs "
        "after the append, so no preserved-effects suite negative can target "
        "it; the same comparison is negatively witnessed on the resolve path "
        "(:648).",
        [(C1, 611), (C1, 616), (C1, 628)],
        ['dg5/site/pm_goal_dg_ca_c1.py:648']),
    'dg5/site/pm_goal_dg_ca_c1.py:630': _p(
        "appender.first_receipt(handle) resolves the append-issued receipt "
        "handle through Storage.receipt_of, which returns a deepcopy of the "
        "same custody row that first_custody(event_id) returns for the event "
        "that handle was issued for; both sides are deepcopies of one row "
        "read in the same synchronous sequence with no intervening write.",
        [(C1, 626), (C1, 630), (ST, 1588), (ST, 1594)]),
    'dg5/site/pm_goal_dg_ca_assignment.py:709': _p(
        "frozen_producer can refuse only via candidate_edit diverging the "
        "producer from progress['producer_input']; the audit template is "
        "term() of the whole expected producer built from the same captured "
        "source, so any divergence in a producer field also breaks the "
        "template equality at :716 (the only template leaves not fixed by "
        "the producer are the three slots, none of which is a producer "
        "field). :716 is witnessed by a single-defect negative.",
        [(AS, 706), (AS, 709), (AS, 716), (AS, 499)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:716']),
    'dg5/site/pm_goal_dg_ca_c1.py:646': _p(
        "event_id comes from Storage.event_by_identity over the scoped "
        "identity index, which is written only by a successful append - the "
        "same append that creates the event's custody row. If the lookup "
        "misses there is no custody, so publication_from_custody refuses at "
        ":587; if it hits, :646 passes. :646 can therefore never be the "
        "sole refusal, and :587 is witnessed by a single-defect negative.",
        [(C1, 644), (C1, 646), (C1, 587), (ST, 1638)],
        ['dg5/site/pm_goal_dg_ca_c1.py:587']),
    'dg5/site/pm_goal_dg_ca_owners.py:524': _p(
        "domain_generation is set to 1 in the same install_writer_domain call "
        "that writes the domain cell, and never reset; a second install that "
        "somehow passed :524 would put the domain cell with expected=None "
        "and refuse at the Storage CAS-absent check. The in-memory flag and "
        "the stored cell are the same fact fixed by the first install.",
        [(OWN, 524), (OWN, 540), (OWN, 546)],
        ['dg5/site/pm_goal_test_storage.py:1654']),
    'dg5/site/pm_goal_test_storage.py:1602': _p(
        "authenticate_receipt compares the presented first-append receipt "
        "with the custody row's receipt; publish_control then recomputes the "
        "expected publication from that same custody row and requires the "
        "whole presented publication (which contains the receipt) to equal "
        "it at :667. Any receipt mismatch at :1602 is therefore also a "
        "publication mismatch at :667 in the same call.",
        [(ST, 1598), (ST, 1602), (C1, 665), (C1, 667)],
        ['dg5/site/pm_goal_dg_ca_c1.py:667']),
    'dg5/lease/last/number': _p(
        "ensure_lease evaluates leased_through_sequence_id = uint64(sequence "
        "+ LEASE_SIZE - 1) at :128 before current_lease.last_sequence_id = "
        "uint64(sequence + LEASE_SIZE - 1) at :130 - the identical arithmetic "
        "on the identical value in the same dict construction, so the "
        "through check refuses first on every overflowing input and passes "
        "exactly when last would pass.",
        [(AS, 125), (AS, 128), (AS, 130)],
        ['dg5/lease/through/number']),
    'dg5/site/pm_goal_dg_ca_owners.py:686': _p(
        "accept transacts the outcome value and immediately reads the same "
        "cell back in the same synchronous call; Storage transact is "
        "all-or-none and cell reads return the stored value just written, "
        "with no intervening write, so the readback equality cannot fail "
        "alone (a failed transact raises before the readback).",
        [(OWN, 683), (OWN, 686)]),
    'dg5/site/pm_goal_test_storage.py:1261': _p(
        "_handles is populated only by _issue_handle, called only with kind "
        "'reservation' (reserve/resume), and _resolve_handle is called only "
        "with kind 'reservation'; a handle passing the issuer membership "
        "check at :1260 therefore always has the required kind. The kind "
        "check can never refuse after the issuer check passes.",
        [(ST, 1253), (ST, 1271), (ST, 1261)],
        ['dg5/site/pm_goal_test_storage.py:1260']),
    'dg5/site/pm_goal_test_owner_adapters.py:542': _p(
        "AppendOwner.event checks type(handle) is OriginalHandle immediately "
        "before the _events membership check at :543; _events is a "
        "WeakKeyDictionary keyed only by OriginalHandle('event') instances "
        "minted in append_original, so any handle passing :543 has the exact "
        "type, and the type check can never refuse alone.",
        [(AD, 542), (AD, 543), (AD, 525)],
        ['dg5/site/pm_goal_test_owner_adapters.py:543']),
    'dg5/site/pm_goal_test_owner_adapters.py:548': _p(
        "AppendOwner.first_receipt checks type(handle) is OriginalHandle "
        "immediately before the _events membership check at :549; _events is "
        "keyed only by OriginalHandle('event') instances minted in "
        "append_original, so any handle passing :549 has the exact type, "
        "and the type check can never refuse alone.",
        [(AD, 548), (AD, 549), (AD, 525)],
        ['dg5/site/pm_goal_test_owner_adapters.py:549']),
    'dg5/site/pm_goal_test_storage.py:1056': _p(
        "_index_group indexes one durable group's frames; on the append "
        "path the group's event ids were required fresh and group-unique "
        "before the write (dedupe/conflict and duplicate-in-group checks), "
        "and on recovery each segment file is scanned once. A duplicate "
        "event id therefore cannot reach indexing through any family call.",
        [(ST, 1056), (ST, 1462), (ST, 1477)],
        ['dg5/site/pm_goal_test_storage.py:1462',
         'dg5/site/pm_goal_test_storage.py:1477']),
    'dg5/site/pm_goal_test_storage.py:1057': _p(
        "The scoped identity indexed at :1057 is the same (partition, type, "
        "idempotency key) identity the append dedupe path checks before "
        "writing (conflict/scoped_identity and partial-dedupe), so a second "
        "event with the same scoped identity cannot have been appended to "
        "be indexed.",
        [(ST, 1057), (ST, 1463), (ST, 1466)],
        ['dg5/site/pm_goal_test_storage.py:1463']),
    'dg5/site/pm_goal_test_storage.py:1534': _p(
        "append writes the member frames and commit frame, fsyncs, then "
        "scans the same segment bytes back; the scan's last group commit is "
        "decoded from the commit frame just written from the in-memory "
        "commit dict, with no other writer able to interleave (single "
        "synchronous call, segment truncated to the watermark first).",
        [(ST, 1509), (ST, 1531), (ST, 1534)]),
    'dg5/site/pm_goal_test_storage.py:1564': _p(
        "The custody row is constructed in _custody_row entirely from the "
        "schema-validated stored event (validate_event_record at append) "
        "plus Storage's own digests/ids of fixed formats, then checked "
        "against the custody schema it was constructed to satisfy; every "
        "field is copied from an already-validated value.",
        [(ST, 1544), (ST, 1564)]),
    'dg5/site/pm_goal_test_storage.py:1618': _p(
        "durable_group_value assembles the group value from the commit "
        "record Storage itself wrote at append (commit frame fields and "
        "member tuples from the indexed group) and checks it against the "
        "group schema those same writers satisfy; no caller-supplied field "
        "reaches it without append-time validation.",
        [(ST, 254), (ST, 1618)]),
    'dg5/site/pm_goal_test_storage.py:1624': _p(
        "read_frame is reached only from read_event (which has just required "
        "the same events-dict lookup at :1633) and from scan/recovery over "
        "already-indexed ids; on the family path the :1633 check refuses "
        "first with the identical predicate on the identical dict.",
        [(ST, 1622), (ST, 1624), (ST, 1633)],
        ['dg5/site/pm_goal_test_storage.py:1633']),
    'dg5/site/pm_goal_test_storage.py:440': _p(
        "The frame header is the 7 short strings of event_header (schema "
        "consts and owner-minted ids of fixed short format in the validated "
        "event); measured canonical length is 193 bytes for genuine ids and "
        "3107 even at a uniform 512 characters per member, under the 4096 cap.",
        [(ST, 426), (ST, 440)]),
    'dg5/site/pm_goal_test_storage.py:441': _p(
        "encode_event_frame is reached in append only after the stored-part "
        "cap requires canonical(event) <= 16384 at :1487; the frame payload "
        "is that same canonical event, three orders of magnitude under the "
        "16777216 payload cap, so the payload cap cannot refuse after the "
        "stored-part cap passes.",
        [(ST, 440), (ST, 1487), (ST, 441)]),
    'dg5/site/pm_goal_test_storage.py:470': _p(
        "validate_event_record is called only with the event dict append "
        " itself constructs (dict(candidate, observed/persisted/sequence)) "
        "or with msgpack-decoded frame values, which decode_event_value "
        "only returns as dicts for event frames; on every family path the "
        "argument is a dict by construction at the call site.",
        [(ST, 470), (ST, 1485)]),
    'dg5/site/pm_goal_test_storage.py:163': _p(
        "k_component is called only from scope_partition (whose project_id "
        "argument is type-checked str at :189 immediately before) and from "
        "index/key builders over schema-validated string fields of stored "
        "events; no family path passes a non-str component.",
        [(ST, 163), (ST, 189)],
        ['dg5/site/pm_goal_test_storage.py:189']),
    'dg5/site/pm_goal_test_owner_adapters.py:238': _p(
        "register is called only from TestOwner.__init__ with the owner's "
        "class-level role literal (every owner class in the DG lanes declares "
        "a non-empty str role, and AssociationOwner receives one of the three "
        "literal association roles from World), so role is always a "
        "non-empty str at registration.",
        [(AD, 238), (OWN, 154)]),
    'dg5/site/pm_goal_test_owner_adapters.py:239': _p(
        "owner_id is minted per TestOwner instance at construction (uuid-"
        "based TEST_ONLY id) and register is called once per instance from "
        "__init__; two live owners cannot present the same id to one "
        "registry through any family construction path.",
        [(AD, 239)]),
    'dg5/site/pm_goal_test_owner_adapters.py:383': _p(
        "Every _issue ref is either freshly minted by uid() (decision, "
        "registration, dispatch, member, receipt refs) or the sequence-"
        "formatted TEST_ONLY:original ref with a per-issue incrementing "
        "uint64 sequence, so a ref cannot already be in _originals when "
        "issued through any family owner call.",
        [(AD, 383), (AD, 380)]),
    'dg5/C3/control_epoch/number': _p(
        "The latch control_epoch increment is unreachable at the ceiling: "
        "before_stop_entry (called at latch before the increment) builds the "
        "complete numeric inventory from the current control, deriving "
        "control_epoch+1/+2 domains, and h_arg canonicalises that argument "
        "through the physical-integer range - a control_epoch at uint64 max "
        "is refused there first (witnessed in the supplement smoke: "
        "C3/argument/numrule/physical_integer_range). At publish_control the "
        "native selector sha over the same edited control refuses earlier. "
        "A stored control_epoch that could overflow the increment therefore "
        "cannot be carried to it by any coherent route state.",
        [(R3, 516), (R3, 591), (R3, 682)]),
    'dg5/site/pm_goal_dg_ca3_route.py:1189': _p(
        "control['pending'] at publish_control entails the same pending at "
        "settle_owner: the only genuine writer is GoalOwner.reserve_pending, "
        "which is fenced off while a cancellation is pending (owners :478) - "
        "and cancellation_pending is set from latch until publish itself "
        "clears it after this check - so no genuine operation can introduce "
        "a body pending between settle and publish, and settle's identical "
        "check at :866 refuses any pending introduced earlier. The same "
        "field and predicate are witnessed at :866.",
        [(R3, 866), (R3, 1189), (OWN, 478)],
        ['dg5/site/pm_goal_dg_ca3_route.py:866',
         'dg5/site/pm_goal_dg_ca_owners.py:478']),
    'dg5/site/pm_goal_dg_ca3_native.py:738': _p(
        "effects.inventory is called only from D05 aggregate/readback paths "
        "inside run_native, immediately after effects.drain has read the same "
        "members dict and capability/invocation cells in the same synchronous "
        "call; members for the run are created at effects.birth during "
        "attach_workflow and never removed, so inventory cannot find them "
        "absent after drain has just used them.",
        [(N3, 738), (N3, 741), (N3, 654)]),
    'dg5/site/pm_goal_dg_ca3_native.py:741': _p(
        "inventory re-reads exactly the capability/invocation cells drain has "
        "just read and rewritten in the same run_native call (revoke/resolve "
        "writes via _put), with no deletion path between drain and the "
        "aggregate inventory call, so no member can be unavailable there.",
        [(N3, 741), (N3, 654)]),
    'dg5/site/pm_goal_dg_ca3_route.py:794': _p(
        "The d06 scope join compares result/intent/control/origin scopes, all "
        "issued in prepare/publish from the same run_scope variable and bound "
        "together by the readback control/intent sha joins at native "
        ":1069/:1071 (any later scope tamper breaks those first, witnessed "
        "in the supplement smoke), so the four scopes cannot diverge at the "
        "route join.",
        [(R3, 794), (N3, 1069)],
        ['dg5/site/pm_goal_dg_ca3_native.py:1069']),
    'dg5/site/pm_goal_dg_ca3_route.py:797': _p(
        "result/intent/control/origin operation ids are the single d06 "
        "operation uid minted at prepare and written into every record from "
        "that variable; the readback sha joins bind the records together, "
        "so a divergent operation id cannot survive to the route join.",
        [(R3, 797), (N3, 944), (N3, 1069)],
        ['dg5/site/pm_goal_dg_ca3_native.py:1069']),
    'dg5/site/pm_goal_dg_ca3_route.py:801': _p(
        "owners_native compares the stored result cell with the result "
        "record from d06.readback, which reads that same cell (w.value) "
        "moments earlier in the same synchronous settle call; no write to "
        "the result cell runs between the two reads.",
        [(R3, 801), (N3, 1066)]),
    'dg5/site/pm_goal_dg_ca3_route.py:812': _p(
        "The safe-stop scope join compares the d05 readback's scopes with "
        "the route run scope; the d05 result/origin are bound together by "
        "the origin sha join at native :874 inside that readback, and the "
        "result was issued by aggregate from the same run_scope variable, "
        "so a scope divergence cannot survive the readback to reach :812 "
        "(witnessed: tampering the result scope refuses at :874 first).",
        [(R3, 812), (N3, 874)],
        ['dg5/site/pm_goal_dg_ca3_native.py:874']),
    'dg5/site/pm_goal_dg_ca3_native.py:803': _p(
        "aggregate is called only from run_native, which is the only caller that "
        "sets run['d05'] (at the end of aggregate itself); a second aggregate "
        "through run_native is refused earlier by the scheduler-stop store CAS "
        "on its fixed key, so 'd05' in run with aggregate re-entered cannot "
        "arise through any route call.",
        [(N3, 803), (N3, 805), (N3, 850)]),
    'dg5/site/pm_goal_dg_ca3_native.py:805': _p(
        "aggregate reads run['scheduler_stop_key'] only after scheduler.stop "
        "in the same run_native call has set it unconditionally (:635) before "
        "drain and aggregate run; the key and its cell therefore exist.",
        [(N3, 635), (N3, 805)]),
    'dg5/site/pm_goal_dg_ca3_native.py:938': _p(
        "d06.prepare is called only from run_native, which aggregate-blocks a "
        "second entry at :803 long before prepare could run twice; run['d06'] "
        "is set only at the end of prepare itself, so a re-entered prepare "
        "with 'd06' present cannot arise through any route call.",
        [(N3, 803), (N3, 938), (N3, 983)],
        ['dg5/site/pm_goal_dg_ca3_native.py:803']),
    'dg5/site/pm_goal_dg_ca3_native.py:993': _p(
        "publish is called only from run_native immediately after prepare in "
        "the same synchronous sequence, and prepare always leaves "
        "run['d06']['phase'] == 'prepared'; nothing runs between the two "
        "calls that could change the phase.",
        [(N3, 983), (N3, 993)]),
    'dg5/site/pm_goal_dg_ca3_native.py:997': _p(
        "publish compares the current body/control selectors with the "
        "before-selectors captured in prepare in the same run_native "
        "sequence; between prepare and publish only readback and reads run "
        "(no body/control writer), so the selectors cannot diverge.",
        [(N3, 948), (N3, 997)]),
    'dg5/site/pm_goal_dg_ca3_native.py:1006': _p(
        "The candidate's producer_semantic_digest is computed at prepare "
        "from the exact event dict that publish appends unchanged (the "
        "frozen producer path), and custody's digest is Storage's "
        "producer_digest of that same stored event; both are "
        "NR.producer_digest of one dict with no intervening edit path.",
        [(N3, 935), (N3, 1006)]),
    'dg5/site/pm_goal_dg_ca3_route.py:840': _p(
        "native_selections compares the d06 origin cell with the origin "
        "record from d06.readback, which reads that same cell moments "
        "earlier in the same settle call (owners_native readback precedes "
        "native_selections in settle_owner); no write intervenes.",
        [(R3, 840), (N3, 1067)]),
    'dg5/site/pm_goal_dg_ca3_route.py:996': _p(
        "late_evaluate is called only from issue_assignment_audit and "
        "append paths with slots built at the call site always containing "
        "'sequence_id' (the reserved sequence), so the late slot is bound "
        "at every reachable call.",
        [(R3, 996), (R3, 1035)]),
    'dg5/site/pm_goal_dg_ca3_route.py:1128': _p(
        "The stored event is Storage's encoding of the frozen producer "
        "(required at :1113) with exactly the reserved sequence and the "
        "Storage-assigned times that late_entry's assigned_event is built "
        "from (same reservation record and assigned times, read in the "
        "same call); the check runs after the append, so no "
        "preserved-effects suite negative can target it either.",
        [(R3, 1113), (R3, 1128), (R3, 975)],
        ['dg5/site/pm_goal_dg_ca3_route.py:1113']),
    'dg5/site/pm_goal_dg_ca3_route.py:1113': _p(
        "frozen_producer can refuse only via candidate_edit; the late "
        "template is term() of the whole expected producer (from the same "
        "captured source as the frozen producer_input), so any edited "
        "producer field also breaks the assigned-event equality at :1128 "
        "after the append. The producer is therefore never the sole "
        "refusal a suite negative can preserve effects through.",
        [(R3, 1113), (R3, 1128)],
        ['dg5/site/pm_goal_dg_ca3_route.py:1128']),
    'dg5/site/pm_goal_dg_ca3_route.py:1140': _p(
        "The receipt segment name is issued by Storage for the selected "
        "segment held under the fence, and late_reservation recorded "
        "selected_segment_name from that same segment record at reserve; "
        "post-append, so no preserved-effects suite negative can target it.",
        [(R3, 1140), (AS, 461)]),
    'dg5/site/pm_goal_dg_ca3_route.py:1145': _p(
        "check_late_domains tests receipt fields against the late numeric "
        "domains derived as singletons of the reserved values, and the "
        "receipt carries those reserved values by the assigned-event "
        "equality at :1128; post-append, so no preserved-effects suite "
        "negative can target it.",
        [(R3, 1145), (R3, 1128)],
        ['dg5/site/pm_goal_dg_ca3_route.py:1128']),
    'dg5/site/pm_goal_dg_ca3_route.py:1156': _p(
        "Same identity-index argument as C1 :646 on the C3 resolve path: "
        "event_by_identity misses only when no append indexed the event, "
        "in which case append_readback's publication_from_custody refuses "
        "at C1 :587 (witnessed there by a single-defect negative).",
        [(R3, 1156), (C1, 587)],
        ['dg5/site/pm_goal_dg_ca_c1.py:587']),
    'dg5/site/pm_goal_dg_ca3_route.py:1178': _p(
        "publish_control reads the stop record latched flag at :1178 and, "
        "later in the same call, owners_native's d05 readback requires the "
        "identical latched flag on the identical record at native :756; "
        "no stop write runs between (post_owners/readback are reads), so "
        ":1178 is never the sole refusal.",
        [(R3, 1178), (N3, 756)],
        ['dg5/site/pm_goal_dg_ca3_native.py:756']),
    'dg5/site/pm_goal_dg_ca3_route.py:1348': _p(
        "Same replay argument as C1 :823 with the added event-count term: "
        "passing :1344 means sir.accept took its replay branch, which "
        "performs no transact or append, so neither the cell generation "
        "nor the event count can move before :1348.",
        [(R3, 1342), (R3, 1348)],
        ['dg5/site/pm_goal_dg_ca3_route.py:1344']),
    'dg5/site/pm_goal_dg_ca3_route.py:1378': _p(
        "read_retained_success captures the cell generation and then only "
        "reads stored cells and schema-validates the audit record; no "
        "transact or append runs in between, so the generation cannot move.",
        [(R3, 1356), (R3, 1378)]),
    'dg5/site/pm_goal_dg_ca3_route.py:1395': _p(
        "read_retained_unsettled captures the cell generation and then only "
        "reads stored cells and schema-validates the audit record; no "
        "transact or append runs in between, so the generation cannot move.",
        [(R3, 1385), (R3, 1395)]),
    'dg5/site/pm_goal_dg_ca_owners.py:176': _p(
        "World.selection is called only from install_writer_domain (with the "
        "domain wrapper it has just written in the same call) and from "
        "PermissionOwner.selection (with the value current() has just read "
        "from that exact cell); in both, the compared stored value is the "
        "value passed, read back synchronously with no intervening write.",
        [(OWN, 176), (OWN, 239), (OWN, 541)]),
}
