# Original treatment evidence boundary

T-M01 is a consequential supported-meaning loss. Frozen draft line 72 requires generation comparison **inside** the transaction, with rollback/re-preview after another import changes relevant data. Frozen final line 58 instead states: “Before opening the write transaction, compare the preview's database generation”. Lines 54, 56, 88 and 102 retain a general no-stale-decision goal but no protected check or serialization spanning that earlier read and the writes.

Unexecuted primary-semantics interleaving: A's preview and completed pre-transaction check see generation g. B commits changed accepted data and generation g+1. A then starts its write transaction and applies its old reviewed current-revision/active-view choices without another protected check. SQLite's one-writer rule serializes transactions; it does not lock a prior completed read. There need be no simultaneous write or key violation. A can commit a complete atomic batch while its before/after preview was stale. The exact primary transaction/isolation contexts P15/P22 support that consequence. No candidate code or future application was executed.

Counterevidence considered: final explicitly names generations, prohibits stale decisions and proposes a concurrent-generation case. It may intend the stronger invariant. The specific pre-transaction sequence loses the draft's protected boundary, and no single-worker/lock contract is supplied. This finding does not select an engine, prescribe deployment, or assert every possible implementation fails. It assesses the exact frozen proposal and preservation.

T-N01 is bounded history imprecision: PR13597 (merge c542e7486e768af2ab03187ce264b87cf5bf9444) checks invalid Python read_csv option names; its test_quote expects quote to error. That explains the closed issue's quote-versus-quotechar caller condition more accurately than a generic StringIO/encoding regression. The final does not claim a current bug, and first fixed release remains unknown.

Exact public authorities:
- https://www.sqlite.org/lang_transaction.html (DEFERRED, read/write and transaction scope)
- https://www.sqlite.org/isolation.html (connection isolation, serialized writes, BEGIN IMMEDIATE)
- https://duckdb.org/docs/current/sql/statements/transactions
- https://duckdb.org/docs/current/connect/concurrency
- https://github.com/duckdb/duckdb/issues/12338
- https://github.com/duckdb/duckdb/pull/13597
- https://api.github.com/repos/duckdb/duckdb/pulls/13597/files (pyconnection.cpp and test_read_csv.py; inspected only)

The source index and shared response-digest evidence preserve versions/locators. No parser/storage test, deployed software or downloaded-code execution is claimed.
