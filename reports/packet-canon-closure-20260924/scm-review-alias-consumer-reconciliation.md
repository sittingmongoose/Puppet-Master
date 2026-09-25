# Source Control review-alias consumer reconciliation

Source Control's deferred-collision paragraph still described review aliases as awaiting command-owner adjudication. Forge's compatibility table and the UI catalog already explicitly normalize `cmd.source_control.pr.create` to `cmd.forge.review.create {provider: github}` and `cmd.source_control.pr.merge` to `cmd.forge.review.merge {provider: github}`. DL-044 preserves one create command and adapter-owned authority.

The consumer paragraph now states those existing exact mappings and their no-independent-registration/handler/wiring boundary. Other collision categories and other review spellings are not adjudicated by analogy. No new alias, product decision, command or native behavior is introduced.

This addresses only the stale owner-choice wording behind `TOUCH-FGIPR-001/reverse_consumer_coverage` and `TOUCH-FGIPR-002/reverse_consumer_coverage`. It does not prove native consumer implementation, central runtime dispatch or full reverse-consumer closure. Sources inspected: Source_Control_System.md §7, Forge_Integrations.md §3.1 compatibility normalization, UI_Command_Catalog.md compatibility inputs near UCC-121, and Decision_Log.md DL-044. The provisional external SCM review is not authority to re-ask that settled choice.

A different Sol independently reviewed the exact one-bullet diff and accepted its fidelity. All 19 existing Forge review-response tests pass. Shard generation passes 99 sources / 2,766 shards; index generation passes 6,747 units / 26,567 acceptance criteria without adding/removing a unit. This owner has no configured shard directory. No governance binding or main state was changed.
