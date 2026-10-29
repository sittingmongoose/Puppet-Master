
    (function() {
      'use strict';
      function logCmd() {}
      /* pm6 W2 / title-bar notify: delegate to window.toast (globals).
         Fallback console only — bottom #pmToastStack is retired. */
      function toast(msg) {
        if (window.toast) { window.toast(msg); return; }
        try { console.log('[toast]', msg); } catch (e0) {}
      }
      var DND_MIME = 'application/x-puppet-master-term-pane';
      var COLOR_PALETTE = ['#7ee787', '#79c0ff', '#ffa657', '#ff7b72', '#d2a8ff', '#56d4dd', '#e3b341', '#8b949e'];
      var ICON_CATALOG = ['zap', 'terminal', 'server', 'box', 'layers', 'cpu', 'globe', 'sparkles', 'database', 'git', 'cloud', 'hammer', 'bug', 'package', 'radio', 'wifi', 'shield', 'folder', 'code', 'clock'];
      function iconSvg(kind, size) {
        var wh = size || 12;
        var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + wh + '" height="' + wh + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        if (kind === 'zap') s += '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>';
        else if (kind === 'terminal') s += '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>';
        else if (kind === 'server') s += '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>';
        else if (kind === 'box') s += '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>';
        else if (kind === 'layers') s += '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/>';
        else if (kind === 'cpu') s += '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>';
        else if (kind === 'globe') s += '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>';
        else if (kind === 'database') s += '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>';
        else if (kind === 'git') s += '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 9v6a3 3 0 0 0 3 3h6"/><line x1="6" y1="21" x2="6" y2="18"/>';
        else if (kind === 'cloud') s += '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>';
        else if (kind === 'hammer') s += '<path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L9 15"/><path d="M14.41 14.41 20 20"/>';
        else if (kind === 'bug') s += '<rect x="9" y="2" width="6" height="6" rx="1"/><path d="M9 12H5"/><path d="M19 12h-4"/><path d="M12 8v4"/><path d="M5 16h4"/><path d="M15 16h4"/>';
        else if (kind === 'package') s += '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';
        else if (kind === 'radio') s += '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>';
        else if (kind === 'wifi') s += '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>';
        else if (kind === 'shield') s += '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>';
        else if (kind === 'folder') s += '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>';
        else if (kind === 'code') s += '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>';
        else if (kind === 'clock') s += '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
        else if (kind === 'sparkles') s += '<path d="M12 3l1.9 5.8h6.1l-5 3.6 1.9 5.8-5-3.6-5 3.6 1.9-5.8-5-3.6h6.1z"/>';
        else s += '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>';
        return s + '</svg>';
      }
      function splitIconSvg(stacked) {
        var s = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        if (stacked) {
          s += '<rect x="4" y="3" width="16" height="7" rx="1"/><rect x="4" y="14" width="16" height="7" rx="1"/>';
        } else {
          s += '<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>';
        }
        return s + '</svg>';
      }
      function workgroupPlusSvg() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>' +
          '<line x1="15" y1="13" x2="15" y2="19"/><line x1="12" y1="16" x2="18" y2="16"/>' +
          '</svg>';
      }
      function dragPayloadWrite(dt, obj) {
        var json = JSON.stringify(obj);
        try { dt.setData(DND_MIME, json); } catch (e1) {}
        try { dt.setData('text/plain', json); } catch (e2) {}
      }
      function countLeaves(node) {
        if (!node) return 0;
        if (node.type === 'leaf') return 1;
        return node.children.reduce(function(a, c) { return a + countLeaves(c); }, 0);
      }
      function layoutGridDims(layout) {
        if (!layout || layout.type === 'leaf') return { rows: 1, cols: 1 };
        if (layout.type === 'row') {
          var cw = 0, rh = 0;
          layout.children.forEach(function(c) {
            var d = layoutGridDims(c);
            cw += d.cols;
            rh = Math.max(rh, d.rows);
          });
          return { rows: rh, cols: cw };
        }
        var ch = 0, rw = 0;
        layout.children.forEach(function(c) {
          var d = layoutGridDims(c);
          ch += d.rows;
          rw = Math.max(rw, d.cols);
        });
        return { rows: ch, cols: rw };
      }
      function isValidQuadrantLayout(layout) {
        var d = layoutGridDims(layout);
        return d.rows <= 2 && d.cols <= 2 && countLeaves(layout) <= 4;
      }
      function removeLeaf(tree, paneId) {
        if (!tree) return null;
        if (tree.type === 'leaf') return tree.paneId === paneId ? null : tree;
        var ch = tree.children.map(function(c) { return removeLeaf(c, paneId); }).filter(Boolean);
        if (ch.length === 0) return null;
        if (ch.length === 1) return ch[0];
        return { type: tree.type, children: ch };
      }
      function firstPaneIdInTree(node) {
        if (!node) return null;
        if (node.type === 'leaf') return node.paneId;
        for (var i = 0; i < node.children.length; i++) {
          var x = firstPaneIdInTree(node.children[i]);
          if (x) return x;
        }
        return null;
      }
      function collectLeafPaneIds(node, acc) {
        acc = acc || [];
        if (!node) return acc;
        if (node.type === 'leaf') { acc.push(node.paneId); return acc; }
        node.children.forEach(function(c) { collectLeafPaneIds(c, acc); });
        return acc;
      }
      function paneChipLabel(paneId) {
        var p = state.panes[paneId];
        if (!p) return paneId;
        return (p.displayName || paneId).slice(0, 22);
      }
      function paneSubColor(g, paneId) {
        var p = state.panes[paneId];
        if (p && p.subtabTextColor) return p.subtabTextColor;
        return g.accentColor || '#8b949e';
      }
      function closeTermCtxMenus() {
        document.querySelectorAll('.pm-term-ctx-menu').forEach(function(m) { m.remove(); });
      }
      document.addEventListener('click', function() { closeTermCtxMenus(); });
      function openTermCtxMenu(pageX, pageY, build) {
        closeTermCtxMenus();
        var m = document.createElement('div');
        m.className = 'pm-term-ctx-menu';
        m.onclick = function(e) { e.stopPropagation(); };
        build(m);
        document.body.appendChild(m);
        var mw = m.offsetWidth;
        var mh = m.offsetHeight;
        var x = pageX;
        var y = pageY;
        if (x + mw > window.innerWidth - 8) x = window.innerWidth - mw - 8;
        if (y + mh > window.innerHeight - 8) y = window.innerHeight - mh - 8;
        m.style.left = x + 'px';
        m.style.top = y + 'px';
        setTimeout(function() {
          function out(ev) {
            if (!m.contains(ev.target)) { closeTermCtxMenus(); document.removeEventListener('mousedown', out, true); }
          }
          document.addEventListener('mousedown', out, true);
        }, 0);
      }
      function swapPaneIdsInTree(node, a, b) {
        if (!node) return;
        if (node.type === 'leaf') {
          if (node.paneId === a) node.paneId = b;
          else if (node.paneId === b) node.paneId = a;
          return;
        }
        node.children.forEach(function(c) { swapPaneIdsInTree(c, a, b); });
      }
      var paneCounter = 200;
      var defaultLines = {
        alpha: [
          { t: 'line', c: '$ cargo build --workspace' },
          { t: 'line', c: '   Compiling puppet-master v0.1.0' },
          { t: 'line', c: '    Finished `dev` profile [unoptimized + debuginfo] in 8.42s' },
          { t: 'line', c: '$ cargo test --workspace' },
          { t: 'line', c: 'test result: ok. 214 passed; 0 failed; 0 ignored' }
        ],
        beta: [{ t: 'line info', c: '[historical transcript — PTY not live after restart]' }],
        gamma: [
          { t: 'line', c: '$ vite --host' },
          { t: 'line info', c: '  VITE v5.4.0  ready in 412 ms' },
          { t: 'line', c: '  Local:   http://localhost:3000/' }
        ],
        delta: [{ t: 'line', c: '$ git log --oneline -2' }, { t: 'line', c: 'a3f2c1d feat: add auth handler' }],
        npm: [{ t: 'line', c: '$ npm run dev' }, { t: 'line info', c: 'webpack compiled' }],
        docker: [{ t: 'line', c: '$ docker ps --format table' }, { t: 'line', c: 'CONTAINER ID   IMAGE     STATUS' }],
        psql: [{ t: 'line', c: '$ psql -h localhost demo' }, { t: 'line', c: 'demo=# \\dt' }],
        ci: [{ t: 'line', c: '[CI] pipeline #882 · running tests…' }, { t: 'line info', c: '  cargo test --workspace' }],
        misc: [{ t: 'line', c: '$ bench --quick' }, { t: 'line', c: 'ok · 12.4ms' }],
        term_tp_ci: [
          { t: 'line info', c: '[06:00:00] pipeline #882 · branch main' },
          { t: 'line', c: '[CI] queued on runner-pm-04' },
          { t: 'line', c: '[CI] checkout · fetch depth 50 · 2.1s' },
          { t: 'line', c: '[CI] cache restore · cargo-registry · hit' },
          { t: 'line', c: '[CI] matrix: [linux-gnu, macos-arm]' },
          { t: 'line info', c: '[06:00:18] linux-gnu · building' },
          { t: 'line', c: '   Compiling workspace in release…' },
          { t: 'line info', c: '[06:04:02] linux-gnu · tests starting' },
          { t: 'line', c: 'test result: ok. 412 passed; 0 failed' },
          { t: 'line info', c: '[06:07:55] pipeline success · artifacts uploaded' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_ci_cover: [
          { t: 'line info', c: '[06:05:12] coverage · llvm-cov' },
          { t: 'line', c: '$ cargo llvm-cov nextest --workspace --summary-only' },
          { t: 'line', c: 'Filename                      Regions    Missed   Cover' },
          { t: 'line', c: 'src/main.rs                      120        8     93.33%' },
          { t: 'line', c: 'src/runtime/mod.rs               840       61     92.74%' },
          { t: 'line', c: 'src/terminal/emu.rs              402       44     89.05%' },
          { t: 'line', c: 'TOTAL                           15201     1102    92.75%' },
          { t: 'line info', c: '[06:05:48] codecov upload · OK' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_ci_lint: [
          { t: 'line info', c: '[06:02:11] job eslint-ui' },
          { t: 'line', c: '$ pnpm --filter ui exec eslint . --max-warnings 0' },
          { t: 'line', c: 'Linting… 184 files' },
          { t: 'line stderr', c: '/src/components/TermStrip.tsx' },
          { t: 'line stderr', c: '  42:7  warning  React Hook useEffect has a missing dependency: \'syncBar\'' },
          { t: 'line', c: '✖ 1 problem (0 errors, 1 warning)' },
          { t: 'line stderr', c: 'ESLint found too many warnings (maximum: 0).' },
          { t: 'line info', c: '[06:02:24] exit code 1 · annotation posted to PR #441' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_ci_test: [
          { t: 'line info', c: '[06:03:40] unit matrix · shard 2/4' },
          { t: 'line', c: '$ cargo nextest run --partition count:4/2 --workspace' },
          { t: 'line', c: 'Starting 103 tests across 28 binaries' },
          { t: 'line', c: '        PASS [   0.8s] puppet-master::policy policy::deny_unsigned_tool' },
          { t: 'line', c: '        PASS [   2.1s] puppet-master::storage wal_roundtrip' },
          { t: 'line', c: '        PASS [  12.4s] puppet-master::gui screenshot_diff_smoke' },
          { t: 'line', c: '        FAIL [   0.2s] puppet-master::net flaky_tunnel_retry (ignored)' },
          { t: 'line info', c: '[06:04:01] summary: 102 passed, 1 ignored, 0 failed' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_db: [
          { t: 'line info', c: '[15:44:22] psql · demo@localhost' },
          { t: 'line', c: '$ psql -h localhost -U demo -d demo -c \'\\conninfo\'' },
          { t: 'line', c: 'You are connected to database "demo" as user "demo" on host "localhost".' },
          { t: 'line', c: 'demo=# SELECT now(), version();' },
          { t: 'line', c: '            now             | version' },
          { t: 'line', c: ' 2026-04-06 15:44:23.102+00 | PostgreSQL 16.2' },
          { t: 'line', c: 'demo=# \\dt' },
          { t: 'line', c: '               List of relations' },
          { t: 'line', c: ' public | sessions | table | demo' },
          { t: 'line info', c: '[15:44:25] idle in transaction: none' },
          { t: 'line', c: 'demo=# ' }
        ],
        term_tp_db_dump: [
          { t: 'line info', c: '[03:15:00] scheduled logical backup' },
          { t: 'line', c: '$ pg_dump -h localhost -U demo -d demo -Fc -f /backup/demo_20260406_0315.dump' },
          { t: 'line', c: 'pg_dump: last built-in OID is 16383' },
          { t: 'line', c: 'pg_dump: reading extensions' },
          { t: 'line', c: 'pg_dump: dumping contents of table "public.sessions"' },
          { t: 'line info', c: '[03:15:14] 128 MB written · checksum SHA256 verified' },
          { t: 'line', c: '$ ls -lh /backup/demo_20260406_0315.dump' },
          { t: 'line', c: '-rw-r--r-- 1 backup backup 122M Apr  6 03:15 demo_20260406_0315.dump' },
          { t: 'line info', c: 'Retention: 14d · off-site sync queued' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_db_exp: [
          { t: 'line info', c: '[18:29:40] explain analyze' },
          { t: 'line', c: 'demo=# EXPLAIN (ANALYZE, BUFFERS)' },
          { t: 'line', c: 'SELECT * FROM sessions WHERE project_id = $1 ORDER BY updated_at DESC LIMIT 50;' },
          { t: 'line', c: 'Limit  (cost=1.12..24.88 rows=50 width=128) (actual time=0.08..1.02 rows=50 loops=1)' },
          { t: 'line', c: '  ->  Index Scan using sessions_project_updated_idx on sessions' },
          { t: 'line', c: '        (actual time=0.06..0.88 rows=50 loops=1)' },
          { t: 'line info', c: 'Planning Time: 0.214 ms · Execution Time: 1.124 ms' },
          { t: 'line', c: 'demo=# ' }
        ],
        term_tp_db_mig: [
          { t: 'line info', c: '[09:12:08] sqlx migrate · dry output' },
          { t: 'line', c: '$ sqlx migrate info' },
          { t: 'line', c: '1/applied  initial schema' },
          { t: 'line', c: '2/applied  add session ledger' },
          { t: 'line', c: '3/pending  add web_cache_ttl' },
          { t: 'line', c: '$ sqlx migrate run' },
          { t: 'line', c: 'Applied 3/migrate add web_cache_ttl (42ms)' },
          { t: 'line', c: '$ sqlx migrate info' },
          { t: 'line', c: '3/applied  add web_cache_ttl' },
          { t: 'line info', c: '[09:12:11] database version locked at 3' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_dk: [
          { t: 'line info', c: '[08:22:01] compose · project puppet-master' },
          { t: 'line', c: '$ docker compose up -d' },
          { t: 'line', c: ' Container pm-postgres-1  Running' },
          { t: 'line', c: ' Container pm-redis-1     Running' },
          { t: 'line', c: ' Container pm-api-1       Starting' },
          { t: 'line', c: ' Container pm-api-1       Started' },
          { t: 'line', c: '$ docker compose ps --format \'table {{.Name}}\\t{{.Status}}\'' },
          { t: 'line', c: 'NAME            STATUS' },
          { t: 'line', c: 'pm-api-1        Up 3 seconds (health: starting)' },
          { t: 'line', c: 'pm-postgres-1   Up 2 days' },
          { t: 'line info', c: '[08:22:08] healthcheck: api · 1/1 passing' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_dk_img: [
          { t: 'line info', c: '[19:14:33] image inventory' },
          { t: 'line', c: '$ docker images --format \'table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}\' | head' },
          { t: 'line', c: 'REPOSITORY          TAG       SIZE' },
          { t: 'line', c: 'puppet-master-api   latest    842MB' },
          { t: 'line', c: 'postgres            16        453MB' },
          { t: 'line', c: 'redis               7         128MB' },
          { t: 'line', c: '$ docker history puppet-master-api:latest --no-trunc | head -n 6' },
          { t: 'line', c: 'IMAGE         CREATED BY' },
          { t: 'line', c: '<missing>     RUN cargo build --release' },
          { t: 'line info', c: '[19:14:36] 14 layers · base debian:bookworm-slim' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_dk_net: [
          { t: 'line info', c: '[12:33:45] bridge networks' },
          { t: 'line', c: '$ docker network ls | grep pm' },
          { t: 'line', c: 'abc123   pm_default    bridge    local' },
          { t: 'line', c: '$ docker network inspect pm_default --format \'{{json .IPAM.Config}}\'' },
          { t: 'line', c: '[{"Subnet":"172.28.0.0/16","Gateway":"172.28.0.1"}]' },
          { t: 'line', c: '$ docker compose exec api getent hosts postgres' },
          { t: 'line', c: '172.28.0.3      postgres pm-postgres-1.pm_default' },
          { t: 'line info', c: '[12:33:52] DNS resolution ok' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_dk_vol: [
          { t: 'line info', c: '[07:51:12] named volumes' },
          { t: 'line', c: '$ docker volume ls | grep pm_' },
          { t: 'line', c: 'local     pm_postgres_data' },
          { t: 'line', c: 'local     pm_redis_data' },
          { t: 'line', c: 'local     pm_build_cache' },
          { t: 'line', c: '$ docker system df -v | grep pm_postgres_data -A2' },
          { t: 'line', c: 'VOLUME NAME         LINKS     SIZE' },
          { t: 'line', c: 'pm_postgres_data    1         1.042GB' },
          { t: 'line info', c: '[07:51:18] last backup snapshot: 2026-04-05T04:00Z' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_e2_fix: [
          { t: 'line info', c: '[11:40:33] fixtures · refresh' },
          { t: 'line', c: '$ ls -la e2e/fixtures/' },
          { t: 'line', c: 'drwxr-xr-x  user  sessions-minimal.json' },
          { t: 'line', c: 'drwxr-xr-x  user  wizard-stub.tar.zst' },
          { t: 'line', c: '$ pm e2e fixtures verify --strict' },
          { t: 'line', c: 'OK  sessions-minimal.json  schema v3' },
          { t: 'line', c: 'OK  wizard-stub.tar.zst    checksum' },
          { t: 'line info', c: '[11:40:38] fixtures pinned for commit a3f2c1d' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_e2_snap: [
          { t: 'line info', c: '[13:55:01] snapshot update · ui' },
          { t: 'line', c: '$ npx playwright test --update-snapshots --grep @visual' },
          { t: 'line', c: 'Updating snapshot TerminalStrip-dark.png' },
          { t: 'line', c: 'Updating snapshot PlanningWizard-step3.png' },
          { t: 'line stderr', c: '3 snapshots updated, 0 removed.' },
          { t: 'line', c: '$ git status --short e2e/snapshots' },
          { t: 'line', c: ' M e2e/snapshots/TerminalStrip-dark.png' },
          { t: 'line info', c: '[13:55:22] review required before merge' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_e2_tr: [
          { t: 'line info', c: '[17:25:11] trace server · local' },
          { t: 'line', c: '$ npx playwright show-trace test-results/debug/trace.zip' },
          { t: 'line', c: 'Serving trace at http://127.0.0.1:9323/trace/index.html' },
          { t: 'line', c: 'Press Ctrl+C to stop' },
          { t: 'line info', c: '[17:25:14] loaded 1,204 events · 82 screenshots' },
          { t: 'line', c: 'GET /trace/snapshot-0001.jpeg 200 2ms' },
          { t: 'line', c: 'GET /trace/network.json 200 1ms' },
          { t: 'line info', c: '[17:26:02] user opened action #44 "click" · selector [data-test=send]' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_e2e: [
          { t: 'line info', c: '[17:22:05] playwright · headed=false' },
          { t: 'line', c: '$ npx playwright test --reporter=line --workers=4' },
          { t: 'line', c: 'Running 12 tests using 4 workers' },
          { t: 'line', c: '... planning wizard > smoke (8.2s)' },
          { t: 'line', c: '… assistant › send message (12.1s)' },
          { t: 'line', c: '… terminal › split pane dnd (6.4s)' },
          { t: 'line info', c: '[17:22:53] 12 passed (48.1s)' },
          { t: 'line', c: 'To open last HTML report: npx playwright show-report' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_hist: [
          { t: 'line info', c: '[09:41:02] session snapshot · pid 8841 · cwd ~/projects/puppet-master' },
          { t: 'line', c: '$ rustc --version --verbose' },
          { t: 'line', c: 'rustc 1.84.0 (stable)' },
          { t: 'line', c: '$ cargo test -p puppet-master --no-run' },
          { t: 'line', c: '   Compiling puppet-master v0.1.0' },
          { t: 'line stderr', c: 'warning: unused variable: `ctx`' },
          { t: 'line info', c: '   --> src/runtime/mod.rs:402:7' },
          { t: 'line', c: '    Finished `test` profile [optimized + debuginfo]' },
          { t: 'line info', c: '[09:43:18] PTY detached · exit code 0 (transcript frozen)' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_m_dep: [
          { t: 'line info', c: '[14:48:30] dependency graph · mermaid export' },
          { t: 'line', c: '$ cargo tree -p puppet-master -e normal --prefix none | head -n 20' },
          { t: 'line', c: 'slint v1.8.0' },
          { t: 'line', c: 'tokio v1.40.0' },
          { t: 'line', c: 'serde v1.0.210' },
          { t: 'line', c: '$ cargo deny check licenses' },
          { t: 'line', c: 'licenses ok — 0 errors, 0 warnings' },
          { t: 'line info', c: '[14:48:36] graph exported to Plans/.pipeline/deps.dot' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_m_gen: [
          { t: 'line info', c: '[10:11:05] codegen · proto + openapi' },
          { t: 'line', c: '$ buf generate proto/' },
          { t: 'line', c: 'wrote gen/go/puppet/v1/service.pb.go' },
          { t: 'line', c: '$ openapi-generator-cli generate -i docs/openapi.yaml -g rust -o gen/api' },
          { t: 'line', c: '[main] INFO  writing file …/models/session.rs' },
          { t: 'line info', c: '[10:11:18] 37 files changed' },
          { t: 'line', c: '$ git diff --stat gen/ | tail -n 1' },
          { t: 'line', c: ' 37 files changed, 4021 insertions(+), 118 deletions(-)' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_m_scp: [
          { t: 'line info', c: '[16:18:22] bundle → staging' },
          { t: 'line', c: '$ tar -czf /tmp/pm-bundle.tar.gz --exclude=target .' },
          { t: 'line', c: '…' },
          { t: 'line', c: '$ scp -C /tmp/pm-bundle.tar.gz deploy@staging.pm.internal:/incoming/' },
          { t: 'line', c: 'pm-bundle.tar.gz   100%  210MB   12.4MB/s   00:17' },
          { t: 'line', c: '$ ssh deploy@staging.pm.internal \'sha256sum /incoming/pm-bundle.tar.gz\'' },
          { t: 'line', c: 'a91f…c02  /incoming/pm-bundle.tar.gz' },
          { t: 'line info', c: '[16:18:42] checksum matched local' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_misc: [
          { t: 'line info', c: '[21:33:17] microbench · 30 iterations' },
          { t: 'line', c: '$ cargo bench -p puppet-master --bench routing -- --noplot' },
          { t: 'line', c: 'routing/short_path   time:   [412 ns 418 ns 425 ns]' },
          { t: 'line', c: 'routing/deep_chain   time:   [1.2 µs 1.22 µs 1.25 µs]' },
          { t: 'line', c: 'Found 2 outliers among 30 measurements (6.67%)' },
          { t: 'line info', c: '[21:33:45] results written target/criterion/routing' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_ps_cold: [
          { t: 'line info', c: '[05:55:00] cold boot sequence' },
          { t: 'line', c: '$ systemctl --user status pm-agent' },
          { t: 'line', c: 'Active: active (running) since Mon 2026-04-06 05:54:58 UTC' },
          { t: 'line', c: '$ pm daemon --foreground 2>&1 | head -n 12' },
          { t: 'line', c: 'config loaded from ~/.config/puppet-master/config.toml' },
          { t: 'line', c: 'telemetry: opt-in local only' },
          { t: 'line', c: 'runtime: tokio worker threads = 8' },
          { t: 'line info', c: '[05:55:04] ready · listening on /run/pm/agent.sock' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_ps_crash: [
          { t: 'line info', c: '[02:33:18] crash artifact · SIGABRT' },
          { t: 'line', c: '$ coredumpctl info 8841' },
          { t: 'line', c: 'PID: 8841 (puppet-master)' },
          { t: 'line', c: 'Signal: 6 (ABRT)' },
          { t: 'line', c: 'Command Line: target/debug/puppet-master --demo' },
          { t: 'line', c: '$ ls -la /var/lib/systemd/coredump/core.puppet-master.*' },
          { t: 'line', c: '-rw-r-----  root root  128M … core.puppet-master.8841.lz4' },
          { t: 'line info', c: '[02:33:22] uploaded to symbol server · id ab12…' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_ps_env: [
          { t: 'line info', c: '[04:12:44] env freeze · prior session' },
          { t: 'line', c: '$ env | sort | rg \'^(RUST|PM|PATH|CARGO)\'' },
          { t: 'line', c: 'CARGO_HOME=/home/dev/.cargo' },
          { t: 'line', c: 'PATH=/home/dev/.cargo/bin:…' },
          { t: 'line', c: 'PM_PROFILE=dev' },
          { t: 'line', c: 'RUST_BACKTRACE=1' },
          { t: 'line', c: '$ printenv PM_SESSION_ID' },
          { t: 'line', c: 'sess-7f3a- prior' },
          { t: 'line info', c: '[04:12:47] captured 42 variables → .pm/env.freeze.json' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_sec: [
          { t: 'line info', c: '[14:02:11] ui · ~/projects/puppet-master/ui' },
          { t: 'line', c: '$ pnpm install --frozen-lockfile' },
          { t: 'line', c: 'Lockfile is up to date, resolution step is skipped' },
          { t: 'line', c: 'Packages: +0' },
          { t: 'line', c: 'Done in 1.1s' },
          { t: 'line', c: '$ vite --host 0.0.0.0 --port 3000' },
          { t: 'line info', c: '  VITE v5.4.0  ready in 389 ms' },
          { t: 'line', c: '  ➜  Local:   http://localhost:3000/' },
          { t: 'line', c: '  ➜  Network: http://192.168.1.14:3000/' },
          { t: 'line info', c: '[14:02:14] hmr · /@fs/src/App.tsx' },
          { t: 'line', c: '14:02:15 [vite] hmr update /src/App.tsx' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_v_analyze: [
          { t: 'line info', c: '[10:55:12] bundle scan · production build' },
          { t: 'line', c: '$ vite build --mode production 2>&1 | tee /tmp/vite-build.log' },
          { t: 'line', c: 'vite v5.4.0 building for production…' },
          { t: 'line', c: 'transforming…' },
          { t: 'line', c: '✓ 1842 modules transformed.' },
          { t: 'line', c: 'rendering chunks…' },
          { t: 'line', c: 'dist/index.html                   0.42 kB' },
          { t: 'line', c: 'dist/assets/index-abc123.js     412.18 kB │ gzip: 128.4 kB' },
          { t: 'line stderr', c: '(!) Some chunks are larger than 500 kB after minification.' },
          { t: 'line info', c: '[10:55:48] build finished in 36.1s' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_v_cfg: [
          { t: 'line info', c: '[11:18:44] TypeScript project introspection' },
          { t: 'line', c: '$ node -p "require(\'./tsconfig.json\').compilerOptions.strict"' },
          { t: 'line', c: 'true' },
          { t: 'line', c: '$ npx tsc --showConfig | head -n 24' },
          { t: 'line', c: '{' },
          { t: 'line', c: '    "compilerOptions": {' },
          { t: 'line', c: '        "target": "ES2022",' },
          { t: 'line', c: '        "module": "ESNext",' },
          { t: 'line', c: '        "moduleResolution": "bundler",' },
          { t: 'line info', c: '… truncated …' },
          { t: 'line', c: '$ npx tsc --noEmit 2>&1 | wc -l' },
          { t: 'line', c: '0' },
          { t: 'line info', c: '[11:18:52] no diagnostics' },
          { t: 'line', c: '$ ' }
        ],
        term_tp_v_proxy: [
          { t: 'line info', c: '[16:33:01] dev proxy · api → localhost:8080' },
          { t: 'line', c: '$ curl -sI http://127.0.0.1:3000/api/health' },
          { t: 'line', c: 'HTTP/1.1 200 OK' },
          { t: 'line', c: 'vary: Origin' },
          { t: 'line', c: 'x-powered-by: Express' },
          { t: 'line', c: 'content-type: application/json; charset=utf-8' },
          { t: 'line', c: 'content-length: 27' },
          { t: 'line', c: '$ curl -s http://127.0.0.1:3000/api/health | jq .' },
          { t: 'line', c: '{' },
          { t: 'line', c: '  "ok": true,' },
          { t: 'line', c: '  "revision": "r2041"' },
          { t: 'line', c: '}' },
          { t: 'line info', c: '[16:33:04] latency p50 6.2ms · p99 41ms (last 200 req)' },
          { t: 'line', c: '$ ' }
        ]
      };
      function mkPane(base, id, sessionId, linesKey, accent) {
        return {
          id: id, sessionId: sessionId, devSessionId: base.devSessionId || null, state: base.state || 'running',
          profile: base.profile || 'build', accent: accent || 1, cwd: base.cwd || '~/projects/puppet-master',
          profileLabel: base.profileLabel || '', displayName: base.displayName || 'Shell', iconId: base.iconId || 'terminal',
          subtabTextColor: base.subtabTextColor || null,
          rendererRequested: 'gpu', rendererEffective: 'canvas',
          shellTier: 'rich', degradations: [], restoreOutcome: 'restored_live', durability: 'guaranteed_durable',
          retentionTier: '10k_lines', commandBlock: { id: 'tcb-' + id, life: 'running' },
          historyBanner: base.historyBanner || null, inspectorOpen: false,
          lines: defaultLines[linesKey] || defaultLines.alpha
        };
      }
      var state = {
        barOrder: ['g1', 'g_prior', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
        barSlotIds: ['g1', 'g2', 'g3', '__overflow__'],
        activeGroupId: 'g1',
        focusedPaneId: 'tp-a',
        editorTerminalPanels: [],
        editorPanelCounter: 0,
        dragPayload: null,
        termStripAnim: false,
        linkedSessions: { problems: 'ts-sess-alpha', output: 'ts-sess-alpha', ports: 'ts-sess-gamma' },
        panes: {},
        terminalGroups: []
      };
      state.panes = {
        'tp-a': mkPane({ displayName: 'build', iconId: 'hammer' }, 'tp-a', 'ts-sess-alpha', 'alpha', 1),
        'tp-b': mkPane({ displayName: 'git', iconId: 'git', rendererEffective: 'gpu' }, 'tp-b', 'ts-sess-delta', 'delta', 2),
        'tp-c': mkPane({ displayName: 'agent log', iconId: 'radio', devSessionId: 'dev-sess-vite-01', shellTier: 'basic', degradations: ['integration_basic'] }, 'tp-c', 'ts-sess-alpha', 'alpha', 3),
        'tp-d': mkPane({ displayName: 'watch', iconId: 'wifi', rendererEffective: 'gpu' }, 'tp-d', 'ts-sess-delta', 'delta', 4),
        'tp-hist': mkPane({
          displayName: 'prior shell', iconId: 'clock',
          state: 'exited', profile: 'shell', cwd: '~', shellTier: 'opaque',
          degradations: ['no_pty_live'], restoreOutcome: 'restored_exited', durability: 'transient_only',
          retentionTier: 'transcript_snapshot', commandBlock: { id: 'tcb-7701', life: 'failed' },
          historyBanner: 'Historical shell — restart to attach a live PTY'
        }, 'tp-hist', 'ts-sess-beta', 'term_tp_hist', 1),
        'tp-sec': mkPane({ displayName: 'dev server', iconId: 'globe', cwd: '~/projects/puppet-master/ui', rendererEffective: 'canvas' }, 'tp-sec', 'ts-sess-gamma', 'term_tp_sec', 1),
        'tp-v-cfg': mkPane({ displayName: 'tsconfig', iconId: 'code' }, 'tp-v-cfg', 'ts-sess-vite-cfg', 'term_tp_v_cfg', 2),
        'tp-v-proxy': mkPane({ displayName: 'API proxy', iconId: 'cloud' }, 'tp-v-proxy', 'ts-sess-vite-proxy', 'term_tp_v_proxy', 3),
        'tp-v-analyze': mkPane({ displayName: 'bundle scan', iconId: 'layers' }, 'tp-v-analyze', 'ts-sess-vite-analyze', 'term_tp_v_analyze', 4),
        'tp-dk': mkPane({ displayName: 'compose stack', iconId: 'box' }, 'tp-dk', 'ts-sess-docker', 'term_tp_dk', 2),
        'tp-dk-img': mkPane({ displayName: 'image layers', iconId: 'layers' }, 'tp-dk-img', 'ts-sess-dk-img', 'term_tp_dk_img', 3),
        'tp-dk-vol': mkPane({ displayName: 'volumes', iconId: 'folder' }, 'tp-dk-vol', 'ts-sess-dk-vol', 'term_tp_dk_vol', 4),
        'tp-dk-net': mkPane({ displayName: 'networks', iconId: 'wifi' }, 'tp-dk-net', 'ts-sess-dk-net', 'term_tp_dk_net', 1),
        'tp-db': mkPane({ displayName: 'sql shell', iconId: 'database' }, 'tp-db', 'ts-sess-db', 'term_tp_db', 3),
        'tp-db-mig': mkPane({ displayName: 'migrations', iconId: 'code' }, 'tp-db-mig', 'ts-sess-db-mig', 'term_tp_db_mig', 4),
        'tp-db-exp': mkPane({ displayName: 'explain plan', iconId: 'cpu' }, 'tp-db-exp', 'ts-sess-db-exp', 'term_tp_db_exp', 1),
        'tp-db-dump': mkPane({ displayName: 'logical backup', iconId: 'package' }, 'tp-db-dump', 'ts-sess-db-dump', 'term_tp_db_dump', 2),
        'tp-ci': mkPane({ displayName: 'workflow', iconId: 'cpu' }, 'tp-ci', 'ts-sess-ci', 'term_tp_ci', 4),
        'tp-ci-lint': mkPane({ displayName: 'eslint', iconId: 'bug' }, 'tp-ci-lint', 'ts-sess-ci-lint', 'term_tp_ci_lint', 1),
        'tp-ci-test': mkPane({ displayName: 'unit matrix', iconId: 'layers' }, 'tp-ci-test', 'ts-sess-ci-test', 'term_tp_ci_test', 2),
        'tp-ci-cover': mkPane({ displayName: 'coverage', iconId: 'shield' }, 'tp-ci-cover', 'ts-sess-ci-cover', 'term_tp_ci_cover', 3),
        'tp-e2e': mkPane({ displayName: 'playwright', iconId: 'bug' }, 'tp-e2e', 'ts-sess-e2e', 'term_tp_e2e', 1),
        'tp-e2-tr': mkPane({ displayName: 'trace viewer', iconId: 'radio' }, 'tp-e2-tr', 'ts-sess-e2-tr', 'term_tp_e2_tr', 2),
        'tp-e2-fix': mkPane({ displayName: 'fixtures', iconId: 'folder' }, 'tp-e2-fix', 'ts-sess-e2-fix', 'term_tp_e2_fix', 3),
        'tp-e2-snap': mkPane({ displayName: 'snapshots', iconId: 'sparkles' }, 'tp-e2-snap', 'ts-sess-e2-snap', 'term_tp_e2_snap', 4),
        'tp-misc': mkPane({ displayName: 'microbench', iconId: 'package' }, 'tp-misc', 'ts-sess-misc', 'term_tp_misc', 2),
        'tp-m-scp': mkPane({ displayName: 'scp bundle', iconId: 'cloud' }, 'tp-m-scp', 'ts-sess-m-scp', 'term_tp_m_scp', 3),
        'tp-m-gen': mkPane({ displayName: 'codegen', iconId: 'code' }, 'tp-m-gen', 'ts-sess-m-gen', 'term_tp_m_gen', 4),
        'tp-m-dep': mkPane({ displayName: 'dep graph', iconId: 'layers' }, 'tp-m-dep', 'ts-sess-m-dep', 'term_tp_m_dep', 1),
        'tp-ps-env': mkPane({ displayName: 'env freeze', iconId: 'folder' }, 'tp-ps-env', 'ts-sess-ps-env', 'term_tp_ps_env', 1),
        'tp-ps-crash': mkPane({ displayName: 'crash artifact', iconId: 'shield' }, 'tp-ps-crash', 'ts-sess-ps-crash', 'term_tp_ps_crash', 2),
        'tp-ps-cold': mkPane({ displayName: 'cold boot', iconId: 'cpu' }, 'tp-ps-cold', 'ts-sess-ps-cold', 'term_tp_ps_cold', 3)
      };
      state.terminalGroups = [
        { id: 'g1', title: 'Dev · cargo', accentColor: '#7ee787', iconId: 'zap',
          tree: { type: 'col', children: [
            { type: 'row', children: [{ type: 'leaf', paneId: 'tp-a' }, { type: 'leaf', paneId: 'tp-b' }] },
            { type: 'row', children: [{ type: 'leaf', paneId: 'tp-c' }, { type: 'leaf', paneId: 'tp-d' }] }
          ]}},
        { id: 'g_prior', title: 'Prior shell', accentColor: '#79c0ff', iconId: 'clock',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-hist' },
              { type: 'leaf', paneId: 'tp-ps-env' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-ps-crash' },
              { type: 'leaf', paneId: 'tp-ps-cold' }
            ]}
          ]}},
        { id: 'g2', title: 'Vite', accentColor: '#56d4dd', iconId: 'globe',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-sec' },
              { type: 'leaf', paneId: 'tp-v-cfg' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-v-proxy' },
              { type: 'leaf', paneId: 'tp-v-analyze' }
            ]}
          ]}},
        { id: 'g3', title: 'Docker', accentColor: '#ffa657', iconId: 'box',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-dk' },
              { type: 'leaf', paneId: 'tp-dk-img' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-dk-vol' },
              { type: 'leaf', paneId: 'tp-dk-net' }
            ]}
          ]}},
        { id: 'g4', title: 'Database', accentColor: '#d2a8ff', iconId: 'database',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-db' },
              { type: 'leaf', paneId: 'tp-db-mig' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-db-exp' },
              { type: 'leaf', paneId: 'tp-db-dump' }
            ]}
          ]}},
        { id: 'g5', title: 'CI', accentColor: '#ff7b72', iconId: 'cpu',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-ci' },
              { type: 'leaf', paneId: 'tp-ci-lint' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-ci-test' },
              { type: 'leaf', paneId: 'tp-ci-cover' }
            ]}
          ]}},
        { id: 'g6', title: 'E2E', accentColor: '#e3b341', iconId: 'bug',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-e2e' },
              { type: 'leaf', paneId: 'tp-e2-tr' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-e2-fix' },
              { type: 'leaf', paneId: 'tp-e2-snap' }
            ]}
          ]}},
        { id: 'g7', title: 'Misc', accentColor: '#8b949e', iconId: 'package',
          tree: { type: 'col', children: [
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-misc' },
              { type: 'leaf', paneId: 'tp-m-scp' }
            ]},
            { type: 'row', children: [
              { type: 'leaf', paneId: 'tp-m-gen' },
              { type: 'leaf', paneId: 'tp-m-dep' }
            ]}
          ]}}
      ];
      function getGroup(id) { return state.terminalGroups.find(function(g) { return g.id === id; }); }
      function getActiveGroup() { return getGroup(state.activeGroupId); }
      function fillBarSlots() {
        var order = state.barOrder;
        var n = order.length;
        if (n <= 4) state.barSlotIds = order.slice(0, n);
        else state.barSlotIds = order.slice(0, 4).concat(['__overflow__']);
      }
      fillBarSlots();
      function hiddenGroupIds() {
        var shown = {};
        state.barSlotIds.forEach(function(s) { if (s !== '__overflow__') shown[s] = true; });
        return state.barOrder.filter(function(id) { return !shown[id]; });
      }
      function promoteGroupIntoBar(gid) {
        if (gid !== state.activeGroupId) state.termStripAnim = true;
        var order = state.barOrder;
        var vis = state.barSlotIds.filter(function(x) { return x !== '__overflow__'; });
        var ai = vis.indexOf(state.activeGroupId);
        var slot = ai >= 0 ? ai : 1;
        slot = Math.min(slot, vis.length - 1);
        if (slot < 0) slot = 0;
        var victim = vis[slot];
        if (!victim || victim === gid) {
          state.activeGroupId = gid;
          renderAll();
          syncTerminalTabBar('terminal');
          return;
        }
        var iG = order.indexOf(gid);
        var iV = order.indexOf(victim);
        order[iG] = victim;
        order[iV] = gid;
        state.activeGroupId = gid;
        fillBarSlots();
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function findPaneLocation(paneId) {
        for (var gi = 0; gi < state.terminalGroups.length; gi++) {
          var g = state.terminalGroups[gi];
          function walk(n) {
            if (!n) return false;
            if (n.type === 'leaf') return n.paneId === paneId;
            return n.children.some(walk);
          }
          if (walk(g.tree)) return { group: g };
        }
        return null;
      }
      function collectPaneIdsFromTree(node, acc) {
        acc = acc || [];
        if (!node) return acc;
        if (node.type === 'leaf') { acc.push(node.paneId); return acc; }
        node.children.forEach(function(c) { collectPaneIdsFromTree(c, acc); });
        return acc;
      }
      function killWorkgroup(gid) {
        var g = getGroup(gid);
        if (!g) return;
        if (state.terminalGroups.length <= 1) {
          var pids = collectPaneIdsFromTree(g.tree, []);
          pids.forEach(function(pid) { delete state.panes[pid]; });
          paneCounter++;
          var np = 'tp-fresh-' + paneCounter;
          state.panes[np] = mkPane({ displayName: 'shell', iconId: 'terminal' }, np, 'ts-fresh-' + paneCounter, 'alpha', 1);
          g.tree = { type: 'leaf', paneId: np };
          g.title = 'Shell';
          g.accentColor = COLOR_PALETTE[0];
          g.iconId = 'terminal';
          state.focusedPaneId = np;
          state.editorTerminalPanels = state.editorTerminalPanels.filter(function(ep) { return ep.groupId !== gid; });
          fillBarSlots();
          renderAll();
          syncTerminalTabBar('terminal');
          toast('Workgroup reset to fresh shell');
          return;
        }
        var pids = collectPaneIdsFromTree(g.tree, []);
        pids.forEach(function(pid) { delete state.panes[pid]; });
        state.terminalGroups = state.terminalGroups.filter(function(x) { return x.id !== gid; });
        state.barOrder = state.barOrder.filter(function(x) { return x !== gid; });
        state.editorTerminalPanels = state.editorTerminalPanels.filter(function(ep) { return ep.groupId !== gid; });
        if (state.activeGroupId === gid) {
          state.activeGroupId = state.terminalGroups[0] ? state.terminalGroups[0].id : '';
        }
        fillBarSlots();
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function findSessionLocation(sessionId) {
        for (var pid in state.panes) {
          if (state.panes[pid].sessionId === sessionId) {
            var loc = findPaneLocation(pid);
            if (loc) return { paneId: pid, group: loc.group };
          }
        }
        return null;
      }
      function readTermPaneDragPayload(dt) {
        if (!dt) return null;
        try {
          var raw = dt.getData(DND_MIME);
          if (!raw) raw = dt.getData('text/plain');
          if (!raw) return null;
          return JSON.parse(raw);
        } catch (e) { return null; }
      }
      function dragPayloadDuringDrag(dt) {
        var pl = readTermPaneDragPayload(dt);
        if (pl) return pl;
        if (state.dragPayload && (state.dragPayload.kind === 'pane' || state.dragPayload.kind === 'subtab' || state.dragPayload.kind === 'group')) return state.dragPayload;
        return null;
      }
      function scrubAllTerminalPaneCompositing() {
        document.querySelectorAll(
          '#bottomTerminalHost, #bottomTerminalHost .terminal-workspace, #pmEditorTerminalStack, ' +
            '#bottomTerminalHost .terminal-pane, #bottomTerminalHost .terminal-pane-body, #bottomTerminalHost .pm-recovery-banner, ' +
            '#pmEditorTerminalStack .terminal-pane, #pmEditorTerminalStack .terminal-pane-body, #pmEditorTerminalStack .pm-recovery-banner'
        ).forEach(function(el) {
          el.style.removeProperty('opacity');
          el.style.removeProperty('filter');
        });
        document.querySelectorAll('.pane-container').forEach(function(el) {
          el.style.removeProperty('opacity');
        });
      }
      function clearTerminalDragVisuals() {
        state.dragPayload = null;
        var bh = document.getElementById('bottomTerminalHost');
        if (bh) bh.classList.remove('pm-term-pane-drag-active');
        var es = document.getElementById('pmEditorTerminalStack');
        if (es) es.classList.remove('pm-term-pane-drag-active');
        scrubAllTerminalPaneCompositing();
        var ed = document.getElementById('editorView');
        if (ed) ed.classList.remove('pm-editor-term-drop-hover');
        document.querySelectorAll('.pm-term-dragging, .pm-term-drop-target, .pm-term-drop-hover, .pm-term-pane-drop-target').forEach(function(el) {
          el.classList.remove('pm-term-dragging', 'pm-term-drop-target', 'pm-term-drop-hover', 'pm-term-pane-drop-target');
        });
      }
      function scheduleTerminalDragCleanup(ev) {
        if (ev && ev.target && ev.target.style) {
          ev.target.style.removeProperty('opacity');
          ev.target.style.removeProperty('filter');
          var pane = ev.target.closest ? ev.target.closest('.terminal-pane') : null;
          if (pane && pane !== ev.target && pane.style) {
            pane.style.removeProperty('opacity');
            pane.style.removeProperty('filter');
          }
        }
        clearTerminalDragVisuals();
        requestAnimationFrame(clearTerminalDragVisuals);
        setTimeout(clearTerminalDragVisuals, 0);
        setTimeout(clearTerminalDragVisuals, 50);
      }
      document.addEventListener('dragend', scheduleTerminalDragCleanup, true);
      document.addEventListener('dragend', scheduleTerminalDragCleanup, false);
      document.addEventListener('drop', function() { setTimeout(clearTerminalDragVisuals, 0); }, true);
      function injectSplitAtPane(tree, targetPaneId, axis) {
        var splitType = axis === 'horizontal' ? 'col' : 'row';
        paneCounter++;
        var np = 'tp-split-' + paneCounter;
        var fp = state.panes[targetPaneId];
        state.panes[np] = fp ? JSON.parse(JSON.stringify(fp)) : mkPane({}, np, 'ts-sess-split-' + paneCounter, 'alpha', 1);
        state.panes[np].id = np;
        state.panes[np].sessionId = 'ts-sess-split-' + paneCounter;
        state.panes[np].lines = [{ t: 'line', c: '$ ' }];
        var leaf = { type: 'leaf', paneId: targetPaneId };
        var newLeaf = { type: 'leaf', paneId: np };
        var branch = { type: splitType, children: [leaf, newLeaf] };
        function inject(n) {
          if (!n) return n;
          if (n.type === 'leaf' && n.paneId === targetPaneId) return branch;
          if (n.children) return { type: n.type, children: n.children.map(inject) };
          return n;
        }
        return inject(tree);
      }
      function splitActive(axis) {
        var g = getActiveGroup();
        if (!g) return;
        if (countLeaves(g.tree) >= 4) { toast('Max 4 panes in this workgroup'); return; }
        var next = injectSplitAtPane(g.tree, state.focusedPaneId, axis);
        if (!isValidQuadrantLayout(next)) { delete state.panes['tp-split-' + paneCounter]; paneCounter--; toast('Split would exceed 2×2 grid'); return; }
        g.tree = next;
        state.focusedPaneId = 'tp-split-' + paneCounter;
        toast('Split pane · new terminal_session_id');
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function addTabToActiveGroup() {
        var g = getActiveGroup();
        if (!g) return;
        if (countLeaves(g.tree) >= 4) { toast('Grid full in this workgroup'); return; }
        var leaves = collectLeafPaneIds(g.tree);
        var tryOrder = leaves.indexOf(state.focusedPaneId) >= 0
          ? [state.focusedPaneId].concat(leaves.filter(function(x) { return x !== state.focusedPaneId; }))
          : leaves;
        for (var li = 0; li < tryOrder.length; li++) {
          for (var ax = 0; ax < 2; ax++) {
            var axis = ax === 0 ? 'horizontal' : 'vertical';
            var cand = injectSplitAtPane(g.tree, tryOrder[li], axis);
            if (isValidQuadrantLayout(cand)) {
              g.tree = cand;
              state.focusedPaneId = 'tp-split-' + paneCounter;
              toast('Added terminal');
              renderAll();
              syncTerminalTabBar('terminal');
              return;
            }
            delete state.panes['tp-split-' + paneCounter];
            paneCounter--;
          }
        }
        toast('No valid split slot');
      }
      function addTerminalGroup() {
        paneCounter++;
        var gid = 'g-new-' + paneCounter;
        var pid = 'tp-new-' + paneCounter;
        state.panes[pid] = mkPane({ displayName: 'shell', iconId: 'terminal' }, pid, 'ts-new-' + paneCounter, 'alpha', 1);
        state.terminalGroups.push({
          id: gid, title: 'Workgroup ' + paneCounter, accentColor: COLOR_PALETTE[state.terminalGroups.length % COLOR_PALETTE.length], iconId: 'terminal',
          tree: { type: 'leaf', paneId: pid }
        });
        state.barOrder.push(gid);
        state.activeGroupId = gid;
        state.termStripAnim = true;
        fillBarSlots();
        toast('New workgroup');
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function closePane(paneId) {
        var loc = findPaneLocation(paneId);
        if (!loc) return;
        var p = state.panes[paneId];
        if (p && p.state === 'running') {
          if (!confirm('Terminate session? OK = terminate, Cancel = layout only')) { /* demo still removes */ }
        }
        if (countLeaves(loc.group.tree) <= 1) {
          killWorkgroup(loc.group.id);
          return;
        }
        loc.group.tree = removeLeaf(loc.group.tree, paneId);
        if (!loc.group.tree) return;
        delete state.panes[paneId];
        state.editorTerminalPanels = state.editorTerminalPanels.filter(function(ep) { return ep.paneId !== paneId; });
        if (state.focusedPaneId === paneId) state.focusedPaneId = firstPaneIdInTree(loc.group.tree) || state.focusedPaneId;
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function resolveGroupToDefaultPaneId(gid) {
        var g = getGroup(gid);
        if (!g || !g.tree) return null;
        var leaves = collectLeafPaneIds(g.tree);
        if (leaves.length === 0) return null;
        if (gid === state.activeGroupId && leaves.indexOf(state.focusedPaneId) >= 0) return state.focusedPaneId;
        return leaves[0];
      }
      function addEditorTerminalPanelFromPayload(pl) {
        if (!pl) return;
        var paneId = null;
        var groupId = null;
        var title = 'Terminal';
        if (pl.kind === 'pane' || pl.kind === 'subtab') {
          paneId = pl.paneId;
          groupId = pl.groupId;
        } else if (pl.kind === 'group') {
          groupId = pl.id;
          paneId = resolveGroupToDefaultPaneId(groupId);
          var gx = getGroup(groupId);
          if (gx) title = (gx.title || 'Workgroup') + ' · terminal';
        } else return;
        if (!paneId || !groupId) {
          toast('Could not open terminal in editor');
          return;
        }
        if (!state.panes[paneId]) {
          toast('Terminal not found');
          return;
        }
        title = paneChipLabel(paneId) || title;
        if (state.editorTerminalPanels.some(function(x) { return x.paneId === paneId; })) {
          toast('This terminal is already in the editor');
          return;
        }
        state.editorPanelCounter++;
        state.editorTerminalPanels.push({
          id: 'edtp-' + state.editorPanelCounter,
          paneId: paneId,
          groupId: groupId,
          title: title
        });
      }
      function undockEditor() {
        state.editorTerminalPanels = [];
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function isDockedInEditor(paneId) {
        return state.editorTerminalPanels.some(function(ep) { return ep.paneId === paneId; });
      }
      function renderTranscript(body, lines) {
        body.innerHTML = '';
        lines.forEach(function(l) {
          var d = document.createElement('div');
          d.className = l.t;
          d.textContent = l.c;
          body.appendChild(d);
        });
      }
      function renderPane(paneId, ctx) {
        var p = state.panes[paneId];
        if (!p) return document.createElement('div');
        var wrap = document.createElement('div');
        wrap.className = 'terminal-pane pane-accent-' + p.accent + (state.focusedPaneId === paneId ? ' pm-pane-focused' : '');
        wrap.dataset.paneId = paneId;
        wrap.dataset.groupId = ctx.groupId;
        var gPane = getGroup(ctx.groupId);
        if (gPane) wrap.style.setProperty('--pane-wg-accent', gPane.accentColor || '#8b949e');
        wrap.draggable = true;
        wrap.tabIndex = state.focusedPaneId === paneId ? 0 : -1;
        wrap.title = p.sessionId + ' — drag to editor to dock';
        if (p.historyBanner) {
          var ban = document.createElement('div');
          ban.className = 'pm-recovery-banner';
          ban.textContent = p.historyBanner;
          wrap.appendChild(ban);
        }
        var body = document.createElement('div');
        body.className = 'terminal-pane-body';
        renderTranscript(body, p.lines);
        wrap.appendChild(body);
        wrap.onclick = function() {
          state.focusedPaneId = paneId;
          renderAll();
          syncTerminalTabBar('terminal');
        };
        wrap.ondragstart = function(e) {
          state.dragPayload = { kind: 'pane', paneId: paneId, groupId: ctx.groupId };
          dragPayloadWrite(e.dataTransfer, state.dragPayload);
          e.dataTransfer.effectAllowed = 'copyMove';
          wrap.classList.add('pm-term-dragging');
        };
        wrap.ondragend = function() { scheduleTerminalDragCleanup(); };
        /* Capture: dragover/drop must run while cursor is over .terminal-pane-body (descendant), or drop is rejected */
        wrap.addEventListener('dragover', function(e) {
          var pl = dragPayloadDuringDrag(e.dataTransfer);
          if (!pl || pl.groupId !== ctx.groupId || pl.paneId === paneId) return;
          if (pl.kind !== 'pane') return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          wrap.classList.add('pm-term-pane-drop-target');
        }, true);
        wrap.ondragleave = function(e) {
          var rel = e.relatedTarget;
          if (rel && wrap.contains(rel)) return;
          wrap.classList.remove('pm-term-pane-drop-target');
        };
        wrap.addEventListener('drop', function(e) {
          wrap.classList.remove('pm-term-pane-drop-target');
          var pl = readTermPaneDragPayload(e.dataTransfer) || (state.dragPayload && state.dragPayload.kind === 'pane' ? state.dragPayload : null);
          if (!pl || pl.kind !== 'pane' || pl.groupId !== ctx.groupId || pl.paneId === paneId) return;
          e.preventDefault();
          e.stopPropagation();
          clearTerminalDragVisuals();
          var g = getGroup(ctx.groupId);
          if (!g) return;
          swapPaneIdsInTree(g.tree, pl.paneId, paneId);
          state.focusedPaneId = pl.paneId;
          renderAll();
          syncTerminalTabBar('terminal');
        }, true);
        return wrap;
      }
      function renderTree(node, ctx) {
        if (!node) return document.createElement('div');
        if (node.type === 'leaf') {
          if (isDockedInEditor(node.paneId)) {
            var ph = document.createElement('div');
            ph.className = 'pm-term-docked-placeholder';
            ph.textContent = 'Terminal in editor — drop here to remove from editor';
            ph.ondragover = function(e) { e.preventDefault(); };
            ph.ondrop = function(e) {
              e.preventDefault();
              clearTerminalDragVisuals();
              state.editorTerminalPanels = state.editorTerminalPanels.filter(function(ep) { return ep.paneId !== node.paneId; });
              renderAll();
              syncTerminalTabBar('terminal');
            };
            return ph;
          }
          return renderPane(node.paneId, ctx);
        }
        var flexDir = node.type === 'row' ? 'row' : 'column';
        var box = document.createElement('div');
        /* Do not use pm-terminal-enter here: its opacity keyframes dim the whole split + all panes and can stick wrong after DnD */
        box.className = 'terminal-split-node';
        box.style.display = 'flex';
        box.style.flexDirection = flexDir;
        box.style.flex = '1';
        box.style.minHeight = '0';
        box.style.minWidth = '0';
        box.style.gap = '1px';
        node.children.forEach(function(ch, i) {
          if (i > 0) {
            var rz = document.createElement('div');
            rz.className = node.type === 'row' ? 'resizer-col pm-term-pane-resizer' : 'resizer-row pm-term-pane-resizer';
            box.appendChild(rz);
          }
          var inner = renderTree(ch, ctx);
          inner.style.flex = '1';
          box.appendChild(inner);
        });
        return box;
      }
      function renderEditorTerminalStack() {
        var stack = document.getElementById('pmEditorTerminalStack');
        if (!stack) return;
        if (state.editorTerminalPanels.length === 0) {
          stack.style.display = 'none';
          stack.innerHTML = '';
          return;
        }
        stack.style.display = 'flex';
        stack.innerHTML = '';
        state.editorTerminalPanels.forEach(function(ep) {
          var panel = document.createElement('div');
          panel.className = 'pm-editor-term-panel';
          panel.dataset.editorPanelId = ep.id;
          var bar = document.createElement('div');
          bar.className = 'pm-editor-term-dock-bar';
          var title = document.createElement('span');
          title.textContent = ep.title;
          bar.appendChild(title);
          var u = document.createElement('button');
          u.type = 'button';
          u.className = 'pm-tiny-btn';
          u.textContent = 'Close';
          var epId = ep.id;
          u.onclick = function() {
            state.editorTerminalPanels = state.editorTerminalPanels.filter(function(x) { return x.id !== epId; });
            renderAll();
            syncTerminalTabBar('terminal');
          };
          bar.appendChild(u);
          panel.appendChild(bar);
          var host = document.createElement('div');
          host.className = 'pm-editor-term-host';
          var g = getGroup(ep.groupId);
          if (g) host.appendChild(renderPane(ep.paneId, { groupId: ep.groupId }));
          panel.appendChild(host);
          stack.appendChild(panel);
        });
        setTimeout(function() { initPaneResizersIn(stack); }, 0);
      }
      function setupEditorDropTarget() {
        var ev = document.getElementById('editorView');
        if (!ev || ev.dataset.pmTermDrop) return;
        ev.dataset.pmTermDrop = '1';
        ev.addEventListener('dragover', function(e) {
          var pl = dragPayloadDuringDrag(e.dataTransfer);
          if (pl && (pl.kind === 'pane' || pl.kind === 'subtab' || pl.kind === 'group')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            ev.classList.add('pm-editor-term-drop-hover');
          }
        });
        ev.addEventListener('dragleave', function(e) {
          if (ev.contains(e.relatedTarget)) return;
          ev.classList.remove('pm-editor-term-drop-hover');
        });
        ev.addEventListener('drop', function(e) {
          var pl = readTermPaneDragPayload(e.dataTransfer) || state.dragPayload;
          ev.classList.remove('pm-editor-term-drop-hover');
          if (!pl || (pl.kind !== 'pane' && pl.kind !== 'subtab' && pl.kind !== 'group')) return;
          e.preventDefault();
          clearTerminalDragVisuals();
          addEditorTerminalPanelFromPayload(pl);
          renderAll();
          syncTerminalTabBar('terminal');
        });
      }
      function bindSubtabDnD(sb, pid, g) {
        sb.ondragover = function(e) {
          var pl = dragPayloadDuringDrag(e.dataTransfer);
          if (!pl || pl.groupId !== g.id || pl.paneId === pid) return;
          if (pl.kind === 'subtab' || pl.kind === 'pane') {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            sb.classList.add('pm-term-drop-hover');
          }
        };
        sb.ondragleave = function(e) {
          var rel = e.relatedTarget;
          if (rel && sb.contains(rel)) return;
          sb.classList.remove('pm-term-drop-hover');
        };
        sb.ondrop = function(e) {
          sb.classList.remove('pm-term-drop-hover');
          e.preventDefault();
          var pl = readTermPaneDragPayload(e.dataTransfer) || state.dragPayload;
          if (!pl || pl.groupId !== g.id || pl.paneId === pid) return;
          if (pl.kind === 'subtab' || pl.kind === 'pane') {
            clearTerminalDragVisuals();
            swapPaneIdsInTree(g.tree, pl.paneId, pid);
            state.focusedPaneId = pl.paneId;
            renderAll();
            syncTerminalTabBar('terminal');
          }
        };
      }
      function renderTerminalChromeBar() {
        var doSubtabAnim = !!state.termStripAnim;
        state.termStripAnim = false;
        var center = document.getElementById('pmTerminalCenterWrap');
        var chrome = document.getElementById('pmBottomTermChrome');
        if (!center || !chrome) return;
        center.innerHTML = '';
        chrome.innerHTML = '';
        var gActive = getActiveGroup();
        if (!gActive) return;
        var stripInner = document.createElement('div');
        stripInner.className = 'pm-term-strip-inner';
        state.barSlotIds.forEach(function(slot) {
          if (slot === '__overflow__') {
            var hid = hiddenGroupIds();
            var ob = document.createElement('button');
            ob.type = 'button';
            ob.className = 'pm-term-overflow' + (hid.indexOf(state.activeGroupId) >= 0 ? ' active' : '');
            ob.textContent = hid.indexOf(state.activeGroupId) >= 0 ? getGroup(state.activeGroupId).title + ' +' + hid.length : '+' + hid.length + ' more';
            ob.onclick = function(ev) {
              ev.stopPropagation();
              var existing = document.querySelector('.pm-term-overflow-menu');
              if (existing) { existing.remove(); return; }
              var m = document.createElement('div');
              m.className = 'pm-term-overflow-menu';
              hid.forEach(function(gid) {
                var gg = getGroup(gid);
                if (!gg) return;
                var it = document.createElement('button');
                it.type = 'button';
                it.textContent = gg.title;
                it.onclick = function() { promoteGroupIntoBar(gid); m.remove(); };
                m.appendChild(it);
              });
              document.body.appendChild(m);
              var r = ob.getBoundingClientRect();
              m.style.left = r.left + 'px';
              m.style.top = (r.bottom + 4) + 'px';
              setTimeout(function() {
                function close() { m.remove(); document.removeEventListener('click', close); }
                document.addEventListener('click', close);
              }, 0);
            };
            stripInner.appendChild(ob);
            return;
          }
          var gg = getGroup(slot);
          if (!gg) return;
          var cluster = document.createElement('div');
          cluster.className = 'pm-term-wg-cluster';
          cluster.style.setProperty('--wg-accent', gg.accentColor || '#8b949e');
          var pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'pm-term-wg-tab' + (state.activeGroupId === gg.id ? ' pm-term-tab-active' : '');
          pill.draggable = true;
          pill.innerHTML = iconSvg(gg.iconId) + '<span>' + gg.title + '</span>';
          pill.onclick = function() {
            if (state.activeGroupId !== gg.id) state.termStripAnim = true;
            state.activeGroupId = gg.id;
            var leaves = collectLeafPaneIds(gg.tree);
            if (leaves.length) state.focusedPaneId = leaves[0];
            renderAll();
            syncTerminalTabBar('terminal');
          };
          pill.oncontextmenu = function(ev) {
            ev.preventDefault();
            openTermCtxMenu(ev.clientX, ev.clientY, function(menu) {
              var b1 = document.createElement('button');
              b1.textContent = 'Rename workgroup…';
              b1.onclick = function() {
                var n = prompt('Workgroup name', gg.title);
                if (n) { gg.title = n; closeTermCtxMenus(); renderAll(); syncTerminalTabBar('terminal'); }
              };
              menu.appendChild(b1);
              var b2 = document.createElement('button');
              b2.textContent = 'Tab color (border)…';
              b2.onclick = function() {
                menu.innerHTML = '';
                var h = document.createElement('div');
                h.className = 'pm-term-ctx-h';
                h.textContent = 'Pick color';
                menu.appendChild(h);
                var row = document.createElement('div');
                row.className = 'pm-term-ctx-swatches';
                COLOR_PALETTE.forEach(function(hex) {
                  var sw = document.createElement('button');
                  sw.type = 'button';
                  sw.className = 'pm-term-ctx-swatch';
                  sw.style.background = hex;
                  sw.onclick = function() {
                    gg.accentColor = hex;
                    closeTermCtxMenus();
                    renderAll();
                    syncTerminalTabBar('terminal');
                  };
                  row.appendChild(sw);
                });
                menu.appendChild(row);
              };
              menu.appendChild(b2);
              var b3 = document.createElement('button');
              b3.textContent = 'Change icon…';
              b3.onclick = function() {
                menu.innerHTML = '';
                var h = document.createElement('div');
                h.className = 'pm-term-ctx-h';
                h.textContent = 'Icons';
                menu.appendChild(h);
                var row = document.createElement('div');
                row.className = 'pm-term-ctx-icons';
                ICON_CATALOG.forEach(function(ic) {
                  var ib = document.createElement('button');
                  ib.type = 'button';
                  ib.className = 'pm-term-ctx-ic';
                  ib.innerHTML = iconSvg(ic, 14);
                  ib.onclick = function() {
                    gg.iconId = ic;
                    closeTermCtxMenus();
                    renderAll();
                    syncTerminalTabBar('terminal');
                  };
                  row.appendChild(ib);
                });
                menu.appendChild(row);
              };
              menu.appendChild(b3);
              var b4 = document.createElement('button');
              b4.textContent = 'Close workgroup';
              b4.onclick = function() {
                closeTermCtxMenus();
                if (confirm('Close this workgroup and all its terminals?')) killWorkgroup(gg.id);
              };
              menu.appendChild(b4);
            });
          };
          pill.ondragstart = function(e) {
            state.dragPayload = { kind: 'group', id: gg.id };
            dragPayloadWrite(e.dataTransfer, state.dragPayload);
            e.dataTransfer.effectAllowed = 'move';
          };
          pill.ondragover = function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          };
          pill.ondrop = function(e) {
            e.preventDefault();
            var pl = readTermPaneDragPayload(e.dataTransfer);
            if (pl && pl.kind === 'group' && pl.id !== gg.id) reorderBarSlots(pl.id, gg.id);
          };
          cluster.appendChild(pill);
          if (state.activeGroupId === gg.id) {
            var subdock = document.createElement('div');
            subdock.className = 'pm-term-subdock' + (doSubtabAnim ? '' : ' pm-term-subdock--static');
            collectLeafPaneIds(gg.tree).forEach(function(pid, sidx) {
              var p = state.panes[pid];
              var subc = paneSubColor(gg, pid);
              var sb = document.createElement('button');
              sb.type = 'button';
              sb.className = 'pm-term-subtab' + (state.focusedPaneId === pid ? ' pm-term-subtab-focused' : '');
              sb.style.setProperty('--sub-accent', gg.accentColor || '#8b949e');
              sb.style.setProperty('--sub-text', subc);
              sb.draggable = true;
              sb.innerHTML = iconSvg(p && p.iconId ? p.iconId : 'terminal', 9) + '<span>' + paneChipLabel(pid) + '</span>';
              sb.onclick = function() { state.focusedPaneId = pid; renderAll(); syncTerminalTabBar('terminal'); };
              sb.ondragstart = function(e) {
                state.dragPayload = { kind: 'subtab', paneId: pid, groupId: gg.id };
                dragPayloadWrite(e.dataTransfer, state.dragPayload);
                e.dataTransfer.effectAllowed = 'move';
              };
              bindSubtabDnD(sb, pid, gg);
              if (doSubtabAnim) {
                sb.classList.add('pm-term-subtab--enter');
                sb.style.animationDelay = (sidx * 0.055) + 's';
              }
              sb.oncontextmenu = function(ev) {
                ev.preventDefault();
                openTermCtxMenu(ev.clientX, ev.clientY, function(menu) {
                  var r1 = document.createElement('button');
                  r1.textContent = 'Rename terminal…';
                  r1.onclick = function() {
                    var n = prompt('Terminal label', paneChipLabel(pid));
                    if (n && p) { p.displayName = n; closeTermCtxMenus(); renderAll(); syncTerminalTabBar('terminal'); }
                  };
                  menu.appendChild(r1);
                  var r2 = document.createElement('button');
                  r2.textContent = 'Subtab text color…';
                  r2.onclick = function() {
                    menu.innerHTML = '';
                    var h = document.createElement('div');
                    h.className = 'pm-term-ctx-h';
                    h.textContent = 'Text color';
                    menu.appendChild(h);
                    var row = document.createElement('div');
                    row.className = 'pm-term-ctx-swatches';
                    COLOR_PALETTE.forEach(function(hex) {
                      var sw = document.createElement('button');
                      sw.type = 'button';
                      sw.className = 'pm-term-ctx-swatch';
                      sw.style.background = hex;
                      sw.onclick = function() {
                        if (p) p.subtabTextColor = hex;
                        closeTermCtxMenus();
                        renderAll();
                        syncTerminalTabBar('terminal');
                      };
                      row.appendChild(sw);
                    });
                    menu.appendChild(row);
                  };
                  menu.appendChild(r2);
                  var r3 = document.createElement('button');
                  r3.textContent = 'Change icon…';
                  r3.onclick = function() {
                    menu.innerHTML = '';
                    var h = document.createElement('div');
                    h.className = 'pm-term-ctx-h';
                    h.textContent = 'Icons';
                    menu.appendChild(h);
                    var row = document.createElement('div');
                    row.className = 'pm-term-ctx-icons';
                    ICON_CATALOG.forEach(function(ic) {
                      var ib = document.createElement('button');
                      ib.type = 'button';
                      ib.className = 'pm-term-ctx-ic';
                      ib.innerHTML = iconSvg(ic, 14);
                      ib.onclick = function() {
                        if (p) p.iconId = ic;
                        closeTermCtxMenus();
                        renderAll();
                        syncTerminalTabBar('terminal');
                      };
                      row.appendChild(ib);
                    });
                    menu.appendChild(row);
                  };
                  menu.appendChild(r3);
                  var r4 = document.createElement('button');
                  r4.textContent = 'Close terminal';
                  r4.onclick = function() {
                    closeTermCtxMenus();
                    closePane(pid);
                  };
                  menu.appendChild(r4);
                });
              };
              subdock.appendChild(sb);
            });
            cluster.appendChild(subdock);
          }
          stripInner.appendChild(cluster);
        });
        center.appendChild(stripInner);
        if (doSubtabAnim) {
          stripInner.classList.add('pm-term-strip-flash');
          setTimeout(function() { stripInner.classList.remove('pm-term-strip-flash'); }, 620);
        }
        var btnStack = document.createElement('button');
        btnStack.type = 'button';
        btnStack.className = 'pm-term-icon-btn';
        btnStack.title = 'Split Active Tab Horizontally';
        btnStack.innerHTML = splitIconSvg(true);
        btnStack.onclick = function() { splitActive('horizontal'); };
        chrome.appendChild(btnStack);
        var btnSide = document.createElement('button');
        btnSide.type = 'button';
        btnSide.className = 'pm-term-icon-btn';
        btnSide.title = 'Split Active Tab Vertically';
        btnSide.innerHTML = splitIconSvg(false);
        btnSide.onclick = function() { splitActive('vertical'); };
        chrome.appendChild(btnSide);
        var addB = document.createElement('button');
        addB.type = 'button';
        addB.className = 'pm-term-icon-btn';
        addB.title = 'Add terminal';
        addB.textContent = '+';
        addB.onclick = addTabToActiveGroup;
        chrome.appendChild(addB);
        var ng = document.createElement('button');
        ng.type = 'button';
        ng.className = 'pm-term-icon-btn';
        ng.title = 'New workgroup';
        ng.setAttribute('aria-label', 'New workgroup');
        ng.innerHTML = workgroupPlusSvg();
        ng.onclick = addTerminalGroup;
        chrome.appendChild(ng);
      }
      function reorderBarSlots(fromId, toId) {
        var o = state.barOrder;
        var i = o.indexOf(fromId);
        var j = o.indexOf(toId);
        if (i < 0 || j < 0) return;
        o.splice(i, 1);
        o.splice(j, 0, fromId);
        fillBarSlots();
        renderAll();
        syncTerminalTabBar('terminal');
      }
      function initPaneResizersIn(root) {
        if (!root) return;
        root.querySelectorAll('.pm-term-pane-resizer').forEach(function(rz) {
          if (rz.dataset.pmReg) return;
          rz.dataset.pmReg = '1';
          var prev = rz.previousElementSibling;
          var next = rz.nextElementSibling;
          if (prev && next && window.registerResizer) {
            var isCol = rz.classList.contains('resizer-col');
            /* Capture the prev+next total ONCE per drag: recomputing it every
               move let flex gaps + fractional rects drift until the 80/40px
               floors were unsatisfiable and the split could never shrink back */
            var dragTotal = 0, startX = 0, startY = 0, startPrev = 0;
            window.registerResizer(rz, {
              isHorizontal: isCol,
              onStart: function(e) {
                dragTotal = 0; startX = e.clientX; startY = e.clientY; startPrev = 0;
              },
              onMove: function(e) {
                if (!prev.parentNode) return;
                /* The rects only seed dragTotal/startPrev on the first move; reading them on every
                   move after the previous move's writes forced a fresh layout for values never used. */
                var pr = null, nr = null;
                if (!dragTotal) { pr = prev.getBoundingClientRect(); nr = next.getBoundingClientRect(); }
                if (isCol) {
                  if (!dragTotal) { dragTotal = pr.width + nr.width; startPrev = pr.width; }
                  var pw = Math.max(80, Math.min(startPrev + (e.clientX - startX), dragTotal - 80));
                  prev.style.setProperty('flex', 'none', 'important');
                  next.style.setProperty('flex', 'none', 'important');
                  prev.style.setProperty('width', pw + 'px', 'important');
                  next.style.setProperty('width', (dragTotal - pw) + 'px', 'important');
                } else {
                  if (!dragTotal) { dragTotal = pr.height + nr.height; startPrev = pr.height; }
                  var ph = Math.max(40, Math.min(startPrev + (e.clientY - startY), dragTotal - 40));
                  prev.style.setProperty('flex', 'none', 'important');
                  next.style.setProperty('flex', 'none', 'important');
                  prev.style.setProperty('height', ph + 'px', 'important');
                  next.style.setProperty('height', (dragTotal - ph) + 'px', 'important');
                }
              }
            });
            rz.addEventListener('dblclick', function() {
              [prev, next].forEach(function(el) {
                el.style.removeProperty('width');
                el.style.removeProperty('height');
                el.style.removeProperty('flex');
              });
            });
          }
        });
      }
      function renderAll() {
        var host = document.getElementById('bottomTerminalHost');
        if (!host) return;
        state.pm7TermDirty = false; /* PM7 T09: rebuild consumes the dirty flag */
        try {
          host.innerHTML = '';
          var g = getActiveGroup();
          if (!g) return;
          var flex = document.createElement('div');
          flex.className = 'terminal-workspace';
          flex.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0;width:100%;align-self:stretch;';
          var ctx = { groupId: g.id };
          flex.appendChild(renderTree(g.tree, ctx));
          host.appendChild(flex);
          setTimeout(function() { initPaneResizersIn(host); }, 0);
          renderEditorTerminalStack();
        } catch (err) {
          if (typeof console !== 'undefined' && console.error) console.error('PM_TERMINAL_DEMO renderAll', err);
        } finally {
          /* After rebuild, clear DnD flags on <html> and scrub inline opacity/filter on terminal nodes */
          clearTerminalDragVisuals();
        }
      }
      function syncTerminalTabBar(tabName) {
        var outer = document.getElementById('pmTermCenterOuter');
        var wrap = document.getElementById('pmTerminalCenterWrap');
        var chrome = document.getElementById('pmBottomTermChrome');
        if (tabName === 'terminal') {
          if (outer) outer.style.display = '';
          if (wrap) wrap.style.display = '';
          if (chrome) chrome.style.display = '';
          pm7TermFlushIfDirty(); /* PM7 T09: rebuild buffered lines on reveal */
          renderTerminalChromeBar();
        } else {
          if (outer) outer.style.display = 'none';
          if (wrap) wrap.style.display = 'none';
          if (chrome) chrome.style.display = 'none';
        }
      }
      function expandBottomIfCollapsed() {
        var bp = document.getElementById('bottomPanel');
        if (bp && bp.classList.contains('collapsed')) {
          bp.classList.remove('collapsed');
          var cb = document.getElementById('collapseBottom');
          if (cb) cb.setAttribute('aria-expanded', 'true');
        }
      }
      /* ── pm6 W2 (js-integration): page-tab delegated switcher ──────────────
         Top page-tab clicks now route through window.PM_PAGES.go (pm6-js-globals)
         so page.changed reaches the PM_DEMO bus — the breadcrumb strip and the
         demo engine listen for it. Runs as a capturing listener so PM_PAGES.go has
         already applied the .active toggling by the time the legacy per-tab
         handler (js-terminal-demo) re-applies the identical classes; PM_PAGES
         emits page.changed exactly once, so nothing double-fires. Propagation
         is NOT stopped: document-level bubble listeners (context-menu and
         popover closers) must keep seeing the click. Keyboard activation is
         preserved — the legacy keydown handler synthesizes .click(), which
         lands here too. If PM_PAGES is absent the legacy handler still switches
         pages unchanged.
         Orchestrator subtabs need no shim here: PM_PAGES.registerSubtab
         ('orchestrator', …) in pm6-js-orchestrator funnels PM_PAGES.go
         ('orchestrator', subtab) into a .click() on .orch-tab[data-tab] — the
         same single path direct tab-strip clicks take (part-25 class toggler +
         the pm6 container listener, whose mark() render is rAF-coalesced). */
      document.addEventListener('click', function(e) {
        if (!window.PM_PAGES || !window.PM_PAGES.go) return;
        var tab = e.target && e.target.closest ? e.target.closest('.page-tab[data-page]') : null;
        if (!tab) return;
        if (e.isTrusted && typeof window.PM_PAGES.goSoon === 'function') window.PM_PAGES.goSoon(tab.getAttribute('data-page'));   /* O55: answer first */
        else window.PM_PAGES.go(tab.getAttribute('data-page'));
      }, true);
      /* ── pm6 W2 (js-integration): theme persistence shim ────────────
         Title-bar theme is a sprout menu (#themeSelect trigger). PM_THEME
         owns the family x mode model and persists pm.themeFamily /
         pm.themeMode / pm.theme itself (a slug alone cannot encode 'auto',
         so this listener must not second-guess it). It only back-fills the
         legacy pm.theme slug when PM_THEME is absent. */
      (function() {
        var ts = document.getElementById('themeSelect');
        if (!ts) return;
        ts.addEventListener('change', function() {
          if (window.PM_THEME && typeof window.PM_THEME.set === 'function') return;
          var v = this.getAttribute('data-value') || this.value;
          if (!v) return;
          try { localStorage.setItem('pm.theme', v); } catch (e0) {}
        });
      })();
      /* PM7 T09: live terminal DOM appends are skipped while the bottom
         panel is collapsed or the Terminal tab is inactive; per-session line
         state still accumulates (p.lines) and every reveal path rebuilds the
         bodies from state via renderAll(). */
      function pm7TermHidden() {
        var bp = document.getElementById('bottomPanel');
        if (bp && bp.classList.contains('collapsed')) return true;
        var host = document.getElementById('bottomTerminalHost');
        return !!(host && !host.classList.contains('active'));
      }
      function pm7TermFlushIfDirty() {
        if (state.pm7TermDirty) renderAll();
      }
      window.PM_TERMINAL_DEMO = {
        state: state,
        linkedSessions: state.linkedSessions,
        logCmd: logCmd,
        toast: function(msg) { ((typeof window !== 'undefined' && window.toast) || toast)(msg); },
        renderAll: renderAll,
        pm7FlushIfDirty: pm7TermFlushIfDirty,
        syncTerminalTabBar: syncTerminalTabBar,
        undockEditor: undockEditor,
        showBottomTab: function(name) {
          if (window.switchBottomTab) window.switchBottomTab(name);
        },
        dispatch: function(cmd, payload) {
          if (cmd.indexOf('show_') !== -1) {
            var t = cmd.indexOf('problems') !== -1 ? 'problems' : cmd.indexOf('ports') !== -1 ? 'ports' : 'output';
            if (window.switchBottomTab) window.switchBottomTab(t);
          }
          toast(cmd);
        },
        revealSession: function(sessionId) {
          expandBottomIfCollapsed();
          if (window.switchBottomTab) window.switchBottomTab('terminal');
          var loc = findSessionLocation(sessionId);
          if (loc) {
            state.termStripAnim = true;
            state.activeGroupId = loc.group.id;
            state.focusedPaneId = loc.paneId;
            promoteGroupIntoBar(loc.group.id);
            toast('Revealed session');
          } else toast('Session not in layout');
          renderAll();
          syncTerminalTabBar('terminal');
        },
        focusSession: function(sessionId) {
          expandBottomIfCollapsed();
          if (window.switchBottomTab) window.switchBottomTab('terminal');
          var loc = findSessionLocation(sessionId);
          if (loc) {
            state.activeGroupId = loc.group.id;
            state.focusedPaneId = loc.paneId;
          }
          renderAll();
          syncTerminalTabBar('terminal');
        },
        setGroupFilter: function() { renderAll(); },
        applySettings: function() {
          var fs = document.getElementById('pmSetTermFont');
          var lh = document.getElementById('pmSetTermLH');
          if (fs) document.documentElement.style.setProperty('--terminal-font-size', fs.value + 'px');
          if (lh) document.documentElement.style.setProperty('--terminal-line-height', lh.value);
        },
        showPaletteHints: function() { toast('Palette stub'); },
        reattachSecondary: function() { toast('Detached section UI retired'); },
        detachSecondary: function() { toast('Use workspace groups instead'); },
        /* PM6 demo-engine adapter surface (PM_DEMO.term). Exactly three additions. */
        appendToSession: function(sessionId, lineHtml) {
          try {
            var text = String(lineHtml == null ? '' : lineHtml).replace(/<[^>]*>/g, '');
            var touched = false;
            for (var pid in state.panes) {
              if (!state.panes.hasOwnProperty(pid)) continue;
              var p = state.panes[pid];
              if (!p || p.sessionId !== sessionId) continue;
              touched = true;
              p.lines.push({ t: 'line', c: text });
              if (p.lines.length > 400) p.lines.splice(0, p.lines.length - 400);
              if (pm7TermHidden()) { state.pm7TermDirty = true; continue; } /* PM7 T09 */
              var body = document.querySelector('.terminal-pane[data-pane-id="' + pid + '"] .terminal-pane-body');
              if (body) {
                var d = document.createElement('div');
                d.className = 'line';
                d.innerHTML = String(lineHtml == null ? '' : lineHtml);
                body.appendChild(d);
                while (body.childNodes.length > 400) body.removeChild(body.firstChild);
                body.scrollTop = body.scrollHeight;
              }
            }
            return touched;
          } catch (e) {
            if (typeof console !== 'undefined' && console.error) console.error('PM_TERMINAL_DEMO.appendToSession', e);
            return false;
          }
        },
        setProblems: function(rows) {
          try {
            var tbody = document.querySelector('#pmProblemsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            var list = rows || [];
            if (!list.length) {
              var tr0 = document.createElement('tr');
              var td0 = document.createElement('td');
              td0.colSpan = 4;
              td0.style.color = 'var(--text-muted)';
              td0.textContent = 'No problems detected in linked sessions.';
              tr0.appendChild(td0);
              tbody.appendChild(tr0);
              return;
            }
            list.forEach(function(r) {
              r = r || {};
              var tr = document.createElement('tr');
              if (r.session) {
                tr.setAttribute('data-session', r.session);
                tr.style.cursor = 'pointer';
                tr.onclick = (function(sess) {
                  return function() { window.PM_TERMINAL_DEMO.revealSession(sess); };
                })(r.session);
              }
              [r.sev || '', r.code || '', r.message || '', r.file || ''].forEach(function(v) {
                var td = document.createElement('td');
                td.textContent = v;
                tr.appendChild(td);
              });
              tbody.appendChild(tr);
            });
          } catch (e) {
            if (typeof console !== 'undefined' && console.error) console.error('PM_TERMINAL_DEMO.setProblems', e);
          }
        },
        setPorts: function(rows) {
          try {
            var tbody = document.querySelector('#bottomPortsHost .pm-ports-table tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            var list = rows || [];
            if (!list.length) {
              var tr0 = document.createElement('tr');
              var td0 = document.createElement('td');
              td0.colSpan = 4;
              td0.style.color = 'var(--text-muted)';
              td0.textContent = 'No forwarded ports detected.';
              tr0.appendChild(td0);
              tbody.appendChild(tr0);
              return;
            }
            list.forEach(function(r) {
              r = r || {};
              var tr = document.createElement('tr');
              var tdPort = document.createElement('td');
              tdPort.textContent = r.port != null ? String(r.port) : '';
              var tdProc = document.createElement('td');
              tdProc.textContent = r.process || '';
              var tdSess = document.createElement('td');
              tdSess.textContent = r.session || '—';
              var tdAct = document.createElement('td');
              if (r.session) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'pm-tiny-btn';
                btn.textContent = 'Open';
                btn.onclick = (function(sess) {
                  return function() { window.PM_TERMINAL_DEMO.revealSession(sess); };
                })(r.session);
                tdAct.appendChild(btn);
              } else {
                var sp = document.createElement('span');
                sp.style.color = 'var(--text-muted)';
                sp.textContent = r.note || '1 session / project';
                tdAct.appendChild(sp);
              }
              tr.appendChild(tdPort);
              tr.appendChild(tdProc);
              tr.appendChild(tdSess);
              tr.appendChild(tdAct);
              tbody.appendChild(tr);
            });
          } catch (e) {
            if (typeof console !== 'undefined' && console.error) console.error('PM_TERMINAL_DEMO.setPorts', e);
          }
        },
        init: function() {
          setupEditorDropTarget();
          fillBarSlots();
          try {
            renderAll();
            syncTerminalTabBar('terminal');
          } catch (e) {
            if (typeof console !== 'undefined' && console.error) console.error('PM_TERMINAL_DEMO init', e);
          }
          if (document.getElementById('pmSetTermFont')) this.applySettings();
        }
      };
    })();

    window.orchNodeDetailContent = {
      '1': '<details open class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">Node Summary</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Node ID</span> <b>1</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Type</span> <b>Lane</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">State</span> <span class="status-badge" style="background:var(--graph-passed); color:#1A1A1A; padding:1px 4px; font-size:9px;">Passed</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Duration</span> <b>1m 20s</b></div></div></details>',
      '2': '<details open class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">Node Summary</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Node ID</span> <b>2</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Type</span> <b>Lane</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">State</span> <span class="status-badge" style="background:var(--graph-running); color:#1A1A1A; padding:1px 4px; font-size:9px;">Running</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Duration</span> <b>0m 45s</b></div></div></details>',
      '2.1': '<details open class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">Node Summary</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Node ID</span> <b>2.1</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Type</span> <b>Task</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">State</span> <span class="status-badge" style="background:var(--graph-passed); color:#1A1A1A; padding:1px 4px; font-size:9px;">Passed</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Attempts</span> <b>2</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Duration</span> <b>0m 22s</b></div></div></details>',
      '2.2': '<div style="margin-bottom:var(--sm); font-size:10px; padding:2px 6px; background:rgba(255,255,255,0.1); border-radius:12px; color:var(--text-muted); display:inline-block;">Runtime: v1.2.5 (Current) • db-admin</div><details open class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C1 Node Summary</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Node ID</span> <b>2.2</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">State</span> <span class="status-badge" style="background:var(--accent-lime); color:#1A1A1A; padding:1px 4px; font-size:9px;">Running</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Attempts</span> <b>1 (Retry 0)</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Safe-Point ID</span> <b style="color:var(--accent-blue);">sp-49a8f</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Worktree</span> <b>wt-2</b></div><div style="margin-top:var(--sm); border-top:1px dashed var(--border-light); padding-top:4px;"><span style="color:var(--text-secondary);">Queue Analysis:</span><div style="color:var(--text-muted); margin-top:2px;">Last wake: Dependency Resolved</div></div></div></details><details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C2 Plan Mapping</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="color:var(--text-secondary); margin-bottom:4px;">Breadcrumb: Lane B &gt; Package 2 &gt; Node 2.2</div><button class="wizard-btn" style="font-size:9px; padding:2px 6px;">Open plan at section</button></div></details><details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C3 Worker Activity</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div><span style="color:var(--text-secondary);">Identity:</span> rust-engineer</div><div><span style="color:var(--text-secondary);">Model:</span> Claude sonnet-4.5</div><div style="margin-top:var(--xs);"><a href="#" style="color:var(--accent-blue);">View logs...</a></div></div></details><details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C6 HITL &amp; Recovery</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="color:var(--text-muted); margin-bottom:var(--sm);">No pending approvals.</div><div style="border-top:1px dashed var(--border-light); padding-top:var(--sm); display:flex; flex-direction:column; gap:var(--xs);"><button class="wizard-btn" style="font-size:10px;">Retry from safe point</button><button class="wizard-btn" style="font-size:10px;">Start fresh attempt</button></div></div></details>',
      '2.3': '<details open class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);"><summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">Node Summary</summary><div style="padding:var(--sm) var(--md); font-size:11px;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Node ID</span> <b>2.3</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Type</span> <b>Task</b></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">State</span> <span class="status-badge" style="background:var(--graph-pending); color:#F5F0E8; padding:1px 4px; font-size:9px;">Pending</span></div><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Blocked</span> <b>Yes</b></div><div style="color:var(--text-muted); margin-top:var(--sm);">Waiting on Task 2.2 completion.</div></div></details>'
    };

    // ── Worktree binding functions ──────────────────────────────────
    // CSS uses .is-open / .is-closing (sprout). Prefer window.PM6_SPROUT from
    // the chat script; fall back to .active only if sprout helpers are absent.
    function closeAllWorktreeDropdowns() {
      var sprout = window.PM6_SPROUT;
      document.querySelectorAll('.wt-bind-dropdown').forEach(function(d) {
        if (sprout && sprout.close) sprout.close(d);
        else {
          d.classList.remove('active', 'is-open', 'is-closing');
          d.style.display = 'none';
        }
      });
    }
    window.toggleWorktreeDropdown = function(btn) {
      var wrap = btn.closest('.wt-bind-wrap') || btn.parentElement;
      var dd = wrap.querySelector('.wt-bind-dropdown');
      if (!dd) return;
      var sprout = window.PM6_SPROUT;
      if (sprout && sprout.open && sprout.close && sprout.isOpen) {
        var open = sprout.isOpen(dd);
        document.querySelectorAll('.wt-bind-dropdown').forEach(function(d) {
          if (d !== dd && sprout.isOpen(d)) sprout.close(d);
        });
        if (open) sprout.close(dd);
        else sprout.open(dd, null, btn);
        return;
      }
      dd.classList.toggle('active');
    };
    window.showCreateWorktreeModal = function() {
      closeAllWorktreeDropdowns();
      var modal = document.getElementById('wtCreateModal');
      if (modal) { modal.classList.add('active'); }
      else {
        var m = document.createElement('div');
        m.className = 'wt-create-modal active';
        m.id = 'wtCreateModal';
        m.innerHTML = '<div class="wt-modal-inner">' +
          '<div style="font-weight:600; font-size:13px; margin-bottom:var(--sm);">Create Worktree</div>' +
          '<label style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:2px;">Branch Name</label>' +
          '<input type="text" style="width:100%; padding:4px 8px; background:var(--surface); border:1px solid var(--border-light); border-radius:var(--border-radius); color:var(--text-primary); font-size:11px; margin-bottom:var(--sm);" placeholder="feat/my-feature" />' +
          '<label style="font-size:10px; color:var(--text-secondary); display:block; margin-bottom:2px;">Base Branch</label>' +
          '<select style="width:100%; padding:4px 8px; background:var(--surface); border:1px solid var(--border-light); border-radius:var(--border-radius); color:var(--text-primary); font-size:11px; margin-bottom:var(--md);">' +
          '<option>main</option><option>develop</option><option>release/v2.4</option></select>' +
          '<div style="display:flex; gap:var(--sm); justify-content:flex-end;">' +
          '<button class="wizard-btn" onclick="hideCreateWorktreeModal()">Cancel</button>' +
          '<button class="wizard-btn" style="background:var(--accent-blue); color:#fff; border-color:var(--accent-blue);" onclick="createWorktree(this)">Create</button>' +
          '</div></div>';
        document.body.appendChild(m);
      }
    };
    window.hideCreateWorktreeModal = function() {
      var m = document.getElementById('wtCreateModal');
      if (m) m.classList.remove('active');
    };
    window.createWorktree = function(btn) {
      var modal = btn.closest('.wt-modal-inner') || btn.closest('.wt-create-modal');
      var input = modal.querySelector('input');
      var name = input ? input.value : 'feat/new-branch';
      if (!name) { if (window.toast) toast('Branch name required'); return; }
      btn.textContent = 'Creating...';
      btn.disabled = true;
      setTimeout(function() {
        hideCreateWorktreeModal();
        if (window.toast) toast('Worktree created: ' + name);
        document.querySelectorAll('.wt-bind-btn').forEach(function(b) {
          b.classList.remove('wt-unbound');
          b.classList.add('wt-bound-clean', 'pm6-chat-wt');
          b.style.color = '';
          var lbl = b.querySelector('.wt-bind-label');
          if (lbl) lbl.textContent = name;
        });
        btn.textContent = 'Create';
        btn.disabled = false;
      }, 800);
    };
    window.bindWorktree = function(name) {
      closeAllWorktreeDropdowns();
      document.querySelectorAll('.wt-bind-btn').forEach(function(b) {
        b.classList.remove('wt-unbound', 'wt-bound-dirty', 'wt-bound-conflict');
        b.classList.add('wt-bound-clean', 'pm6-chat-wt');
        b.style.color = '';
        var lbl = b.querySelector('.wt-bind-label');
        if (lbl) lbl.textContent = name;
      });
      if (window.toast) toast('Bound to worktree: ' + name);
    };
    window.unbindWorktree = function() {
      closeAllWorktreeDropdowns();
      document.querySelectorAll('.wt-bind-btn').forEach(function(b) {
        b.className = 'wt-bind-btn wt-unbound pm6-chat-wt';
        b.style.color = '';
        var lbl = b.querySelector('.wt-bind-label');
        if (lbl) lbl.textContent = 'No worktree';
      });
      if (window.toast) toast('Worktree unbound');
    };

    // ── Merge modal functions ───────────────────────────────────────
    window.showMergeModal = function() {
      var modal = document.getElementById('wtMergeModal');
      if (modal) { modal.classList.add('active'); }
      else {
        var m = document.createElement('div');
        m.className = 'wt-merge-modal active';
        m.id = 'wtMergeModal';
        m.innerHTML = '<div class="wt-merge-inner">' +
          '<div style="font-weight:600; font-size:13px; margin-bottom:var(--sm);">Merge to main</div>' +
          '<div style="display:flex; gap:2px; margin-bottom:var(--sm);">' +
          '<button class="seg-btn active" onclick="selectMergeStrategy(this,\'squash\')">Squash</button>' +
          '<button class="seg-btn" onclick="selectMergeStrategy(this,\'merge\')">Merge</button>' +
          '<button class="seg-btn" onclick="selectMergeStrategy(this,\'rebase\')">Rebase</button></div>' +
          '<textarea class="wt-merge-commit-msg" rows="3" placeholder="Commit message..."></textarea>' +
          '<div style="display:flex; gap:var(--sm); justify-content:flex-end; margin-top:var(--sm);">' +
          '<button class="wizard-btn" onclick="hideMergeModal()">Cancel</button>' +
          '<button class="wizard-btn" style="background:var(--accent-lime); color:#111; border-color:var(--accent-lime);" onclick="executeMerge(this)">Merge</button>' +
          '</div></div>';
        document.body.appendChild(m);
      }
    };
    window.hideMergeModal = function() {
      var m = document.getElementById('wtMergeModal');
      if (m) m.classList.remove('active');
    };
    window.selectMergeStrategy = function(btn, strategy) {
      var parent = btn.parentElement;
      parent.querySelectorAll('.seg-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    };
    window.executeMerge = function(btn) {
      btn.textContent = 'Merging...';
      btn.disabled = true;
      setTimeout(function() {
        hideMergeModal();
        if (window.toast) toast('Merge complete. Branch squashed into main.');
        btn.textContent = 'Merge';
        btn.disabled = false;
      }, 1200);
    };

    // ── Subagent card expand/collapse (event delegation) ────────────
    document.addEventListener('click', function(e) {
      var header = e.target.closest('.subagent-card-header');
      if (header && !e.target.closest('.sa-batch-group')) {
        header.closest('.subagent-card').classList.toggle('expanded');
      }
    });

    // ── Batch subgroup expand/collapse ──────────────────────────────
    document.addEventListener('click', function(e) {
      var gh = e.target.closest('.sa-batch-group-header');
      if (gh) { gh.closest('.sa-batch-group').classList.toggle('expanded'); }
    });


    // ── File manager worktree root toggle ───────────────────────────
    window.toggleFileManagerRoot = function(btn) {
      var bc = btn.closest('.fm-wt-breadcrumb');
      var dd = bc.querySelector('.fm-wt-root-dropdown');
      if (dd) dd.classList.toggle('active');
    };

    // ── Outside click: close worktree dropdowns ─────────────────────
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.wt-bind-wrap') && !e.target.closest('.wt-bind-dropdown')) {
        closeAllWorktreeDropdowns();
      }
    });

    // ── Update worktree button state per thread ─────────────────────
    var wtThreadData = {
      'thread0': { state: 'bound-clean', label: 'feat/dashboard-v2' },
      'thread1': { state: 'unbound', label: 'No worktree' },
      'thread2': { state: 'bound-dirty', label: 'feat/schema-update' },
      'thread3': { state: 'bound-clean', label: 'fix/auth-refresh' },
      'thread-subagents': { state: 'bound-clean', label: 'feat/oauth2-pkce' },
      'thread-crew': { state: 'unbound', label: 'No worktree' },
      'thread-worktree-merge': { state: 'bound-dirty', label: 'feat/multi-tenant' },
      'thread-batch-fanout': { state: 'unbound', label: 'No worktree' },
      'thread-escalation': { state: 'bound-clean', label: 'perf/analytics-opt' },
      'thread-debug1': { state: 'bound-clean', label: 'debug/login-401' }
    };
    window.updateWorktreeButtonForThread = function(threadId) {
      var data = wtThreadData[threadId] || { state: 'unbound', label: 'No worktree' };
      document.querySelectorAll('.wt-bind-btn').forEach(function(btn) {
        /* keep pm6-chat-wt; never pin inline color (blocks lens-matched hover) */
        btn.className = 'wt-bind-btn wt-' + data.state + ' pm6-chat-wt';
        btn.style.color = '';
        var lbl = btn.querySelector('.wt-bind-label');
        if (lbl) lbl.textContent = data.label;
      });
      document.querySelectorAll('.wt-current-name').forEach(function(el) { el.textContent = data.label; });
      document.querySelectorAll('.wt-current-label .wt-status-pill').forEach(function(el) {
        el.className = 'wt-status-pill ' + (data.state === 'bound-dirty' ? 'dirty' : data.state === 'bound-conflict' ? 'conflict' : data.state === 'unbound' ? '' : 'clean');
        el.textContent = data.state === 'bound-dirty' ? 'dirty' : data.state === 'bound-conflict' ? 'conflict' : data.state === 'unbound' ? '' : 'clean';
        el.style.display = data.state === 'unbound' ? 'none' : '';
      });
    };

    window.openPRDBuilder = function() { if (window.switchWizardStep) window.switchWizardStep(2); };
    window.openOrchestratorPlanCompile = function() {
      const orchPage = document.querySelector(".page-tab[data-page='orchestrator']");
      if (orchPage) orchPage.click();
      setTimeout(() => {
        const compileTab = document.querySelector("#orch-tab-plan_compile, .orch-tab[data-tab='plan_compile']");
        if (compileTab) compileTab.click();
      }, 50);
    };
    function hideEditorViewIfNoVisiblePanes() {
      const edView = document.getElementById('editorView');
      if (edView && !edView.querySelector('.editor-pane:not([style*="display: none"])')) {
        edView.style.display = 'none';
        const splitResizer = document.getElementById('editorSplitResizer');
        if (splitResizer) splitResizer.style.display = 'none';
      }
    }

    window.switchWizardStep = function(stepIndex) {
      document.querySelectorAll('.page-wizard').forEach(wizardContainer => {
          wizardContainer.querySelectorAll('.wizard-nav-step').forEach(el => {
            el.classList.remove('active', 'complete');
            const idx = parseInt(el.getAttribute('data-nav-step'));
            if (idx < stepIndex) el.classList.add('complete');
            if (idx === stepIndex) el.classList.add('active');
          });
          wizardContainer.querySelectorAll('.wizard-nav-connector').forEach((el, i) => {
            el.classList.toggle('complete', i < stepIndex);
          });
          const panels = wizardContainer.querySelectorAll('.wizard-step-panel');
          panels.forEach(panel => {
            const idx = parseInt(panel.getAttribute('data-wizard-panel'));
              if (idx === stepIndex) {
              panel.style.display = 'flex';
              panel.classList.add('active');
            } else {
              panel.style.display = 'none';
              panel.classList.remove('active');
            }
          });
      });
    };




    /* MODIFIED (adapter shim): resize controller rebuilt on Pointer Events +
       setPointerCapture — releasing over the editor iframe or minimap canvas
       can no longer swallow the release and strand the drag (stuck cursor,
       endless resize, stuck pm6-noanim); window blur ends any active drag as
       a safety net. onStart/onEnd hooks (pm6-noanim toggling) and the
       resizer registration API (resizerEl, opts) are unchanged;
       setupResizer's horizontal math measures from the dragged element's own
       rect so leftPanelResizer / editorSplitResizer / editorDashResizer track
       the cursor 1:1. Dbl-click on any resizer resets to CSS defaults. */
    (function resizeController() {
        let active = null;
        let glowRect = null;
        /* Drag-idle bus. Every resizer in the app funnels through here, and
           endDrag is reached from pointerup, pointercancel, lostpointercapture
           AND window blur — so `pm-resizing` on the body element cannot get
           stuck, which
           is what makes this the safe place to own it. Observers that do a
           forced-layout pass (cozy-shelves pill fit, PM_EDGE band geometry,
           the editor/dash refit) read the flag to idle for the drag and
           register here to catch up exactly once on release. */
        const dragEndHooks = [];
        window.PM_ON_DRAGEND = function (fn) { dragEndHooks.push(fn); };
        window.PM_DRAGEND = function () {
            for (let i = 0; i < dragEndHooks.length; i++) { try { dragEndHooks[i](); } catch (e) {} }
        };
        function endDrag(ev) {
            if (!active) return;
            const a = active;
            active = null;
            try {
                if (ev && typeof ev.pointerId === 'number' && a.resizer.hasPointerCapture(ev.pointerId)) {
                    a.resizer.releasePointerCapture(ev.pointerId);
                }
            } catch (e) {}
            a.resizer.classList.remove('resizing');
            document.body.classList.remove('pm-resizing');
            glowRect = null;
            if (a.endHandler) a.endHandler();
            window.PM_DRAGEND();
        }
        window.PM_CANCEL_RESIZER = function() { endDrag(null); };
        window.addEventListener('blur', () => endDrag(null));
        /* Grab-glow anchor: park --pm-glow-off where the pointer is along the
           bar so the glow blooms at the grab point instead of the midpoint
           (pm6-css-bento reads it as the ::before/::after `translate`).
           Deliberately element-level — a third document-level pointermove
           would break the PM7 T07 listener merge. Ratio is clamped, so during
           a captured drag the glow pins to the bar end rather than sliding
           off. Written as a px offset FROM THE BAR MIDPOINT, not a position:
           `translate` percentages resolve against the pseudo-element's own
           box (16x56 / 46x240), not the bar's.
           The rect is hoisted into glowRect for the duration of a drag — this
           runs ahead of the drag guard on every pointermove, and a bar's own
           drag only moves it ACROSS its axis: a col resizer slides in x while
           this reads top/height, a row resizer in y while this reads
           left/width. Plain hover keeps measuring live (infrequent, and the
           layout may genuinely have moved since). */
        function trackGlow(resizerEl, e) {
            /* Bars the Home grab light has adopted (.pmw-gl) paint no legacy pseudo glow at all
               (56-light.css retires ::before/::after on them), so the rect read and the variable
               write were pure per-move waste, including during the Home chat drag, whose pointerdown
               this controller never sees: glowRect stayed null and every move forced a fresh rect. */
            if (resizerEl.classList.contains('pmw-gl')) return;
            const r = glowRect || resizerEl.getBoundingClientRect();
            const vertical = resizerEl.classList.contains('resizer-col');
            const len = (vertical ? r.height : r.width) || 1;
            const raw = vertical ? (e.clientY - r.top) / len : (e.clientX - r.left) / len;
            const off = (Math.min(1, Math.max(0, raw)) - 0.5) * len;
            resizerEl.style.setProperty('--pm-glow-off', off.toFixed(2) + 'px');
        }
        window.registerResizer = function(resizerEl, opts) {
            resizerEl.addEventListener('pointerdown', (e) => {
                if (e.button !== undefined && e.button !== 0) return;
                if (active) endDrag(null);
                active = { resizer: resizerEl, moveHandler: opts.onMove, endHandler: opts.onEnd };
                try { resizerEl.setPointerCapture(e.pointerId); } catch (e2) {}
                /* Reads before writes: the glow rect (and onStart's clamp reads inside it) used to run
                   after the class writes, forcing a full style+layout inside the pickup handler.
                   No body cursor either: cursor is inherited, so writing it on <body> restyled the
                   whole document at pickup and release (measured 45-70ms each); the resizer's own CSS
                   cursor (.resizer-col/.resizer-row) applies for the whole captured drag, exactly as
                   Home's own divider/chat drags already rely on. */
                glowRect = resizerEl.getBoundingClientRect();
                if (opts.onStart) opts.onStart(e);
                resizerEl.classList.add('resizing');
                document.body.classList.add('pm-resizing');
                e.preventDefault();
            });
            /* placed before the drag guard: the glow must track plain hover
               too, which is the whole point of the affordance */
            resizerEl.addEventListener('pointerenter', (e) => trackGlow(resizerEl, e));
            resizerEl.addEventListener('pointermove', (e) => {
                trackGlow(resizerEl, e);
                if (!active || active.resizer !== resizerEl) return;
                if (active.moveHandler) active.moveHandler(e);
            });
            /* No pointerleave reset. Clearing --pm-glow-off on leave dropped
               the anchor back to the CSS midpoint default WHILE the 150ms
               fade-out was still running, so the glow visibly snapped to the
               bar's midpoint before disappearing. The stale value is
               harmless: pointerenter rewrites it synchronously, before the
               fade-in paints. */
            resizerEl.addEventListener('pointerup', endDrag);
            resizerEl.addEventListener('pointercancel', endDrag);
            resizerEl.addEventListener('lostpointercapture', () => endDrag(null));
        };
    })();

    function setupResizer(resizerId, prevElementId, nextElementId, isHorizontal=true) {
        const resizer = document.getElementById(resizerId);
        if (!resizer) return;
        const getPrev = () => document.getElementById(prevElementId) || (prevElementId && document.querySelector('.' + prevElementId));
        const getNext = () => document.getElementById(nextElementId) || (nextElementId && document.querySelector('.' + nextElementId));
        let startX = 0, startY = 0, startW = 0, startH = 0;
        /* Clamp inputs are measured once at drag start. They used to be re-read on every move —
           a parent rect plus two getComputedStyle calls after the previous move's width write,
           i.e. a forced style+layout per pointermove. None of them can change during one gesture
           (the window does not resize mid-drag, and the elements' own min/max are stylesheet-fixed). */
        let dragCache = null, lastWritten = null;
        window.registerResizer(resizer, {
            isHorizontal,
            onStart(e) {
                const prev = getPrev();
                const next = getNext();
                startX = e.clientX; startY = e.clientY;
                dragCache = null; lastWritten = null;
                if (isHorizontal && prev) {
                    startW = prev.getBoundingClientRect().width;
                    const prevCS = getComputedStyle(prev);
                    dragCache = {
                        containerW: resizer.parentNode ? resizer.parentNode.getBoundingClientRect().width : 0,
                        minW: parseFloat(prevCS.minWidth) || 200,
                        /* Honour the element's own max-width. .side-panel-slot caps at
                           min(480px, 50vw); without this the drag kept writing widths
                           past the cap that CSS then threw away, so the panel froze
                           while the handle ran on — and dragging back did nothing until
                           the written value fell under the cap again. That decoupling
                           was the "jerky" left panel. */
                        cssMaxW: parseFloat(prevCS.maxWidth),
                        nextMinW: next ? (parseFloat(getComputedStyle(next).minWidth) || 0) : 0
                    };
                }
                if (!isHorizontal && next) {
                    startH = next.getBoundingClientRect().height;
                    dragCache = { containerH: resizer.parentNode ? resizer.parentNode.getBoundingClientRect().height : 0 };
                }
                /* class write last, after every read above (see registerResizer's pickup note) */
                if (prev) prev.classList.add('pm6-noanim');
            },
            onEnd() {
                const prev = getPrev();
                if (prev) prev.classList.remove('pm6-noanim');
                dragCache = null;
            },
            onMove(e) {
                const prev = getPrev();
                const next = getNext();
                if (isHorizontal && prev && dragCache) {
                    let newWidth = startW + (e.clientX - startX);
                    let maxW = Math.max(320, dragCache.containerW - (dragCache.nextMinW || 240));
                    if (!isNaN(dragCache.cssMaxW) && dragCache.cssMaxW > 0) maxW = Math.min(maxW, dragCache.cssMaxW);
                    if (maxW < dragCache.minW) maxW = dragCache.minW;
                    newWidth = Math.max(dragCache.minW, Math.min(newWidth, maxW));
                    if (lastWritten !== null && Math.abs(newWidth - lastWritten) < 0.5) return;
                    lastWritten = newWidth;
                    prev.style.setProperty('width', newWidth + 'px', 'important');
                    prev.style.setProperty('flex', 'none', 'important');
                    /* remember what the user actually asked for: refits clamp
                       DOWN against this and restore back UP to it when the
                       space returns (see refitEditorDashSplit) */
                    prev.dataset.pmUserW = newWidth;
                } else if (!isHorizontal && next && dragCache) {
                    const maxH = Math.max(50, dragCache.containerH - 100);
                    const newHeight = Math.max(50, Math.min(startH + (startY - e.clientY), maxH));
                    if (lastWritten !== null && Math.abs(newHeight - lastWritten) < 0.5) return;
                    lastWritten = newHeight;
                    next.style.setProperty('height', newHeight + 'px', 'important');
                    next.style.setProperty('flex', 'none', 'important');
                }
            }
        });
        resizer.addEventListener('dblclick', () => {
            if (isHorizontal) {
                const prev = getPrev();
                if (prev) {
                    prev.style.removeProperty('width');
                    prev.style.removeProperty('flex');
                    delete prev.dataset.pmUserW;
                }
            } else {
                const next = getNext();
                if (next) { next.style.removeProperty('height'); next.style.removeProperty('flex'); }
            }
        });
    }

    /* Editor/dashboard refit. A drag pins .editor-view at `width:Npx` +
       `flex:none !important`, which makes it unshrinkable — so when the docked
       chat panel opened and .center-column lost its width, the whole squeeze
       landed on .dashboard-view and crushed it out of sight. This clamps the
       pinned width against the dashboard's min-width so the EDITOR gives up
       the space, and restores it back toward dataset.pmUserW when the space
       comes back. No-op until the split has actually been dragged (plain flex
       already fits correctly). */
    function refitEditorDashSplit() {
        const ev = document.getElementById('editorView');
        const dv = document.getElementById('dashboardView');
        if (!ev || !dv) return;
        if (ev.style.display === 'none' || dv.style.display === 'none') return;
        const row = ev.parentNode;
        if (!row || !row.getBoundingClientRect) return;
        const want = parseFloat(ev.dataset.pmUserW || '') || parseFloat(ev.style.width);
        if (!want) return;
        const rowW = row.getBoundingClientRect().width;
        if (!rowW) return;
        /* exact gutter (resizer box + collapsed margins), overflow-proof */
        const gap = Math.max(0, dv.getBoundingClientRect().left - ev.getBoundingClientRect().right);
        const evMin = parseFloat(getComputedStyle(ev).minWidth) || 0;
        const dashMin = parseFloat(getComputedStyle(dv).minWidth) || 0;
        const target = Math.min(want, Math.max(evMin, rowW - dashMin - gap));
        if (Math.abs(target - (parseFloat(ev.style.width) || 0)) < 0.5) return;
        ev.style.setProperty('width', target + 'px', 'important');
        ev.style.setProperty('flex', 'none', 'important');
    }
    window.PM_REFIT_SPLIT = refitEditorDashSplit;

    document.addEventListener('DOMContentLoaded', () => {

        // Sync Dashboard activity-bar icon with initial visibility (dashboard is shown by default)
        const dash = document.getElementById('dashboardView');
        const dashboardIcon = document.querySelector('.activity-bar .icon[title="Dashboard"]');
        if (dash && dashboardIcon && dash.style.display !== 'none') {
            dashboardIcon.classList.add('active');
        }

        // Dashboard tabs logic
        document.querySelectorAll('.dashboard-tabs').forEach(tabsContainer => {
            tabsContainer.addEventListener('click', e => {
                const tab = e.target.closest('.tab');
                if (tab) {
                    /* Tab visuals are stylesheet-owned now (PM7 tab
                       silhouette): the inline color/background/border writes
                       that used to live here outranked every .ed-shape-on
                       rule, so the strip could never adopt the shared
                       silhouette chrome. Only state flips remain: the
                       active class and its mirrored aria-selected. */
                    tabsContainer.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                    
                    const tabName = tab.textContent.trim();
                    const mainGrid = document.getElementById('dashGridMain');
                    const metricsGrid = document.getElementById('dashGridMetrics');
                    const monitoringGrid = document.getElementById('dashGridMonitoring');
                    
                    if (mainGrid) mainGrid.style.display = 'none';
                    if (metricsGrid) metricsGrid.style.display = 'none';
                    if (monitoringGrid) monitoringGrid.style.display = 'none';
                    
                    if (tabName === 'Main' && mainGrid) mainGrid.style.display = 'contents';
                    if (tabName === 'Metrics' && metricsGrid) metricsGrid.style.display = 'contents';
                    if (tabName === 'Monitoring' && monitoringGrid) monitoringGrid.style.display = 'contents';
                }
            });
        });


        // PM7 T20: surface DnD is Pointer Events/model-first; editor-tab DnD remains local.
        /* ---------- editor tab drag-reorder (delegated) ---------------------- ----------------------
           Previously this was a one-shot pass over the STATIC markup: it set
           `draggable` on the tabs that existed at parse time, so pane 1 lost
           reordering the moment renderEditorTabs() rebuilt its strip with
           createElement, and panels created later (Home panels 3/4) never had
           it at all. The drop also reordered the DOM only, so the next render
           snapped the order straight back.

           Now: `draggable` is armed on pointerdown (the same trick the
           dashboard widget grid uses), every handler is delegated on document
           so it covers strips that do not exist yet, and the drop writes the
           new order back to the owning model before re-rendering. */
        /* pointer-capture reorder: HTML5 DnD is retired for tab reorder.
           WebKit made the old path invisible three ways at once: a dragover
           stream that only ticks on native NSDragging updates (sparse), a
           native opaque drag snapshot whenever the custom drag image is not
           renderable (opacity:0 counts as not renderable), and macOS
           reduce-motion gating. Pointer capture drives the same FLIP
           machinery at full input rate with the REAL tab under the pointer:
           no ghost bitmap, no dragover cadence, no OS drag session at all.
           T07 note: move/up/cancel listeners ride the TAB element under
           setPointerCapture -- document-level pointermove stays untouched. */
        var edPD = null; /* one reorder gesture at a time */
        function edMotionOK() {
            return !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) &&
                document.documentElement.getAttribute('data-motion') !== 'reduced';
        }

        function edReorderSlots(strip, dragging) {
            /* transform-free midpoint cache -- callers guarantee every tab's
               transform is '' at sample time, so live rects ARE layout */
            var mids = [];
            var tabs = strip.querySelectorAll('.tab');
            for (var i = 0; i < tabs.length; i++) {
                var t = tabs[i];
                if (t === dragging || t.style.display === 'none') continue;
                var r = t.getBoundingClientRect();
                mids.push({ el: t, mid: r.left + r.width / 2 });
            }
            return mids;
        }

        function edDetachReorder() {
            window.removeEventListener('pointermove', edReorderMove, true);
            window.removeEventListener('pointerup', edReorderUp, true);
            window.removeEventListener('pointercancel', edReorderCancel, true);
        }

        document.addEventListener('pointerdown', function (e) {
            if (!e.isPrimary || e.button !== 0) return;
            var tab = e.target && e.target.closest ? e.target.closest('.editor-tabs .tab') : null;
            if (!tab) return;
            if (e.target.closest('.tab-close-btn, .tab-close')) return; /* closing, not dragging */
            var strip = tab.closest('.editor-tabs');
            if (!strip || edPD) return;
            edPD = { tab: tab, strip: strip, pid: e.pointerId, startX: e.clientX,
                     grabX: 0, slotLeft: 0, slotW: 0, lastTx: 0, mids: null,
                     motionOK: true, didDrag: false };
            /* listeners live on WINDOW, not the tab: re-slotting the tab is
               a DOM remove+insert, which releases pointer capture -- a
               tab-scoped lostpointercapture would cancel the drag on the very
               first re-slot (the same trap the workspace drag documents on
               its grip handles). Capture is still taken as a stream nicety:
               it suppresses hover churn and keeps events flowing while it
               lasts; the window listeners simply do not care when it dies. */
            window.addEventListener('pointermove', edReorderMove, true);
            window.addEventListener('pointerup', edReorderUp, true);
            window.addEventListener('pointercancel', edReorderCancel, true);
            try { tab.setPointerCapture(e.pointerId); } catch (err) {}
        }, true);

        function edReorderMove(e) {
            var g = edPD;
            if (!g || e.pointerId !== g.pid) return;
            if (!g.didDrag) {
                if (Math.abs(e.clientX - g.startX) < 4) return; /* drag threshold */
                g.didDrag = true;
                g.motionOK = edMotionOK();
                g.tab.classList.add('dragging');
                /* the grabbed tab becomes the LIVE tab immediately (reference
                   behavior: the connected surface rushes to your hand and
                   rides it). EDSHAPE's lastActive change turns its next sync
                   into a spring; every move after that snap-follows the
                   painted box, so tab and canvas stay one fused shape for
                   the whole gesture. Content render stays deferred. */
                if (!g.tab.classList.contains('active')) {
                    g.strip.querySelectorAll('.tab.active').forEach(function (t) { t.classList.remove('active'); });
                    g.tab.classList.add('active');
                }
                var r0 = g.tab.getBoundingClientRect();
                g.grabX = g.startX - r0.left;
                g.slotLeft = r0.left;
                g.slotW = r0.width;
                g.mids = edReorderSlots(g.strip, g.tab);
                /* roll the retro gesture mode once per drag (null outside
                   retro themes / reduced motion) */
                g.retroMode = (window.PM6_RETRO_MOTION && PM6_RETRO_MOTION.beginDrag) ?
                    PM6_RETRO_MOTION.beginDrag(g.tab) : null;
                if (window.getSelection) { try { getSelection().removeAllRanges(); } catch (err) {} }
            }
            e.preventDefault();
            /* insertion index from CACHED transform-free midpoints -- live
               rects of mid-FLIP neighbours are transform-inclusive lies */
            var center = e.clientX - g.grabX + g.slotW / 2;
            var afterEl = null;
            for (var mi = 0; mi < g.mids.length; mi++) {
                if (center < g.mids[mi].mid) { afterEl = g.mids[mi].el; break; }
            }
            /* end anchor: the overflow chip when present, else the pinned
               actions cluster -- inserting before the cluster alone would
               land the tab to the chip's RIGHT */
            var ref = afterEl != null ? afterEl :
                (g.strip.querySelector('.pm-ed-overflow') ||
                 g.strip.querySelector('.pane-tabbar-actions'));
            /* no-op guard: already directly before ref means the insert would
               be pure churn (observer wakeups, FLIP restarts, zero layout) */
            if (g.tab.nextElementSibling !== ref && g.tab !== ref) {
                if (g.motionOK) {
                    /* FLIP the displaced tabs. First rects are taken
                       transform-INCLUSIVE so an interrupted slide continues
                       from where it visually is instead of teleporting. */
                    var firsts = [];
                    var sibs = g.strip.querySelectorAll('.tab');
                    var si, sTab, dx, lr;
                    for (si = 0; si < sibs.length; si++) {
                        sTab = sibs[si];
                        if (sTab === g.tab || sTab.style.display === 'none') continue;
                        firsts.push([sTab, sTab.getBoundingClientRect().left]);
                        window.PM7_MOTION_FINISH.cancel(sTab, 'transition', 'transform');
                        cancelAnimationFrame(sTab.__pmTabSlideFrame);
                    }
                    g.strip.insertBefore(g.tab, ref);
                    var newMids = [];
                    for (si = 0; si < firsts.length; si++) {
                        sTab = firsts[si][0];
                        sTab.style.transition = 'none';
                        sTab.style.transform = '';
                        lr = sTab.getBoundingClientRect();
                        newMids.push({ el: sTab, mid: lr.left + lr.width / 2 });
                        dx = firsts[si][1] - lr.left;
                        if (dx >= 1 || dx <= -1) {
                            sTab.style.transform = 'translateX(' + dx + 'px)';
                            void sTab.offsetWidth; /* commit the offset frame */
                            (function (tab) {
                                // Old cancellation dispatches before this replacement frame.
                                tab.__pmTabSlideFrame = requestAnimationFrame(function () {
                                    tab.__pmTabSlideFrame = 0;
                                    tab.style.transition = 'transform 250ms cubic-bezier(.22,1,.36,1)';
                                    tab.style.transform = '';
                                    window.PM7_MOTION_FINISH(tab, 'transition', 'transform', function () {
                                        tab.style.transition = '';
                                        tab.style.transform = '';
                                    });
                                });
                            })(sTab);
                        } else {
                            sTab.style.transition = '';
                            sTab.style.transform = '';
                        }
                    }
                    newMids.sort(function (a, b) { return a.mid - b.mid; });
                    g.mids = newMids;
                    /* re-cache the dragged slot from its transform-free rect */
                    var keepT = g.tab.style.transform;
                    g.tab.style.transform = '';
                    var dr = g.tab.getBoundingClientRect();
                    g.slotLeft = dr.left;
                    g.slotW = dr.width;
                    g.tab.style.transform = keepT;
                } else {
                    g.strip.insertBefore(g.tab, ref);
                    g.mids = edReorderSlots(g.strip, g.tab);
                    var dr2 = g.tab.getBoundingClientRect();
                    g.slotLeft = dr2.left;
                    g.slotW = dr2.width;
                }
            }
            if (g.motionOK) {
                /* 1:1 glide, transform ONLY. The layout position stays at the
                   insertion slot, so the midpoint math and EDSHAPE's per-frame
                   snap both keep seeing the truth. Soft rubber-band past the
                   strip edges instead of a hard clamp. */
                var sr = g.strip.getBoundingClientRect();
                var tx = e.clientX - g.grabX - g.slotLeft;
                var txMin = sr.left - g.slotLeft;
                var txMax = sr.right - g.slotW - g.slotLeft;
                if (tx < txMin) tx = txMin + (tx - txMin) * 0.35;
                if (tx > txMax) tx = txMax + (tx - txMax) * 0.35;
                /* retro tab motion: beginDrag always returns 'dos' (dashed
                   cut-out), so the glide always snaps to the 8px character
                   grid. Quantize BEFORE lastTx so the drop settle starts
                   from the painted position, not the raw pointer position. */
                if (g.retroMode) {
                    tx = Math.round(tx / 8) * 8;
                }
                g.lastTx = tx;
                g.tab.style.transform = 'translateX(' + tx + 'px)';
            }
            if (window.PM6_EDTAB_SHAPE) { try { PM6_EDTAB_SHAPE.sync(g.strip, false); } catch (err) {} }
        }

        function edReorderUp(e) {
            var g = edPD;
            if (!g || e.pointerId !== g.pid) return;
            edPD = null;
            edDetachReorder();
            try { g.tab.releasePointerCapture(g.pid); } catch (err) {}
            if (!g.didDrag) return; /* plain click: selection runs natively */
            /* the trailing synthetic click can leak to whatever sits under
               the release point in some engines -- swallow clicks for a beat,
               then stand down */
            var swallow = function (ce) { ce.stopPropagation(); ce.preventDefault(); };
            document.addEventListener('click', swallow, true);
            setTimeout(function () { document.removeEventListener('click', swallow, true); }, 120);
            edReorderSettle(g);
        }

        function edReorderCancel(e) {
            var g = edPD;
            if (!g || e.pointerId !== g.pid) return;
            edPD = null;
            edDetachReorder();
            if (!g.didDrag) return;
            /* system-cancel path (mirrors the old ESC handling): settle the
               residue instantly and refit -- no persist, the next render may
               snap the order back by design */
            g.tab.style.transform = '';
            var settle = g.strip.querySelectorAll('.tab');
            for (var si = 0; si < settle.length; si++) {
                settle[si].style.transition = '';
                settle[si].style.transform = '';
            }
            g.tab.classList.remove('dragging');
            if (typeof window.PM6_FIT_EDITOR_TABS === 'function') {
                try { window.PM6_FIT_EDITOR_TABS(g.strip); } catch (err) {}
            }
            /* the grab activated this tab; a cancelled gesture must still
               leave class and content agreeing */
            var cfile = g.tab.getAttribute('data-file');
            var cpane = g.strip.closest('.editor-pane');
            if (cpane && cfile && typeof FILE_DATA !== 'undefined' && FILE_DATA[cfile]) {
                var cprefix = cpane.getAttribute('data-pm-home-editor-prefix') ||
                    (cpane.id === 'editorPane1' ? 'pane1' : (cpane.id === 'editorPane2' ? 'pane2' : null));
                if (cprefix) renderFileToPane(cfile, cprefix, true);
            }
            if (window.PM6_EDTAB_SHAPE) { try { PM6_EDTAB_SHAPE.sync(g.strip, false); } catch (err) {} }
        }

        function edReorderSettle(g) {
            var tab = g.tab, strip = g.strip;
            /* final slot, transform-free (clear + measure + re-transform is
               synchronous -- nothing paints in between) */
            tab.style.transform = '';
            var fr = tab.getBoundingClientRect();
            var delta = g.slotLeft + g.lastTx - fr.left;
            /* order + activation bookkeeping that reads NO layout runs now;
               layout-reading work (fitters, model re-render) waits until the
               settle transform is gone -- transforms poison their reads */
            strip.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            if (typeof window.PM6_PERSIST_TAB_ORDER === 'function') {
                try { window.PM6_PERSIST_TAB_ORDER(strip); } catch (err) {}
            }
            var finished = false;
            /* the silhouette RIDES the settle: snap-sync to the tab's painted
               box every frame of the bounce, so tab and canvas arrive as one
               fused surface. A free-running spring here diverged from the
               tab's own settle curve by up to a tab-width mid-flight. */
            var ride = function () {
                if (finished) return;
                if (window.PM6_EDTAB_SHAPE) { try { PM6_EDTAB_SHAPE.sync(strip, false); } catch (err) {} }
                requestAnimationFrame(ride);
            };
            var finish = function (te) {
                if (te && te.propertyName && te.propertyName !== 'transform') return;
                if (finished) return;
                finished = true;
                tab.removeEventListener('transitionend', finish);
                tab.style.transition = '';
                tab.style.transform = '';
                var residue = strip.querySelectorAll('.tab');
                for (var ri = 0; ri < residue.length; ri++) {
                    residue[ri].style.transition = '';
                    residue[ri].style.transform = '';
                }
                tab.classList.remove('dragging');
                var filename = tab.getAttribute('data-file');
                var pane = strip.closest('.editor-pane');
                if (typeof window.PM6_FIT_EDITOR_TABS === 'function') {
                    try { window.PM6_FIT_EDITOR_TABS(strip); } catch (err) {}
                }
                /* model re-render LAST: for pane 1 this rebuilds the strip
                   from state, which would tear the settling tab out of the
                   DOM mid-animation */
                if (pane && filename && typeof FILE_DATA !== 'undefined' && FILE_DATA[filename]) {
                    var prefix = pane.getAttribute('data-pm-home-editor-prefix') ||
                        (pane.id === 'editorPane1' ? 'pane1' : (pane.id === 'editorPane2' ? 'pane2' : null));
                    if (prefix) renderFileToPane(filename, prefix, true);
                }
                if (window.PM6_EDTAB_SHAPE) { try { PM6_EDTAB_SHAPE.sync(strip, false); } catch (err) {} }
            };
            if (g.motionOK && (delta >= 1 || delta <= -1)) {
                /* low-bounce settle into the slot */
                tab.style.transition = 'none';
                tab.style.transform = 'translateX(' + delta + 'px)';
                void tab.offsetWidth;
                /* measured off the reference at 60fps: the released tab
                   returns with a ~65%-per-frame exponential decay over
                   ~150ms and ZERO overshoot -- a tight ease-out, not a
                   bounce */
                tab.style.transition = 'transform 160ms cubic-bezier(.17,.84,.29,.99)';
                tab.style.transform = 'translateX(0px)';
                tab.addEventListener('transitionend', finish);
                setTimeout(finish, 260); /* transitionend can be lost to a re-render */
                requestAnimationFrame(ride);
            } else {
                finish();
            }
        }

        // init generic resizers
        setupResizer('leftPanelResizer', 'sidePanelSlot', 'editorView');
        setupResizer('editorSplitResizer', 'editorPane1', 'editorPane2');
        setupResizer('editorDashResizer', 'editorView', 'dashboardView');
        setupResizer('terminalResizer', 'center-row', 'bottomPanel', false);
        if (window.PM_TERMINAL_DEMO) window.PM_TERMINAL_DEMO.init();
        if (window.switchBottomTab) window.switchBottomTab('terminal');
        
        const chatResizer = document.getElementById('chatResizer');
        const chatPanel = document.getElementById('chatPanel');
        if (chatResizer && chatPanel && window.registerResizer) {
            let chatStartX = 0, chatStartW = 0, chatMinW = 360;
            window.registerResizer(chatResizer, {
                isHorizontal: true,
                onStart(e) {
                    chatStartX = e.clientX;
                    chatStartW = chatPanel.getBoundingClientRect().width;
                    /* Derive the floor like setupResizer does instead of the
                       old hardcoded 520: --chat-panel-w resolves to 480 below
                       2200px and to a 380-440 clamp below 1720px, so a 520
                       floor snapped the panel 40-140px WIDER on the first
                       pointermove and could never be dragged back. */
                    chatMinW = parseFloat(getComputedStyle(chatPanel).minWidth) || 0;
                    if (!chatMinW) chatMinW = Math.min(360, chatStartW);
                },
                onMove(e) {
                    const newWidth = Math.max(chatMinW, Math.min(chatStartW + (chatStartX - e.clientX), 1200));
                    chatPanel.style.setProperty('width', newWidth + 'px', 'important');
                    chatPanel.style.setProperty('max-width', 'none', 'important');
                    chatPanel.style.setProperty('flex', 'none', 'important');
                    refitEditorDashSplit();
                }
            });
            chatResizer.addEventListener('dblclick', () => {
                chatPanel.style.removeProperty('width');
                chatPanel.style.removeProperty('max-width');
                chatPanel.style.removeProperty('flex');
                refitEditorDashSplit();
            });
        }

        /* One observer on the editor/dashboard row covers window resizes,
           left-panel drags and the responsive breakpoints without polling.
           refitEditorDashSplit only writes .editor-view's width, which does
           not change the row's own box, so this cannot self-retrigger. */
        const editorDashRow = (document.getElementById('editorView') || {}).parentNode;
        if (editorDashRow && typeof ResizeObserver !== 'undefined') {
            /* Idle for a resizer drag: the row is re-laid out every frame and
               the refit answers with a getComputedStyle + four rects. The
               clamp only matters once the drag has settled, so catch up on
               release. The chat resizer's own inline refit call stays live —
               that one IS the drag's clamp. */
            let refitPending = false;
            new ResizeObserver(() => {
                if (document.body.classList.contains('pm-resizing')) { refitPending = true; return; }
                refitEditorDashSplit();
            }).observe(editorDashRow);
            if (window.PM_ON_DRAGEND) window.PM_ON_DRAGEND(() => {
                if (!refitPending) return;
                refitPending = false;
                refitEditorDashSplit();
            });
        }


      document.body.addEventListener('click', (e) => {

        // Close status menu dropdown on click outside
        const statusDrop = document.getElementById('statusMenuDropdown');
        if (statusDrop && statusDrop.classList.contains('visible') && !e.target.closest('.status-menu-wrap')) {
            statusDrop.classList.remove('visible');
        }

        // Click editor tab to make it active (delegated) — skip if tab has its own onclick
        const editorTab = e.target.closest('.editor-tabs .tab');
        if (editorTab && !e.target.closest('.tab-close') && !editorTab.hasAttribute('onclick')) {
            const tabs = editorTab.closest('.editor-tabs');
            if (tabs) {
                tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                editorTab.classList.add('active');
            }
            return;
        }

        // Close editor tab
        const tabCloseBtn = e.target.closest('.tab-close');
        if (tabCloseBtn) {
            const tab = tabCloseBtn.closest('.tab');
            const pane = tab.closest('.editor-pane');
            if (tab) tab.remove();
            
            // If no tabs left in pane, close pane
            if (pane && !pane.querySelector('.tab')) {
                pane.style.display = 'none';
                hideEditorViewIfNoVisiblePanes();
            }
            e.stopPropagation(); // stop click from bubbling
        }
        
        // Click file in file tree to open in correct editor pane
        const fileItem = e.target.closest('.file-tree .file');
        if (fileItem && !e.target.closest('.git-status') && !e.target.closest('.folder')) {
            var filename = fileItem.getAttribute('data-filename') || fileItem.textContent.trim().split(' ')[0];

            // Highlight clicked file in sidebar
            document.querySelectorAll('.file-tree .file').forEach(function(f) { f.classList.remove('file-active'); });
            fileItem.classList.add('file-active');

            // Show editor view
            var edView = document.getElementById('editorView');
            if (edView) edView.style.display = 'flex';

            // Route FILE_DATA files to the correct pane
            var pane1Files = ['app.rs','main.rs','orchestrator.rs','workspace.rs'];
            var pane2Files = ['config.rs','types.rs','errors.rs'];

            if (pane1Files.indexOf(filename) !== -1 && typeof switchEditorPane1Tab === 'function') {
                var pane1 = document.getElementById('editorPane1');
                if (pane1) pane1.style.display = 'flex';
                switchEditorPane1Tab(filename);
            } else if (pane2Files.indexOf(filename) !== -1 && typeof switchEditorPane2CodeTab === 'function') {
                var pane2 = document.getElementById('editorPane2');
                if (pane2) pane2.style.display = 'flex';
                switchEditorPane2CodeTab(filename);
            } else {
                // Fallback for non-FILE_DATA files (Cargo.toml, README.md, etc.)
                var lowerName = filename.toLowerCase();
                var ext = lowerName.includes('.') ? lowerName.split('.').pop() : '';
                var pane1 = document.getElementById('editorPane1');
                if (pane1) {
                    pane1.style.display = 'flex';
                    var tabs = pane1.querySelector('.editor-tabs');
                    if (tabs) {
                        tabs.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
                        var newTab = document.createElement('span');
                        newTab.className = 'tab active';
                        newTab.setAttribute('data-file', filename);
                        newTab.innerHTML = filename + ' <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                        tabs.appendChild(newTab);
                    }
                    var codeTarget = pane1.querySelector('.editor-code');
                    if (codeTarget) {
                        var fakeCode = '// Viewing ' + filename + '\n\n';
                        if (filename === 'Cargo.toml') {
                            fakeCode += '[package]\nname = "puppet-master"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nserde = { version = "1.0", features = ["derive"] }\ntokio = { version = "1.30", features = ["full"] }\nreqwest = { version = "0.11", features = ["json"] }\ntracing = "0.1"\nanyhow = "1"\nclap = { version = "4", features = ["derive"] }\n';
                        } else if (filename === 'README.md') {
                            fakeCode += '# Puppet Master\n\nA modern orchestrator and agentic IDE.\n\n## Quick start\n\ncargo build --release\n./target/release/puppet-master --profile dev\n';
                        } else if (ext === 'rs') {
                            fakeCode += '// Module: ' + filename + '\n\npub struct ComponentState {\n    pub id: String,\n    pub healthy: bool,\n}\n';
                        } else {
                            fakeCode += '// Content for ' + filename + '\n';
                        }
                        codeTarget.innerHTML = fakeCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    }
                }
            }
        }

        const target = e.target.closest('[data-step-target], [data-nav-step]');
        if (target) {
            const attr = target.getAttribute('data-step-target') || target.getAttribute('data-nav-step');
            const step = parseInt(attr);
            if (!isNaN(step)) window.switchWizardStep(step);
        }

        const orchNode = e.target.closest('.orch-rungraph-node');
        const orchRow = e.target.closest('.orch-rungraph-row');
        const orchGraphTarget = orchNode || orchRow;
        if (orchGraphTarget) {
            const nodeId = orchGraphTarget.getAttribute('data-node-id');
            if (nodeId) {
                const container = document.getElementById('orchDagPreview');
                if (container) {
                    container.querySelectorAll('.orch-rungraph-node, .orch-rungraph-row').forEach(el => el.classList.remove('selected'));
                    orchGraphTarget.classList.add('selected');
                    const other = container.querySelector('.orch-rungraph-node[data-node-id="' + nodeId + '"], .orch-rungraph-row[data-node-id="' + nodeId + '"]');
                    if (other && other !== orchGraphTarget) other.classList.add('selected');
                }
                const detailBody = document.getElementById('orchGraphDetailBody');
                if (detailBody && window.orchNodeDetailContent) {
                    const html = window.orchNodeDetailContent[nodeId];
                    detailBody.innerHTML = html != null ? html : '<p class="orch-rungraph-no-selection">No detail for this node.</p>';
                }
            }
        }

                const iconBtn = e.target.closest('.activity-bar .icon');
        if (iconBtn) {
            const title = iconBtn.getAttribute('title');
            const chatPanel = document.getElementById('chatPanel');
            
            if (title === 'Chat') {
                if (chatPanel) chatPanel.classList.toggle('hidden');
                const chatResizer = document.getElementById('chatResizer');
                if (chatResizer) chatResizer.classList.toggle('hidden');
                iconBtn.classList.toggle('active');
                /* the docked panel takes its width off .center-column — refit
                   the split so the editor yields instead of the dashboard */
                refitEditorDashSplit();
            } else if (title === 'Dashboard') {
                const dash = document.getElementById('dashboardView');
                if (dash) {
                    if (dash.style.display === 'none') {
                        dash.style.display = 'flex';
                        iconBtn.classList.add('active');
                    } else {
                        dash.style.display = 'none';
                        iconBtn.classList.remove('active');
                    }
                    const dashResizer = document.getElementById('editorDashResizer');
                    if (dashResizer) dashResizer.style.display = dash.style.display;
                }
            } else {
                const isActive = iconBtn.classList.contains('active');
                document.querySelectorAll('.activity-bar .icon[data-target]').forEach(i => i.classList.remove('active'));
                
                const sidePanelSlot = document.getElementById('sidePanelSlot');
                if (isActive) {
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                    iconBtn.classList.remove('active');
                } else {
                    iconBtn.classList.add('active');
                    const targetId = iconBtn.getAttribute('data-target');
                    const showTarget = () => {
                        document.querySelectorAll('.side-panel-view').forEach(v => v.classList.remove('active'));
                        const targetView = document.getElementById(targetId);
                        if (targetView) targetView.classList.add('active');
                        if (sidePanelSlot) sidePanelSlot.classList.remove('hidden');
                    };
                    /* O55: a click on another section answers first (its icon), the section follows a frame later */
                    if (targetId && e.isTrusted && sidePanelSlot && !sidePanelSlot.classList.contains('hidden') && !window.__pmRailSoon) {
                        window.__pmRailSoon = true;
                        requestAnimationFrame(() => setTimeout(() => { window.__pmRailSoon = false; if (iconBtn.classList.contains('active')) showTarget(); }, 0));
                    } else if (targetId) showTarget();
                }
            }
        }

        const activityBarToggle = e.target.closest('#activityBarToggle');
        if (activityBarToggle) {
            const activityBar = document.getElementById('activityBar');
            if (activityBar) {
                activityBar.classList.toggle('collapsed');
                activityBarToggle.textContent = activityBar.classList.contains('collapsed') ? '>' : '<';
            }
        }
        
        const collapseBottom = e.target.closest('#collapseBottom');
        if (collapseBottom) {
            const bottomPanel = document.getElementById('bottomPanel');
            if (bottomPanel) {
                bottomPanel.classList.toggle('collapsed');
                collapseBottom.setAttribute('aria-expanded', bottomPanel.classList.contains('collapsed') ? 'false' : 'true');
                if (bottomPanel.classList.contains('collapsed')) {
                    bottomPanel.style.height = '';
                    bottomPanel.style.flex = '';
                } else if (window.PM_TERMINAL_DEMO && PM_TERMINAL_DEMO.pm7FlushIfDirty) {
                    PM_TERMINAL_DEMO.pm7FlushIfDirty(); /* PM7 T09 */
                }
            }
        }

      });

      /* ── Browser Tab Switching in Editor Pane 2 ── */
      window.switchEditorPane2Tab = function(tabType) {
        var codeArea = document.getElementById('editorPane2CodeArea');
        var browserContent = document.getElementById('browserTabContent');
        var configTab = document.getElementById('configRsTab');
        var browserTab = document.getElementById('browserPreviewTab');
        var autoTab = document.getElementById('automationBrowserTab');
        var autoBanner = document.getElementById('automationBanner');
        var badge = document.getElementById('browserSessionBadge');
        var addrBar = document.getElementById('browserAddressBar');

        // Deactivate all tabs in pane2
        document.querySelectorAll('#editorPane2 .editor-tabs .tab').forEach(function(t) { t.classList.remove('active'); });

        if (tabType === 'code') {
          if (codeArea) codeArea.style.display = '';
          if (browserContent) browserContent.style.display = 'none';
          if (configTab) configTab.classList.add('active');
        } else if (tabType === 'browser') {
          if (codeArea) codeArea.style.display = 'none';
          if (browserContent) { browserContent.style.display = 'flex'; }
          if (browserTab) browserTab.classList.add('active');
          if (autoBanner) autoBanner.style.display = 'none';
          if (badge) { badge.className = 'browser-session-badge workspace'; badge.textContent = 'workspace_preview'; }
          if (addrBar) addrBar.value = 'http://localhost:3000';
        } else if (tabType === 'automation') {
          if (codeArea) codeArea.style.display = 'none';
          if (browserContent) { browserContent.style.display = 'flex'; }
          if (autoTab) { autoTab.style.display = ''; autoTab.classList.add('active'); }
          if (autoBanner) autoBanner.style.display = 'flex';
          if (badge) { badge.className = 'browser-session-badge automation'; badge.textContent = 'automation_session'; }
          if (addrBar) addrBar.value = 'http://localhost:3000/test-runner';
        }
      };

      /* ── Automation Takeover Handlers ── */
      window.handleTakeover = function(action) {
        var banner = document.getElementById('automationBanner');
        var statusText = document.getElementById('autoStatusText');
        var pulse = document.getElementById('autoPulse');
        var badge = document.getElementById('browserSessionBadge');
        var autoTab = document.getElementById('automationBrowserTab');

        if (action === 'pause') {
          if (statusText) statusText.innerHTML = 'Agent Paused &mdash; User inspecting browser';
          if (pulse) pulse.style.animationPlayState = 'paused';
        } else if (action === 'continue') {
          if (statusText) statusText.innerHTML = 'Agent Controlling Browser &mdash; Running test: login flow verification';
          if (pulse) pulse.style.animationPlayState = 'running';
        } else if (action === 'stop') {
          if (banner) banner.style.display = 'none';
          if (badge) { badge.className = 'browser-session-badge workspace'; badge.textContent = 'workspace_preview'; }
          if (autoTab) autoTab.style.display = 'none';
          // Re-activate the browser preview tab
          document.querySelectorAll('#editorPane2 .editor-tabs .tab').forEach(function(t) { t.classList.remove('active'); });
          var browserTab = document.getElementById('browserPreviewTab');
          if (browserTab) browserTab.classList.add('active');
        }
      };

      /* ── Toggle Automation Mode (demo button) ── */
      window.toggleAutomationMode = function() {
        var autoTab = document.getElementById('automationBrowserTab');
        if (autoTab && autoTab.style.display === 'none') {
          autoTab.style.display = '';
          switchEditorPane2Tab('automation');
        } else {
          switchEditorPane2Tab('browser');
          if (autoTab) autoTab.style.display = 'none';
        }
      };

      /* ── Browser Context to Chat (Composer Chips) ── */
      window.addBrowserChipToChat = function(chipType, label) {
        var chip = document.createElement('span');
        chip.className = 'composer-chip ' + chipType;
        chip.innerHTML = label + ' <span class="close-chip" onclick="this.parentElement.remove()">&times;</span>';
        document.querySelectorAll('.composer-chips-container').forEach(function(c) {
          c.appendChild(chip.cloneNode(true));
        });
        // Re-attach close handlers on cloned chips
        document.querySelectorAll('.composer-chip .close-chip').forEach(function(btn) {
          btn.onclick = function() { this.parentElement.remove(); };
        });
      };

      /* ── Bottom Panel Tab Switching ── */
      window.switchBottomTab = function(tabName) {
        document.querySelectorAll('.bottom-tabs-left .tab').forEach(function(t) {
          var on = t.getAttribute('data-bottom-tab') === tabName;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.setAttribute('tabindex', on ? '0' : '-1');
        });
        var map = {
          terminal: 'bottomTerminalHost',
          problems: 'bottomProblemsHost',
          output: 'bottomOutputHost',
          ports: 'bottomPortsHost',
          browser: 'bottomBrowserContent',
          debug: 'bottomDebugHost'
        };
        Object.keys(map).forEach(function(key) {
          var el = document.getElementById(map[key]);
          if (!el) return;
          el.classList.toggle('active', key === tabName);
        });
        if (window.PM_TERMINAL_DEMO && typeof PM_TERMINAL_DEMO.syncTerminalTabBar === 'function') {
          PM_TERMINAL_DEMO.syncTerminalTabBar(tabName);
        }
      };

      window.toggleBottomBrowserTab = function() {
        switchBottomTab('browser');
      };

      /* ── Browser Bottom Sub-tab Switching (Console/Network/Evidence) ── */
      window.switchBrowserSubtab = function(subtab) {
        document.querySelectorAll('.browser-bottom-subtabs .subtab').forEach(function(t) {
          t.classList.toggle('active', t.getAttribute('data-browser-subtab') === subtab);
        });
        var console = document.getElementById('browserConsolePane');
        var network = document.getElementById('browserNetworkPane');
        var evidence = document.getElementById('browserEvidencePane');
        if (console) console.style.display = subtab === 'console' ? '' : 'none';
        if (network) network.style.display = subtab === 'network' ? '' : 'none';
        if (evidence) evidence.style.display = subtab === 'evidence' ? '' : 'none';
      };

      /* ── Fake Website Element Pick on Click ── */
      document.addEventListener('click', function(e) {
        var pickable = e.target.closest('[data-pickable]');
        if (pickable && pickable.closest('.browser-viewport')) {
          e.preventDefault();
          var tag = pickable.tagName.toLowerCase();
          var cls = pickable.className ? '.' + pickable.className.split(' ')[0] : '';
          addBrowserChipToChat('element-pick', '&lt;' + tag + cls + '&gt;');
          // Brief flash feedback
          pickable.style.outline = '2px solid #64ffda';
          setTimeout(function() { pickable.style.outline = ''; }, 600);
        }
      });

      document.querySelectorAll('.editor-tabs .tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          // Scope active to this panel only
          var container = this.closest('.editor-tabs');
          container.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
          // Focus is global — only one tab glows across all panels
          document.querySelectorAll('.editor-tabs .tab.tab-focused').forEach(function(t) { t.classList.remove('tab-focused'); });
          this.classList.add('tab-focused');
        });
      });
      // Set initial focus on first active tab
      var firstActive = document.querySelector('.editor-tabs .tab.active');
      if (firstActive) firstActive.classList.add('tab-focused');

      // Agent-Config section switching
      document.querySelectorAll('.ac-nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          var tab = this.getAttribute('data-ac-tab');
          document.querySelectorAll('.ac-nav-item').forEach(function(n) { n.classList.remove('active'); });
          this.classList.add('active');
          document.querySelectorAll('.ac-section').forEach(function(s) { s.classList.remove('active'); });
          var target = document.getElementById('ac-' + tab);
          if (target) target.classList.add('active');
        });
      });

      document.querySelectorAll('.page-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          const pageId = this.getAttribute('data-page');
          if (!pageId) return;
          if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') return;   /* O55: PM_PAGES switches */
          document.querySelectorAll('.page-tab').forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
          document.querySelectorAll('.primary-content > .page').forEach(function(p) {
            p.classList.toggle('active', p.classList.contains('page-' + pageId));
          });
          document.querySelectorAll('.page-tab').forEach(function(t) {
            t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
          });
        });

        tab.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            this.click();
          }
        });
      });


      // Theme Switcher — title-bar sprout menu (PM_THEME); keep change bridge for legacy listeners
      const themeSelect = document.getElementById('themeSelect');
      if (themeSelect) {
          themeSelect.addEventListener('change', function() {
              var v = this.getAttribute('data-value') || this.value;
              var pm = /^([a-z]+)-(light|dark)$/.exec(v || '');
              if (pm) v = (function(f){try{var p=typeof window.PM_THEME_PAINT_FAMILY==='function'?window.PM_THEME_PAINT_FAMILY(f):f;return /^(friendly|glass|retro|basic)$/.test(p)?p:f;}catch(e){return f;}})(pm[1]) + '-' + pm[2];
              if (v) document.documentElement.setAttribute('data-theme', v);
          });
      }

      // Settings Inspector Panel Logic (Advanced Settings)
      document.querySelectorAll('.orch-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          const tabId = this.getAttribute('data-tab');
          if (!tabId) return;
          const parent = this.closest('.page-orchestrator');
          if (!parent) return;
          parent.querySelectorAll('.orch-tab').forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
          parent.querySelectorAll('.orch-tab-content').forEach(function(c) {
            c.classList.remove('active');
            if (c.getAttribute('data-tab') === tabId) { c.classList.add('active'); }
          });

          parent.querySelectorAll('.orch-tab').forEach(function(t) {
            t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
          });
        });

        tab.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            this.click();
          }
        });
      });

      window.switchWizardStep(0);
    });
    