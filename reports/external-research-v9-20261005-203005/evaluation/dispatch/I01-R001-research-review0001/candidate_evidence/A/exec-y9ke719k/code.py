import json, os, hashlib, shutil, tempfile, time

# W4 (rerun, corrected ordering): source-image identity by sha256+size, robust to
# relocation, renaming, and mtime changes. Original-removal check now happens
# after the removal.

d = tempfile.mkdtemp()
src_dir = os.path.join(d, "acquisition")
os.makedirs(src_dir)
src = os.path.join(src_dir, "acq001_camA.ome.tif")
payload = b"fake-tiff-bytes-\x00\x01" * 4096
with open(src, "wb") as f:
    f.write(payload)

sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
record = {"path": src, "size": os.path.getsize(src), "sha256": sha(src), "mtime": os.path.getmtime(src)}

# "relocation": copy to a differently named path with a different mtime
rel_dir = os.path.join(d, "relocated")
os.makedirs(rel_dir)
dst = os.path.join(rel_dir, "acq001_camA_renamed_copy.ome.tif")
shutil.copyfile(src, dst)
os.utime(dst, (1600000000, 1600000000))

relocated_mtime_differs = os.path.getmtime(dst) != record["mtime"]
relocated_sha_matches = sha(dst) == record["sha256"]

os.remove(src)
original_path_missing = not os.path.exists(record["path"])

# relink search over the whole tree: match on size + content hash only
candidates = []
for root, _, files in os.walk(d):
    for name in files:
        p = os.path.join(root, name)
        try:
            if os.path.getsize(p) == record["size"] and sha(p) == record["sha256"]:
                candidates.append(p)
        except OSError:
            pass

out = {
    "record_sha256_prefix": record["sha256"][:16],
    "record_size": record["size"],
    "relocated_copy_mtime_differs": relocated_mtime_differs,
    "relocated_copy_sha_matches": relocated_sha_matches,
    "original_path_missing_after_removal": original_path_missing,
    "relink_candidates_found": [os.path.relpath(p, d) for p in candidates],
    "note": "identity anchored on sha256+size; path is a hint, mtime is not identity",
}
print(json.dumps(out, indent=1))