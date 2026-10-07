"""Independent bounded checks of the mapped tarfile source bytes.
Runs the exact library modules on the EXISTING host interpreter, not complete
CPython 3.12.3/3.14.0 runtimes. All filesystem fixtures stay below output_dir.
No candidate artifacts are imported or edited. No network/install operations.
"""
import sys
sys.dont_write_bytecode = True
import ast, hashlib, importlib.util, io, json, os, pathlib, platform, stat
import tempfile, warnings
OUT = pathlib.Path(__file__).resolve().parent
MAP = json.loads((OUT / "INPUT_MAP.json").read_text())
by_id = {s["source_id"]: s for s in MAP["primary_sources"]}
modules = {}
for label, sid in [("3.12.3", "tarold"), ("3.14.0", "tarnew")]:
    spec = importlib.util.spec_from_file_location("review_tar_" + label.replace(".", "_"), by_id[sid]["path"])
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    modules[label] = mod
results = {"host_interpreter": sys.version, "platform": platform.platform(),
           "execution_limit": "Exact mapped tarfile.py modules on host 3.14.4; not complete exact-release interpreters.",
           "sources": {sid: {"path": s["path"], "sha256": hashlib.sha256(pathlib.Path(s["path"]).read_bytes()).hexdigest()} for sid, s in by_id.items()},
           "cases": []}
def record(case, release, **kw):
    results["cases"].append({"case": case, "release": release, **kw})
def member(mod, name, kind=None, linkname="", mode=0o644):
    t = mod.TarInfo(name)
    t.type = mod.REGTYPE if kind is None else kind
    t.linkname, t.mode = linkname, mode
    return t
def archive(mod, members):
    b = io.BytesIO()
    with mod.open(fileobj=b, mode="w") as tf:
        for t in members:
            tf.addfile(t, io.BytesIO(b"") if t.isreg() else None)
    b.seek(0)
    return b
with tempfile.TemporaryDirectory(prefix="review-witness-", dir=OUT) as scratch:
    root = pathlib.Path(scratch)
    for release, mod in modules.items():
        base = root / release
        base.mkdir()
        with mod.open(fileobj=io.BytesIO(b"\0" * 10240), mode="r:") as tf:
            with warnings.catch_warnings(record=True) as ws:
                warnings.simplefilter("always")
                fn = tf._get_filter_function(None)
            record("omitted_default", release, function=fn.__name__, warnings=[type(w.message).__name__ for w in ws])
        record("filter_error_taxonomy", release, subclasses=[c.__name__ for c in mod.FilterError.__subclasses__()])
        samples = [
            ("absolute_regular", member(mod, "/safe_absolute_regular")),
            ("setuid_regular", member(mod, "setuid_regular", mode=0o4755)),
            ("fifo", member(mod, "fifo", mod.FIFOTYPE, mode=0o600)),
            ("absolute_symlink", member(mod, "absolute_symlink", mod.SYMTYPE, "/outside")),
            ("outside_symlink", member(mod, "outside_symlink", mod.SYMTYPE, "../outside")),
            ("normalized_symlink", member(mod, "normalized_symlink", mod.SYMTYPE, "a/../b")),
        ]
        for name, t in samples:
            try:
                f = mod.data_filter(t, str(base))
                record("data_filter_" + name, release, result="accepted", name=f.name, mode=None if f.mode is None else oct(f.mode), linkname=f.linkname)
            except Exception as e:
                record("data_filter_" + name, release, result="raised", exception=type(e).__name__)
        os.symlink("loop", base / "loop")
        try:
            f = mod.data_filter(member(mod, "loop/item"), str(base))
            record("data_filter_symlink_loop", release, result="accepted", name=f.name)
        except Exception as e:
            record("data_filter_symlink_loop", release, result="raised", exception=type(e).__name__, errno=getattr(e, "errno", None))
        for level in [0, 1, 2]:
            dest = base / ("fifo_level_" + str(level))
            dest.mkdir()
            raised = None
            with mod.open(fileobj=archive(mod, [member(mod, "blocked_fifo", mod.FIFOTYPE, mode=0o600)]), mode="r:") as tf:
                tf.errorlevel = level
                try:
                    tf.extractall(dest, filter="data")
                except Exception as e:
                    raised = type(e).__name__
            exists = (dest / "blocked_fifo").exists()
            record("explicit_data_fifo_errorlevel", release, errorlevel=level, raised=raised, member_exists=exists,
                   is_fifo=exists and stat.S_ISFIFO((dest / "blocked_fifo").lstat().st_mode))
        for api in ["extractall", "extract"]:
            dest = base / ("link_fallback_" + api)
            dest.mkdir()
            target = member(mod, "target_fifo", mod.FIFOTYPE, mode=0o600)
            link = member(mod, "link", mod.LNKTYPE, "target_fifo", mode=0o600)
            raised, cause = None, None
            with mod.open(fileobj=archive(mod, [target, link]), mode="r:") as tf:
                try:
                    if api == "extractall":
                        tf.extractall(dest, members=[tf.getmember("link")], filter="data")
                    else:
                        tf.extract("link", dest, filter="data")
                except Exception as e:
                    raised = type(e).__name__
                    cause = type(e.__cause__).__name__ if e.__cause__ else None
            exists = (dest / "link").exists()
            record("link_fallback_target_revalidation", release, api=api, raised=raised, cause=cause,
                   member_exists=exists, is_fifo=exists and stat.S_ISFIFO((dest / "link").lstat().st_mode))
        dest = base / "directory_refilter"
        dest.mkdir()
        calls = []
        def refilter(t, path):
            calls.append(t.name)
            if len(calls) == 2:
                raise mod.FilterError("refused during directory fixup")
            return t
        raised = None
        with mod.open(fileobj=archive(mod, [member(mod, "dir", mod.DIRTYPE, mode=0o700)]), mode="r:") as tf:
            tf.errorlevel = 2
            try:
                tf.extractall(dest, filter=refilter)
            except Exception as e:
                raised = type(e).__name__
        record("directory_fixup_refilter", release, filter_calls=calls, errorlevel=2, raised=raised)
results["scratch_cleaned"] = not pathlib.Path(scratch).exists()
(OUT / "reviewer_checks.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))

