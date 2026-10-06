# Discriminating check W3: save-integrity mechanics (temp file + atomic rename).
# Tests the MECHANISM only: POSIX rename(2) replaces the target wholesale; an aborted
# save that never reaches rename() leaves the previous target intact.
import os, json

p = "project.json"
t = "project.json.tmp"

# 1) successful save path
with open(t, "w") as fh:
    json.dump({"version": 1, "annotations": []}, fh)
os.replace(t, p)  # POSIX rename(2)
v1 = json.load(open(p))["version"]
tmp_exists_after_replace = os.path.exists(t)

# 2) interrupted save: writer crashed after temp write, before rename
with open(t, "w") as fh:
    json.dump({"version": 2, "annotations": [{"corrupt": True}], "truncated_tail": True}, fh)
# simulate the abort: process died here; nothing replaced the target.
os.remove(t)  # cleanup of the stale temp only

v2 = json.load(open(p))["version"]
print({"successful_save_version": v1,
       "temp_removed_by_rename": not tmp_exists_after_replace,
       "version_after_aborted_save": v2,
       "target_unaffected_by_abort": v2 == 1})
print("EXIT_OK" if (v1 == 1 and v2 == 1) else "EXIT_FAIL")