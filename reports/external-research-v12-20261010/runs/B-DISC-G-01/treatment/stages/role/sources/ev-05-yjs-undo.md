# Evidence S5: Yjs UndoManager API

- URL: https://docs.yjs.dev/api/undo-manager
- Publisher: Yjs project. Status: 200 OK. Retrieved: 2026-10-10 (UTC; exact time UNKNOWN).
- Locator: Y.UndoManager API page.

Verbatim excerpts (bounded):

- "A selective Undo/Redo manager for Yjs."
- "If any of the specified types, or any of its children is modified, the UndoManager adds a reverse-operation on its stack."
- "By default, all local changes that don't specify a transaction origin will be tracked." (via trackedOrigins option)
- "The UndoManager merges edits that are created within a certain captureTimeout (defaults to 500ms). Set it to 0 to capture each change individually."
- "Undo the last operation on the UndoManager stack. The reverse operation will be put on the redo-stack."
