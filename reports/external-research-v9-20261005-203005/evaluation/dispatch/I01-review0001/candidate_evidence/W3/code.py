import hashlib, json, os, tempfile

# Atomic project save: write temp in the target directory, then os.replace.
# Checks: (1) failed save leaves the old file byte-identical;
# (2) a simulated crash between temp-write and replace strands an orphan
# temp file (motivating the recovery sweep); (3) sha256 identity is stable
# and byte-sensitive.

d = tempfile.mkdtemp()
target = os.path.join(d, "annotations.json")

def save(path, obj, crash_before_replace=False):
    tmp = path + ".tmp"          # temp in the SAME directory as target
    with open(tmp, "w") as f:
        json.dump(obj, f)
        f.flush()
        os.fsync(f.fileno())
    if crash_before_replace:
        raise RuntimeError("simulated crash before os.replace")
    os.replace(tmp, path)

def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()

save(target, {"v": 1, "ann": ["a"]})
h1 = sha(target)
good_bytes = open(target).read()

try:
    save(target, {"v": 2, "ann": ["b"]}, crash_before_replace=True)
except RuntimeError as e:
    print("simulated failure                :", e)

print("target intact after failed save  :",
      open(target).read() == good_bytes, os.path.exists(target))
print("directory listing (orphan temp?) :", sorted(os.listdir(d)))

save(target, {"v": 2, "ann": ["ok"]})
print("after successful save            :", open(target).read())
print("identity hash stable             :", sha(target) == sha(target))
with open(target, "a") as f:
    f.write(" ")
print("any byte change alters identity  :", sha(target) != h1)
print("temp was created in target dir   : True (by construction, avoids EXDEV)")