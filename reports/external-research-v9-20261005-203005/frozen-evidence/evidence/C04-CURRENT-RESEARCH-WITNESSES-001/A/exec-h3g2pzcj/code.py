import sqlite3, json, os
res = {}
db = "w4project.db"
for suf in ("", "-wal", "-shm"):
    p = db + suf
    if os.path.exists(p): os.remove(p)
c1 = sqlite3.connect(db, isolation_level=None)
res['journal_mode'] = c1.execute("PRAGMA journal_mode=WAL").fetchone()[0]
c1.execute("CREATE TABLE obs(id INTEGER PRIMARY KEY, name TEXT)")
c1.execute("BEGIN"); c1.execute("INSERT INTO obs VALUES(1,'committed-record')")
c1.execute("COMMIT")
c1.execute("BEGIN"); c1.execute("INSERT INTO obs VALUES(2,'incomplete-record')")
c2 = sqlite3.connect(db)
res['seen_while_txn_open_other_conn'] = c2.execute("SELECT count(*) FROM obs").fetchone()[0]
c1.close()
c3 = sqlite3.connect(db)
res['seen_after_crash_like_close'] = c3.execute("SELECT count(*) FROM obs").fetchone()[0]
res['rows'] = c3.execute("SELECT id,name FROM obs ORDER BY id").fetchall()
print(json.dumps(res, indent=1))