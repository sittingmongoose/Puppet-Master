# Astra — Puppet Master onboarding and guided tour

**GPT-6 Pro · September 4, 2026 · interactive concept, not a production integration.**

Open `Concepts/TestAstraPmConcept.html`. It is a standalone, rebuilt copy of `TestPMConcept.html`, with both former onboarding/tour implementations removed before the new implementation is inlined. The full surrounding application stays present. The original, PMConcept7, shared source modules, Plans, and governance files are untouched.

For Concept Hub, use this folder's `index.html`. The wrapper preserves the complete shell and forwards only the Hub's theme and reduced-motion controls. The visible model label is retained.

## Start here

The first opening starts setup. Choose Friendly, Glass, Retro, or Basic, in light or dark. Each combination has its own original vector illustration. The appearance is previewed locally during setup; the selected theme is applied to the full shell when leaving setup. This avoids expensive whole-application restyles during the illustration crossfade.

The normal path is **appearance → start/connect → project → location → optional online copy → review → create → AI accounts → optional free models → tour**. An existing user can start fresh or preview selected settings from another project. Existing folder, online source, and encrypted-backup paths are also present. The connected-device ready screen includes **Create a new project**.

Setup can be closed and resumed. A created project remains created when account setup is postponed. The small Astra launcher reopens setup or the tour. The setup header's preview controls expose returning-user fixtures without contaminating the default new-user journey.

## Safe preview behavior

Source services have real outbound sign-in/sign-up links, but the HTML cannot receive a real authentication callback. A separately labelled sample action advances the preview. Never enter real passwords, API keys, recovery keys, or private keys into this concept. Key fields accept the displayed sample values only.

Installing a CLI, checking a NAS, pairing a device, source authentication, and restore are explicit **sample operations**, not successful external operations. The page creates no server, firewall rule, SSH key, repository, clone, or filesystem project. The existing shell's project-card and project-picker owners are exercised only after final confirmation, as local concept behavior.

The tour's Teacher example runs locally in a fresh real Chat thread. It makes no AI request. Its Wizard practice adapter occupies the real Planning Wizard surface, but does not implement the production planning service. **Approve And Build** is demonstrated as an approval boundary; practice never starts a build.

## Rebuild

From the repository root:

```bash
python3 Concepts/onboarding/astra-gpt-6-pro/build.py
python3 Concepts/ConceptHub/validate.py Concepts/onboarding/astra-gpt-6-pro
```

The builder requires the captured baseline hash and fails rather than guessing when upstream source changes. It strips the old roots, styles, and scripts, then inlines `art.js`, `astra.css`, `onboarding.js`, and `tour.js`. It adds two small exports inside the copied existing owners: Settings Transfer and transactional full-layout snapshot restoration. There is no source-side monkey patch in PMConcept7.

## Reproduce the behavioral checks

Python 3, Playwright, and a Chromium executable are needed. The tests write to a unique temporary directory, not this concept folder. They use full HTML `set_content` and an explicit test-only in-memory Storage shim. That method was needed because the review environment blocks local URL navigation. It does **not** certify real disk persistence, native Slint, external authentication, or installation.

```bash
python3 Concepts/onboarding/astra-gpt-6-pro/checks/acceptance.py
python3 Concepts/onboarding/astra-gpt-6-pro/checks/pointer_checks.py
python3 Concepts/onboarding/astra-gpt-6-pro/checks/bridge_check.py
```

Set `CHROMIUM_PATH` when Chromium is not at `/usr/bin/chromium`. See `QA.md` for exact results and recording limitations; `RESEARCH.md` for evidence behind the design; `PORTING.md` for owner, command, storage, Doctor, and Slint work that remains before production.

## Preview API

`ASTRA.demo.reset()` clears only Astra's fixture state and starts setup again. `ASTRA.demo.failNext('commit')`, `failNext('pair')`, `failNext('ssh')`, and `failNext('source')` exercise recoverable failures. `ASTRA.state`, `ASTRA.events`, and `PM7_GUIDED_TOUR.snapshot()` expose review state. These are concept-local inspection hooks, not product APIs or production receipts.
