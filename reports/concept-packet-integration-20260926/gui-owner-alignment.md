# Selected onboarding and tour: owner alignment

F3-520/F3-521 now consume the selected design without changing its HTML:

- PWIZ-029 permits individually consented, read-only selected-source pairing on another Puppet Master, with exact draft/session/hash/expiry and `source_access_authorization_refs`. Connected Server pairing remains after Review; other mutation fences remain.
- Local history follows the reviewed Git/Jujutsu/no-history choice. An unavailable backend route blocks; it never silently substitutes Git.
- Persistent Look and sound controls are shared chrome controls. Settings persistence requires the verified current Project. No-Project/Project Later offers ephemeral preview only, connection/commit supplies the actual binding, and Tour Project switching invalidates/rebinds stale controls. Audio is supplementary.

The first review caught global-preference wording; the second review approved the corrected Project scope. Existing contracts already cover selected-source refs, reviewed history and Settings scope. Only the negative onboarding fixture's stale universal `init_git true` explanation changed; nonexistent `repository.init` remains rejected. No new command, settings key, schema or mirrored UI test was needed.

Validation: guided-tour contracts 19 pass; Settings draft-transfer 11 pass; explicit-history test 1 pass. The broader onboarding test has one storage-census hash mismatch also present at `origin/main` (actual `8ca3ac9f…`, expected `8f038450…`); this pass does not repair it. The complete static contract validator passed 31 pairs, 1,068 positive cases and 3,481 negative cases. These results do not prove native UI behavior or persistence.

Evidence: `validation/new-contracts.json` and `gui-owner-alignment/preserved-manifest.json` under the external evidence root recorded in `evidence.json`. Sol review is also preserved there.

The selected prototype still uses app-local sound persistence and an on default; the canonical Project-owned setting defaults off. This is a recorded future consumer correction, not silently adopted product authority or a claimed source fix.
