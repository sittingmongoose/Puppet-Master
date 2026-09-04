# Production port and owner boundaries

## Scope and authority

This delivery is one isolated interactive concept. It neither updates canonical Plans nor authorizes production WorkNodes. `TestPMConcept.html` was captured from main at `4c88c0f01300cea36135b73eec96991d73969aa2`. Its source SHA-256 is `ea9c502a1c4a456f3e092c45d3524105153f9bba52d36f26fbfad922e885a4ef`. The current `Plans/UI_Command_Catalog.md` was read to confirm catalog ownership and permission/freshness requirements; the complete catalog-to-adapter binding has **not** been certified. Strings in Astra's diagnostic log must not be promoted into new canonical commands by copying this prototype.

## Existing components exercised

| Surface | Existing owner reused | What the concept proves |
|---|---|---|
| Project creation/opening | `PM_DEMO.actions`: `proj.new.open`, `proj.folder.open`, `proj.new.create`, `proj.open`; existing project-picker click handler | Local project card and active project only after explicit confirmation |
| Settings inheritance | `PM12_KIMI`'s existing `settingsCopySources`, `prepareDetachedSettingsCopy`, `applyDetachedSettingsCopy` | Preview and selected-group application through the existing detached Settings Transfer code |
| Chat and Teacher | Existing Chat thread, persona picker, composer, `chat.send`, stream/state events | One deterministic local example in the actual Chat surface; no paid completion |
| ELI5 | Actual ELI5 toggle and same message sink | Same example restated rather than a second unrelated answer |
| Chat movement | `PM_HOME_WORKSPACE.beginDrag/updateDrag/commitDrop` | Actual owner move, including its stable hit-test requirement and dispatch receipt |
| Snapshot restoration | Small copied-owner export invoking `commitLayout` | Validated, persisted full-layout restoration; projection renders a clone so transient CSS geometry cannot corrupt restored saved sizes |
| Widget sizing | Actual widget size menu and `PM7_SHELL_ADJUSTMENTS.applyDashSize` | Real existing resize behavior and owner receipts |
| Navigation | `PM_PAGES` and actual Wizard tab | Real page landing, with a scoped practice adapter inside `#panel-wizard` |
| Appearance | `PM_THEME` | Existing whole-shell theme on exit, isolated setup preview during animation |
| Existing replay entry points | `PM7_ONBOARDING_CINEMATIC`, `PM7_GUIDED_TOUR` | Existing Settings/Home replay links reach the replacement systems |

Neither copied-owner bridge changes the shared source generator. Their public counterpart should be designed and registered once in the appropriate owner before a production port.

## New local coordination and fixtures

`ASTRA` owns only this prototype's setup draft, pending stage, preview flags, and deterministic fixtures. `PM7_GUIDED_TOUR` coordinates the local tour. These exports are not a new production authority. `data-as` and `data-tour` are local action selectors. `astra:change` is a local diagnostic event, with `concept_simulation_only=true` and `productionMutationDispatched=false`; it is not a registered EventRecord or a production receipt.

Source authentication, host discovery/pairing, SSH preparation, backup selection/unlock, CLI discovery/installation, provider authentication, and free-model selection are **labelled sample adapters**. Their log labels include proposed owner-oriented `cmd.*` names for inspection, but no production command bus receives them. The later port must map them to catalog-approved IDs and exact payload contracts, removing any noncanonical diagnostic labels rather than registering them reflexively.

The Planning Wizard practice adapter is a deliberately narrow local model: idea, intended outcomes, one question, why it matters, review, answer edit, resulting permission change, and approval boundary. Its practice data must remain separate from a real PlanCompileRun. It must not silently start a build when leaving practice.

## Required production integration

**Project owner.** Persist a draft identity independently from the created project identity. Confirm source/path/host freshness at commit. Use a real idempotency key, transaction/recovery state, and an authoritative receipt. Resolve duplicate names and repository conflicts. Commit progress must be driven by owner events, not the prototype's timer. The present HTML only simulates external create/clone/restore work.

**Settings Transfer.** Preserve exact setting IDs, scope, selected groups, and the existing preview/apply boundary. Credentials are references, never copied secret values. Explicit onboarding choices win over inherited defaults. Expose missing or unauthorized referenced accounts after creation without repeating successful setup. Full rollback/partial-failure behavior needs backend tests.

**Source accounts.** Use the protected auth-browser/device-code owner, exact return context, cancellable generation, expiration and identity checks. GitHub/GitLab/Origin and separately identified Gitea/Forgejo instances cannot be treated as interchangeable endpoints. Account authorization can precede final confirmation; repository creation cannot. Outbound signup links in this HTML are not a substitute for callback handling.

**Providers.** Capability-discovered, host-scoped installed/authenticated/ready state comes from the provider owner. A CLI install is offered only when required and only after explicit consent. Cursor stays direct SDK/API with no CLI backup. OpenCode runtime, Go and Zen routes remain distinct. Multi-account additions must not replace another account. Private usage-endpoint handling is outside this concept; execution readiness does not imply quota is available.

**SSH and remote access.** Reuse approved connection metadata before new provisioning. Store the private key only on the execution host. Confirm new identity; reject changed identity pending explicit resolution. Provision public keys only through an authorized mechanism. Test existing-folder access without creating the project. Pairing codes must have real expiry/generation/trust semantics. A sample code is not a scannable secure QR. Do not infer WAN exposure, tsnet connection, domain setup, or firewall changes from choosing an option in the HTML.

**Persistence and recovery.** The local draft is stored under `pm.astra.onboarding.v3`; sample secrets are not stored. Real lifecycle state belongs to the canonical Project/connection/auth owners. Define schema migration, stale-target revalidation, interrupted commit recovery, and host/account revocation handling. The supplied test shim proves serialization and rehydration only, not filesystem durability or native browser storage.

**Doctor.** Keep Doctor in Settings. Add owner-backed findings for missing/incompatible CLI on the selected execution host, expired sign-in, unusable copied account reference, source authentication, project sync, Server/remote-route health, and execution-ready-but-quota-unknown. Remediation must return to the exact finding and accept only a current owner result. The current concept does not claim these new native finding producers exist.

## Slint translation

Port the explicit setup stage/trail, draft, commit, provider, and tour models into canonical state/reducers. Express world artwork, opacity/translation, pointer coordinates, timing and reduced motion through Slint properties, animation/timers, and owner commands. The browser DOM is not the source of lifecycle truth. For Show Me, resolve semantic control identity and command availability before each action; wait for the real success predicate, retain an interruptible generation token, and cancel without dispatching a second action.

The tour snapshot must include visible/collapsed/host/slot/sizing, original thread/persona/input, current page and touched widgets. Skip restores the original view and layout; Finish restores layout unless explicitly kept, while landing on the Wizard with the user's project. Capture/review representative native frames on target hardware before declaring motion parity. Browser software-renderer timings are not native Slint certification.
