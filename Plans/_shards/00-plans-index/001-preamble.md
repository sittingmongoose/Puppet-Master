# Shard 001: Preamble

Source: `Plans/00-plans-index.md`

Source lines: L1-L10

Source SHA256: `fd3747a33188f47fae6cb85a8d90758777a4a90f414b40c76c5da4d525295196`

---

# Plans Index (authoritative map)

- 2026-09-28: User-approved inventory wave: `Plans/settings_inventory.json` admits three NieR Mode rows (916 rows; `Plans/FinalGUISpec.md#F3-441` amendment and `#F3-426` note, `Plans/Settings_System.md` section 4.4 and section 10): NieR Mode, a Settings switch (off by default, App & Input under Theme & colors) that paints the whole app in NieR: Automata's ink-and-parchment look and type over the Basic theme without adding a ninth theme (the chosen theme comes back when it is turned off); its 29 individually switchable parts across look, motion, sound and voice, pointer and world details; and its background of faint ink scenes. NieR decides the accent color and the app font while it is on; its motion obeys Reduce motion and Animation speed and its sounds obey the sound setting.
- 2026-09-28: User-approved inventory wave: `Plans/settings_inventory.json` admits thirteen Git and SSH rows the Settings guided set-ups write (913 rows; `Plans/FinalGUISpec.md#F3-441` amendment, `Plans/Settings_System.md` section 10): the Git name and email, how Git signs in and its key per code service, commit signing and its key, big-file storage with its size and types, the default ignore list, protected branches, the SSH key list and each server's sign-in. The Settings concept also adopts DL-107 and DL-108 (chat sounds on, Queue as the busy-send default) from the inventory.
- 2026-09-28: Settings review round 3 recorded in `Plans/Settings_System.md` (presentation section, subsection 10, `SSYS-042`): Settings sets defaults and runs guided set-ups and does no live work, so Goals in Settings is defaults, templates, recovery and checks with Goals started in the assistant chat or the Planning Wizard, and one chat's actions live in that chat's menu; every listed set-up (language servers, formatters, test, debug and permission profiles, servers, SSH computers and keys, ways in from away, moving a workspace, settings transfer, code services, Git) runs in the onboarding wizard's form; a permission profile carries its four answers and its own rules, which form the profile layer above the project's rules (`Plans/Permissions_System.md#PRECEDENCE-LAYERS`); one shared SSH key list; the Git and SSH rows stay concept-stage proposals until admitted.
- 2026-09-27: Packet-sweep repairs reconcile Named Plan consumer scope and child-parent joins, optional Azure team-project human-only official administration (`ADO-008`), non-Tour Ready navigation to Planning Wizard, typed command/preview/verification mappings, WSL and execution assurance, and durable internal application-update scheduling. Current owner documents and companion fixtures remain authoritative; the selected concept demonstrates their GUI behavior. Static fixtures and concept checks do not admit native handlers, storage writers or production events. See `reports/packet-repairs-20260927/README.md` for the bounded repair and verification record.



> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
