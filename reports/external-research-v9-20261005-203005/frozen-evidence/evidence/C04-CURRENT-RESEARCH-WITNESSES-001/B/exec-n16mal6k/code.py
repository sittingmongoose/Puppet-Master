import sqlite3
print("sqlite3 runtime library version:", sqlite3.sqlite_version)
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.execute("CREATE TABLE obs(id INTEGER PRIMARY KEY, label TEXT, lon REAL, lat REAL)")
cur.execute("CREATE VIRTUAL TABLE obs_rtree USING rtree(id, minx, maxx, miny, maxy)")
print("rtree virtual table created OK")
cur.execute("INSERT INTO obs VALUES (1,'complete point',-0.12,51.5)")
cur.execute("INSERT INTO obs_rtree VALUES (1,-0.13,-0.11,51.49,51.51)")
cur.execute("INSERT INTO obs VALUES (2,'record without coordinates',NULL,NULL)")
try:
    cur.execute("INSERT INTO obs_rtree VALUES (2,NULL,NULL,NULL,NULL)")
    print("UNEXPECTED: NULL bbox accepted")
except Exception as e:
    print("NULL bbox insert rejected ->", type(e).__name__, "-", e)
con.commit()
n = cur.execute("SELECT COUNT(*) FROM obs_rtree").fetchone()[0]
m = cur.execute("SELECT COUNT(*) FROM obs").fetchone()[0]
print("rows in rtree index:", n, "| rows in observation table:", m)
print("-> geometry-less record stays visible in the table but is absent from the spatial index")
rc = cur.execute("SELECT rtreecheck('obs_rtree')").fetchone()[0]
print("rtreecheck('obs_rtree'):", rc)
print("scope: stdlib sqlite3 in isolated python; checks documented rtree constraints, not app code")
