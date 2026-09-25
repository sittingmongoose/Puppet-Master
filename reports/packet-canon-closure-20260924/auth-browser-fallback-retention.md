# Human AuthBrowser fallback source retention

GAAAF-016 now retains September SAUTH-002's narrow rule: isolated human AuthBrowser is the last supported fallback for the same operation, provider and registered app. Existing explicit human consent, initiating active Client/session, no-recording and provider restrictions remain mandatory.

This does not restore the older IRT-010 total method ordering, automatically retry credentials, invent provider support or implement a native sign-in flow. The older baseline row explicitly directs preservation of newer canon; it is not authority to replace current provider-specific admission.

Source: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/r5-forge-backup132-review-20260912-seSuPcL7/source-snapshot/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md`, SAUTH-002, SHA-256 `e1b553ae465cea93becf79e62b3fc6eb105bf8bb56b86f74c5fceffd1461c4fc`.

Independent source/current-owner/Decision Log review found no newer supersession of this narrow rule: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/AUTH-FALLBACK-RESIDUAL-REVIEW.md`, SHA-256 `c10c1a965f166184d857706e0790d98b8d2511ed20ee75e42d7c77cf1591b0d8`. No schema or vendor-support proof is claimed by the prose clarification. Ordinary owner-derived files are regenerated; governance bindings and main remain untouched.

Static verification: shard generation/check PASS (99 sources, 2,766 shards); index generation PASS (6,747 units, 26,567 acceptance criteria), no unit IDs added or removed. All changed unit/acceptance records belong to GitHub_API_Auth_and_Flows.md, and no unrelated shard directory changed. Whitespace check passes. Runtime sign-in, provider support and protected-browser execution remain unproved.
