# Search rebuild owner-edge identity repair

The existing UI catalog and production wiring register `cmd.search.rebuild_index`. Wiring Matrix's IndexBuilder `build_full` edge and WM-029 instead named `cmd.search.rebuild_regex_index`. They now use the registered command. The historical spelling remains explicit source lineage, never an alias or second dispatch path.

This closes only the command-name mismatch, not the separate Search request/result/currentness, observable-work or reverse-consumer binding questions. No native rebuild, index writer, event or storage admission is claimed. The generic central response contract was already stricter than an earlier audit claimed; this repair does not weaken or duplicate it.

Independent discovery review: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/search-index-reconciliation-01/REVIEW-INDEPENDENT.md`, SHA-256 `93fd9acfd8a76ca796278b774e416eb0986a54434356e7edc432c31e69f60fc8`.

Two new static regression tests check the owner edge against the catalog/production ID and reject an alternate registered predecessor spelling. Both pass. They do not exercise a native command or prove the pending typed owner-result integration. Ordinary shard/index regeneration accompanies this edit; no governance binding or landing baseline is refreshed.

Different-Sol final diff review PASS: external `case-reconciliation/SEARCH-REBUILD-IDENTITY-DIFF-REVIEW.md` in the same campaign, SHA-256 `c31c10af11cb3406c7b72c64e22b2c7ba5362f7ff918a168d53942ceaa01ae4e`. Shard check passes 99 sources / 2,766 shards. Index generation passes 6,747 units / 26,566 acceptance criteria, with no unit IDs added or removed and all changed unit/acceptance records owned by Wiring_Matrix.md. No unrelated shard directory changed.
