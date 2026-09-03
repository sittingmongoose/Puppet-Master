# Shard 020: Additive Correction v4 — Browser Component Currentness At Dispatch (2026-09-03)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L10496-L10575

Source SHA256: `cddc39f6018cb3977d9b4e9548a521c5befbf8d24e634cced5730046cb3b622c`

---

## Additive Correction v4 — Browser Component Currentness At Dispatch (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`BSTALE-001..012`) to this owner.
The three capture modes (Full Screenshot, Region Screenshot, Component), ordinary DevTools
access, and the protected-authentication exclusion all stay exactly as specified above.

### BSTALE-001..003 — Revalidate, then send

Every path that sends a captured component revalidates, immediately before dispatch, the browser
session, the page, the frame, the page generation, the stable locator, and the captured identity.
This applies to `Send Now`, a numbered composer list, an inserted chip, a targeted composer send,
and a delayed send. A stale DOM handle is never trusted.

Resolution is exact:

| Locator result | Behaviour |
|---|---|
| Exactly one compatible match | Refresh generation and current context, then proceed |
| Zero matches | `stale_capture` with a recapture action |
| More than one match | `stale_capture` with a recapture action |
| Destroyed frame or page | `stale_capture` with a recapture action |
| Identity mismatch on a single match | `stale_capture` with a recapture action |

Compatibility for the single-match case checks tag, role, component identity, source reference,
and fingerprint. Nearest-match heuristics are never accepted.

```text
pm.browser.component_revalidation_result.v1
  attachment_id, captured_generation, current_generation,
  locator_result_count, identity_match, result, recapture_action
```

Nothing is sent before the condition is resolved, and the component is never silently dropped or
replaced with a different element.

### BSTALE-004 — Recapture reuses the picker

Recapture reuses `cmd.browser.component.pick`, or its branch-current canonical equivalent, so one
selection flow owns identity creation. `cmd.browser.component.recapture` is not minted by
default; a census would have to prove a genuinely different semantic first.

### BSTALE-005..006 — Lists and chips keep structured identity

A numbered composer list validates each hidden component reference independently. One stale item
stays visible, is marked, and blocks only itself; the other valid items are untouched. A partial
list is never sent without an explicit user action.

An insert-at-cursor chip preserves its structured identity and is revalidated at message
admission. It is never flattened into a plain text token, and the visible `<Component>` label
always maps to the hidden context that will actually be sent.

### BSTALE-007 — Scheduling requires a frozen snapshot

A scheduled message cannot retain a live component selector. It must freeze a screenshot, DOM, or
source snapshot with an immutable artifact identity, or scheduling is refused. No arbitrary future
element is re-selected at dispatch. This is the browser side of `SMSG-009`.

### BSTALE-008 — Capture sends are isolated payloads

Full Screenshot, Region Screenshot, and component `Send Now` build isolated submission payloads.
They never consume unrelated `ComposerBuffer` text or attachments, and existing composer content
is byte-for-byte unchanged afterwards. The ordinary send path is never called with the whole
composer payload.

### BSTALE-009..012 — Details, generation identity, source maps, and late callbacks

Stale-capture Details expose the original page, session, and generation, the capture time, the
identity hints, and the reason. Protected authentication data stays excluded, and credentials,
cookies, and storage are never persisted.

Currentness is generation and identity based, not timestamp based. A node captured seconds ago but
since replaced fails revalidation; recency alone never declares a capture fresh.

A component source-map or source-file change that invalidates the captured mapping is disclosed
even when the DOM locator still resolves. The agent receives the current source identity or a
recapture requirement, and a stale source line is never presented as exact.

Late component-resolution callbacks are fenced by the browser selection epoch and the
`ComposerBuffer` revision, so an old resolution cannot send after the user changed or removed the
item. Stale asynchronous results are discarded, not dispatched.
