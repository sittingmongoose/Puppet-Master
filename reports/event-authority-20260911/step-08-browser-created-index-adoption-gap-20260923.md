# Step 08 — Browser created checkpoint generic-index adoption gap

The current `browser.workspace.created` Storage binding SP-266 predates the exact SP-278 generic EventRecord index root/generation/anchor/frontier/read-snapshot token. SP-278 expressly requires each filtered owner to adopt that complete token. The registered created checkpoint v1 schema contains `index_checkpoint_ref`, `current_selection_sha256`, bounds and `source_cursor`, but no `index_read_token`; the sibling reset checkpoint SP-282 explicitly imports the SP-278 `read_token` and `coverage.last_frame` definitions. A created reader that compares only the old CURRENT/full-index cursor cannot prove the complete current SP-278 frontier after an ordinary append that preserves generation identity. This is an OPEN technical consumer/currentness depth gap for created, not evidence that the registered event or its older checkpoint is invalid. A versioned created successor must specify the exact owner/schema/registry/fixture/reader adoption and compatible handling of existing v1 values; it cannot silently change the v1 wire value, borrow reset's checkpoint or assert currentness from matching hashes. The Browser pair's full twelve-cell assessment remains unfinished, as do native proofs. Step 08 remains open; Step 09 remains 0 registered, 6 excluded, 20 carded, 226 remaining; Step 10 has not run. Main stays held.

Cost: root read SP-266, SP-278 and SP-282, compared the two complete registered checkpoint schemas, and independently reran both Browser workspace static test files: 87 tests PASS. The interrupted Browser assessment produced only a source inventory, not a frozen twelve-cell verdict. No native Browser, Storage or permission execution was run. Monetary attribution is unavailable.

| Current source at `origin/main` `d247d57ebd0d53ce4c66f4795e24a14d8782e9b8` | SHA-256 |
|---|---|
| `Plans/browser_workspace_created_contracts.schema.json` | `0be9ff6f77fba79156d65afa6c73bf2055c103a651f0237dd289f5d765ee0409` |
| `Plans/browser_workspace_reset_contracts.schema.json` | `fc3b1824c918f17e1b5691462b371997e2b0eabe5a064af6feef7e6c6ad6f02e` |
| `Plans/storage-plan.md` | `328858615bc5badb18c227e89e721c6ae18e244e0a13ae49b692000e9c15add7` |

The 87 passing tests exercise the existing contracts; they do not supply the missing created-token adoption or PNC-019 approval for the 42-family checkpoint. No registry, Plan, governance or baseline file was changed.
