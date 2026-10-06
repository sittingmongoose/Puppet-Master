import json, os, hashlib, shutil, tempfile

# W4: source-image identity by content hash (sha256) + size, robust to relocation
# and to mtime changes; mtime alone is shown to be unreliable for identity.

d = tempfile.mkdtemp()
src_dir = os.path.join(d, "acquisition")
os.makedirs(src_dir)
src = os.path.join(src_dir, "acq001_camA.ome.tif")
payload = b"fake-tiff-bytes-\x00\x01" * 4096
with open(src, "wb") as f:
    f.write(payload)

sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
record = {"path": src, "size": os.path.getsize(src), "sha256": sha(src), "mtime": os.path.getmtime(src)}

# "move to another machine": copy to a differently named path (mtime set differently)
rel_dir = os.path.join(d, "relocated")
os.makedirs(rel_dir)
dst = os.path.join(rel_dir, "acq001_camA_renamed_copy.ome.tif")
shutil.copyfile(src, dst)
os.utime(dst, (time.time() - 98765, time.time() - 98765)) if False else os.utime(dst, (1600000000, 1600000000))

original_gone = not os.path.exists(record["path"])
os.remove(src)

# relink search: match on size + content hash, NOT name or mtime
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
    "record": record,
    "relocated_copy_mtime_differs": os.path.getmtime(dst) != record["mtime"],
    "relocated_copy_sha_matches": sha(dst) == record["sha256"],
    "original_path_missing": original_gone,
    "relink_candidates_found": candidates,
    "note": "identity anchored on sha256+size; path is a hint, mtime is not identity",
}
print(json.dumps(out, indent=1))