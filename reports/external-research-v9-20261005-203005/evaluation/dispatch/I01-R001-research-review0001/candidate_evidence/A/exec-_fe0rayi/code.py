import json, os, tempfile

# W3: atomic project save via temp file + os.replace, and interrupted-save recovery.
# Filesystem is the python_execute sandbox (fresh, empty).

d = tempfile.mkdtemp()
proj = os.path.join(d, "project.json")
with open(proj, "w") as f:
    f.write(json.dumps({"rev": 1, "annotations": ["a1"]}))

tmp = os.path.join(d, "project.json.tmp-witness")
# interrupted save: process "crashes" mid-write, rename never happens
with open(tmp, "w") as f:
    f.write('{"rev": 2, "annotations": ["a1", "a2"')
# (crash here)

surviving = json.load(open(proj))
stale_tmp_exists = os.path.exists(tmp)
stale_tmp_is_partial = open(tmp).read()[-1] != "]"

# recovery: stale temp is discarded (or resumed), then a clean save completes
with open(tmp, "w") as f:
    f.write(json.dumps({"rev": 2, "annotations": ["a1", "a2"]}))
os.replace(tmp, proj)  # atomic on POSIX: readers see old or new file, never partial

after = json.load(open(proj))
out = {
    "dir": os.path.basename(d),
    "state_after_interrupted_save": surviving,
    "stale_temp_detected": stale_tmp_exists,
    "stale_temp_was_partial_json": stale_tmp_is_partial,
    "state_after_clean_save": after,
    "temp_gone_after_replace": not os.path.exists(tmp),
}
print(json.dumps(out, indent=1))