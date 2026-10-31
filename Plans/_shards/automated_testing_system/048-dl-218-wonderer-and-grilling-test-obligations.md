# Shard 048: DL-218 Wonderer and grilling test obligations

Source: `Plans/Automated_Testing_System.md`

Source lines: L6549-L6666

Source SHA256: `c6a020b3dcd9310c03940a59fca04a218f2734d59ca3567dbb193deec919b6c0`

---

## DL-218 Wonderer and grilling test obligations

| Owner | Required proof beyond the positive path |
|---|---|
| CWR-041 | A first pass at start and at most two further delivered passes; three to five leads is a target, five is the maximum, and thin or empty delivered passes are valid. Record leads/no_new_leads truthfully; reject six leads, pass 4, missing tether/sources, blank or whitespace-only reasons, substantiation without evidence and set-aside without a reason. A failed, timed-out or unavailable further attempt consumes no repeat. |
| CWR-041, PART-011..015 | Join each vote's current participant identity to its roster/attempt; Wonderer casts no support, oppose or abstain record. Displayed Abstained never contributes to either denominator. A changed ordinary role votes only through its new current attempt; never convert historical Wonderer evidence. Deny Grill Me participant role, Persona and Skill spellings case-insensitively. |
| CWR-041 | The first BrainStorm pass starts in Intake before blind proposals take concurrency, later passes queue behind core work, and every pass stays blind until all proposals are in. Crew split receives the first pass; room round 1 starts on time and its first pass joins between turns whenever delivered. Recorded failure outcomes let the run continue. Record dispositions from Debate, while splitting or on later delivery. |
| CWR-041, UCC-205 | Check It accepts any disposition in running/waiting Crew, BrainStorm and Chat Room while lead admission is open; its BrainStorm alias reaches the same operation. Research already in flight returns the existing operation without another attempt. Both result definitions require receipts, resulting revision/currentness and a terminal evidence/reason outcome or observable running work. Test all canonical and compatibility surfaces. |
| CWR-041, CWR-043 | BrainStorm/Crew synthesis waits on in-flight passes, undecided leads and research; starting it atomically refuses later pass or Check It requests with lead_admission_closed and binds publication to its starting lead/research revision. Chat Room summary/end never waits and lists undecided leads as not taken up. |
| CWR-042 | Grill Me adds no participant, model, Persona, lane, slot or vote. User-only rounds ask the whole ready frontier with settled prerequisites and no one-question-at-a-time option. Facts route to research; only dependent questions wait. Reuse prior answers, preserve one bank/counter and routed set keyed by collaboration_run_id, baseline 0 in Crew/Chat Room, QMAX-005..007 charge and QMAX-014..015 typed exhaustion. |
| CWR-042, APR-072 | Automatic completion needs no ready decision, pending fact research or unsettled branch. A decision left open, and every decision that depends on it, is listed as open in What we agreed and does not count as an unsettled branch. A frontier waiting only on research stays waiting with feedback and recomputes on return; I don't know removes a decision from the frontier and lists it open. Wrap up and cap end with open items. Every session has its own What we agreed and fresh Confirm; Keep going preserves history and count. Exhaustion, stale identity, denial, duplicate submit and restart never bypass its gate. |
| CWR-042, ACD-503 | Initial Crew split, room round 1, BrainStorm proposals and Plan writes wait for that session's Confirm. Mid-run activation starts at the next round, assignment or phase boundary, continues already running work and gates only the step using the new answers. Every later decision session needs its own current agreement Confirm, with the same counter. |
| CWR-043, ACD-503 | Numbered questions, preselected recommendations, explicit accept-the-round, Wrap up, all answered/open decisions, Confirm and Keep going render truthfully. Preselection never submits. Grill Me marks the existing coordinator/moderator. Lead rows show tether, source, reason and recorder; disposition set_aside shows set aside, research set_aside shows not supported. Keyboard and pointer use identical controls and reasons. |
| CW section 17, MIG-021 | Convert definitions for future runs and terminal runs once, preserving attribution, Usage, answers and ordinary historical votes. An in-progress run finishes with its recorded roster or quarantines, with no hot swap of voters, quorum or confirmation gate. Restart is idempotent; ambiguous identity quarantines. |

The static fixture gate proves schemas and its explicit roster join only. Protocol, attempt fencing, actual questionnaire behavior, native storage, visual, restart and provider proof remain future runtime obligations, not inferred from a passing shape check.

### ATS-078 - Wonderer Passes And Grilling Confirmation Obligations

```yaml
plan_unit_id: ATS-078
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DL-218 adds test obligations for CWR-041, CWR-042, CWR-043 and APR-072. Validate every admitted
  positive definition against both its selected definition and the full root schema. Validate
  WondererPass numbers 1..3, target three to five leads with maximum five, truthful outcome leads or
  no_new_leads, valid thin and empty repeats, and refusal of six leads. Each WondererLead needs a
  tether and source_refs; dispositions need non-whitespace reasons and a recorder, substantiated
  needs evidence_refs and null set_aside_reason, and set_aside needs a non-whitespace reason. Both
  alias-identical research results require receipts, resulting revision and currentness on success
  and either a terminal evidence/reason outcome or an observable running operation. Reject missing
  values and whitespace-only reasons. Deny Grill Me role, Persona and Skill participant names
  case-insensitively. The fixture-only roster join rejects every Wonderer vote, even abstain, while
  displayed Abstained stays outside both denominators. Runtime tests must prove that a failed first
  pass is never retried automatically, that a requested pass after it is further pass 2 and counts
  toward the two on delivery, and first-pass Intake admission before blind proposals take
  concurrency, every-pass blind isolation, queued later passes behind core work, no repeat charge
  for failed, timed-out or unavailable further attempts, and Chat Room round 1 starting on time with
  later pass delivery between turns. Grill Me's initial interview still precedes room round 1.
  Verify disposition recording from Debate, while splitting or on later delivery, and
  BrainStorm/Crew synthesis gating on accepted passes, undecided leads and in-flight research.
  Synthesis atomically closes further-pass and Check it admission with lead_admission_closed and
  binds publication to its starting lead/research revision; Check it coalesces an already running
  lead operation. A refused further-pass message returns CollaborationMessageResult with
  lead_admission_closed and a null collaboration_message_id, delivers no request and starts no pass.
  Exercise all kinds and BrainStorm alias paths. Grill Me adds no participant or Persona. Test
  whole-frontier user-only rounds with numbered preselected recommendations, explicit
  accept-the-round, fact routing and prior-answer reuse. Crew and Chat Room use one
  collaboration_run_id QuestionBank with baseline 0, routed sets, QMAX-005..007 first durable
  presentation charging and QMAX-014..015 typed exhaustion; extension is the whole maximum. The Crew
  or Chat Room bank opens on the first Grill Me enablement and never charges earlier ordinary
  needs-you prompts. A research-blocked frontier must wait with feedback and recompute on return; I
  don't know leaves the frontier and appears as open in What we agreed. Automatic completion
  requires no ready decision, pending fact research or unsettled branch. A decision left open, and
  every decision that depends on it, is listed as open in What we agreed and does not count as an
  unsettled branch. Wrap up and cap completion list open items. Mid-run enablement starts at the
  next round, assignment or phase boundary, continues running work and gates only the step using
  newly confirmed answers. Every later decision session has its own What we agreed and fresh
  Confirm, preserving one counter. Check set aside for disposition and not supported for research,
  stale/repeated actions and restart. MIG-021 converts definitions and terminal runs while
  preserving attribution; an in-progress run finishes under its recorded roster or quarantines
  without swapping voters, quorum or confirmation gates. Static schema/fixture success proves no
  native handler, migration execution, UI, provider or recovery behavior.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- CWR-041
- CWR-042
- CWR-043
- APR-072
- ACD-503
- ATS-062
unblocks: []
acceptance_criteria:
  - "Every positive admitted definition passes full-root validation and every named negative fails its stated constraint."
  - "No Wonderer vote or self-dispatched research is admitted; all pass timings, counts and empty outcomes follow CWR-041."
  - "Synthesis waits on passes, dispositions and research, closes admission atomically and publishes only its starting revision."
  - "No duplicate Check it operation starts while one is in flight; both command IDs enforce identical result boundaries."
  - "Pending research never silently completes grilling, and open decisions and each agreement remain visible."
  - "Only each agreement's Confirm releases its consuming step; boundary activation preserves running work and one counter."
  - "No migration hot-swaps an in-progress run; runtime and migration proof remain separate from static validation."
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: wonderer_grilling_contract_coverage
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/collaborative_workflows_contract_fixtures.json
- Plans/assistant_chat_contract_fixtures.json
- scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
preserved_exact_tokens:
- CWR-041
- CWR-042
- CWR-043
- APR-072
- WondererPass
- WondererLead
- MIG-021
negative_constraints:
- Do not count displayed Wonderer abstention as a vote record.
- Do not label static fixtures as native or visual proof.
owner_hints:
- Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043
