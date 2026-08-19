import re, sys, subprocess, pathlib, tempfile
for path in sys.argv[1:]:
    src = pathlib.Path(path).read_text(encoding='utf-8')
    scripts = re.findall(r'<script>\n(.*?)\n</script>', src, re.S)
    for idx, body in enumerate(scripts):
        f = pathlib.Path(tempfile.gettempdir()) / ('chk-%s-%d.js' % (pathlib.Path(path).stem, idx))
        f.write_text(body, encoding='utf-8')
        r = subprocess.run(['node', '--check', str(f)], capture_output=True, text=True)
        status = 'OK' if r.returncode == 0 else 'FAIL'
        print(f"{path}: script {idx}: {status}")
        if r.returncode != 0:
            print(r.stderr[:500])
