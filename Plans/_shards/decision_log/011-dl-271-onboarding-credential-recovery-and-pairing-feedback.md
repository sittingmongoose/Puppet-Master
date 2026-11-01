# Shard 011: DL-271 — Onboarding credential, recovery and pairing feedback

Source: `Plans/Decision_Log.md`

Source lines: L19553-L19762

Source SHA256: `180b737ae2600e00fdd56c9c0a74e451653f67027aeaf4666e2c3bbd3ea910d4`

---

## DL-271 — Onboarding credential, recovery and pairing feedback

```yaml
plan_unit_id: DL-271
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'DL-271 records the PM7 final onboarding batch accepted through the lead on 2026-10-31. DL-271 FO-11,
  2026-10-31: where an OpenCode server requires its own HTTP Basic credentials, the Password field asks for that server’s
  password, not an AI provider’s API key or the person’s Puppet Master sign-in. Its hint states that distinction and
  identifies credential custody in the OS keychain on the selected execution host, through the existing credential owner.
  Optional server auth stays optional when the server needs none. Protected entry, secret-free readback and exact host/account
  binding remain; an API-key-only hint is used only on an actual API-key field. DL-271 FO-12, 2026-10-31: Protect’s missing-access
  guidance is count-neutral: ask for the access details without claiming a fixed number of fields. The selected Backup
  destination family, auth method and credential mode determine the actual required fields and validation through their
  existing owner. Changing the line never omits a required credential, locator, region or temporary-session value and
  never turns incomplete access into an available Connect action. DL-271 Unlock wording, 2026-10-31: ask for your recovery
  phrase, rather than six words or another fixed word count. The Recovery Kit is not a six-word format (PWIZ-025/BRS-018);
  the Backup owner still defines and verifies the real protected recovery material and its exact source/target binding.
  The wording admits no new phrase format, key derivation, unlock proof or weaker secret-handling rule. DL-271 weak-key
  eligibility, 2026-10-31: Choose a key may list a DSA or RSA-1024 key as Too weak to use, but it cannot be selected,
  used as a default, advanced or installed. The refusal reads Older key type — too weak to use. Check this eligibility
  before an existing authorization, matching prior profile or passphrase/unlock state; those cannot make a weak key usable.
  A retained weak selection must be replaced by an owner-eligible key before the flow advances. Other keys keep their
  existing owner checks, identity binding and custody; the shared list never exposes or moves a private half. DL-271
  initial request waiting, 2026-10-31: while the current invitation is live and no device request has arrived, Your Server
  is ready shows No requests yet with Check again. Checking re-reads the current owner run; a real arriving request also
  updates that view. This neutral state is not an error and invents no candidate, approval or trust. Continue retains
  its existing Server-ready gates. Keep it distinct from DL-259 FO-7’s answered approval/rejection: a completed request
  stays answered, and a fresh request requires the existing new-code/new-generation route. DL-271 FO-14, 2026-10-31:
  long tokens in an opened question note wrap within its available width, so their full text is readable without horizontal
  scrolling. Keep vertical scrolling when the note exceeds its available height. This applies to Plain English and Expert,
  including NieR, and visual wrapping preserves the exact token for copying; it adds no second note renderer or per-family
  content version.'
gui_related: true
gui_classification_reason: Corrects credential/recovery wording, weak-key eligibility and visible pairing waiting state.
split_recommended: false
depends_on:
- DL-126
- DL-259
- DL-260
- PWIZ-021
- PWIZ-025
- PO-009
- SSYS-042
- SRV-004
unblocks: []
acceptance_criteria:
- 'DL-271 FO-11, 2026-10-31: where an OpenCode server requires its own HTTP Basic credentials, the Password field asks
  for that server’s password, not an AI provider’s API key or the person’s Puppet Master sign-in. Its hint states that
  distinction and identifies credential custody in the OS keychain on the selected execution host, through the existing
  credential owner. Optional server auth stays optional when the server needs none. Protected entry, secret-free readback
  and exact host/account binding remain; an API-key-only hint is used only on an actual API-key field.'
- 'DL-271 FO-12, 2026-10-31: Protect’s missing-access guidance is count-neutral: ask for the access details without claiming
  a fixed number of fields. The selected Backup destination family, auth method and credential mode determine the actual
  required fields and validation through their existing owner. Changing the line never omits a required credential, locator,
  region or temporary-session value and never turns incomplete access into an available Connect action.'
- 'DL-271 Unlock wording, 2026-10-31: ask for your recovery phrase, rather than six words or another fixed word count.
  The Recovery Kit is not a six-word format (PWIZ-025/BRS-018); the Backup owner still defines and verifies the real
  protected recovery material and its exact source/target binding. The wording admits no new phrase format, key derivation,
  unlock proof or weaker secret-handling rule.'
- 'DL-271 weak-key eligibility, 2026-10-31: Choose a key may list a DSA or RSA-1024 key as Too weak to use, but it cannot
  be selected, used as a default, advanced or installed. The refusal reads Older key type — too weak to use. Check this
  eligibility before an existing authorization, matching prior profile or passphrase/unlock state; those cannot make
  a weak key usable. A retained weak selection must be replaced by an owner-eligible key before the flow advances. Other
  keys keep their existing owner checks, identity binding and custody; the shared list never exposes or moves a private
  half.'
- 'DL-271 initial request waiting, 2026-10-31: while the current invitation is live and no device request has arrived,
  Your Server is ready shows No requests yet with Check again. Checking re-reads the current owner run; a real arriving
  request also updates that view. This neutral state is not an error and invents no candidate, approval or trust. Continue
  retains its existing Server-ready gates. Keep it distinct from DL-259 FO-7’s answered approval/rejection: a completed
  request stays answered, and a fresh request requires the existing new-code/new-generation route.'
- 'DL-271 FO-14, 2026-10-31: long tokens in an opened question note wrap within its available width, so their full text
  is readable without horizontal scrolling. Keep vertical scrolling when the note exceeds its available height. This
  applies to Plain English and Expert, including NieR, and visual wrapping preserves the exact token for copying; it
  adds no second note renderer or per-family content version.'
validation_surfaces:
- python3 scripts/pm7-build-check.py
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm7-demo-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: credential_confusion_unsafe_key_selection_or_pairing_state
reasoning_tier: high
context_scope: onboarding_credential_and_pairing_feedback
implementation_surfaces:
- Plans/Provider_OpenCode.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/Server_System.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_amendment
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- 'PM7 final batch, lead 1031214952-2d19 (2026-10-31), integration 2819a3def0: FO-11 2a3661f021; FO-12/Unlock 4c6305553d;
  weak-key/waiting view dfbaacbad7. Provider/onboarding/server reports are source lineage only; no concept host, seeded
  situation, artificial delay or helper API is a product requirement. Lead 1031215509-a74e confirms unconditional weak-key
  refusal.'
- 'PM7 final batch, lead 1031214952-2d19 (2026-10-31), integration 2819a3def0: FO-11 2a3661f021; FO-12/Unlock 4c6305553d;
  weak-key/waiting view dfbaacbad7. Provider/onboarding/server reports are source lineage only; no concept host, seeded
  situation, artificial delay or helper API is a product requirement. Lead 1031215509-a74e confirms unconditional weak-key
  refusal.'
preserved_exact_tokens:
- DL-271
- OpenCode
- DSA
- RSA-1024
- Too weak to use
- Older key type — too weak to use
- No requests yet
- Check again
- recovery phrase
negative_constraints:
- Do not persist protected input in ordinary drafts, receipts or logs.
- Do not invent a fixed recovery-phrase format or change Backup cryptography.
- Do not allow prior authorization or passphrase state to bypass weak-key refusal.
- Do not promote concept scaffolding, artificial owner delays or prefilled scenarios into product canon.
- Do not add commands, trust authority or executable build tasks.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Provider_OpenCode.md
- Plans/Settings_System.md
- Plans/Server_System.md
```


### DL-272 — Footage review alignment, real product rules

```yaml
plan_unit_id: DL-272
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'DL-272 records the PM7 lead’s 2026-11-01 footage batch at integration 7d2dd568be, not a new set
  of personal rulings by Jared. Existing DL-126, DL-257, DL-259, DL-260 and DL-271 remain constraints. It aligns
  protected sign-in fallback/addition/retry and per-service expiry, native-Client auth before listing under D7,
  matching identity/pairing feedback, generated proxy files and actionable failures, truthful restore/Ready status,
  source-control validation/privacy/access/selection, and fixed readable stage/indicator/Pip success behavior. It
  adds the single Models route-disable command of CS-108/UCC-213. Stale canon’s global five-minute timeout and blanket
  pre-Review auth prohibition are amended only as specified by MA-047/RAS-014/PWIZ-021/025. Remote Link grammar
  remains deferred by Jared’s REMOTE-CODE-1; XXXX-XXXX belongs only to pairing-code display. Forgejo restricted-token
  support without account identity remains an owner question. Demo mechanics, samples, Studio situations, concept
  hosts, seeds, timings and source function names are not product rules. No governance reseal, WorkNodes, NodeSeeds
  or native/runtime acceptance is supplied.


  Final delta FO-16/FO-18/FO-19, lead 2026-11-01, integration 0cf2bf59e4: choosing another option ends the old refusal
  feedback without a cheer; no usable AI or Free Models means calm Almost ready in every look with no celebration;
  long values wrap in their pane with a fingerprint’s hash whole on its own line after its algorithm when needed.
  PWIZ-022, MS-122, F3-520/598/600/663 and DR-020/080 own the amendments. No Jared ruling changes, new commands,
  Settings rows or trust authority result. Codeberg naming/admission and Forgejo restricted-token support remain
  Jared’s open questions.'
gui_related: true
gui_classification_reason: Defines user-visible setup/feedback or its exact owner-routed control.
split_recommended: false
depends_on:
- DL-259
- DL-271
unblocks: []
acceptance_criteria:
- DL-272 records the PM7 lead’s 2026-11-01 footage batch at integration 7d2dd568be, not a new set of personal rulings
  by Jared. Existing DL-126, DL-257, DL-259, DL-260 and DL-271 remain constraints. It aligns protected sign-in fallback/addition/retry
  and per-service expiry, native-Client auth before listing under D7, matching identity/pairing feedback, generated proxy
  files and actionable failures, truthful restore/Ready status, source-control validation/privacy/access/selection, and
  fixed readable stage/indicator/Pip success behavior. It adds the single Models route-disable command of CS-108/UCC-213.
  Stale canon’s global five-minute timeout and blanket pre-Review auth prohibition are amended only as specified by MA-047/RAS-014/PWIZ-021/025.
  Remote Link grammar remains deferred by Jared’s REMOTE-CODE-1; XXXX-XXXX belongs only to pairing-code display. Forgejo
  restricted-token support without account identity remains an owner question. Demo mechanics, samples, Studio situations, concept hosts, seeds, timings and source function names are
  not product rules. No governance reseal, WorkNodes, NodeSeeds or native/runtime acceptance is supplied.
- 'Final delta FO-16/FO-18/FO-19, lead 2026-11-01, integration 0cf2bf59e4: choosing another option ends the old
  refusal feedback without a cheer; no usable AI or Free Models means calm Almost ready in every look with no celebration;
  long values wrap in their pane with a fingerprint’s hash whole on its own line after its algorithm when needed.
  PWIZ-022, MS-122, F3-520/598/600/663 and DR-020/080 own the amendments. No Jared ruling changes, new commands,
  Settings rows or trust authority result. Codeberg naming/admission and Forgejo restricted-token support remain
  Jared’s open questions.'
validation_surfaces:
- python3 scripts/pm7-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: owner_identity_and_truthful_feedback
reasoning_tier: high
context_scope: pm7_footage_review_20261101
implementation_surfaces:
- Plans/Decision_Log.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01
- Concepts/onboarding/opus-5.5 at7d2dd568be76874ff8b4d3e82bad3701226d248c (source lineage only)
- PM7 final delta FO-16/FO-18/FO-19; lead mail 1101140232-5344, 2026-11-01; integration 0cf2bf59e4d9048d65f56842c7b8bc75eda9be78.
  Actual 60-ui-core.js, 61-components.js, 74-screens-ready.js and 10-window.css under Concepts/onboarding/opus-5.5/src
  are source lineage only.
preserved_exact_tokens:
- DL-272
- DL-126
- DL-259
- DL-260
- DL-271
negative_constraints:
- Do not infer native handlers, trust, success, credential authority or governance readiness from a concept or static
  fixture.
owner_hints:
- Plans/Decision_Log.md
```
