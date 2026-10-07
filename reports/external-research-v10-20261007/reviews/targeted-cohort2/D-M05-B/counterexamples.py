import sqlite3, json, pathlib, tempfile, datetime
root = pathlib.Path(__file__).resolve().parent
results = {"executed_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "runtime": sqlite3.sqlite_version, "source_id": sqlite3.connect(":memory:").execute("SELECT sqlite_source_id()").fetchone()[0], "scope": "Reviewer-authored bounded local-disk witnesses using installed Python sqlite3; not two-host/network testing; not candidate execution or selected-release certification."}
def open_db(p):
    return sqlite3.connect(str(p), timeout=0, isolation_level=None)
with tempfile.TemporaryDirectory(prefix="review-local-", dir=root) as td:
    p = pathlib.Path(td) / "commit.db"
    w = open_db(p)
    mode = w.execute("PRAGMA journal_mode=WAL").fetchone()[0]
    w.execute("PRAGMA wal_autocheckpoint=0")
    w.execute("CREATE TABLE t(x)")
    w.execute("INSERT INTO t VALUES (1)")
    r = open_db(p)
    r.execute("BEGIN")
    old = r.execute("SELECT x FROM t").fetchone()[0]
    w.execute("BEGIN IMMEDIATE")
    w.execute("UPDATE t SET x=2")
    w.execute("COMMIT")
    snapshot = r.execute("SELECT x FROM t").fetchone()[0]
    results["reader_does_not_block_commit"] = {"journal_mode": mode, "reader_in_transaction_during_commit": r.in_transaction, "commit": "success", "reader_before": old, "reader_after_writer_commit": snapshot, "writer_value": w.execute("SELECT x FROM t").fetchone()[0]}
    try:
        r.execute("UPDATE t SET x=3")
        results["stale_snapshot_upgrade"] = {"result": "unexpected success"}
    except sqlite3.Error as e:
        results["stale_snapshot_upgrade"] = {"errorcode": e.sqlite_errorcode, "errorname": e.sqlite_errorname, "message": str(e), "other_writer_transaction_active": w.in_transaction}
    r.execute("ROLLBACK")
    w.close(); r.close()
    p = pathlib.Path(td) / "size.db"
    w = open_db(p)
    w.execute("PRAGMA journal_mode=WAL")
    w.execute("PRAGMA wal_autocheckpoint=0")
    w.execute("PRAGMA synchronous=NORMAL")
    w.execute("CREATE TABLE t(x)")
    w.execute("INSERT INTO t VALUES(0)")
    for i in range(4200):
        w.execute("UPDATE t SET x=?", (i,))
    results["wal_index_size"] = {"committed_updates": 4200, "shm_bytes": pathlib.Path(str(p)+"-shm").stat().st_size, "wal_bytes": pathlib.Path(str(p)+"-wal").stat().st_size, "checkpoint_disabled": True}
    w.close()
results["temporary_databases_removed"] = True
(root/"counterexamples.json").write_text(json.dumps(results, indent=2)+"\n")
print(json.dumps(results, indent=2))

