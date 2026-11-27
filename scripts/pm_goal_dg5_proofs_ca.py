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
BO = 'scripts/pm_goal_dg_cb_owners.py'
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
        "C1.wrapper in issue_assignment_audit with assigner.audit_key, and in C2 "
        "C1.wrapper with the formatted binding_key at C2 :479 and wrap with "
        "selection_key at C2 :666); call sites passing key=None use wrapper defs "
        "without physical_key, so the branch is never taken with an empty or "
        "non-str key.",
        [(C1, 45), (C1, 56), (C1, 201), (C1, 390), (AS, 644), (C2, 479), (C2, 666)]),
    'dg5/site/pm_goal_dg_ca_c1.py:59': _p(
        "wrapper() fills every required field other than record/storage_instance_id/"
        "physical_key from the schema's const. The producer bank is the hash-pinned "
        "W12 successor selection (its bytes are verified at Roots load), and every "
        "wrapper def used by the C1/C2/C4 routes declares const for exactly those "
        "fields (schema_id/schema_version), so 'const' is always present when the "
        "branch is reached with a schema from that bank.",
        [(C1, 59), (C1, 47), ('scripts/pm_goal_own_c3_w12b_roots.py', 24)]),
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
         ('Plans/event_family_registry.json', 589)],
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
        "evaluate() has two callers. C4A calls it on the audit's "
        "exact_event_encoding_template after resolve_audit schema-checks the whole "
        "StorageAssignmentAudit; that schema closes EncodingTerm source_slot to the "
        "slots append binds (observed/persisted timestamps and "
        "cancellation_receipt_sha256 - a bogus slot is schema-refused at resolve, "
        "witnessed in the supplement smoke), and append passes exactly those slots "
        "at both evaluate calls. The second caller is ca3_route late_evaluate "
        "(C3 issue_assignment_audit, route :994-1003), which hands evaluate the "
        "leaves of the code-built late_template(), whose only source_slot values "
        "are cancellation_receipt_sha256 and the two event timestamps, and binds "
        "all of them (route :1035-1036).",
        [(AS, 377), (AS, 438), (AS, 713), (AS, 731), (R3, 994), (R3, 1003), (R3, 1035)]),
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
        "renamed between reserve and append. A fenced reserved append can "
        "still rotate (storage :1493 passes allow_rotation=fenced is None, "
        "true under the assignment fence) and "
        "so land outside the segment :196 checked; that append is refused at "
        ":205 (assignment/assigned_offset), which requires the appended event's "
        "offset and segment generation to equal the reservation's, before :745 "
        "runs. Post-append, so no preserved-effects suite negative can target "
        "it either.",
        [(AS, 461), (AS, 196), (AS, 205), (AS, 745), (ST, 1493)],
        ['dg5/site/pm_goal_dg_ca_assignment.py:196', 'dg5/site/pm_goal_dg_ca_assignment.py:205']),
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
    'dg5/site/pm_goal_test_storage.py:1624': _p(
        "read_frame is reached only from read_event (which has just required "
        "the same events-dict lookup at :1633) and from scan/recovery over "
        "already-indexed ids; on the family path the :1633 check refuses "
        "first with the identical predicate on the identical dict.",
        [(ST, 1622), (ST, 1624), (ST, 1633)],
        ['dg5/site/pm_goal_test_storage.py:1633']),
    'dg5/site/pm_goal_test_storage.py:163': _p(
        "k_component is called only from scope_partition (whose project_id "
        "argument is type-checked str at :189 immediately before) and from "
        "index/key builders over schema-validated string fields of stored "
        "events; no family path passes a non-str component.",
        [(ST, 163), (ST, 189)],
        ['dg5/site/pm_goal_test_storage.py:189']),
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
    'dg5/site/pm_goal_dg_ca3_route.py:812': _p(
        "The safe-stop scope join compares the d05 readback's scopes with "
        "the route run scope; the d05 result/origin are bound together by "
        "the origin sha join at native :874 inside that readback, and the "
        "result was issued by aggregate from the same run_scope variable, "
        "so a scope divergence cannot survive the readback to reach :812 "
        "(witnessed: tampering the result scope refuses at :874 first).",
        [(R3, 812), (N3, 874)],
        ['dg5/site/pm_goal_dg_ca3_native.py:874']),
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
    'dg5/site/pm_goal_dg_ca3_route.py:406': _p(
        "capture requires start commit scope == run_scope at :316 inside "
        "before_stop_native and association active_run_ref == run_scope "
        "goal_run_id at :351 immediately before it; :406 only restates the "
        "transitive equality of the same two values read in the same call.",
        [(R3, 316), (R3, 351), (R3, 406)],
        ['dg5/site/pm_goal_dg_ca3_route.py:316',
         'dg5/site/pm_goal_dg_ca3_route.py:351']),
    'dg5/site/pm_goal_dg_ca3_route.py:802': _p(
        "The origin issuer_method is the D06 Origin schema const written at "
        "publish from the literal in pm_goal_dg_ca3_native.publish, and its "
        "afterimages result selector is src_sel of the result cell in the "
        "same publish call that writes control['result'] from the identical "
        "src_sel; tampering either is refused earlier (seed/schema or the "
        "readback control sha joins), witnessed in the supplement smoke.",
        [(R3, 802), (N3, 1035)],
        ['dg5/site/pm_goal_dg_ca3_native.py:1069']),
    'dg5/site/pm_goal_dg_ca3_route.py:311': _p(
        "native_sources reads registered writers from writers.inventory() and "
        "before_stop_native compares each with a second inventory() call in "
        "the same synchronous sequence; inventory() is a pure read of the "
        "same registration cells with no intervening write, so the two "
        "registrations cannot differ.",
        [(R3, 298), (R3, 311)]),
    'dg5/site/pm_goal_dg_ca3_route.py:923': _p(
        "Same registered-selector argument as C1 :573 on the C3 freeze path: "
        "the producer payload_schema_id is the PAYLOAD_SCHEMA literal copied "
        "into the captured source metadata, and the registry row for "
        "goal.cancelled records that literal; source custody binds the "
        "metadata to the captured original.",
        [(R3, 923), (C1, 40)],
        ['dg5/site/pm_goal_dg_ca_c1.py:436']),
    'dg5/site/pm_goal_dg_ca3_route.py:1086': _p(
        "append_readback takes checkpoint/generation from index.current() "
        "and the token from index.read_token(), which itself calls current() "
        "again with no index publish in between (readback performs no index "
        "write), so token, checkpoint and generation name the same generation.",
        [(R3, 1086), (IX, 186)]),
    'dg5/site/pm_goal_dg_ca3_route.py:1089': _p(
        "frame['event'] is Storage's decode of the exact frame bytes whose "
        "hash read_frame has just verified, and stored_event is read_event's "
        "decode of the same frame; both are the same deterministic decode "
        "of one byte string in the same call.",
        [(R3, 1089), (IX, 212)]),
    'dg5/site/pm_goal_dg_ca3_index.py:218': _p(
        "source_frame's value_bytes is NUMRULE.event_value_bytes of the "
        "event decoded from the hash-verified frame, and encode_event_frame "
        "embeds exactly canonical(event) as the frame payload, so the "
        "computed bytes are a substring of the same raw frame by construction.",
        [(IX, 218), (ST, 435)]),
    'dg5/site/pm_goal_dg_cb_migration.py:759': _p(
        "The replay branch captures the cell generation, calls only "
        "read_result (whose own passive check at :868 requires the "
        "generation unchanged across its two predicate evaluations), and "
        "compares generation again; nothing else runs between, so the "
        "replay no-effect check restates read_result's passive guarantee.",
        [('scripts/pm_goal_dg_cb_migration.py', 759), ('scripts/pm_goal_dg_cb_migration.py', 868)],
        ['dg5/site/pm_goal_dg_cb_migration.py:868']),
    'dg5/site/pm_goal_dg_cb_migration.py:790': _p(
        "commit reads back each write from the same Storage transaction it "
        "has just applied (transact is all-or-none and w.value returns the "
        "stored value); a mismatch would mean the transaction did not apply "
        "the write it reported, which the Storage transaction contract "
        "refuses earlier.",
        [('scripts/pm_goal_dg_cb_migration.py', 790)]),
    'dg5/site/pm_goal_dg_cb_owners.py:798': _p(
        "Every genuine Stop writer maintains the invariant epochs>0 implies a "
        "last receipt: birth_domain and copy_zero_domain write epochs 0 with "
        "last ref None (the virgin branch), and manual stop/resume always "
        "issues a receipt and sets last_original_stop_receipt_ref/sha256 in "
        "the same transaction as the epoch increment, so a non-virgin record "
        "with no last receipt cannot be produced by any owner call; direct "
        "cell tampering is refused earlier by the image origin sha binding.",
        [(BO, 798)]),
    'dg5/site/pm_goal_dg_ca3_route.py:807': _p(
        "owners_native is reached only with a d06 disposition from "
        "d06.readback, whose safe-stop seed status is the literal "
        "'bounded_original_safe_stop_resolved' set when the aggregate "
        "resolved (an unresolved aggregate refuses inside readback at "
        "native :870/:876 before any disposition is returned). The "
        "stored-result conjunct (original_result.disposition) is held by "
        "the SuccessfulReadback whole root d05.readback composes through "
        "make() (native :896): make refuses a stored result whose "
        "disposition is not resolved at native :211 "
        "(native/seed_not_preserved) before owners_native. :870 holds "
        "only the in-memory resolved flag.",
        [(R3, 807), (N3, 870), (N3, 896), (N3, 211)],
        ['dg5/site/pm_goal_dg_ca3_native.py:870']),
    'dg5/site/pm_goal_dg_ca3_route.py:817': _p(
        "native_after/unchanged body+control in the disposition are the "
        "run.current() values read by d06.readback at publish/readback "
        "time, and owners_native re-reads run.current() moments later in "
        "the same synchronous settle call with no intervening run write.",
        [(R3, 817), (N3, 1010)]),
    'dg5/site/pm_goal_dg_ca3_route.py:822': _p(
        "The disposition event is built in d06.readback from "
        "storage.read_event of the same event id the route re-reads here, "
        "and its type/payload goal_run_id are the frozen producer's, "
        "bound on the D06 path: the candidate's event_type literal (the "
        "event dict at native :923-924) and payload goal_run_id from "
        "run_scope (native :920), and the "
        "custody producer digest required equal to the stored candidate's "
        "at append (native :1006, proof).",
        [(R3, 822), (N3, 1082), (N3, 920), (N3, 923), (N3, 924), (N3, 1006)],
        ['dg5/site/pm_goal_dg_ca3_native.py:1006']),
    'dg5/site/pm_goal_dg_ca3_route.py:827': _p(
        "mutation_started in the frozen producer payload is computed at "
        "freeze from the same safe-stop settlements list the disposition "
        "carries (safe['original_result']['settlements'] from the d05 "
        "aggregate that froze the event), so the boolean cannot diverge "
        "from bool(settlements) at settle.",
        [(R3, 827), (N3, 874)],
        ['dg5/site/pm_goal_dg_ca3_native.py:874']),
    'dg5/site/pm_goal_dg_cb_owners.py:154': _p(
        "msgpack_decode decodes with S.decode_canonical (:151), which is "
        "pm_event_numbers.decode_storage_value under the EVENT_VALUE "
        "profile: it re-encodes the decoded value and refuses "
        "physical_noncanonical (pm_event_numbers.py:401) unless that "
        "equals the raw bytes, which surfaces as codec/msgpack_decode at "
        ":153. S.canonical at :154 is the identical encoder "
        "(storage_value_bytes, EVENT_VALUE; pm_goal_test_storage.py:205), "
        "so every raw that passes :151 already equals S.canonical(value) "
        "and :154 cannot refuse alone. This holds for any bytes presented, "
        "including a stored carrier with codec_id MSGPACK, whose bytes "
        "physical() (:169) passes through unchanged.",
        [(BO, 154), (BO, 151), ('scripts/pm_event_numbers.py', 401), (ST, 205), (BO, 169)]),
    'dg5/site/pm_goal_dg_ca3_route.py:799': _p(
        "The route re-checks the d06 control phase/result that "
        "d06.readback has just required at native :1069 (committed phase "
        "and result selector sha) in the same settle call; a control that "
        "reached owners_native already passed that exact predicate.",
        [(R3, 799), (N3, 1069)],
        ['dg5/site/pm_goal_dg_ca3_native.py:1069']),
    'dg5/site/pm_goal_dg_cb_migration.py:451': _p(
        "cap.stop is the projection returned by the host owner's "
        "read_for_binding_migration in the same capture, built from the "
        "same stop cell whose image stop_item carries; both reads are of "
        "one cell in one synchronous capture with no stop write between.",
        [('scripts/pm_goal_dg_cb_migration.py', 451), (BO, 776)]),
    'dg5/site/pm_goal_dg_ca3_route.py:78': _p(
        "Same wrapper argument as C1 :56 on the C3 route wrapper: every "
        "wrap() call site whose def requires physical_key passes a "
        "formatted non-empty key from key()/progress_key(), and call sites "
        "without a key use defs with no physical_key requirement.",
        [(R3, 78), (R3, 186)]),
    'dg5/site/pm_goal_dg_ca3_route.py:81': _p(
        "Same wrapper argument as C1 :59: the workflow bank is hash-pinned "
        "at Roots load and every wrapper def used by the route declares "
        "const for its non-record/storage_instance/physical_key fields.",
        [(R3, 81), (R3, 186)]),
    'dg5/site/pm_goal_dg_cb_migration.py:527': _p(
        "Run bindings are enumerated by scheduler_sources only alongside a "
        "schedule for a run in the same run_ids set (the binding is "
        "appended only when its schedule cell exists), and derive_joins "
        "checks the schedule at :521 against the identical runs dict "
        "first; a binding for a missing run is never enumerated.",
        [('scripts/pm_goal_dg_cb_migration.py', 527), (BO, 1083)],
        ['dg5/site/pm_goal_dg_cb_migration.py:521']),
    'dg5/site/pm_goal_dg_cb_migration.py:532': _p(
        "Consents and callback admissions are enumerated by "
        "scheduler_sources filtered to the same run_ids set derive_joins "
        "checks against (consents by run_id in run_ids, callbacks by the "
        "scope prefix of runs in that set at schedule time); the schedule "
        "check at :521 on the identical runs dict precedes both loops.",
        [('scripts/pm_goal_dg_cb_migration.py', 532), (BO, 1083)],
        ['dg5/site/pm_goal_dg_cb_migration.py:521']),
    'dg5/site/pm_goal_dg_ca_owners.py:176': _p(
        "Within goal.cancelled, World.selection is called only from "
        "install_writer_domain (with the domain wrapper it has just written in "
        "the same call) and from PermissionOwner.selection (with the value "
        "current() has just read from that exact cell); in both, the compared "
        "stored value is the value passed, read back synchronously with no "
        "intervening write. Its one other caller, pm_goal_dg_int_goal.py:612 "
        "(psel), passes w.value(), which can be None for an absent cell; it is "
        "a DG-INT caller outside goal.cancelled and does not bear on this "
        "goal.cancelled proof.",
        [(OWN, 176), (OWN, 239), (OWN, 541), ('scripts/pm_goal_dg_int_goal.py', 612)]),
}


# Withdrawn written proofs (lead pm-ea-lead 1121094214-9517 (1)). They are kept for the record with the
# sites the re-bind patch gave them, and are deliberately outside PROOFS so no tool loads them as proofs:
# pm_goal_dg5_justified.written_proofs and keycheck.py read only PROOFS. Do not move them back without a new
# argument that survives the cited kills.
WITHDRAWN = {
    'dg5/site/pm_goal_test_owner_adapters.py:481': dict(
        reason=(
            'Contradicted at the current line: goal_run.started/stage7/wrong-handle-type/invalid is KILLED at '
            ':481 (stage-8 calls.json on adapter 707094ca: with :481 cut the call is accepted), so the type '
            'check does refuse alone and is not entailed by :482. Goal Cancelled :481 credits only by its own '
            'kill (lead pm-ea-lead 1121094214-9517 (1)).'
        ),
        proof=_p(
            "type(handle) is OriginalHandle is entailed by the next check "
            "handle in self._handles (:482): handles enter _handles only through "
            "_issue, which mints OriginalHandle instances, so anything passing "
            ":482 has the exact type, and anything failing :481 also fails :482. "
            ":481 can therefore never refuse alone; :482 closes by presence.",
            [(AD, 481), (AD, 482)],
            ['dg5/site/pm_goal_test_owner_adapters.py:482']),
    ),
    'dg5/site/pm_goal_test_owner_adapters.py:625': dict(
        reason=(
            'Contradicted at the current line: the shared re-check witness event_subclass_handle:624 puts a '
            'subclass handle into appender._events (a sealed stored-cell rewrite) and is KILLED at :625, so '
            'the type check refuses alone. The row closes by that kill (goal.cancelled-009.06), not by this '
            'proof (lead pm-ea-lead 1121094214-9517 (1)).'
        ),
        proof=_p(
            "AppendOwner.event checks type(handle) is OriginalHandle immediately "
            "before the _events membership check at :626; _events is a "
            "WeakKeyDictionary keyed only by OriginalHandle('event') instances "
            "minted in append_original, so any handle passing :626 has the exact "
            "type, and the type check can never refuse alone.",
            [(AD, 625), (AD, 626), (AD, 603)],
            ['dg5/site/pm_goal_test_owner_adapters.py:626']),
    ),
    'dg5/site/pm_goal_test_owner_adapters.py:631': dict(
        reason=(
            'Contradicted at the current line: the shared re-check witness first_receipt_subclass_handle:630 '
            'is KILLED at :631, so the type check refuses alone. The row closes by that kill '
            '(goal.cancelled-009.07), not by this proof (lead pm-ea-lead 1121094214-9517 (1)).'
        ),
        proof=_p(
            "AppendOwner.first_receipt checks type(handle) is OriginalHandle "
            "immediately before the _events membership check at :632; _events is "
            "keyed only by OriginalHandle('event') instances minted in "
            "append_original, so any handle passing :632 has the exact type, "
            "and the type check can never refuse alone.",
            [(AD, 631), (AD, 632), (AD, 603)],
            ['dg5/site/pm_goal_test_owner_adapters.py:632']),
    ),
    'dg5/site/pm_goal_test_owner_adapters.py:321': dict(
        reason=(
            'Re-judged (lead pm-ea-lead 1121094214-9517 (1)): the premise that register is only reached from '
            "TestOwner.__init__ with a class-level role does not hold at the adapter's surface. "
            "OwnerRegistry.register is a public method; the original call world.registry.register(owner, '') "
            'on a Goal Cancelled World refuses at :321 alone and is accepted with :321 cut (proof-maint '
            "rejudge registry-role-type, gated table 3cad9059233418d7 PASS), as Started's "
            'goal_run.started/stage7/registry-role-type showed. The row closes by that kill.'
        ),
        proof=_p(
            "register is called only from TestOwner.__init__ with the owner's "
            "class-level role literal (every owner class in the DG lanes declares "
            "a non-empty str role, and AssociationOwner receives one of the three "
            "literal association roles from World), so role is always a "
            "non-empty str at registration.",
            [(AD, 321), (OWN, 154)]),
    ),
    'dg5/site/pm_goal_test_owner_adapters.py:322': dict(
        reason=(
            'Re-judged (lead pm-ea-lead 1121094214-9517 (1)): register is public, so a live owner can be '
            'presented twice. world.registry.register(world.goal, world.goal.role) on a Goal Cancelled World '
            'refuses at :322 alone and is accepted with :322 cut (proof-maint rejudge registry-duplicate, '
            'gated table 1aa7962f2279b9b0 PASS). The row closes by that kill.'
        ),
        proof=_p(
            "owner_id is minted per TestOwner instance at construction (uuid-"
            "based TEST_ONLY id) and register is called once per instance from "
            "__init__; two live owners cannot present the same id to one "
            "registry through any family construction path.",
            [(AD, 322)]),
    ),
    'dg5/site/pm_goal_test_owner_adapters.py:466': dict(
        reason=(
            'Re-judged (lead pm-ea-lead 1121094214-9517 (1)): TestOwner.issue accepts a caller-supplied ref, '
            'so a ref can already be in _originals. world.goal.issue(None, {...}, ref=<an issued ref>) on a '
            'Goal Cancelled World refuses at :466 alone and is accepted with :466 cut (proof-maint rejudge '
            'issue-immutable, gated table 03aaf3d2a5c115dd PASS). The row closes by that kill.'
        ),
        proof=_p(
            "Every _issue ref is either freshly minted by uid() (decision, "
            "registration, dispatch, member, receipt refs) or the sequence-"
            "formatted TEST_ONLY:original ref with a per-issue incrementing "
            "uint64 sequence, so a ref cannot already be in _originals when "
            "issued through any family owner call.",
            [(AD, 466), (AD, 463)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:922': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Accepting mutant on a plain schema-valid request: the '
            'premise that the remaining fields are fixed-size ids is false. withdrawal_id has no maxLength and '
            "appears hex-doubled in the key, while Storage caps only the value. withdrawal_id='W'*6000 (key 12279 "
            'chars, stored value 7552 B) refuses M/withdraw/operation_cap with :922 intact and is accepted with :922 '
            'cut (probe_gc_b.py cb_migration922).'
        ),
        proof=_p(
            "The withdrawal value is the scope + three ids + the stored "
            "original result + fenced domain selection + preserved pending "
            "ids; the original result is itself a commit write already bounded "
            "by stored_part_cap as a stored part, and the remaining fields are "
            "fixed-size ids, so the operation measure cannot reach PART_CAP "
            "for any result commit could have written.",
            [('scripts/pm_goal_dg_cb_migration.py', 922), ('scripts/pm_goal_dg_cb_migration.py', 782)],
            ['dg5/site/pm_goal_dg_cb_migration.py:782']),
    ),
    'dg5/site/pm_goal_dg_cb_owners.py:286': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Accepting mutant: the premise that every transact check is '
            'built in derive() is false; the C5 owner negatives call MigrationStorage.transact directly with '
            'fixture-built checks. A direct transact whose absent-check dict carries one extra key refuses '
            'tx/check_shape with :286 intact and commits with :286 cut (probe_gc_b.py cb_owners286).'
        ),
        proof=_p(
            "Every transact check in the family is constructed in derive() as "
            "dict(table=..., key=..., expected=...) - exactly the required key "
            "set - so the shape check cannot refuse on any family path.",
            [(BO, 286), ('scripts/pm_goal_dg_cb_migration.py', 613)]),
    ),
    'dg5/site/pm_goal_dg_ca3_native.py:803': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Accepting mutant: "d05 in run with aggregate re-entered '
            'cannot arise" is false under the supplement\'s in-memory run-dict edits. With r.wf_run[\'d05\'] = {} before '
            'the first run_native, :803 refuses d05/already_aggregated intact, and with :803 cut run_native is '
            'accepted (probe_gc_a.py native803).'
        ),
        proof=_p(
            "aggregate is called only from run_native, which is the only caller that "
            "sets run['d05'] (at the end of aggregate itself); a second aggregate "
            "through run_native is refused earlier by the scheduler-stop store CAS "
            "on its fixed key, so 'd05' in run with aggregate re-entered cannot "
            "arise through any route call.",
            [(N3, 803), (N3, 805), (N3, 850)]),
    ),
    'dg5/site/pm_goal_dg_cb_owners.py:230': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Accepting mutant: "the origin binding refuses first" is '
            "false; schema_ref_for (:398) runs before the origin lookup (:400-402), and the supplement's "
            'cb_edit_reissue writes a matching origin. Reissuing the workflow body with an unknown schema_id, then '
            'image(), refuses family/unsupported_schema intact and is accepted with schema_ref None with :230 cut '
            '(probe_gc_b.py cb_owners230).'
        ),
        proof=_p(
            "The schema ids lookup values are the stored wrappers' own "
            "schema_id fields, written by the issuing owners from the same "
            "FAMILY_SCHEMAS table (wrap/store_form at issuance), so a stored "
            "original's schema_id is always a table key for its family; a "
            "tampered wrapper is refused by its issuance-origin sha binding "
            "before any schema_ref_for call in capture authentication.",
            [(BO, 230), (BO, 395)]),
    ),
    'dg5/site/pm_goal_dg_ca_owners.py:524': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Accepting mutant: "the in-memory flag and the stored cell '
            'are the same fact" is false under the supplement\'s drop() fixture. With both writer-domain cells '
            'dropped, a second install refuses domain/not_installed with :524 intact and is accepted with :524 cut '
            '(probe_gc_b.py ca_owners524).'
        ),
        proof=_p(
            "domain_generation is set to 1 in the same install_writer_domain call "
            "that writes the domain cell, and never reset; a second install that "
            "somehow passed :524 would put the domain cell with expected=None "
            "and refuse at the Storage CAS-absent check. The in-memory flag and "
            "the stored cell are the same fact fixed by the first install.",
            [(OWN, 524), (OWN, 540), (OWN, 546)],
            ['dg5/site/pm_goal_test_storage.py:1654']),
    ),
    'dg5/d06/revision/number': dict(
        reason=(
            'Withdrawn (lead pm-ea-lead 1121101954-8459 (1)) after the proof audit of 2026-11-21 '
            '(proof-audit/AUDIT.md, audit.json, probes/). Refuted premise: "every refusal in prepare is caught by '
            'run_native" is false; run_native catches only AdapterRefusal (route.py:774) and NR.uint64 raises '
            'NumruleRefusal. With the revision at 2^64-2 plus one genuine transition, run_native refuses '
            'd06/revision/numrule/integer_range intact; with the check cut a later StorageRefusal follows, so the row '
            'is the only refusal of its kind and rests only on this false proof (probe_gc_a.py d06rev).'
        ),
        proof=_p(
            "after_rev is computed only in d06.prepare, whose every refusal is "
            "caught by run_native and recorded as d06_refusal (the route entry "
            "accepts), so the overflow can never be the refusal of a family "
            "entry; and the body revision it increments is the run revision "
            "counter (see run/revision), starting at 1 and advancing once per "
            "genuine transition in the same process.",
            [(N3, 949)],
            ['dg5/run/revision/number']),
    ),
    # Round 3 (pm-ea-lead 1121124828-43f4 (b)): moved here unchanged from PROOFS; each reason names its final list, the reviews and
    # the route by which the row now closes (a kill or OPEN). Withdrawn proofs never credit.
    'dg5/site/pm_goal_dg_ca3_native.py:1006': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "The candidate's producer_semantic_digest is computed at prepare "
            "from the exact event dict that publish appends unchanged (the "
            "frozen producer path), and custody's digest is Storage's "
            "producer_digest of that same stored event; both are "
            "NR.producer_digest of one dict with no intervening edit path.",
            [(N3, 935), (N3, 1006)]),
    ),
    'dg5/site/pm_goal_dg_ca3_native.py:211': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=_p(
            "make() seeds are dicts the issuing owner has just built from "
            "stored records it validated against the same root at issuance "
            "(issue/validate paths), then re-validates with the identical "
            "validator; a seed leaf the specimen would not preserve cannot "
            "have passed issuance validation in the same process.",
            [(N3, 211), (N3, 250)]),
    ),
    'dg5/site/pm_goal_dg_ca3_native.py:805': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 audit SOUND; '
            "round 2 S-A UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's own code "
            '(rule C).'
        ),
        proof=_p(
            "aggregate reads run['scheduler_stop_key'] only after scheduler.stop "
            "in the same run_native call has set it unconditionally (:635) before "
            "drain and aggregate run; the key and its cell therefore exist.",
            [(N3, 635), (N3, 805)]),
    ),
    'dg5/site/pm_goal_dg_ca3_native.py:947': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-A-1 UNSOUND '
            '(accepting mutant), M-A-2 SOUND. 113.r2 route: kill: the mutant becomes a single-defect negative.'
        ),
        proof=_p(
            "Same prepare-only argument as d06/revision: unsupported_status is "
            "checked only in d06.prepare, whose refusals run_native catches and "
            "records instead of refusing the entry; the body status itself is "
            "written only by allocate ('running') and transition() with the "
            "statuses its callers pass from NONTERMINAL+TERMINAL.",
            [(N3, 947), (N3, 518)]),
    ),
    'dg5/site/pm_goal_dg_ca3_native.py:993': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "publish is called only from run_native immediately after prepare in "
            "the same synchronous sequence, and prepare always leaves "
            "run['d06']['phase'] == 'prepared'; nothing runs between the two "
            "calls that could change the phase.",
            [(N3, 983), (N3, 993)]),
    ),
    'dg5/site/pm_goal_dg_ca3_native.py:997': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-A-1 UNSOUND '
            '(refuted premise), M-A-2 UNSOUND (accepting mutant). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=_p(
            "publish compares the current body/control selectors with the "
            "before-selectors captured in prepare in the same run_native "
            "sequence; between prepare and publish only readback and reads run "
            "(no body/control writer), so the selectors cannot diverge.",
            [(N3, 948), (N3, 997)]),
    ),
    'dg5/site/pm_goal_dg_ca3_route.py:1189': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=_p(
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
    ),
    'dg5/site/pm_goal_dg_ca3_route.py:824': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-A-1 UNSOUND '
            '(accepting mutant), M-A-2 UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "Same first-custody read twice argument as C1 :630 on the C3 "
            "readback path: both sides are deepcopies of the one custody row "
            "for the event, read in the same synchronous sequence.",
            [(R3, 824), (N3, 1095)]),
    ),
    'dg5/site/pm_goal_dg_ca_c1.py:322': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final lists '
            'FINAL-LIST-113.r2 and FINAL-LIST-R2B. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round '
            '1 shard1 SOUND, shard2 UNSOUND; round 2 ADJ SOUND; round 2b P-B-1 UNSOUND, P-B-2 UNSOUND. 113.r2 why: '
            'both round-2b reviewers UNSOUND. 113.r2 route: kill: the mutant becomes a single-defect negative. R2B '
            'why: reproduces on the ladder: UNSOUND, accepting mutant. R2B route: kill (rule 2): this mutant as a '
            "single-defect negative, owner.inventory replaced by the owner's own body with complete=False, expecting "
            'C1/capture_source/inventory_complete/<role>.'
        ),
        proof=_p(
            "The statement is acquired only as the issuing AssociationOwner's original "
            "(registry acquire), and AssociationOwner.inventory builds it with the "
            "literal complete=True; no other statement shape can be issued or acquired, "
            "so the completeness re-check cannot refuse alone.",
            [(C1, 320), (C1, 322), (OWN, 730), (OWN, 737)]),
    ),
    'dg5/site/pm_goal_dg_ca_c1.py:628': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 SOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "In append_original the stored event is Storage's encoding of the exact "
            "producer value passed to append (required frozen at :611), and Storage "
            "validates the candidate's producer25 template at append; producer25 of "
            "the read-back event therefore equals that producer. The check runs "
            "after the append, so no preserved-effects suite negative can target "
            "it; the same comparison is negatively witnessed on the resolve path "
            "(:648).",
            [(C1, 611), (C1, 616), (C1, 628)],
            ['dg5/site/pm_goal_dg_ca_c1.py:648']),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:424': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=_p(
            "derive_joins runs only after goal enumeration and authentication "
            "succeed, which requires the goal body and control cells to be "
            "present and imageable; cap.images therefore contains both items "
            "when derive_joins reads them in the same capture call.",
            [('scripts/pm_goal_dg_cb_migration.py', 424), ('scripts/pm_goal_dg_cb_migration.py', 361)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:425': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            "(refuted premise), M-B-2 UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's "
            'own code (rule C).'
        ),
        proof=_p(
            "Same enumeration argument as :424 for the body item specifically: "
            "the goal owner's enumeration reads the body cell through "
            "body_cell (goal/body_unavailable) before any image is "
            "authenticated, so a missing body refuses there first.",
            [('scripts/pm_goal_dg_cb_migration.py', 425)],
            ['dg5/site/pm_goal_dg_cb_owners.py:438']),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:426': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=_p(
            "Same enumeration argument as :424 for the control item: the goal "
            "owner's control() read (goal/control_unavailable) precedes "
            "derive_joins in the same capture call.",
            [('scripts/pm_goal_dg_cb_migration.py', 426)],
            ['dg5/site/pm_goal_dg_cb_owners.py:443']),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:428': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            "(refuted premise), M-B-2 UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's "
            'own code (rule C).'
        ),
        proof=_p(
            "Body and control scope fields are written at goal birth from the "
            "same scope the keys are scoped by (goal keys embed project/thread/"
            "goal ids), and both cells are bound by their issuance origins in "
            "authenticate_mapping before derive_joins; a scope-divergent body "
            "cannot be the cell stored under this scope's body key without "
            "breaking that origin binding first.",
            [('scripts/pm_goal_dg_cb_migration.py', 428)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:443': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "Each receipt image in cap.images was issued by the goal owner for "
            "this scope at mutation time (receipt record scope/owner are the "
            "issuing mutation's scope and owner) and is bound by its issuance "
            "origin in authenticate_mapping before derive_joins re-checks the "
            "same fields.",
            [('scripts/pm_goal_dg_cb_migration.py', 443)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:462': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "The goal_plan_binding image is enumerated by the plan owner for "
            "this scope (gpb_key scoped by the run id under this scope) and "
            "its record goal_id is written by bind_goal from that scope; the "
            "storage instance is the wrapper's own instance stamped at "
            "issuance in this Storage.",
            [('scripts/pm_goal_dg_cb_migration.py', 462)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:782': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            "(refuted premise), M-B-2 UNSOUND (refuted premise). 113.r2 route: kill: a negative expecting the guard's "
            'own code (rule C).'
        ),
        proof=_p(
            "Commit writes are the derive() candidate: manifest parts are "
            "grouped by manifest_parts under the same PART_CAP probe size, "
            "and every other write is a schema-bounded record (binding, "
            "result with bounded scope/member selectors from the manifest "
            "parts), so no single write value can exceed the cap.",
            [('scripts/pm_goal_dg_cb_migration.py', 579), ('scripts/pm_goal_dg_cb_migration.py', 782)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:783': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "operation_cap adds only the physical_key wrapper around a write "
            "value already bounded by stored_part_cap and the manifest "
            "grouping probe, which sizes parts with the identical "
            "dict(physical_key, value) measure; non-part writes are "
            "schema-bounded records far under the cap (see :782).",
            [('scripts/pm_goal_dg_cb_migration.py', 579), ('scripts/pm_goal_dg_cb_migration.py', 783)],
            ['dg5/site/pm_goal_dg_cb_migration.py:782']),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:842': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 UNSOUND, '
            'shard3 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "read_result re-measures manifest parts that manifest_parts "
            "grouped under exactly this cap measure at commit and that are "
            "bound by the whole-manifest sha check at :844 in the same "
            "predicate; a part over cap cannot have been committed.",
            [('scripts/pm_goal_dg_cb_migration.py', 579), ('scripts/pm_goal_dg_cb_migration.py', 842)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:867': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            '(refuted premise), M-B-2 UNSOUND (accepting mutant). 113.r2 route: kill: a negative expecting the '
            "guard's own code (rule C)."
        ),
        proof=_p(
            "read_result evaluates the identical pure predicate twice over the "
            "same stored cells with no intervening write (its own passive check "
            "at :868 covers the same span), so the two results cannot differ "
            "through any genuine call (the helper test seam is not a family "
            "entry argument).",
            [('scripts/pm_goal_dg_cb_migration.py', 862), ('scripts/pm_goal_dg_cb_migration.py', 867)],
            ['dg5/site/pm_goal_dg_cb_migration.py:868']),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:868': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "read_result captures the cell generation and then only reads "
            "stored cells and schema-validates them (predicate run twice, both "
            "read-only); no transact or append runs in between, so the "
            "generation cannot move.",
            [('scripts/pm_goal_dg_cb_migration.py', 826), ('scripts/pm_goal_dg_cb_migration.py', 868)]),
    ),
    'dg5/site/pm_goal_dg_cb_migration.py:920': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            '(accepting mutant), M-B-2 UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "withdraw reads the stored result via result_selection at entry "
            "as 'original' and re-reads the identical cell at :920 in the same "
            "synchronous call; the only writes in between are the read_result "
            "audit (passive, :868) and no result write, so the two reads "
            "cannot differ.",
            [('scripts/pm_goal_dg_cb_migration.py', 920)],
            ['dg5/site/pm_goal_dg_cb_migration.py:868']),
    ),
    'dg5/site/pm_goal_dg_cb_owners.py:289': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 2 M-B-1 UNSOUND '
            '(accepting mutant), M-B-2 UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "Derive builds checks only with expected=<captured version> (never "
            "None), so the expected-is-None absent branch of MigrationStorage."
            "transact is unreachable from any family caller.",
            [(BO, 289), ('scripts/pm_goal_dg_cb_migration.py', 613)]),
    ),
    'dg5/site/pm_goal_dg_cb_owners.py:291': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard1 UNSOUND, '
            'shard2 UNSOUND; round 2 ADJ UNSOUND (accepting mutant). 113.r2 route: kill: the mutant becomes a '
            'single-defect negative.'
        ),
        proof=_p(
            "MigrationStorage.transact checks are built only in Coordinator."
            "derive from the capture images' versions, and commit re-derives "
            "the candidate from a final capture and requires the checks to be "
            "identical (final_candidate) before transacting; a cell whose "
            "version moved between capture and commit is therefore refused at "
            "final_candidate (or independent/final capture) before any stale "
            "check can reach transact, and no write runs between the final "
            "derive and the transaction in the same call.",
            [(BO, 291), ('scripts/pm_goal_dg_cb_migration.py', 778)]),
    ),
    'dg5/site/pm_goal_test_storage.py:1618': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final list '
            'FINAL-LIST-113.r2. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round 1 shard0 SOUND; '
            'round 2 S-A SOUND (entailment). 113.r2 why: addendum 3: same field, any value its type admits. 113.r2 '
            "route: kill: a negative expecting the guard's own code (rule C)."
        ),
        proof=_p(
            "durable_group_value assembles the group value from the commit "
            "record Storage itself wrote at append (commit frame fields and "
            "member tuples from the indexed group) and checks it against the "
            "group schema those same writers satisfy; no caller-supplied field "
            "reaches it without append-time validation.",
            [(ST, 254), (ST, 1618)]),
    ),
    'dg5/run/revision/number': dict(
        reason=(
            'Withdrawn in proof maintenance round 3 (pm-ea-lead 1121124828-43f4 (b)), on the final lists '
            'FINAL-LIST-113.r2 and FINAL-LIST-R2B. Reviews (event-authority-20261104/reviews/PROOF-REVIEW-R2): round '
            '1 shard1 UNSOUND, shard2 SOUND; round 2 ADJ SOUND; round 2b P-B-1 UNSOUND, P-B-2 CANNOT_DECIDE. 113.r2 '
            'why: ADJ3: break stands at level 2 (run.restart at level 1). 113.r2 route: kill: a negative expecting '
            "the guard's own code (rule C). R2B why: break stands (P-B-1), refuted premise. R2B route: kill: "
            'owner-shaped run at revision 2**64-1, route to terminal, run.restart, expecting '
            'run/revision/numrule/integer_range, under the forked judge.'
        ),
        proof=_p(
            "run['revision'] is an in-memory counter starting at allocation "
            "and incremented once per genuine run transition in the same "
            "process; no stored input carries it, so no single-defect case "
            "can present it at the uint64 ceiling.",
            [(N3, 518)]),
    ),
    # Round 3 follow-up 1 (pm-ea-lead 1121132345-c739): FINAL-LIST-113.r4 withdrawals after the S2-SURV
    # review, moved here unchanged.
    'dg5/site/pm_goal_dg_ca3_native.py:142': dict(
        reason=(
            'Withdrawn in proof maintenance round 3, follow-up 1 (pm-ea-lead 1121132345-c739), on FINAL-LIST-113.r4 '
            '(sha256 6a2c1422...). Review S2-SURV '
            '(event-authority-20261104/reviews/PROOF-REVIEW-R2/S2-SURV/REVIEW.md): UNSOUND, accepting mutant. Run to '
            'settle_owner, replace the D06 intent.safe_stop_source with src_sel(D05 result) keeping the sha and '
            "setting schema_version to 9.9.9, reseal the control intent sha (level 3, the supplement's "
            'c3/d06_d05_join channel): intact refuses selector_schema at :142; cut, settle_owner and freeze_event '
            'accept (probe_native142.py, reproduced). r4 route: kill: the mutant becomes a single-defect negative '
            '(S2-SURV, level 3 via c3/d06_d05_join field).'
        ),
        proof=_p(
            "verify_custody checks the selector sha against the current cell "
            "bytes immediately before the schema check; a cell whose schema_id "
            "differed from the selector's would have different bytes and is "
            "refused at selector_hash first, and a sha-matching cell carries "
            "the selector's schema_id by construction of src_sel.",
            [(N3, 140), (N3, 142)]),
    ),
    # Round 3 follow-up 1, second commit (pm-ea-lead 1121132345-c739): ca3_route :801, whose corrected
    # argument a probe of the different-key case refutes, moved here unchanged.
    'dg5/site/pm_goal_dg_ca3_route.py:801': dict(
        reason=(
            'Withdrawn in proof maintenance round 3, follow-up 1 (pm-ea-lead 1121132345-c739: correct the argument '
            'for the older-saved-version case, or leave :801 withdrawn if the corrected claim is false). It is false. '
            'FINAL-LIST-113.r4 held it (held_needs_targeted_review) after the ROUND3-EDITS review: verify_custody '
            '(native :138-140) also accepts a selector whose digest is an older committed version of its cell '
            '(WorkflowLeasedStorage.committed_version, route :104-112). Probe '
            'round3-edits/followup1/probes/probe_801.py (sha256 4ce470d1a4e96015...) at owner 34f212, case '
            'diffkey_old_both, run twice: at settle_owner, commit a copy of the genuine d06 result V at a new key K2, '
            "then commit V with record.committed_at_utc changed at K2, and re-point the d06 control's result selector "
            "and the publish origin's afterimages.result to K2 keeping the digest of V (genuine transactions). "
            "verify_custody passes through committed_version, and :1069 still holds at the run dict's result_key. "
            'Intact, settle_owner refuses C3/settle_owner/d06_result_custody at :801; with :801 cut, settle_owner and '
            'freeze_event both accept. So :801 is the only check that refuses: the row closes only by a kill (this '
            'input as a single-defect negative). With the origin left unchanged the cut is caught at :802 '
            '(d06_origin_publish), a different code; with a single current commit at K2, or a same-key rewrite, :801 '
            'never refuses.'
        ),
        proof=_p(
            "owners_native compares the cell named by the d06 control's result "
            "selector with the result record from d06.readback, which reads "
            "the result by the run dict's result_key (native :1066). The two "
            "are bound by the control_result hash and verify_custody, not by "
            "being the same cell: d06.readback requires at native :1069 that "
            "the control's result selector digest equals the row hash of the "
            "record it read, and verify_custody (route :788, its hash check at "
            "native :140) requires, before :801 in the same synchronous settle "
            "call, that the cell the selector names carries that digest. No "
            "write to the result cell runs between these reads and :801.",
            [(R3, 801), (N3, 1066), (N3, 1069), (R3, 788), (N3, 140)]),
    ),
}


# Landed from methodb-pilot a17cf2bb8c, scripts/pm_goal_dg5_methodb_stage8_ca_template_keys.py PROOFS (the
# stage-8 intake that admitted the row); every cited line is current at the lane head.
PROOFS.update({
    'dg5/site/pm_goal_dg_ca_assignment.py:715': dict(
        kind='template_value_requires_same_keys',
        families=['goal.cancelled'],
        depends_on=['dg5/site/pm_goal_dg_ca_assignment.py:716'],
        sites=[
            (AS, 714),
            (AS, 715),
            (AS, 716),
            (AD, 83),
            (AD, 88),
        ],
        argument=(
            'The two adjacent checks use the same two dictionaries. The later equality check requires '
            'identical keys before comparing values. The original extra-template-member example refuses at '
            'the key check. Disabling just that check exposes the later value check. Disabling just the value '
            'check preserves the key refusal, disabling both allows the original append to complete, and '
            'restoring both repeats the original refusal.'
        ),
    ),
})
