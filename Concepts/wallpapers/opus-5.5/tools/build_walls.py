#!/usr/bin/env python3
"""build_walls.py - the all-look wallpapers layered onto a page (pm7-wallpapers, Opus 5.5, 2026-10-13).

    python3 build_walls.py --check [--report <file.json>]
    python3 build_walls.py --base <page.html> --out <page.html> [--report <file.json>]

--check validates catalog.d and every file it names: the fragment shape, ids that are one lowercase word and unique
across fragments, both prints present as 2560x1440 WebP under the size cap, their 320x180 thumbnails, and at most one
default per look. It writes nothing but the optional report.

--base/--out writes only --out (never into Concepts/; review pages go to the share folder). It adds, each exactly once:
  <style id="wpk-css"> before the first </head>: the --lg-wall-<id>-<mode> images the base does not carry yet (one the
    base already carries must hold the same bytes as the catalog's file, or the build stops), the rules that land each
    id's print on --lg-wall (Glass) and --lg-wall-any (other looks), the gallery thumbnails, and src/wallpapers.css;
  <script id="wpk-js"> before the last </body>: the merged catalog as window.PM_WALLPAPERS_CATALOG and src/wallpapers.js.
The usual base is the Glass review page (Concepts/liquid-glass/opus-5.5/tools/build_proto.py), so these come after
Glass's own; on a page without Glass the wallpapers still paint every other look.

PMConcept7 itself is published only by opus-5.5 build.py, which calls inject() on its built page after Glass's
inject() (Glass's publish, approved by the coordinator 2026-10-14 and 2026-10-15) and stamps nothing.
"""
import argparse
import base64
import hashlib
import json
import pathlib
import re
import struct
import subprocess
import sys

PKG = pathlib.Path(__file__).resolve().parent.parent
LOOKS = ('basic', 'glass', 'friendly', 'retro', 'nier')
MAX_BYTES = 235_520          # about 230 KB per print (Glass's picker contract)
FULL = (2560, 1440)
THUMB = (320, 180)


def webp_size(b):
    """(width, height) of a WebP, from its first chunk."""
    if b[:4] != b'RIFF' or b[8:12] != b'WEBP':
        raise ValueError('not a WebP')
    kind = b[12:16]
    if kind == b'VP8X':
        return 1 + int.from_bytes(b[24:27], 'little'), 1 + int.from_bytes(b[27:30], 'little')
    if kind == b'VP8 ':
        w, h = struct.unpack('<HH', b[26:30])
        return w & 0x3FFF, h & 0x3FFF
    if kind == b'VP8L':
        bits = int.from_bytes(b[21:25], 'little')
        return 1 + (bits & 0x3FFF), 1 + ((bits >> 14) & 0x3FFF)
    raise ValueError('unknown WebP chunk %r' % kind)


def load_catalog():
    errors, fragments, seen, defaults = [], [], {}, {}
    files = sorted(p for p in (PKG / 'catalog.d').glob('*.json'))
    for p in files:
        m = re.fullmatch(r'(\d+)-([a-z]+)\.json', p.name)
        if not m:
            errors.append(f'{p.name}: name must be <NN>-<family>.json')
            continue
        frag = json.loads(p.read_text(encoding='utf-8'))
        for k in ('family', 'label', 'owner', 'order', 'about', 'wallpapers'):
            if k not in frag:
                errors.append(f'{p.name}: missing {k}')
        if frag.get('family') != m.group(2) or frag.get('order') != int(m.group(1)):
            errors.append(f'{p.name}: family/order must match the file name')
        for w in frag.get('wallpapers', []):
            wid = w.get('id', '')
            where = f'{p.name}:{wid}'
            if not re.fullmatch(r'[a-z]+', wid):
                errors.append(f'{where}: id must be one lowercase word')
            if wid in seen:
                errors.append(f'{where}: id already used in {seen[wid]}')
            seen[wid] = p.name
            for k in ('name', 'description', 'files'):
                if not w.get(k):
                    errors.append(f'{where}: missing {k}')
            d = w.get('default_for')
            if d is not None:
                if d not in LOOKS:
                    errors.append(f'{where}: default_for must be one of {LOOKS} or null')
                elif d in defaults:
                    errors.append(f'{where}: {d} already defaults to {defaults[d]}')
                else:
                    defaults[d] = wid
            for mode in ('dark', 'light'):
                rel = (w.get('files') or {}).get(mode)
                if not rel:
                    errors.append(f'{where}: no {mode} file')
                    continue
                for path, want, cap, label in ((PKG / rel, FULL, MAX_BYTES, mode), (PKG / 'src' / 'thumbs' / f'{wid}-{mode}.webp', THUMB, 40_000, mode + ' thumbnail')):
                    if not path.is_file():
                        errors.append(f'{where}: {label} missing ({path.relative_to(PKG.parent.parent.parent) if path.is_relative_to(PKG.parent.parent.parent) else path})')
                        continue
                    b = path.read_bytes()
                    try:
                        size = webp_size(b)
                    except ValueError as e:
                        errors.append(f'{where}: {label}: {e}')
                        continue
                    if size != want:
                        errors.append(f'{where}: {label} is {size[0]}x{size[1]}, not {want[0]}x{want[1]}')
                    if len(b) > cap:
                        errors.append(f'{where}: {label} is {len(b)} bytes, over {cap}')
        fragments.append((p, frag))
    if defaults.get('glass') != 'ribbons':
        errors.append('glass must default to ribbons (Jared, 2026-10-11)')
    idx = (PKG / 'index.html').read_text(encoding='utf-8')
    m = re.search(r"var FRAGMENTS = \[([^\]]*)\]", idx)
    listed = re.findall(r"'([^']+)'", m.group(1)) if m else None
    if listed != [p.name for p in files]:
        errors.append(f'index.html FRAGMENTS {listed} must list catalog.d in order: {[p.name for p in files]}')
    return fragments, errors


def report(fragments):
    out = {'package': 'Concepts/wallpapers/opus-5.5', 'families': [], 'totals': {}}
    total_full = total_thumb = count = 0
    for p, frag in fragments:
        fam = {'fragment': f'catalog.d/{p.name}', 'family': frag['family'], 'label': frag['label'], 'owner': frag['owner'], 'wallpapers': []}
        for w in frag['wallpapers']:
            entry = {'id': w['id'], 'name': w['name'], 'default_for': w.get('default_for'), 'files': {}}
            for mode in ('dark', 'light'):
                b = (PKG / w['files'][mode]).read_bytes()
                t = (PKG / 'src' / 'thumbs' / f"{w['id']}-{mode}.webp").read_bytes()
                entry['files'][mode] = {'path': w['files'][mode], 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest(),
                                        'thumb_bytes': len(t), 'thumb_sha256': hashlib.sha256(t).hexdigest()}
                total_full += len(b)
                total_thumb += len(t)
            fam['wallpapers'].append(entry)
            count += 1
        out['families'].append(fam)
    out['totals'] = {'wallpapers': count, 'prints': count * 2, 'print_bytes': total_full, 'thumb_bytes': total_thumb}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--base')
    ap.add_argument('--out')
    ap.add_argument('--report')
    a = ap.parse_args()
    fragments, errors = load_catalog()
    if errors:
        sys.exit('catalog:\n  ' + '\n  '.join(errors))
    rep = report(fragments)
    if a.check:
        t = rep['totals']
        print(f"catalog ok: {t['wallpapers']} wallpapers in {len(fragments)} families, {t['prints']} prints "
              f"{t['print_bytes']:,} B, thumbnails {t['thumb_bytes']:,} B")
    if a.base or a.out:
        if not (a.base and a.out):
            sys.exit('--base and --out go together')
        build(pathlib.Path(a.base), pathlib.Path(a.out), fragments, rep)
    elif not a.check:
        sys.exit('nothing to do: --check or --base/--out')
    if a.report:
        pathlib.Path(a.report).write_text(json.dumps(rep, indent=1) + '\n', encoding='utf-8')


class LayerError(Exception):
    pass


def inject(base, fragments=None, rep=None):
    """The page with the wallpapers layer added (its <style id="wpk-css"> before the first </head>, its
    <script id="wpk-js"> before the last </body>), and what it added: {'images', 'reused', 'style', 'script'}."""
    if fragments is None:
        fragments, errors = load_catalog()
        if errors:
            raise LayerError('catalog:\n  ' + '\n  '.join(errors))
    if rep is None:
        rep = report(fragments)
    for mark in ('id="wpk-css"', 'id="wpk-js"'):
        if mark in base:
            raise LayerError(f'base already carries {mark}')
    js_path = PKG / 'src' / 'wallpapers.js'
    chk = subprocess.run(['node', '--check', str(js_path)], capture_output=True, text=True)
    if chk.returncode:
        raise LayerError('wallpapers.js: ' + chk.stderr)
    images, reused, rules, thumbs = [], [], [], []
    catalog = {'version': 1, 'families': []}
    for p, frag in fragments:
        fam = {'family': frag['family'], 'label': frag['label'], 'owner': frag['owner'], 'wallpapers': []}
        for w in frag['wallpapers']:
            wid = w['id']
            fam['wallpapers'].append({'id': wid, 'name': w['name'], 'description': w['description'], 'default_for': w.get('default_for')})
            for mode in ('dark', 'light'):
                var = f'--lg-wall-{wid}-{mode}'
                b64 = base64.b64encode((PKG / w['files'][mode]).read_bytes()).decode()
                m = re.search(re.escape(var) + r':\s*url\(data:image/webp;base64,([A-Za-z0-9+/=]+)\)', base)
                if m:
                    if m.group(1) != b64:
                        raise LayerError(f'{var}: the base carries different bytes than {w["files"][mode]}')
                    reused.append(var)
                else:
                    images.append(f'  {var}: url(data:image/webp;base64,{b64});\n')
                tb = base64.b64encode((PKG / 'src' / 'thumbs' / f'{wid}-{mode}.webp').read_bytes()).decode()
                thumbs.append(f'  --wpk-t-{wid}-{mode}: url(data:image/webp;base64,{tb});\n')
                rules.append(f'html[data-lg-wall="{wid}"][data-theme$="-{mode}"] body {{ --lg-wall-any: var({var}); }}\n'
                             f'html[data-lg="on"][data-theme="glass-{mode}"][data-lg-wall="{wid}"]:not(#lgz) body {{ --lg-wall: var({var}); }}\n'
                             f'html[data-theme$="-{mode}"] .wpk-thumb[data-wpk-id="{wid}"] {{ background-image: var(--wpk-t-{wid}-{mode}); }}\n')
        catalog['families'].append(fam)
    css = (PKG / 'src' / 'wallpapers.css').read_text(encoding='utf-8')
    style = ('<style id="wpk-css">\n'
             f'/* wallpapers (Concepts/wallpapers/opus-5.5): {rep["totals"]["wallpapers"]} in {len(fragments)} families; '
             f'{len(images)} prints added here, {len(reused)} already on the page */\n'
             'html {\n' + ''.join(images) + '}\n.wpk-gallery {\n' + ''.join(thumbs) + '}\n' + ''.join(rules) + css + '</style>\n')
    cat_js = json.dumps(catalog, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    script = f'<script id="wpk-js">\nwindow.PM_WALLPAPERS_CATALOG = {cat_js};\n{js_path.read_text(encoding="utf-8")}</script>\n'
    h, b = base.find('</head>'), base.rfind('</body>')
    if h < 0 or b < 0 or b < h:
        raise LayerError('base: no </head> before </body>')
    out = base[:h] + style + base[h:b] + script + base[b:]
    return out, {'images': images, 'reused': reused, 'style': style, 'script': script}


def build(base_path, out_path, fragments, rep):
    if out_path.resolve().is_relative_to((PKG.parent.parent).resolve()):
        sys.exit('--out must be outside Concepts/ (review pages go to the share folder)')
    base = base_path.read_text(encoding='utf-8')
    try:
        out, added = inject(base, fragments, rep)
    except LayerError as exc:
        sys.exit(str(exc))
    images, reused, style, script = added['images'], added['reused'], added['style'], added['script']
    if 'data-concept-model=' not in out[:4000]:
        out = out.replace('<html lang="en"', '<html lang="en" data-concept-model="Opus 5.5"', 1)
    raw = out.encode('utf-8')
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(raw)
    rep['build'] = {'base': str(base_path), 'base_bytes': len(base.encode('utf-8')), 'base_sha256': hashlib.sha256(base.encode('utf-8')).hexdigest(),
                    'out': str(out_path), 'out_bytes': len(raw), 'out_sha256': hashlib.sha256(raw).hexdigest(),
                    'prints_added': len(images), 'prints_reused': len(reused), 'style_bytes': len(style.encode()), 'script_bytes': len(script.encode())}
    print(f'{out_path} {len(raw):,} bytes (+{len(raw) - rep["build"]["base_bytes"]:,}) sha256 {rep["build"]["out_sha256"][:16]}; '
          f'{len(images)} prints added, {len(reused)} reused from the base')


if __name__ == '__main__':
    main()
