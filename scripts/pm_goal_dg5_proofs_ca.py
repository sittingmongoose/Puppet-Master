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
    'dg5/site/pm_goal_dg_ca_owners.py:176': _p(
        "World.selection is called only from install_writer_domain (with the "
        "domain wrapper it has just written in the same call) and from "
        "PermissionOwner.selection (with the value current() has just read "
        "from that exact cell); in both, the compared stored value is the "
        "value passed, read back synchronously with no intervening write.",
        [(OWN, 176), (OWN, 239), (OWN, 541)]),
}
