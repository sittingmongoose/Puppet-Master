# S2 — Python glob module

- URL: https://docs.python.org/3.13/library/glob.html
- Version/scope: Python 3.13.16 documentation; target CPython 3.13.
- Retrieved: 2026-10-10 during 04:19 UTC, minute precision; exact per-call time unavailable.
- Operation: public primary documentation page inspected with web.open and web.find.
- Locators: module introduction; `glob.glob`.

## Bounded evidence

The module introduction says glob performs no tilde expansion and points callers to `os.path.expanduser`; it also contrasts the module’s default leading-dot matching with pathlib. `glob.glob` says output order depends on the filesystem and whether files added or removed during the call appear is unspecified. It suppresses OSError during scanning, including PermissionError for unreadable directories. The documentation warns that recursive `**` on large trees may take an inordinate amount of time.

Applicability: these statements concern `glob.glob` defaults unless a parameter is stated, and are used only to compare its tilde/dot behavior or support the bounded performance discussion. They do not define pathlib's contract.
