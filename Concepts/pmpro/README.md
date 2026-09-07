# Puppet Master Pro — Newbie-First Onboarding and Guided Tour

This directory owns the rebuilt onboarding and Guided Tour used by
`Concepts/TestProPmConcept.html`.

The concept intentionally leaves `Concepts/TestPMConcept.html` untouched. The copied
concept loads these two files near the end of its `<body>`:

```html
<link rel="stylesheet" href="./pmpro/onboarding.css">
<script src="./pmpro/onboarding.js"></script>
```

## Product intent

The experience is designed for someone who does not know what source control, a
repository, GitHub, a server, SSH, or an AI provider is. The primary path therefore:

1. establishes which device will run Puppet Master;
2. produces a clear device-ready state;
3. offers **Create a new Project**, **Use a Project I already have**, and **Restore a Project**;
4. collects only the Project information needed for a first usable workspace;
5. keeps storage, online history, copied settings, and appearance in a draft;
6. lists every planned side effect at a final review boundary;
7. creates the Project once, with an operation identity and durable receipt; and
8. offers AI-provider and free-model setup only after the Project exists.

A user may close and resume the draft. Going Back preserves answers. Abandoning or
expiring the draft does not apply its theme or create Project resources.

## State and side-effect boundary

The concept persists a `project_setup_draft.v2` object locally. Pre-confirmation steps
may perform reversible preflight work—device checks, account authorization fixtures,
SSH identity inspection, and folder tests—but do not create the Project or an online
repository.

The review screen enumerates `pending_side_effects`. **Create Project** starts one
idempotent operation with an operation ID, idempotency key, per-effect progress, and a
`project_creation_receipt.v2`. The failure fixture interrupts that operation and proves
that retry continues the same identity instead of creating a duplicate.

This is a concept projection, not production persistence or provider wiring. It performs
no real network or provider calls.

## Device and pairing flow

The opening device decision supports:

- use this computer;
- connect to an existing Puppet Master; and
- set up or restore a server/NAS/always-on computer.

The existing-installation route shows a pairing address, QR treatment, short code, expiry,
and a two-device approval explanation before returning to the same device-ready receipt.

## Network storage and assisted SSH

SSH is the default choice for NAS or network storage. SMB and NFS remain available as
advanced alternatives.

The assisted SSH concept follows this sequence:

1. resolve only the host the user entered;
2. read the public host key;
3. display its fingerprint for explicit verification;
4. ask for the NAS password once;
5. create an Ed25519 key pair on this device;
6. install only the public key;
7. discard the one-time password;
8. test the selected folder; and
9. save a connection receipt.

The flow deliberately does not treat a scanned key as trusted. Host identity approval is
a visible security boundary. The injected failure path is recoverable and retry-safe.

## Online source history

The source-control screen first explains the idea as **Project history**. Repository and
source-host terminology is available through progressive disclosure.

GitHub, GitLab, Bitbucket, and Forgejo concept handoffs support **Sign in** and **Create
account**. Successful authorization marks an account Ready but does not create or attach a
repository. Repository creation or attachment is represented only in the final side-effect
list and commit operation.

## Visual worlds and motion

The concept contains four authored visual systems, each with dark and light variants:

- **Friendly** — warm, organic illustration, asymmetric soft forms;
- **Glass** — spatial translucent layers, aurora light, luminous depth;
- **Retro** — CRT scanlines, phosphor grid, squared tactile controls;
- **Basic** — restrained architectural grid, neutral materials, precise geometry.

They alter composition, illustration, materials, typography treatment, geometry, and the
Guided Tour workspace—not only colors.

Theme changes use a named View Transition when supported. Normal onboarding navigation
uses separate named scene, content, and caption transitions so outgoing and incoming
content overlap rather than exposing an empty stage. Unsupported browsers use the local
fallback animation. `prefers-reduced-motion` and the concept's reduced-motion switch
suppress non-essential travel while preserving state changes.

## Guided Tour

The tour persists `guided_tour.v2` state and runs against a local deterministic practice
fixture with:

- network blocked;
- provider requests: `0`;
- usage increment: `0`;
- pause, resume, skip, and replay;
- workspace snapshot restore or keep;
- user-performed **Try It** actions; and
- **Show Me** demonstrations that dispatch through the same action handlers.

The 13-step route begins in Assistant Chat, teaches Teacher and ELI5, moves/docks Chat,
adds a Project Overview widget, then spends most of its time in Planning Wizard. The user
chooses a goal, derives outcomes, answers a decision, opens Why This Matters, reviews the
plan, edits the answer, sees a concrete plan consequence, and ends at the real approval
boundary rather than a fake completion screen.

## Keyboard and focus behavior

The onboarding behaves as a modal task surface: focus enters it, Tab and Shift+Tab remain
within it, Escape closes the active layer or setup, and focus returns to the invoker.
The Guided Tour keeps its guide and highlighted target reachable, provides keyboard
alternatives for spatial actions, and keeps visible focus treatment.

## Verification record

All checks below were run against the self-contained QA harness that loads the same CSS and
JavaScript as the copied concept.

### Functional paths

- Complete create → theme → network SSH → GitHub authorization → settings inheritance →
  review → receipt → provider/free-model path: **pass**, no console errors or warnings.
- Guided Tour user-action route: **pass**, 13/13 steps, 14 command events, final handoff to
  `#planning-wizard`.
- Additional matrix: server pairing, existing Project import, SSH/commit failure recovery,
  mobile/focus/reduced-motion/resume, and Show Me: **5/5 pass**.
- JavaScript syntax: **pass** with `node --check`.

### 60-fps frame review

Onboarding/theme/step capture:

- 8.0 seconds at 60 fps;
- 480 decoded frames;
- 0 black frames;
- minimum mean luma: 31.0222;
- 95th percentile adjacent-frame mean absolute delta: 0.5887;
- every frame reviewed in eight contact sheets.

Guided Tour Show Me/docking/widget capture:

- 7.0 seconds at 60 fps;
- 420 decoded frames;
- 0 black frames;
- minimum mean luma: 19.8447;
- 95th percentile adjacent-frame mean absolute delta: 0.4213;
- every frame reviewed in seven contact sheets.

The iteration record includes the defects found visually and repaired: a one-frame theme
cut, an empty stage during page navigation, and an underpowered straight Show Me pointer.
The final pass uses whole-world transitions, overlapping old/new scenes, a curved pointer
trajectory, and a visible landing ripple.
