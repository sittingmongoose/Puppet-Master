"""Small byte/path primitives; no scientific decisions."""
import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

MAX_FILE = 16 * 1024 * 1024


def now():
    return datetime.now(timezone.utc).isoformat()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, sort_keys=True, indent=2, allow_nan=False) + "\n").encode()


def read(path, limit=MAX_FILE):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"not a regular non-symlink file: {path}")
    with path.open("rb") as stream:
        data = stream.read(limit + 1)
    if len(data) > limit:
        raise ValueError(f"file exceeds {limit} bytes: {path}")
    return data


def scoped(root, name):
    root = Path(root).resolve(strict=True)
    rel = Path(name)
    if rel.is_absolute() or not rel.parts or any(p in ("..", ".git") for p in rel.parts):
        raise ValueError("paths must be explicit relative paths without '..' or .git")
    path = root
    for part in rel.parts:
        path = path / part
        if path.is_symlink():
            raise ValueError(f"symlink rejected: {path}")
    return path


def write_new(path, data, readonly=False):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    # Publish complete bytes atomically and never replace an existing identity.
    fd, temporary = tempfile.mkstemp(prefix=".mechanical-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
        os.chmod(temporary, 0o444 if readonly else 0o600)
        os.link(temporary, path)
    finally:
        os.unlink(temporary)


def object_put(root, data):
    sha = digest(data)
    path = scoped(root, "objects/" + sha)
    try:
        write_new(path, data, readonly=True)
    except FileExistsError:
        if read(path) != data:
            raise ValueError("content-addressed object mismatch")
    return sha


def emit(value):
    print(encoded(value).decode(), end="")
