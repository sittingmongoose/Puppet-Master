# Browser/Chat: existing specification versus companion defects

Current owner composition already specifies the required Browser-to-Chat
behavior. No new Chat product carrier, admission policy, buffer architecture,
or decision card is justified by this comparison.

Browser BSTALE-005/006 owns per-hidden-reference identity/currentness and
independent stale-chip refusal. BSTALE-008 and the Browser command catalog own
isolated immediate sends and unchanged unrelated composer bytes. Current Chat
§4 owns FIFO/max-two queue entries, and §7.1/§8 own pending chips and success/
failure retention. `cmd.chat.send` already returns `message_id`. Those facts
need not all be copied into a new command-result object to count as specified.

The central Full Thread `CommandOutcomeRecord` and UI command response already
exist. A missing field in those envelopes does not erase a field owned by
Chat's queue. The SIR return-context rule cited by the rejected proposal is
specific to Forge review, not a universal requirement to put Browser focus in
a Chat result. API/automation callers need not have GUI focus.

The frozen Browser helper still has two actual defects: a changed payload
digest can pass with the authentic normalized arguments fixed, and a changed
owner-result digest can pass with the authenticated typed result fixed.
Their repair remains a narrow existing-SIR join, not new Chat behavior.
Native adapters, dispatch, currentness and GUI execution remain unproved.

Root read and accepted the different-Sol adjudication at
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/browser-chat-owner-interface-01/CURRENT-OWNER-ADJUDICATION-AFTER-V2.md`,
SHA-256 `3413fb535b24b28cdea462a96d58eca9a2787278df9dcd15da4ef7d2f5f62839`.
It supersedes the inference in V1/V2 owner proposals that absent local fields
prove a required new Chat carrier; it does not accept the defective helper or
claim complete Browser/native/packet closure. Frozen proposals remain unchanged.
