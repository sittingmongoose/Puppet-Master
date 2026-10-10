# A1 evidence — URI filenames, immutable parameter (additional primary 1 of 3)
URL: https://www.sqlite.org/uri.html (section "immutable=1")

Retrieval: provider web_fetch on 2026-10-10 between 04:03:00Z and 04:04:30Z (UTC day-session;
exact per-fetch second not recorded). Within the 8-additional-page allowance.

## Verbatim
> "The immutable query parameter is a boolean that signals to SQLite that the underlying
> database file is held on read-only media and cannot be modified, even by another
> process with elevated privileges. SQLite always opens immutable database files
> read-only and it skips all file locking and change detection on immutable database
> files. If this query parameter ... asserts that a database file is immutable and that
> file changes anyhow, then SQLite might return incorrect query results and/or
> SQLITE_CORRUPT errors."

Applicability note: URI filenames require URI processing enabled (compile-time
SQLITE_USE_URI / sqlite3_config(SQLITE_CONFIG_URI) / SQLITE_OPEN_URI bit); filenames not
beginning "file:" are ordinary filenames regardless of the URI setting.
