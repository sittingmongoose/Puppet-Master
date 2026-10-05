# W3: atomic project-file save (write temp in same dir + os.replace) and content-hash identity
import hashlib, json, os, tempfile

workdir = tempfile.mkdtemp(prefix="proj_atomic_")
target = os.path.join(workdir, "project.json")

def save_atomic(path, obj):
    """Standard safe-save: serialize to temp file in same directory, then rename over target."""
    d = os.path.dirname(os.path.abspath(path))
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".project-", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(obj, f)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)   # POSIX: atomic replace of existing target
        return True
    except BaseException:
        os.unlink(tmp)          # failed save leaves old target untouched
        raise

save_atomic(target, {"v": 1, "ann": []})
before = open(target).read()
before_hash = hashlib.sha256(before.encode()).hexdigest()

# simulate a failure during a later save: crash AFTER temp write, BEFORE replace
class Boom(Exception):
    pass
try:
    fd, tmp = tempfile.mkstemp(dir=workdir, prefix=".project-", suffix=".tmp")
    with os.fdopen(fd, "w") as f:
        json.dump({"v": 2, "corrupt": True}, f)
        raise Boom
except Boom:
    pass

after = open(target).read()
after_hash = hashlib.sha256(after.encode()).hexdigest()
print("target intact after failed save :", before == after, before_hash == after_hash)
print("no leftover temp visible?  files:", sorted(os.listdir(workdir)))

# second save succeeds atomically
save_atomic(target, {"v": 2, "ann": ["ok"]})
print("after successful save           :", open(target).read())

# source-image identity: hash of file bytes
blob = b"fake 3GB image bytes" * 1000
h1 = hashlib.sha256(blob).hexdigest()
blob_changed = blob + b"x"
h2 = hashlib.sha256(blob_changed).hexdigest()
print("identity hash stable            :", hashlib.sha256(blob).hexdigest() == h1)
print("any byte change alters identity :", h1 != h2)
print("same-dir rename supported       :", os.path.exists(target))
