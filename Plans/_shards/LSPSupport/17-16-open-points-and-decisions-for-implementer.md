## 16. Open points and decisions for implementer

The following should be decided at implementation time and documented in the implementation guide:

- **Exact timeout values** (hover, completion, workspace symbol) and whether they are user-configurable in Settings.
- **Debounce default** for didChange (100 ms recommended; range 50-200 ms).
- **workspaceFolders cap** (10 recommended) and policy when cap exceeded (e.g. LRU by last open).
- **Settings > LSP** is a dedicated tab under Settings (FinalGUISpec §7.4.2); no further location decision needed.
- **Project-level LSP config:** File path and format (e.g. `.puppet-master/lsp.json`) and merge rules with app-level config.
- **Completion trigger characters:** Use server-provided list from capability or default to all.
- **Inlay hint refresh:** On every didChange (after debounce) vs. on visible range change only (performance vs. freshness).
- **Code action apply path:** Exact integration point with FileSafe (e.g. same applyEdit entry as agent edits) and user confirmation for destructive actions.

---

