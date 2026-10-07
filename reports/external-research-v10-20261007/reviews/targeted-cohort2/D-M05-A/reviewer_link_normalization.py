"""A bounded normalization counterexample, with all fixtures in review output."""
import sys
sys.dont_write_bytecode = True
import hashlib, importlib.util, json, os, pathlib, tempfile
OUT=pathlib.Path(__file__).resolve().parent
m=json.loads((OUT/"INPUT_MAP.json").read_text())
s={x["source_id"]:x for x in m["primary_sources"]}
observations=[]
with tempfile.TemporaryDirectory(prefix="review-normalization-",dir=OUT) as tmp:
    root=pathlib.Path(tmp)
    dest=root/"destination"
    (dest/"x"/"y").mkdir(parents=True)
    (dest/"x"/"b").write_text("inside")
    outside=root/"outside"
    outside.mkdir()
    os.symlink("x/y",dest/"a")
    os.symlink(outside,dest/"b")
    original="a/../b"
    for release,sid in [("3.12.3","tarold"),("3.14.0","tarnew")]:
        spec=importlib.util.spec_from_file_location("review_norm_"+sid,s[sid]["path"])
        mod=importlib.util.module_from_spec(spec)
        sys.modules[spec.name]=mod
        spec.loader.exec_module(mod)
        t=mod.TarInfo("link")
        t.type=mod.SYMTYPE
        t.linkname=original
        f=mod.data_filter(t,str(dest))
        resolved=os.path.realpath(dest/f.linkname)
        observations.append({"release_library":release,"source_sha256":hashlib.sha256(pathlib.Path(s[sid]["path"]).read_bytes()).hexdigest(),"filter_result":"accepted","original_linkname":original,"result_linkname":f.linkname,"effective_target_relative_to_scratch":os.path.relpath(resolved,root),"target_within_extraction_destination":os.path.commonpath([resolved,str(dest)])==str(dest)})
result={"host_interpreter":sys.version,"limitation":"Exact mapped library code on the existing host; no complete exact-release interpreter run. No archive extraction performed in this check.","layout":{"destination/a":"symlink to x/y","destination/b":"symlink to sibling outside directory, still within review scratch","destination/x/b":"ordinary file within destination"},"observations":observations,"scratch_cleaned":not pathlib.Path(tmp).exists()}
(OUT/"reviewer_link_normalization.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps(result,indent=2))

