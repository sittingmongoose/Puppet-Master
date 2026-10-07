import sqlite3, tempfile, json, time
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
results = {"runtime": sqlite3.sqlite_version, "selected_release": "3.51.3",
           "runtime_matches_selected": sqlite3.sqlite_version == "3.51.3",
           "started_at_utc": datetime.now(timezone.utc).isoformat(),
           "purpose": "Reviewer-only bounded boundary checks; no candidate program or proposed policy executed.",
           "cases": []}
started = time.monotonic()

def record(name, **fields):
    results["cases"].append({"id": name, **fields})

def err(fn):
    try:
        fn()
        return {"error": None}
    except sqlite3.Error as e:
        return {"error": str(e), "code": getattr(e, "sqlite_errorcode", None),
                "name": getattr(e, "sqlite_errorname", None)}

def connections(path, mode):
    a = sqlite3.connect(path, timeout=0, isolation_level=None)
    actual = a.execute("PRAGMA journal_mode=" + mode).fetchone()[0]
    a.execute("CREATE TABLE events(id INTEGER PRIMARY KEY, value TEXT)")
    a.executemany("INSERT INTO events VALUES(?,?)", [(1,"a"),(2,"b"),(3,"c")])
    b = sqlite3.connect(path, timeout=0, isolation_level=None)
    return a,b,actual

with tempfile.TemporaryDirectory(prefix="review-sqlite-",dir=ROOT) as temp:
    a,b,mode = connections(Path(temp)/"snapshot.db", "WAL")
    a.execute("BEGIN DEFERRED")
    a.execute("SELECT * FROM events").fetchall()
    b.execute("BEGIN IMMEDIATE")
    b.execute("INSERT INTO events VALUES(4,'committed')")
    b.execute("COMMIT")
    b.execute("BEGIN IMMEDIATE")
    locked = err(lambda:a.execute("INSERT INTO events VALUES(5,'try')"))
    active_locked = a.in_transaction
    b.execute("ROLLBACK")
    stale = err(lambda:a.execute("INSERT INTO events VALUES(5,'try')"))
    active_stale = a.in_transaction
    a.execute("ROLLBACK")
    fresh = a.execute("SELECT count(*) FROM events").fetchone()[0]
    record("C1-stale-snapshot-and-writer-lock-order", mode=mode,
           committed_since_read_and_writer_active=locked,
           read_transaction_remains_after_busy=active_locked,
           same_snapshot_after_writer_releases=stale,
           read_transaction_remains_after_snapshot_busy=active_stale,
           rows_after_rollback_and_fresh_read=fresh)
    a.close();b.close()

    a,b,mode = connections(Path(temp)/"acquisition.db", "WAL")
    a.execute("BEGIN IMMEDIATE")
    failure = err(lambda:b.execute("BEGIN IMMEDIATE"))
    record("C2-immediate-acquisition",mode=mode,begin=failure,
           losing_connection_in_transaction=b.in_transaction,
           body_executed=False, body_execution_note="Harness deliberately skips body after failed begin.")
    a.execute("ROLLBACK");a.close();b.close()

    a,b,mode = connections(Path(temp)/"commit.db", "DELETE")
    a.execute("BEGIN DEFERRED")
    a.execute("SELECT * FROM events").fetchall()
    b.execute("BEGIN IMMEDIATE")
    b.execute("INSERT INTO events VALUES(4,'uncommitted')")
    failures = [err(lambda:b.execute("COMMIT")) for _ in range(4)]
    c = sqlite3.connect(Path(temp)/"commit.db",timeout=0,isolation_level=None)
    other_begin = err(lambda:c.execute("BEGIN IMMEDIATE"))
    active_before = b.in_transaction
    b.execute("ROLLBACK")
    a.execute("ROLLBACK")
    new_begin = err(lambda:c.execute("BEGIN IMMEDIATE"))
    rows = c.execute("SELECT count(*) FROM events").fetchone()[0]
    c.execute("ROLLBACK")
    record("C3-rollback-journal-commit-exhaustion",mode=mode,
           successful_begin_immediate=True, commit_attempts=failures,
           transaction_active_after_exhaustion=active_before,
           other_writer_before_cleanup=other_begin,
           other_writer_after_explicit_rollback=new_begin,
           rows_after_cleanup=rows,
           limitation="Four immediate attempts, timeout zero; not the candidate's 100ms/1s schedule.")
    a.close();b.close();c.close()

    a,b,mode = connections(Path(temp)/"returning.db", "WAL")
    a.execute("BEGIN IMMEDIATE")
    cursor = a.execute("INSERT INTO events VALUES(4,'x'),(5,'y') RETURNING id")
    first = cursor.fetchone()[0]
    failure = err(lambda:a.execute("COMMIT"))
    active = a.in_transaction
    cursor.close()
    success = err(lambda:a.execute("COMMIT"))
    record("C4-pending-write-commit-busy",mode=mode,first_returned_id=first,
           successful_begin_immediate=True,commit_with_pending_statement=failure,
           active_after_failed_commit=active,commit_after_cursor_close=success,
           rows=a.execute("SELECT count(*) FROM events").fetchone()[0])
    a.close();b.close()

    a,b,mode = connections(Path(temp)/"locked.db", "WAL")
    cursor = a.execute("SELECT * FROM events")
    cursor.fetchone()
    failure = err(lambda:a.execute("DROP TABLE events"))
    cursor.close()
    success = err(lambda:a.execute("DROP TABLE events"))
    record("C5-same-connection-locked",mode=mode,drop_with_cursor=failure,
           drop_after_cursor_close=success)
    a.close();b.close()

    a,b,mode = connections(Path(temp)/"checkpoint.db", "WAL")
    b.execute("PRAGMA wal_autocheckpoint=0")
    a.execute("BEGIN DEFERRED")
    a.execute("SELECT * FROM events").fetchall()
    b.execute("BEGIN IMMEDIATE")
    b.execute("INSERT INTO events VALUES(4,'new')")
    commit = err(lambda:b.execute("COMMIT"))
    before = b.execute("PRAGMA wal_checkpoint(PASSIVE)").fetchone()
    a.execute("ROLLBACK")
    after = b.execute("PRAGMA wal_checkpoint(PASSIVE)").fetchone()
    record("C6-long-reader-checkpoint",mode=mode,writer_commit=commit,
           checkpoint_with_reader=list(before),checkpoint_after_reader=list(after),
           tuple_order=["busy","wal_frames","checkpointed_frames"],
           limitation="PASSIVE checkpoint progress only; no assertion that file shrinks.")
    a.close();b.close()

results["finished_at_utc"] = datetime.now(timezone.utc).isoformat()
results["elapsed_seconds"] = time.monotonic()-started
(ROOT/"counterexamples.json").write_text(json.dumps(results,indent=2)+"\n")
print(json.dumps(results,indent=2))

