#!/usr/bin/env python3
"""Diagnose the actual frozen Batch 17 HTML with durable, bounded results.

This is test tooling, not application runtime code. Starts only a loopback
read-only HTTP server, uses fresh browser contexts, and never modifies source.
"""
from __future__ import annotations
import argparse
import functools
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import platform
import shutil
import threading
import traceback
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).resolve().parents[2]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--outdir', type=Path, required=True)
    parser.add_argument('--loading', choices=['content', 'file', 'http', 'all'], default='all')
    args = parser.parse_args()
    out = args.outdir.resolve()
    if out == ROOT or ROOT in out.parents:
        parser.error('Evidence must be outside source.')
    out.mkdir(parents=True, exist_ok=True)
    report = out / 'RESULT.json'
    if report.exists():
        parser.error('Use a fresh output directory.')
    result = {'status': 'running', 'stage': 'filesystem', 'python': platform.python_version(),
              'scope': 'Frozen HTML boot and ordinary gallery controls, not persistence/native proof',
              'checks': [], 'loading_modes': []}

    def save() -> None:
        report.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')

    def check(name: str, value: bool) -> None:
        result['checks'].append({'name': name, 'pass': bool(value)})
        save()
        if not value:
            raise AssertionError(name)

    save()
    try:
        raw = (ROOT / 'index.html').read_bytes()
        result['html_sha256'] = hashlib.sha256(raw).hexdigest()
        check('HTML is nonempty', len(raw) > 1000)
        check('Standalone bytes match', (ROOT / 'PM_Chat_Assistant_5.6_Pro_Standalone.html').read_bytes() == raw)
        binary = os.environ.get('PM_BROWSER_BIN') or shutil.which('chromium') or shutil.which('chromium-browser') or shutil.which('google-chrome')
        check('Chromium executable is available', bool(binary and Path(binary).is_file()))
        result['browser_executable'] = binary
        result['stage'] = 'browser_import'
        save()
        from playwright.sync_api import sync_playwright
        result['playwright'] = importlib.metadata.version('playwright')
        modes = ['content', 'file', 'http'] if args.loading == 'all' else [args.loading]
        with sync_playwright() as pw:
            result['stage'] = 'browser_launch'
            save()
            browser = pw.chromium.launch(executable_path=binary, headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
            result['browser_version'] = browser.version
            try:
                for mode in modes:
                    result['stage'] = 'loading_' + mode
                    row = {'mode': mode, 'status': 'running', 'errors': []}
                    result['loading_modes'].append(row)
                    save()
                    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
                    page = context.new_page()
                    page.set_default_timeout(12000)
                    page.on('pageerror', lambda e, row=row: row['errors'].append(str(e)))
                    server = thread = None
                    try:
                        if mode == 'content':
                            page.set_content(raw.decode('utf-8'), wait_until='domcontentloaded')
                        elif mode == 'file':
                            page.goto((ROOT / 'index.html').as_uri(), wait_until='domcontentloaded')
                        else:
                            class QuietHandler(SimpleHTTPRequestHandler):
                                def log_message(self, *_):
                                    pass
                            handler = functools.partial(QuietHandler, directory=str(ROOT))
                            server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
                            thread = threading.Thread(target=server.serve_forever, daemon=True)
                            thread.start()
                            row['url'] = f'http://127.0.0.1:{server.server_port}/index.html'
                            response = page.goto(row['url'], wait_until='domcontentloaded')
                            check('HTTP serves the actual frozen bytes', response.status == 200 and hashlib.sha256(response.body()).hexdigest() == result['html_sha256'])
                        page.wait_for_function('window.__PM56_BOOT_OK === true')
                        check(mode + ': shared Plan, To-Do and artifact owners exist', page.evaluate('!!(window.PM56_PLANS && window.PM56_TODOS && window.PM56_ARTIFACTS && window.PM56_B17_WORK)'))
                        page.locator('[data-action="open-demo"]').filter(visible=True).first.click()
                        check(mode + ': ordinary gallery exposes both B17 workflows', page.locator('[data-action="b17-start"]').count() == 2)
                        page.screenshot(path=str(out / (mode + '-gallery.png')))
                        check(mode + ': no page exceptions', not row['errors'])
                        check(mode + ': no action-registration collisions', not page.evaluate('PM56_EXT.collisions'))
                        row['status'] = 'pass'
                    except Exception:
                        row['status'] = 'fail'
                        row['failure'] = traceback.format_exc()
                        try:
                            page.screenshot(path=str(out / (mode + '-failure.png')), timeout=3000)
                        except Exception:
                            pass
                    finally:
                        context.close()
                        if server:
                            server.shutdown()
                            server.server_close()
                            thread.join(timeout=3)
                        save()
            finally:
                browser.close()
        check('Frozen source stayed unchanged', (ROOT / 'index.html').read_bytes() == raw)
        result['status'] = 'pass' if result['loading_modes'] and all(row['status'] == 'pass' for row in result['loading_modes']) else 'fail'
        result['stage'] = 'finished'
    except Exception:
        result['status'] = 'fail'
        result['failure'] = traceback.format_exc()
    finally:
        save()
        print(json.dumps({'status': result['status'], 'stage': result['stage'], 'report': str(report),
                          'html_sha256': result.get('html_sha256'), 'loading_modes': [{k: row[k] for k in ('mode', 'status')} for row in result['loading_modes']]}), flush=True)
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
