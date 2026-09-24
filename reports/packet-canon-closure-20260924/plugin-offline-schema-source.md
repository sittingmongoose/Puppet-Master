# Plugin offline-schema source retention

Repair base `45e9ce5fb43a76128bbbbcdbba61e82efd94d7cb`. Closes only the offline-schema prose-transfer portion of `BSUP-004`.

The Plugins conformance owner and `PLUG-066` now require locally bundled, versioned schemas and prohibit network schema fetching during package loading. Existing closed-schema, containment, provenance, permission and required-component checks remain mandatory. No manifest format, importer policy, command, schema, fixture, authority or runtime admission changed.

Root read the relevant raw and current owner passages before applying. Raw package root:
`/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/legacy-custody/raw/PKT-04-pm-egolite-hermes-origin-browser-scm-implementation-package-2026-08-17/PM_Egolite_Hermes_Origin_Browser_SCM_Implementation_Package_2026-08-17/`.

- `01_IMPLEMENTATION_PACKET.md:761`, SHA-256 `b11615067f6ddf6f55bac1157d0d1951ffc1d62e8adb5958e5dddddc79f46f48`.
- `sources/01_EGO_EVALUATION.md:606`, SHA-256 `c867b26f58b910773c18240523c9ef674e6b45a1baac9dde67a52734364da550`.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `plugin-offline-source-verification.json`, SHA-256 `b44ff7afbc59d4f5b9eb59cba4412e84dba6bb20506831c9f7e9efddc9f2d950`: only Plugins owner and its derived paths changed; existing PlanUnit identities/criteria/canonical statements/constraints preserved, exactly one acceptance criterion added to PLUG-066. Index, shards and whitespace checks pass.
- `browser_scm_performance/plugin-offline-schema-prose-review-45e9ce5fb4.md`, SHA-256 `75629984c1ca197d8e2384e979838cded75df7d0f525d3b887c1ea2354e67254`: separate complete prose-delta review, no findings; not a blind review or runtime test.

Native loader behavior remains unproved; an offline contract validator does not establish it. Four separate source applicability cases remain unresolved: absent skill/MCP components, foreign extension handling, immediate-child package discovery and the named Ego legacy Codex input case. No whole-plugin, whole-packet, governance or main-landing completion is claimed.
