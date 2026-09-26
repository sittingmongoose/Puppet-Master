# Installation profile mapping correction

Status: bounded static mapping repair, not lifecycle execution or whole-contract closure. Base `eb203fb1a`.

TCP-INSTALL serves six existing commands. Its former select-only payload/result/error, availability and permission references incorrectly described the five lifecycle commands. The profile now explicitly keeps select on InstallationSelect types and maps install/update/repair/rollback/verify to their existing lifecycle request/result/error definitions, actual permission snapshot reference and disabled-result envelope. Existing six Wiring mappings remain unchanged. No policy, schema, command, profile/row count or handler availability changed; all six rows remain partial.

Independent review: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/INSTALLATION-PROFILE-INDEPENDENT-REVIEW.md`, SHA-256 `d249b44a55bda00f19f5b443b4286c63f94683b555f2105f0ad2153c6b64eedb`. Reviewed Touch content SHA-256 `63f4d54896fe5decac5f4fe5c6bdd5993631014df387d116ea94dea09695d226`; focused test SHA-256 `4ccb2974ca781754fefeb0b7d9d4c60a8ea6594798f0dc970bf39fd778d20e37`.

Root verification: 82 installation-mapping, Touch-source and Notifications tests PASS. The final focused test passes and rejects the prior HEAD profile with one expected assertion (no test error), proving the old select-only mapping is detected. Every payload/result/error pointer resolves; the six existing Wiring payload/result bindings match. Shard check passes (99 documents/2,766 shards). No owner Markdown changed or derived regeneration needed.

Actual original selection/provenance/permission authority, native lifecycle effects, recovery, receipt evidence and GUI execution remain unproved. A pointer or permission ref does not establish those. No governance/TCR hash refresh, automatic case-matrix credit, full repository gate or main landing is claimed.
