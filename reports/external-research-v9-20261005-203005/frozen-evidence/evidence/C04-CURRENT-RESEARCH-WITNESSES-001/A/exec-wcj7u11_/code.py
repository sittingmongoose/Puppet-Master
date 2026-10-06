import sqlite3, json, time, random
info = {}
con = sqlite3.connect(':memory:')
opts = [r[0] for r in con.execute("PRAGMA compile_options")]
info['rtree_compiled_in'] = any('RTREE' in o for o in opts)
info['sqlite_version'] = sqlite3.sqlite_version
if not info['rtree_compiled_in']:
    print(json.dumps(info)); raise SystemExit(0)
N = 250000
random.seed(42)
lon0, lat0 = 13.0, 52.0
con.execute("CREATE TABLE obs(id INTEGER PRIMARY KEY, name TEXT, lon REAL, lat REAL)")
con.execute("CREATE VIRTUAL TABLE obs_rtree USING rtree(id, minX, maxX, minY, maxY)")
t0 = time.perf_counter()
rows = []
for i in range(N):
    lon = lon0 + random.uniform(-0.5, 0.5); lat = lat0 + random.uniform(-0.5, 0.5)
    rows.append((i, "obs-%d" % i, lon, lat))
con.executemany("INSERT INTO obs VALUES(?,?,?,?)", rows)
con.executemany("INSERT INTO obs_rtree VALUES(?,?,?,?,?)",
                [(r[0], r[2], r[2], r[3], r[3]) for r in rows])
con.commit()
info['insert_250k_s'] = round(time.perf_counter() - t0, 3)
dx, dy = 0.02, 0.01
q = ("SELECT o.id,o.lon,o.lat FROM obs_rtree r JOIN obs o ON o.id=r.id "
     "WHERE r.minX>=? AND r.maxX<=? AND r.minY>=? AND r.maxY<=?")
t1 = time.perf_counter()
res = con.execute(q, (lon0-dx, lon0+dx, lat0-dy, lat0+dy)).fetchall()
info['rtree_viewport_ms'] = round((time.perf_counter()-t1)*1000, 2)
info['rtree_viewport_hits'] = len(res)
t2 = time.perf_counter()
res2 = con.execute("SELECT count(*) FROM obs WHERE lon BETWEEN ? AND ? AND lat BETWEEN ? AND ?",
                   (lon0-dx, lon0+dx, lat0-dy, lat0+dy)).fetchone()
info['fullscan_ms'] = round((time.perf_counter()-t2)*1000, 2)
info['fullscan_hits'] = res2[0]
plan = con.execute("EXPLAIN QUERY PLAN " + q, (lon0-dx, lon0+dx, lat0-dy, lat0+dy)).fetchall()
info['plan'] = [r[-1] for r in plan]
print(json.dumps(info, indent=1))