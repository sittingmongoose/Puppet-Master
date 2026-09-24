# Onboarding Home-entry contract repair

ONB-CANON-006: F3-520 (`Plans/FinalGUISpec.md`, line 35089) already
requires the Home menu's `Run setup wizard` item to invoke
`ui.onboarding.start` with `source_surface: home_menu` at Welcome. The
request schema rejected that exact source. This repair adds only that enum
value; all other definitions, request conditions and existing sources remain
unchanged. It introduces no command, state machine, route or storage shape.

Verification:

- Four focused tests: one expected failure before the repair; all pass after.
  They cover the exact source, unknown spellings, Welcome-only fresh starts,
  and the separate resume source requirement.
- All 13 action-causality tests and 11 Settings draft-transfer tests pass.
- Independent review confirms the exact enum-only JSON delta and checks every
  stage: fresh Home start admits Welcome only.
- Full contract gate: 32 pairs, 1,163 positive cases, 4,024 negative cases and
  12 self-tests; zero findings. This does not prove runtime behavior.
- Existing phase suite: 54 tests, with only its pre-existing storage census
  mismatch (`294 != 90`). No registry or governance binding was changed.
- Shard check: 99 documents / 2,721 shards pass. No owner Markdown changed,
  so no derived-file regeneration was needed.

Evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`

| Evidence file | SHA-256 |
| --- | --- |
| `onboarding-home-entry-verification.json` | `df820d628194cf8f46f5137b152d517db43cf40e281cc4c5d67c9d52f7cd27eb` |
| `onboarding-home-entry-new-contracts-report.json` | `7abb02368cd856844cd1f61bd00011ed4eb7e9b05804d51a381f6bfa0ce6b267` |
| `server_forge_backup/onboarding-home-entry-independent-review.json` | `37e506190d87704318b831833c3c5e3ef857f18184553c67b7ff3be7ba787ea4` |

Ready Back preservation, broader action composition, GUI implementation,
native persistence and owner authority remain separate obligations. This
record does not claim all-packet closure, main landing or a governance seal.
