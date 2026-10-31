# Shard 011: DL-271 — Onboarding credential, recovery and pairing feedback

Source: `Plans/Decision_Log.md`

Source lines: L19459-L19586

Source SHA256: `5ec3ceeb13b5b42c7b75ae4f34f7fb0f0cb4d1d1836158759c2a30d4fcc06846`

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
