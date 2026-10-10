/* The Browser kind (D9; CONTRACT sections 2, 3 and 5; digest 05 sections 8.2 and 11). Ids:
     browser:<n>                 a browser the "+" menu, Ctrl+Shift+B, the Ports tab or an agent opened
     link:<enc host>|<enc title> the chat's fetched-page record (app.js:1387); the label is the decoded title
   The shared header row holds back, forward, reload and the address field, then the capture toolbar (Full screenshot,
   Region screenshot, Select component, DevTools) and the session text toggle (Ordinary / Protected sign-in). DevTools
   docks inside the tab, never a modal: on the right while the body is at least 900 px wide, below it otherwise, with
   Details / DevTools / Captures sections. Pages are fixtures drawn in HTML and CSS (nothing is fetched): the Tastebook
   app on localhost:5173, the app.internal dashboards, the PostgreSQL docs and wiki pages the chat's link: ids name, a
   sign-in page for the protected session, and a quiet page for any other address. The 5.6 Pro chat's capture dialog
   (browser-capture.js) is the content reference; its pills became text, its stale side stripe a glyph and a word. */

var SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs, kids) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (var s in v) el.style.setProperty(s, v[s]); }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  return add(el, kids);
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? document.createTextNode(String(kids)) : kids);
  return el;
}
function ico(name, size) { return PMW.icon(name, { size: size || 14 }); }
function dec(s) { try { return decodeURIComponent(s); } catch (_) { return s; } }
function enc(s) { return encodeURIComponent(s); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clockNow() { var d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
function saveSoon() { try { if (PMW.persist && PMW.persist.saveSoon) PMW.persist.saveSoon(); } catch (_) {} }
/* a status glyph drawn in SVG (never a character): error, warn, info, ok */
var MARKS = {
  error: 'M8 2.2a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 8 2.2zM5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2',
  warn: 'M8 2.4 14 13.2H2zM8 6.6v3.2M8 11.3v.1',
  info: 'M8 2.2a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 8 2.2zM8 7.3v4M8 5v.1',
  ok: 'M3.5 8.5l3 3 6-7'
};
function mark(kind, size) {
  var s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('width', size || 12); s.setAttribute('height', size || 12);
  s.setAttribute('class', 'pmw-br-mark is-' + kind); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', MARKS[kind] || MARKS.info); s.appendChild(p);
  return s;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Addresses                                                                                                            */
/* ------------------------------------------------------------------------------------------------------------------ */

/* 'http://localhost:5173/' -> 'localhost:5173/'; the key a fixture page matches on (no scheme, no query, no hash) */
function addrKey(url) {
  var s = String(url || '').trim().replace(/^[a-z]+:\/\//i, '').replace(/[?#].*$/, '');
  var slash = s.indexOf('/');
  var host = (slash < 0 ? s : s.slice(0, slash)).toLowerCase().replace(/^www\./, '');
  var path = slash < 0 ? '/' : s.slice(slash);
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return host + path;
}
/* what the user typed -> a full address ('localhost:5173' -> 'http://localhost:5173/') or null when it is not one */
function toUrl(typed) {
  var s = String(typed || '').trim();
  if (!s || /\s/.test(s)) return s ? 'search:' + s : null;
  if (/^[a-z]+:\/\//i.test(s)) return s;
  var local = /^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(s) || /\.internal(\/|:|$)/i.test(s);
  return (local ? 'http://' : 'https://') + s + (s.indexOf('/') < 0 ? '/' : '');
}
function shortUrl(url) { return String(url || '').replace(/^https?:\/\//i, '').replace(/\/$/, ''); }

/* link:<enc host>|<enc title> (the chat's grammar, app.js:1355) */
function parseLink(id) {
  var rest = String(id || '').slice(5);
  var bar = rest.indexOf('|');
  return { host: dec(bar < 0 ? rest : rest.slice(0, bar)), title: bar < 0 ? '' : dec(rest.slice(bar + 1)) };
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Fixture content                                                                                                      */
/* ------------------------------------------------------------------------------------------------------------------ */

var RECIPES = [
  { slug: 'miso-butter-salmon', title: 'Miso Butter Salmon', mins: 24, rating: '4.8', cooks: 212, serves: 2,
    art: { f1: '#f08a5d', f2: '#7fb069', f3: '#f6e7cb', t1: '#3b4a3f', t2: '#1f2a24' },
    ingredients: ['2 salmon fillets, skin on', '1 1/2 tbsp white miso', '2 tbsp soft butter', '1 tsp honey', '1 lime', '2 spring onions'],
    steps: ['Heat the oven to 220 °C and line a tray.', 'Mash the miso, butter and honey together.', 'Spread it over the salmon and roast for 12 minutes.', 'Finish with lime juice and sliced spring onion.'] },
  { slug: 'green-curry-ramen', title: 'Green Curry Ramen', mins: 35, rating: '4.6', cooks: 98, serves: 2,
    art: { f1: '#c9d36a', f2: '#e85d4a', f3: '#fff3d1', t1: '#2f3e46', t2: '#1b262c' },
    ingredients: ['2 nests of ramen', '2 tbsp green curry paste', '400 ml coconut milk', '1 1/2 cups stock', '1 handful pak choi', '2 soft eggs'],
    steps: ['Fry the curry paste for a minute.', 'Add the coconut milk and stock; simmer for 8 minutes.', 'Cook the noodles and the pak choi.', 'Serve with halved soft eggs.'] },
  { slug: 'one-pan-shakshuka', title: 'One-Pan Shakshuka', mins: 18, rating: '4.9', cooks: 341, serves: 3,
    art: { f1: '#d64933', f2: '#fff6e0', f3: '#f2b134', t1: '#5b3a29', t2: '#2a1b14' },
    ingredients: ['1 onion', '2 peppers', '1 tin chopped tomatoes', '1 1/2 tsp cumin', '4 eggs', 'feta and parsley'],
    steps: ['Soften the onion and peppers.', 'Add the cumin and tomatoes; cook down for 6 minutes.', 'Make four wells and crack in the eggs.', 'Cover until the whites set; top with feta.'] },
  { slug: 'sheet-pan-gnocchi', title: 'Sheet-Pan Gnocchi', mins: 30, rating: '4.7', cooks: 167, serves: 4,
    art: { f1: '#f1d18a', f2: '#c0392b', f3: '#6aa84f', t1: '#44403c', t2: '#1c1917' },
    ingredients: ['500 g gnocchi', '300 g cherry tomatoes', '1 red onion', '2 tbsp olive oil', 'basil', 'parmesan'],
    steps: ['Heat the oven to 220 °C.', 'Toss everything with the oil on one tray.', 'Roast for 25 minutes, turning once.', 'Finish with basil and parmesan.'] },
  { slug: 'lemon-ricotta-pancakes', title: 'Lemon Ricotta Pancakes', mins: 20, rating: '4.5', cooks: 76, serves: 2,
    art: { f1: '#f3d27a', f2: '#fdf6e3', f3: '#5b8bd9', t1: '#8fb8de', t2: '#4a6fa5' },
    ingredients: ['1 cup ricotta', '2 eggs', '3/4 cup flour', '1 lemon, zested', '1 tbsp sugar', 'blueberries'],
    steps: ['Whisk the ricotta, eggs, zest and sugar.', 'Fold in the flour.', 'Cook small rounds in a buttered pan.', 'Serve with blueberries.'] },
  { slug: 'smoky-black-bean-chili', title: 'Smoky Black Bean Chili', mins: 45, rating: '4.7', cooks: 189, serves: 6,
    art: { f1: '#7a2e1f', f2: '#f4d35e', f3: '#f7f3e3', t1: '#3d2b1f', t2: '#1d140e' },
    ingredients: ['2 tins black beans', '1 onion', '2 chipotles in adobo', '1 tin tomatoes', '1 1/2 tsp smoked paprika', 'sour cream'],
    steps: ['Soften the onion.', 'Add the chipotles, paprika and tomatoes.', 'Add the beans and simmer for 30 minutes.', 'Serve with sour cream.'] }
];
function recipeBy(slug) { for (var i = 0; i < RECIPES.length; i++) if (RECIPES[i].slug === slug) return RECIPES[i]; return null; }

var TB = 'http://localhost:5173';
var TB_CONSOLE = [
  ['info', '[vite] connected. hmr ready in 213ms'],
  ['log', 'console.log("Tastebook web booted")'],
  ['info', '[vite] hmr update /src/lib/RecipeCard.svelte'],
  ['log', 'fetch: GET /api/recipes -> 200 (12ms)'],
  ['log', 'fetch: GET /api/session -> 200 (6ms)'],
  ['warn', 'image-processing: thumbnails falling back to the full-size photo'],
  ['log', 'fetch: POST /api/import -> 202 (141ms)'],
  ['error', 'import poll: /api/import/task-91 422 (quantity parse)'],
  ['log', 'fetch: GET /api/recipes/rec-208 -> 200 (18ms)']
];
var TB_NET = [
  ['200', 'GET', '/', '38 ms', '3.1 KB'], ['200', 'GET', '/assets/app.css', '16 ms', '1.2 KB'],
  ['200', 'GET', '/assets/bundle.js', '54 ms', '139 KB'], ['200', 'GET', '/api/recipes', '12 ms', '2.4 KB'],
  ['202', 'POST', '/api/import', '141 ms', '310 B'], ['304', 'GET', '/favicon.svg', '3 ms', '0 B'],
  ['422', 'GET', '/api/import/task-91', '24 ms', '96 B'], ['200', 'GET', '/api/recipes/rec-208', '18 ms', '1.1 KB']
];
var DASH_CONSOLE = [
  ['log', 'GET /api/queries/tenant_9821 200 482ms'],
  ['warn', 'Query plan missing covering index for tenant_id, created_at'],
  ['log', 'Rendered <QueryTable> · 3 rows · 1 hot row']
];
var DASH_NET = [
  ['200', 'GET', '/dashboards/query-performance', '41 ms', '6.2 KB'], ['200', 'GET', '/static/app.js', '63 ms', '212 KB'],
  ['200', 'GET', '/api/queries?window=24h', '88 ms', '12 KB'], ['200', 'GET', '/api/queries/tenant_9821', '482 ms', '3.1 KB']
];

/* the PostgreSQL pages the chat's working rows read (data.js:361-410); short paraphrases, never the live docs */
var PG_DOCS = {
  'postgresql.org/docs/16/indexes-multicolumn.html': {
    title: 'PostgreSQL 16 · Multicolumn Indexes', head: '11.3. Multicolumn Indexes', chapter: 'Chapter 11. Indexes',
    body: [
      ['p', 'An index can be defined on more than one column of a table. Given a table like this:'],
      ['pre', 'CREATE TABLE test2 (\n  major int,\n  minor int,\n  name varchar\n);'],
      ['p', 'If queries often filter on both columns, for example WHERE major = 1 AND minor = 2, one index can serve them:'],
      ['pre', 'CREATE INDEX test2_mm_idx ON test2 (major, minor);'],
      ['p', 'A multicolumn B-tree index can be used with conditions that involve any subset of its columns, but it is most efficient when there are constraints on the leading (leftmost) columns.'],
      ['p', 'Use multicolumn indexes sparingly. Most of the time an index on one column is enough, and it saves space and time on every write.']
    ] },
  'postgresql.org/docs/16/indexes-index-only-scans.html': {
    title: 'PostgreSQL 16 · Index-Only Scans', head: '11.9. Index-Only Scans and Covering Indexes', chapter: 'Chapter 11. Indexes',
    body: [
      ['p', 'An index-only scan answers a query from the index alone, without visiting the table, when every column the query needs is stored in the index.'],
      ['p', 'It can skip the table only for pages the visibility map marks all-visible; recently written pages still need a visit.'],
      ['pre', 'CREATE INDEX idx_events_tenant_created\n  ON events (tenant_id, created_at) INCLUDE (kind);'],
      ['p', 'Every index costs something on each insert: the table row is written once and every index on the table is updated with it.']
    ] },
  'postgresql.org/docs/16/sql-createindex.html': {
    title: 'CREATE INDEX CONCURRENTLY reference', head: 'CREATE INDEX', chapter: 'SQL Commands',
    body: [
      ['p', 'CREATE INDEX CONCURRENTLY builds the index without locking out writes to the table.'],
      ['pre', 'CREATE INDEX CONCURRENTLY idx_events_tenant_created\n  ON events (tenant_id, created_at DESC);'],
      ['p', 'It scans the table twice and waits for transactions that could use the index to finish, so it takes longer, and it cannot run inside a transaction block.']
    ] },
  'postgresql.org/docs/16/routine-vacuuming.html': {
    title: 'PostgreSQL 16 · Routine Vacuuming', head: '25.1. Routine Vacuuming', chapter: 'Chapter 25. Routine Database Maintenance Tasks',
    body: [
      ['p', 'The autovacuum daemon runs ANALYZE on a table when the number of rows changed since the last one exceeds the analyze threshold plus a fraction of the table.'],
      ['pre', 'autovacuum_analyze_threshold = 50\nautovacuum_analyze_scale_factor = 0.1'],
      ['p', 'A large new index does not change those counts; run ANALYZE yourself after building one if the planner should see it at once.']
    ] },
  'postgresql.org/docs/16/storage-vm.html': {
    title: 'PostgreSQL 16 · Visibility Map', head: '73.4. Visibility Map', chapter: 'Chapter 73. Database Physical Storage',
    body: [
      ['p', 'Each table has a visibility map that tracks which pages hold only rows known to be visible to every active transaction.'],
      ['p', 'Vacuum sets those bits. Index-only scans use them to skip pages, so a table with heavy writes and a lazy autovacuum gets fewer of them than its plan suggests.']
    ] },
  'wiki.postgresql.org/wiki/index_maintenance': {
    wiki: true, title: 'Locking notes for concurrent index builds', head: 'Locking notes for concurrent index builds',
    body: [
      ['p', 'CREATE INDEX CONCURRENTLY scans the table twice and waits for existing transactions, so it cannot run inside a transaction block.'],
      ['p', 'If a concurrent build fails, it leaves an invalid index behind. Find it, drop it and build again:'],
      ['pre', 'SELECT indexrelid::regclass\n  FROM pg_index\n WHERE NOT indisvalid;'],
      ['p', 'Long-running transactions delay the second scan; check pg_stat_activity before you start.']
    ] },
  'wiki.postgresql.org/wiki/index-only_scans': {
    wiki: true, title: 'Index-only scans', head: 'Index-only scans',
    body: [
      ['p', 'Vacuum sets the all-visible bits; a table with heavy writes and a lazy autovacuum gets fewer index-only scans than its plan suggests.'],
      ['p', 'EXPLAIN (ANALYZE) reports Heap Fetches: the number of rows that still had to be read from the table.']
    ] }
};
var DOC_BY_TITLE = {};
Object.keys(PG_DOCS).forEach(function (k) { DOC_BY_TITLE[PG_DOCS[k].title] = k; });
DOC_BY_TITLE['PostgreSQL 16 · Index-Only Scans'] = 'postgresql.org/docs/16/indexes-index-only-scans.html';

/* the agent-access policy rows (BROWSER-008, browser-capture.js); Off -> Ask -> On */
var POLICY = [
  ['nav', 'Navigation', 'on'], ['tabs', 'Tabs and frames', 'on'], ['dom', 'Page structure and components', 'on'], ['css', 'Styles', 'on'],
  ['console', 'Console', 'on'], ['network', 'Network', 'ask'], ['maps', 'Source maps and files', 'on'], ['perf', 'Performance', 'ask'],
  ['storage', 'Storage and cookies', 'ask'], ['shots', 'Screenshots and recording', 'on'], ['forms', 'Form input', 'ask'],
  ['downloads', 'Downloads', 'ask'], ['viewport', 'Viewport and device sizes', 'on'], ['simulate', 'Request simulation', 'off']
];
var POLICY_WORD = { on: 'On', ask: 'Ask', off: 'Off' };
var POLICY_NEXT = { off: 'ask', ask: 'on', on: 'off' };

/* ------------------------------------------------------------------------------------------------------------------ */
/* Fixture pages. Each builder returns the page element; elements carry data-el (what DevTools shows), data-c and     */
/* data-src (the component and its source, for Select component) and data-go (an address a click navigates to).       */
/* ------------------------------------------------------------------------------------------------------------------ */

function E(tag, el, kids, extra) {
  var a = Object.assign({ 'data-el': el }, extra || {});
  return h(tag, a, kids);
}
function C(name, src) { return { 'data-c': name, 'data-src': src }; }

function tbFrame(body, active) {
  function link(text, url, on) { return E('a', 'a.navlink', text, { class: 'pmw-br-tb-link' + (on ? ' is-on' : ''), 'data-go': url, href: '#' }); }
  return E('div', 'div.app', [
    E('nav', 'nav.topbar', [
      E('a', 'a.brand', [h('span', { class: 'pmw-br-tb-logo', 'aria-hidden': 'true' }), 'Tastebook'], { class: 'pmw-br-tb-brand', 'data-go': TB + '/', href: '#' }),
      E('div', 'div.links', [link('Explore', TB + '/', active === 'home'), link('Import', TB + '/import', active === 'import'),
        E('button', 'button.signin', 'Sign in', Object.assign({ class: 'pmw-br-tb-signin', type: 'button' }, C('SignInButton', 'web/src/lib/Editor.svelte:22:3')))], { class: 'pmw-br-tb-links' })
    ], Object.assign({ class: 'pmw-br-tb-nav' }, C('TopBar', 'web/src/routes/+layout.svelte:8:3'))),
    body,
    E('footer', 'footer', ['© 2026 Tastebook · ', h('span', { class: 'pmw-br-tb-flink', text: 'Privacy' }), ' · ', h('span', { class: 'pmw-br-tb-flink', text: 'Terms' })],
      Object.assign({ class: 'pmw-br-tb-foot' }, C('Footer', 'web/src/routes/+layout.svelte:40:3')))
  ], { class: 'pmw-br-site pmw-br-tb' });
}
function photo(r, cls) {
  var st = {};
  Object.keys(r.art).forEach(function (k) { st['--' + k] = r.art[k]; });
  return E('div', 'div.photo', null, { class: 'pmw-br-tb-photo' + (cls ? ' ' + cls : ''), style: st, role: 'img', 'aria-label': r.title });
}
function tbHome() {
  var grid = E('div', 'div.grid', RECIPES.map(function (r) {
    return E('a', 'a.card', [
      photo(r),
      E('h3', 'h3', r.title),
      E('p', 'p.meta', r.mins + ' min · ' + r.rating + ' from ' + r.cooks + ' cooks', { class: 'pmw-br-tb-meta' })
    ], Object.assign({ class: 'pmw-br-tb-card', 'data-go': TB + '/recipes/' + r.slug, href: '#' }, C('RecipeCard', 'web/src/lib/RecipeCard.svelte:5:1')));
  }), Object.assign({ class: 'pmw-br-tb-grid' }, C('RecipeGrid', 'web/src/routes/+page.svelte:31:3')));
  return tbFrame(E('main', 'main', [
    E('section', 'section.hero', [
      E('h1', 'h1', 'Share recipes you actually cook'),
      E('p', 'p.lede', 'Save, remix and rate dishes from cooks you trust.'),
      E('button', 'button.cta', 'Start a cookbook', { class: 'pmw-br-tb-cta', type: 'button' })
    ], Object.assign({ class: 'pmw-br-tb-hero' }, C('Hero', 'web/src/routes/+page.svelte:14:3'))),
    E('h2', 'h2', 'Popular this week', { class: 'pmw-br-tb-h2' }),
    grid,
    E('section', 'section.import', [
      E('span', 'span', 'Found a recipe online? Paste its address and Tastebook brings in the ingredients for you.'),
      E('a', 'a.button', 'Import from a link', { class: 'pmw-br-tb-dark', 'data-go': TB + '/import', href: '#' })
    ], Object.assign({ class: 'pmw-br-tb-banner' }, C('ImportBanner', 'web/src/routes/+page.svelte:52:3')))
  ], { class: 'pmw-br-tb-main' }), 'home');
}
function tbRecipe(r) {
  var src = 'web/src/routes/recipes/[slug]/+page.svelte';
  return tbFrame(E('main', 'main', [
    E('p', 'p.crumbs', [E('a', 'a', 'Explore', { 'data-go': TB + '/', href: '#', class: 'pmw-br-tb-crumb' }), ' / ' + r.title], { class: 'pmw-br-tb-crumbs' }),
    E('h1', 'h1', r.title, { class: 'pmw-br-tb-title' }),
    E('p', 'p.meta', r.mins + ' min · serves ' + r.serves + ' · ' + r.rating + ' from ' + r.cooks + ' cooks', { class: 'pmw-br-tb-meta' }),
    photo(r, 'is-hero'),
    E('div', 'div.columns', [
      E('section', 'section.ingredients', [E('h2', 'h2', 'Ingredients'), E('ul', 'ul', r.ingredients.map(function (t) { return E('li', 'li', t); }))],
        Object.assign({ class: 'pmw-br-tb-ing' }, C('IngredientList', src + ':28:5'))),
      E('section', 'section.steps', [E('h2', 'h2', 'Method'), E('ol', 'ol', r.steps.map(function (t) { return E('li', 'li', t); }))],
        Object.assign({ class: 'pmw-br-tb-steps' }, C('StepList', src + ':41:5')))
    ], { class: 'pmw-br-tb-cols' }),
    E('button', 'button.save', 'Save recipe', Object.assign({ class: 'pmw-br-tb-cta is-solid', type: 'button' }, C('SaveButton', src + ':60:5')))
  ], Object.assign({ class: 'pmw-br-tb-main is-recipe' }, C('RecipePage', src + ':12:1'))), 'home');
}
function tbImport() {
  var src = 'web/src/routes/import/+page.svelte';
  return tbFrame(E('main', 'main', [
    E('h1', 'h1', 'Import a recipe from anywhere', { class: 'pmw-br-tb-title' }),
    E('p', 'p.lede', 'Paste a link and Tastebook pulls in the ingredients, steps and photos for you.', { class: 'pmw-br-tb-meta' }),
    E('div', 'form.import', [
      E('div', 'input.source-url', 'seriouseats.com/recipe/pan-pizza', { class: 'pmw-br-tb-input' }),
      E('button', 'button.import-submit', 'Import recipe', { class: 'pmw-br-tb-cta is-solid', type: 'button' })
    ], Object.assign({ class: 'pmw-br-tb-form' }, C('ImportForm', src + ':9:3'))),
    E('div', 'div.error', [
      E('strong', 'strong', 'We could not read one quantity.'),
      E('span', 'span', ' “1 1/2 cup” on line 3 stopped the import. Fix the line or import the recipe without it.')
    ], Object.assign({ class: 'pmw-br-tb-error', role: 'alert' }, C('ImportError', src + ':30:5'))),
    E('aside', 'aside', 'Mixed quantities like 1 1/2 cup are normalized on import.', { class: 'pmw-br-tb-aside' })
  ], { class: 'pmw-br-tb-main is-narrow' }), 'import');
}

function dashPage() {
  var bars = [38, 62, 45, 82, 56, 91, 68];
  var rows = [['tenant_4471', '96 ms', 'Stable', false], ['tenant_8123', '121 ms', 'Stable', false], ['tenant_9821', '482 ms', 'Needs index', true]];
  return E('div', 'div.dashboard', [
    E('header', 'header', [
      E('h1', 'h1', 'Query Performance'),
      E('p', 'p.crumbs', [E('a', 'a', 'Dashboards', { 'data-go': 'http://app.internal/dashboards', href: '#', class: 'pmw-br-dash-crumb' }), ' / Query Performance'],
        Object.assign({ class: 'pmw-br-dash-crumbs' }, C('Breadcrumb', 'src/features/dashboard/Header.tsx:18:5')))
    ], Object.assign({ class: 'pmw-br-dash-head' }, C('DashboardHeader', 'src/features/dashboard/Header.tsx:12:3'))),
    E('div', 'div.filters', [
      E('button', 'button.filter', 'Tenant: All', Object.assign({ class: 'pmw-br-dash-chip', type: 'button' }, C('TenantFilter', 'src/features/dashboard/FilterToolbar.tsx:22:5'))),
      E('button', 'button.filter', 'Last 24h', Object.assign({ class: 'pmw-br-dash-chip', type: 'button' }, C('WindowFilter', 'src/features/dashboard/FilterToolbar.tsx:31:5')))
    ], Object.assign({ class: 'pmw-br-dash-filters' }, C('FilterToolbar', 'src/features/dashboard/FilterToolbar.tsx:9:3'))),
    E('div', 'div.stats', [['Queries a minute', '1,840'], ['Cache hits', '92 %'], ['Slowest tenant', 'tenant_9821']].map(function (t) {
      return E('div', 'div.stat', [h('span', { text: t[0] }), h('b', { text: t[1] })], { class: 'pmw-br-dash-stat' });
    }), Object.assign({ class: 'pmw-br-dash-stats' }, C('StatRow', 'src/features/dashboard/StatRow.tsx:11:3'))),
    E('section', 'section.chart', [
      E('strong', 'strong', 'p95 482 ms'),
      E('div', 'div.bars', bars.map(function (v) { return h('i', { style: { height: v + '%' } }); }), { class: 'pmw-br-dash-bars', 'aria-hidden': 'true' })
    ], Object.assign({ class: 'pmw-br-dash-chart' }, C('LatencyChart', 'src/features/dashboard/LatencyChart.tsx:44:3'))),
    E('div', 'table.queries', rows.map(function (r) {
      return E('div', 'tr', [
        h('span', { class: 'pmw-br-dash-cell', text: r[0] + ' · ' + r[1] + ' · ' + r[2] }),
        r[3] ? E('button', 'button.retry', 'Retry', Object.assign({ class: 'pmw-br-dash-retry', type: 'button' }, C('RetryButton', 'src/features/dashboard/QueryRow.tsx:52:9'))) : null
      ], Object.assign({ class: 'pmw-br-dash-row' + (r[3] ? ' is-hot' : '') }, C('QueryRow', 'src/features/dashboard/QueryRow.tsx:40:5')));
    }), Object.assign({ class: 'pmw-br-dash-table' }, C('QueryTable', 'src/features/dashboard/QueryTable.tsx:15:3'))),
    E('p', 'p.note', 'Captured 3 traces this session.', Object.assign({ class: 'pmw-br-dash-note' }, C('StatusNote', 'src/features/dashboard/StatusNote.tsx:7:3')))
  ], { class: 'pmw-br-site pmw-br-dash' });
}
function dashIndex() {
  var list = [['Query performance', 'http://app.internal/dashboards/query-performance', 'p95 482 ms · 1 query needs an index'],
    ['Import worker', 'http://app.internal/dashboards/import-worker', '91 tasks today · 1 failed'],
    ['Image pipeline', 'http://app.internal/dashboards/image-pipeline', 'thumbnails 98 % on time']];
  return E('div', 'div.dashboard', [
    E('header', 'header', [E('h1', 'h1', 'Dashboards')], { class: 'pmw-br-dash-head' }),
    E('div', 'ul.boards', list.map(function (d) {
      return E('a', 'a.board', [h('b', { text: d[0] }), h('span', { text: d[2] })], { class: 'pmw-br-dash-board', 'data-go': d[1], href: '#' });
    }), { class: 'pmw-br-dash-boards' })
  ], { class: 'pmw-br-site pmw-br-dash' });
}

function pgPage(key, doc, titleFallback) {
  var d = doc || { title: titleFallback || 'PostgreSQL documentation', head: titleFallback || 'PostgreSQL documentation', chapter: 'Documentation',
    body: [['p', 'This page was recorded when an agent read it. Its text is not part of this demo.']] };
  var body = d.body.map(function (b) {
    return b[0] === 'pre' ? E('pre', 'pre.programlisting', b[1], { class: 'pmw-br-pg-pre' }) : E('p', 'p', b[1]);
  });
  if (d.wiki) {
    return E('div', 'div.wiki', [
      E('aside', 'div.mw-panel', [h('b', { class: 'pmw-br-wiki-logo', text: 'PostgreSQL wiki' }),
        h('span', { text: 'Main page' }), h('span', { text: 'Recent changes' }), h('span', { text: 'Random page' })], { class: 'pmw-br-wiki-side' }),
      E('article', 'div.content', [E('h1', 'h1.firstHeading', d.head), E('p', 'p.sub', 'From PostgreSQL wiki', { class: 'pmw-br-wiki-from' })].concat(body), { class: 'pmw-br-wiki-main' })
    ], { class: 'pmw-br-site pmw-br-wiki' });
  }
  return E('div', 'div.pg-content', [
    E('header', 'header.pg-header', [
      h('span', { class: 'pmw-br-pg-logo', 'aria-hidden': 'true' }), h('b', { text: 'PostgreSQL' }),
      E('nav', 'nav', ['Home', 'About', 'Download', 'Documentation', 'Community'].map(function (t) { return h('span', { text: t }); }), { class: 'pmw-br-pg-nav' })
    ], { class: 'pmw-br-pg-head' }),
    E('main', 'div.doc-content', [
      E('p', 'p.crumbs', 'Documentation › PostgreSQL 16 › ' + d.chapter, { class: 'pmw-br-pg-crumbs' }),
      E('h1', 'h1.title', d.head)
    ].concat(body).concat([
      E('p', 'div.navfooter', 'Prev · Up · Next', { class: 'pmw-br-pg-foot' })
    ]), { class: 'pmw-br-pg-main' })
  ], { class: 'pmw-br-site pmw-br-pg' });
}

function apiHealth() {
  return E('div', 'pre', [E('pre', 'pre', '{\n  "status": "ok",\n  "service": "tastebook-api",\n  "version": "1.2.0",\n  "database": "connected",\n  "queue": { "pending": 0, "failed_today": 1 }\n}', { class: 'pmw-br-raw-pre' })],
    { class: 'pmw-br-site pmw-br-raw' });
}

function ssoPage() {
  return E('div', 'div.sso', [
    E('div', 'form.signin', [
      h('span', { class: 'pmw-br-sso-logo', 'aria-hidden': 'true' }),
      E('h1', 'h1', 'Sign in'),
      E('p', 'p', 'Use your Example account to continue to Tastebook.'),
      E('div', 'input.email', 'jared@tastebook.dev', { class: 'pmw-br-sso-field' }),
      E('div', 'input.password', '············', { class: 'pmw-br-sso-field is-secret' }),
      E('button', 'button.submit', 'Continue', { class: 'pmw-br-sso-btn', type: 'button' }),
      E('p', 'p.fine', 'Protected by Example SSO', { class: 'pmw-br-sso-fine' })
    ], { class: 'pmw-br-sso-card' })
  ], { class: 'pmw-br-site pmw-br-sso' });
}

function notInDemo(url) {
  return h('div', { class: 'pmw-br-site pmw-br-nf' }, [
    h('div', { class: 'pmw-br-nf-box' }, [
      ico('browser', 28),
      h('p', { class: 'pmw-br-nf-t', text: 'This page is not part of the demo' }),
      h('p', { class: 'pmw-br-nf-u', text: url && url.indexOf('search:') === 0 ? 'Search: ' + url.slice(7) : shortUrl(url) }),
      h('p', { class: 'pmw-br-nf-s', text: 'Nothing is fetched in this concept. Try one of these:' }),
      h('div', { class: 'pmw-br-nf-links' }, [
        h('a', { href: '#', 'data-go': TB + '/', text: 'localhost:5173' }),
        h('a', { href: '#', 'data-go': 'http://app.internal/dashboards/query-performance', text: 'app.internal/dashboards/query-performance' }),
        h('a', { href: '#', 'data-go': 'https://postgresql.org/docs/16/indexes-multicolumn.html', text: 'postgresql.org/docs/16/indexes-multicolumn.html' })
      ])
    ])
  ]);
}

/* address -> { key, title, label, build(), console, net, thumb } */
function resolvePage(url, hintTitle) {
  var k = addrKey(url);
  var m;
  if (/^(localhost|127\.0\.0\.1):5173\/?$/.test(k)) return { key: 'tb-home', title: 'Tastebook', build: tbHome, console: TB_CONSOLE, net: TB_NET, thumb: ['#2a2118', '#ff8c42', '#fffdf9'] };
  if ((m = /^(?:localhost|127\.0\.0\.1):5173\/recipes\/([a-z-]+)$/.exec(k)) && recipeBy(m[1])) {
    var r = recipeBy(m[1]);
    return { key: 'tb-recipe', title: r.title + ' · Tastebook', label: r.title, build: function () { return tbRecipe(r); }, console: TB_CONSOLE, net: TB_NET, thumb: ['#2a2118', r.art.f1, '#fffdf9'] };
  }
  if (/^(localhost|127\.0\.0\.1):5173\/import$/.test(k)) return { key: 'tb-import', title: 'Import a recipe · Tastebook', label: 'Import a recipe', build: tbImport, console: TB_CONSOLE, net: TB_NET, thumb: ['#2a2118', '#d1495b', '#fffdf9'] };
  if (/^(localhost|127\.0\.0\.1):8080\/health$/.test(k)) return { key: 'api-health', title: 'localhost:8080/health', label: 'API health', build: apiHealth, console: [], net: [['200', 'GET', '/health', '4 ms', '142 B']], thumb: ['#f4f4f4', '#999', '#fff'] };
  if (k === 'app.internal/dashboards/query-performance') return { key: 'dash', title: 'Query Performance · Dashboard', label: 'Query Performance', build: dashPage, console: DASH_CONSOLE, net: DASH_NET, thumb: ['#141b24', '#4fa3ff', '#1c2632'] };
  if (k === 'app.internal/dashboards' || k === 'app.internal/') return { key: 'dash-index', title: 'Dashboards', build: dashIndex, console: [], net: [['200', 'GET', '/dashboards', '29 ms', '4.0 KB']], thumb: ['#141b24', '#4fa3ff', '#1c2632'] };
  if (/^accounts\.example\.com\/sso\/login$/.test(k)) return { key: 'sso', title: 'Sign in · Example SSO', label: 'Sign in', build: ssoPage, console: [], net: [], thumb: ['#eef1f6', '#3056d3', '#fff'] };
  var docKey = k.toLowerCase();
  if (PG_DOCS[docKey]) {
    var d = PG_DOCS[docKey];
    return { key: 'doc', title: d.title, build: function () { return pgPage(docKey, d); }, console: [], net: [['200', 'GET', k.slice(k.indexOf('/')), '34 ms', '18 KB'], ['200', 'GET', '/media/css/main.css', '12 ms', '9 KB']], thumb: d.wiki ? ['#f8f9fa', '#36c', '#fff'] : ['#336791', '#336791', '#fff'] };
  }
  if (/^(www\.)?postgresql\.org\//.test(k) || /^wiki\.postgresql\.org\//.test(k)) {
    var t = hintTitle || 'PostgreSQL documentation';
    var wiki = /^wiki\./.test(k);
    return { key: 'doc', title: t, build: function () { return pgPage(k, wiki ? { wiki: true, title: t, head: t, body: [['p', 'This page was recorded when an agent read it. Its text is not part of this demo.']] } : null, t); },
      console: [], net: [['200', 'GET', k.slice(k.indexOf('/')), '31 ms', '16 KB']], thumb: wiki ? ['#f8f9fa', '#36c', '#fff'] : ['#336791', '#336791', '#fff'] };
  }
  return { key: 'none', title: 'Not part of the demo', label: shortUrl(url) || 'New tab', build: function () { return notInDemo(url); }, console: [], net: [], missing: true, thumb: ['#888', '#aaa', '#ddd'] };
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Ids, labels and the registration                                                                                    */
/* ------------------------------------------------------------------------------------------------------------------ */

var seq = 0;
function nextBrowserId() {
  var max = seq;
  try {
    (PM_HOME.tabs ? PM_HOME.tabs() : []).forEach(function (t) { var m = /^browser:(\d+)$/.exec(t.tabId); if (m) max = Math.max(max, +m[1]); });
    var closed = PMW.state && PMW.state.layout && PMW.state.layout.closed || [];
    closed.forEach(function (c) { var id = c && c.tab && c.tab.id; var m = id && /^browser:(\d+)$/.exec(id); if (m) max = Math.max(max, +m[1]); });
  } catch (_) {}
  seq = max + 1;
  return 'browser:' + seq;
}
/* the start address of a tab from its id and spec */
function startUrl(id, st) {
  if (st && st.url) return st.url;
  if (/^link:/.test(id || '')) {
    var l = parseLink(id);
    var known = DOC_BY_TITLE[l.title];
    if (known) return 'https://' + known;
    return 'https://' + (l.host || 'postgresql.org') + '/';
  }
  return TB + '/';
}
/* labels for tabs that are not mounted yet (a background open, a restored layout): the strip reads them at once */
function labelFor(id, rec) {
  var st = (rec && rec.state) || {};
  if (/^link:/.test(id)) return parseLink(id).title || parseLink(id).host || 'Fetched page';
  var p = resolvePage(startUrl(id, st), st.pageTitle);
  return p.label || p.title;
}
function fixLabels() {
  var l = PMW.state && PMW.state.layout;
  if (!l) return;
  Object.keys(l.tabs).forEach(function (id) {
    var rec = l.tabs[id];
    if (!rec || rec.kind !== 'browser' || rec.label) return;
    PM_HOME.update(id, { label: labelFor(id, rec) });
  });
}
PM_HOME.on('open', function (e) { if (e && e.kind === 'browser') fixLabels(); });
PM_HOME.on('layout', function () { fixLabels(); });
setTimeout(fixLabels, 0);

PM_HOME.catalog.add('browser', [
  { id: 'web:tastebook', label: 'Tastebook', sub: 'localhost:5173', icon: 'browser', keywords: 'tastebook localhost 5173 app', spec: { kind: 'browser', url: TB + '/' } },
  { id: 'web:query-dashboard', label: 'Query Performance dashboard', sub: 'app.internal/dashboards/query-performance', icon: 'browser', keywords: 'dashboard query internal', spec: { kind: 'browser', url: 'http://app.internal/dashboards/query-performance' } },
  { id: 'link:postgresql.org|' + enc('PostgreSQL 16 · Multicolumn Indexes'), label: 'PostgreSQL 16 · Multicolumn Indexes', sub: 'postgresql.org · read by an agent', icon: 'browser',
    spec: { kind: 'browser', id: 'link:postgresql.org|' + enc('PostgreSQL 16 · Multicolumn Indexes'), label: 'PostgreSQL 16 · Multicolumn Indexes', url: 'https://postgresql.org/docs/16/indexes-multicolumn.html' } },
  { id: 'link:postgresql.org|' + enc('PostgreSQL 16 · Index-Only Scans'), label: 'PostgreSQL 16 · Index-Only Scans', sub: 'postgresql.org · read by an agent', icon: 'browser',
    spec: { kind: 'browser', id: 'link:postgresql.org|' + enc('PostgreSQL 16 · Index-Only Scans'), label: 'PostgreSQL 16 · Index-Only Scans', url: 'https://postgresql.org/docs/16/indexes-index-only-scans.html' } },
  { id: 'link:wiki.postgresql.org|' + enc('Locking notes for concurrent index builds'), label: 'Locking notes for concurrent index builds', sub: 'wiki.postgresql.org · read by an agent', icon: 'browser',
    spec: { kind: 'browser', id: 'link:wiki.postgresql.org|' + enc('Locking notes for concurrent index builds'), label: 'Locking notes for concurrent index builds', url: 'https://wiki.postgresql.org/wiki/Index_Maintenance' } }
]);

PM_HOME.registerKind('browser', {
  label: 'Browser',
  group: 'Browsers',
  icon: 'browser',
  prefixes: ['browser:', 'link:'],
  min: { w: 360, h: 200 },
  dedicated: true,
  idFor: function (spec) { return spec && spec.id ? spec.id : nextBrowserId(); },
  plus: {
    order: 20,
    shortcut: 'Ctrl+Shift+B',
    label: 'Browser',
    keywords: 'web page url localhost devtools',
    sub: function () { return [{ id: 'localhost:5173', label: 'localhost:5173' }, { id: 'app.internal/dashboards/query-performance', label: 'Query dashboard' }]; },
    spec: function (sub) { return { kind: 'browser', url: sub ? 'http://' + sub : 'http://localhost:5173/' }; }
  },
  mount: mountBrowser
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* The tab                                                                                                              */
/* ------------------------------------------------------------------------------------------------------------------ */

function mountBrowser(host, st, api) {
  st = st || {};
  var url0 = startUrl(api.id, st);
  var S = {
    url: url0,
    session: st.session === 'protected' ? 'protected' : 'ordinary',
    devtools: !!st.devtools,
    railTab: st.railTab || 'details',
    toolTab: st.toolTab || 'elements',
    dockW: typeof st.dockW === 'number' ? st.dockW : 340,
    dockH: typeof st.dockH === 'number' ? st.dockH : 0.42,
    history: Array.isArray(st.history) && st.history.length ? st.history.slice(-30) : [url0],
    hIndex: typeof st.hIndex === 'number' ? st.hIndex : -1,
    ordinaryUrl: st.ordinaryUrl || null,
    captures: Array.isArray(st.captures) ? st.captures.slice(0, 24) : [],
    policy: st.policy && typeof st.policy === 'object' ? st.policy : {},
    pageTitle: st.pageTitle || null
  };
  if (S.hIndex < 0 || S.hIndex >= S.history.length) S.hIndex = S.history.length - 1;
  var page = null;          // the resolved fixture
  var armed = null;         // 'region' | 'select' | null
  var picked = null;        // { el, info } the picked component
  var detailCap = null;     // a capture shown in Details
  var expanded = {};        // DevTools element tree: node index -> open
  var dock = 'right';
  var timers = [];

  var root = h('div', { class: 'pmw-br', 'data-session': S.session });
  host.appendChild(root);

  /* ---- the header row: navigation and the address, then the capture toolbar ---- */
  function navBtn(id, label, icon, run) {
    var b = h('button', { type: 'button', class: 'pmw-hbtn pmw-br-nbtn', 'data-br': id, 'aria-label': label, 'data-pm-hover-label': label, 'data-pmh': 'icon' }, [ico(icon)]);
    b.addEventListener('click', function () { if (b.getAttribute('aria-disabled') === 'true') return; run(); });
    return b;
  }
  var backBtn = navBtn('back', 'Back', 'back', function () { go(-1); });
  var fwdBtn = navBtn('forward', 'Forward', 'forward', function () { go(1); });
  var reloadBtn = navBtn('reload', 'Reload', 'reload', function () { reload(); });
  var nav = h('span', { class: 'pmw-br-navs' }, [backBtn, fwdBtn, reloadBtn]);
  var addrIcon = h('span', { class: 'pmw-br-aicon', 'aria-hidden': 'true' });
  var addrIn = h('input', { type: 'text', class: 'pmw-br-addrin', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Address', 'data-pmh': 'off' });
  var addr = h('span', { class: 'pmw-br-addr' }, [addrIcon, addrIn]);
  addrIn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); var u = toUrl(addrIn.value); if (u) navigate(u); viewport.focus({ preventScroll: true }); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); addrIn.value = S.url; addrIn.select(); }
  });
  addrIn.addEventListener('focus', function () { setTimeout(function () { addrIn.select(); }, 0); });
  addrIn.addEventListener('blur', function () { if (addrIn.value.trim() === '') addrIn.value = S.url; });

  function actionsSpec() {
    var prot = S.session === 'protected';
    return [
      { id: 'full', label: 'Full screenshot', icon: 'camera', detail: prot ? 'Refused in the protected sign-in session' : 'Capture the visible page', run: function () { capture('full'); } },
      { id: 'region', label: 'Region screenshot', icon: 'region', detail: prot ? 'Refused in the protected sign-in session' : 'Drag a rectangle on the page; Esc cancels', pressed: armed === 'region', run: function () { toggleArm('region'); } },
      { id: 'select', label: 'Select component', icon: 'pointer', detail: prot ? 'Refused in the protected sign-in session' : 'Point at part of the page and click to pick it; Esc cancels', pressed: armed === 'select', run: function () { toggleArm('select'); } },
      { id: 'devtools', label: 'DevTools', icon: 'devtools', detail: S.devtools ? 'Hide the docked DevTools' : 'Show DevTools docked in this tab', pressed: S.devtools, run: function () { setDevtools(!S.devtools); } },
      { id: 'session', label: prot ? 'Protected sign-in' : 'Ordinary', icon: prot ? 'lock' : 'browser', pressed: prot,
        detail: prot ? 'Only you can see and use this session. Click to go back to the ordinary session' : 'Agents can use this session. Click for the protected sign-in session', run: function () { setSession(prot ? 'ordinary' : 'protected'); } },
      { id: 'more', label: 'More', icon: 'more', menu: moreMenu }
    ];
  }
  var row = api.headerRow({ label: 'Browser controls', left: [{ id: 'br-nav', el: nav }, { id: 'br-addr', el: addr }], actions: actionsSpec() });
  root.appendChild(row.el);
  /* re-render the actions; a header button that had focus keeps it (the row replaces its buttons) */
  function refreshActions() {
    var a = document.activeElement;
    var had = a && a.closest && a.closest('.pmw-hrow-actions') && root.contains(a) ? a.getAttribute('data-id') : null;
    row.set({ actions: actionsSpec() });
    if (had && row.action(had)) row.action(had).focus({ preventScroll: true });
  }

  function moreMenu() {
    var prot = S.session === 'protected';
    /* below 480 px the capture tools leave the row (CSS) and live here */
    var narrowRows = api.size().w < 480 ? [
      { id: 'n-full', label: 'Full screenshot', icon: 'camera', run: function () { capture('full'); } },
      { id: 'n-region', label: 'Region screenshot', icon: 'region', sub: 'Drag a rectangle; Esc cancels', run: function () { toggleArm('region'); } },
      { id: 'n-select', label: 'Select component', icon: 'pointer', sub: 'Click part of the page; Esc cancels', run: function () { toggleArm('select'); } }
    ] : [];
    return { id: 'br-more', width: 280, align: 'end', rows: narrowRows.concat([
      { id: 'page', label: 'Full page screenshot', icon: 'camera', sub: 'The whole page, scrolled', run: function () { capture('page'); } },
      { id: 'copy', label: 'Copy address', icon: 'link', run: function () { copyText(S.url, 'Address copied'); } },
      { id: 'panel', label: 'Open in a new panel', icon: 'newPanel', disabled: prot, reason: 'The protected sign-in session stays in this tab',
        run: function () { api.open({ kind: 'browser', url: S.url, where: 'panel' }); } },
      { id: 'clear', label: 'Clear captures', icon: 'close', disabled: !S.captures.length, reason: 'No captures yet', run: function () { S.captures = []; detailCap = null; renderDock(); saveSoon(); api.announce('Captures cleared'); } },
      '-',
      { id: 's-ord', label: 'Ordinary session', sub: 'Agents can see and use it', checked: !prot, run: function () { setSession('ordinary'); } },
      { id: 's-prot', label: 'Protected sign-in', sub: 'Only you; captures and DevTools are refused', checked: prot, run: function () { setSession('protected'); } }
    ]) };
  }

  /* ---- the protected banner, the page and the dock ---- */
  var banner = h('p', { class: 'pmw-br-banner', role: 'note' }, [ico('lock', 13),
    h('span', { text: 'Protected sign-in. Only you can see and use this page; captures, DevTools and agent access are refused here.' })]);
  root.appendChild(banner);
  var main = h('div', { class: 'pmw-br-main' });
  var view = h('div', { class: 'pmw-br-view', 'data-pm-hover-exempt': 'true' });
  var viewport = h('div', { class: 'pmw-br-page', tabindex: '0', role: 'document' });
  var hl = h('div', { class: 'pmw-br-hl', hidden: true, 'aria-hidden': 'true' }, [h('span', { class: 'pmw-br-hltag' })]);
  var pickBox = h('div', { class: 'pmw-br-hl is-picked', hidden: true, 'aria-hidden': 'true' });
  var region = h('div', { class: 'pmw-br-region', hidden: true }, [h('div', { class: 'pmw-br-rbox', hidden: true }, [h('span', { class: 'pmw-br-rsize' })]),
    h('p', { class: 'pmw-br-rhint', text: 'Drag to capture a region. Esc cancels.' })]);
  var flash = h('div', { class: 'pmw-br-flash', 'aria-hidden': 'true' });
  var prompt = h('div', { class: 'pmw-br-prompt', hidden: true, role: 'dialog', 'aria-label': 'Picked component' });
  view.appendChild(viewport); view.appendChild(hl); view.appendChild(pickBox); view.appendChild(region); view.appendChild(flash); view.appendChild(prompt);
  var splitter = h('div', { class: 'pmw-br-split', role: 'separator', tabindex: '0', 'aria-label': 'Resize DevTools', 'data-pm-hover-exempt': 'true' });
  var dockEl = h('aside', { class: 'pmw-br-dock', 'aria-label': 'DevTools' });
  main.appendChild(view); main.appendChild(splitter); main.appendChild(dockEl);
  root.appendChild(main);

  /* ---- navigation ---- */
  function navigate(url, o) {
    o = o || {};
    if (!o.history) {
      S.history = S.history.slice(0, S.hIndex + 1);
      if (S.history[S.history.length - 1] !== url) S.history.push(url);
      if (S.history.length > 30) S.history = S.history.slice(-30);
      S.hIndex = S.history.length - 1;
    }
    S.url = url;
    S.pageTitle = o.hintTitle || null;
    show({ busy: !o.quiet });
    saveSoon();
  }
  function go(d) {
    var i = S.hIndex + d;
    if (i < 0 || i >= S.history.length) return;
    S.hIndex = i;
    navigate(S.history[i], { history: true });
  }
  function reload() {
    show({ busy: true, reload: true });
    api.announce('Reloaded ' + (page ? page.title : 'the page'));
  }
  function show(o) {
    o = o || {};
    disarm();
    closePrompt();
    picked = null;
    pickBox.hidden = true;
    expanded = {};
    var hint = /^link:/.test(api.id) && S.history.length === 1 ? parseLink(api.id).title : S.pageTitle;
    page = resolvePage(S.url, hint);
    viewport.textContent = '';
    viewport.appendChild(page.build());
    viewport.scrollTop = 0;
    viewport.setAttribute('aria-label', 'Page: ' + page.title);
    addrIn.value = S.url;
    addrIcon.textContent = '';
    addrIcon.appendChild(ico(S.session === 'protected' || /^https:/i.test(S.url) ? 'lock' : 'browser', 13));
    addr.setAttribute('data-pm-hover-label', page.title);
    setAttr(backBtn, 'aria-disabled', S.hIndex <= 0 ? 'true' : null);
    setAttr(fwdBtn, 'aria-disabled', S.hIndex >= S.history.length - 1 ? 'true' : null);
    var label = /^link:/.test(api.id) && S.history.length === 1 ? (parseLink(api.id).title || page.title) : (page.label || page.title);
    api.update({ label: label, title: page.title + ' · ' + shortUrl(S.url), busy: !!o.busy });
    if (o.busy) {
      view.classList.add('is-loading');
      var t = setTimeout(function () { view.classList.remove('is-loading'); api.update({ busy: false }); }, PMW.reduced() ? 0 : 320);
      timers.push(t);
    }
    if (o.reload && PMW.motion) PMW.motion.animate(viewport, [{ opacity: 0.35 }, { opacity: 1 }], { dur: 220 });
    renderDock();
  }
  viewport.addEventListener('click', function (e) {
    if (armed === 'select') return;
    var a = e.target.closest && e.target.closest('[data-go]');
    if (!a || !viewport.contains(a)) { if (e.target.closest && e.target.closest('a')) e.preventDefault(); return; }
    e.preventDefault();
    if (e.altKey || e.ctrlKey || e.metaKey) { api.open({ kind: 'browser', url: a.getAttribute('data-go'), where: e.altKey ? 'panel' : 'tab', background: !e.altKey }); return; }
    navigate(a.getAttribute('data-go'));
  });

  /* ---- sessions ---- */
  function setSession(s) {
    if (S.session === s) return;
    S.session = s;
    root.setAttribute('data-session', s);
    if (s === 'protected') { S.ordinaryUrl = S.url; navigate('https://accounts.example.com/sso/login', { quiet: true }); }
    else navigate(S.ordinaryUrl || TB + '/', { quiet: true });
    refreshActions();
    api.announce(s === 'protected' ? 'Protected sign-in session. Captures and DevTools are refused here.' : 'Ordinary session');
  }

  /* ---- DevTools dock ---- */
  function setDevtools(on) {
    S.devtools = !!on;
    root.setAttribute('data-devtools', S.devtools ? 'on' : 'off');
    refreshActions();
    renderDock();
    saveSoon();
    api.announce(S.devtools ? 'DevTools shown' : 'DevTools hidden');
  }
  function placeDock() {
    var sz = api.size();
    dock = sz.w >= 900 ? 'right' : 'below';
    root.setAttribute('data-dock', dock);
    if (dock === 'right') {
      var w = Math.max(240, Math.min(Math.round(sz.w * 0.6), S.dockW));
      main.style.setProperty('--pmw-br-dock', w + 'px');
      splitter.setAttribute('aria-orientation', 'vertical');
    } else {
      var hh = Math.max(0.25, Math.min(0.7, S.dockH));
      main.style.setProperty('--pmw-br-dock', Math.round(hh * 100) + '%');
      splitter.setAttribute('aria-orientation', 'horizontal');
    }
  }
  splitter.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    var r = main.getBoundingClientRect();
    try { splitter.setPointerCapture(e.pointerId); } catch (_) {}
    splitter.classList.add('is-active');
    function move(ev) {
      if (dock === 'right') S.dockW = Math.round(Math.max(240, Math.min(r.width - 200, r.right - ev.clientX)));
      else S.dockH = Math.max(0.25, Math.min(0.7, (r.bottom - ev.clientY) / r.height));
      placeDock();
    }
    function up() {
      splitter.removeEventListener('pointermove', move); splitter.removeEventListener('pointerup', up); splitter.removeEventListener('pointercancel', up);
      splitter.classList.remove('is-active');
      saveSoon();
    }
    splitter.addEventListener('pointermove', move); splitter.addEventListener('pointerup', up); splitter.addEventListener('pointercancel', up);
  });
  splitter.addEventListener('keydown', function (e) {
    var step = e.shiftKey ? 48 : 8, dir = 0;
    if (dock === 'right') { if (e.key === 'ArrowLeft') dir = 1; else if (e.key === 'ArrowRight') dir = -1; }
    else { if (e.key === 'ArrowUp') dir = 1; else if (e.key === 'ArrowDown') dir = -1; }
    if (!dir) return;
    e.preventDefault(); e.stopPropagation();
    if (dock === 'right') S.dockW = Math.max(240, S.dockW + dir * step);
    else S.dockH = Math.max(0.25, Math.min(0.7, S.dockH + dir * step / Math.max(200, main.clientHeight)));
    placeDock(); saveSoon();
  });

  function renderDock() {
    root.setAttribute('data-devtools', S.devtools ? 'on' : 'off');
    if (!S.devtools) { dockEl.textContent = ''; return; }
    var keepScroll = dockEl.querySelector('.pmw-br-dbody');
    var st0 = keepScroll ? keepScroll.scrollTop : 0;
    dockEl.textContent = '';
    var n = S.captures.filter(function (c) { return c.kind !== 'refused'; }).length;
    var seg = PMW.frames.seg([
      { value: 'details', label: 'Details' }, { value: 'devtools', label: 'DevTools' }, { value: 'captures', label: 'Captures', count: n }
    ], S.railTab, function (v) { S.railTab = v; renderDock(); saveSoon(); }, { label: 'DevTools sections', cls: 'pmw-br-dseg' });
    var close = h('button', { type: 'button', class: 'pmw-hbtn pmw-br-dclose', 'aria-label': 'Hide DevTools', 'data-pm-hover-label': 'Hide DevTools', 'data-pmh': 'icon' }, [ico('close', 13)]);
    close.addEventListener('click', function () { setDevtools(false); });
    dockEl.appendChild(h('div', { class: 'pmw-br-dhead' }, [seg, close]));
    var body = h('div', { class: 'pmw-br-dbody', 'data-pmh': 'off' });
    dockEl.appendChild(body);
    if (S.railTab === 'devtools') body.appendChild(devtoolsSection());
    else if (S.railTab === 'captures') body.appendChild(capturesSection());
    else body.appendChild(detailsSection());
    if (keepScroll) body.scrollTop = st0;
  }

  function kv(rows) {
    var dl = h('dl', { class: 'pmw-br-kv' });
    rows.forEach(function (r) {
      if (!r || r[1] == null || r[1] === '') return;
      dl.appendChild(h('dt', { text: r[0] }));
      var dd = h('dd', { class: r[2] ? 'is-' + r[2] : null });
      add(dd, r[1]);
      dl.appendChild(dd);
    });
    return dl;
  }
  function quiet(text) { return h('p', { class: 'pmw-br-quiet', text: text }); }
  function fileKnown(path) {
    try { return !!PMW.fileIndex && PMW.fileIndex(path, 40).indexOf(path) >= 0; } catch (_) { return false; }
  }
  function sourceLink(src) {
    var m = /^(.*?):(\d+)(?::(\d+))?$/.exec(src || '');
    if (!m) return src;
    if (!fileKnown(m[1])) return h('span', { class: 'pmw-br-mono', text: src });
    var b = h('button', { type: 'button', class: 'pmw-br-srclink', text: src, 'data-pm-hover-label': 'Open the source', 'data-pm-hover-detail': 'Double click keeps the tab', 'data-pmh': 'off' });
    /* D7: a single click opens the panel's preview tab, a double click keeps it, Alt+click opens a new panel */
    b.addEventListener('click', function (e) { api.open({ kind: 'editor', path: m[1], line: +m[2], col: m[3] ? +m[3] : null, where: e.altKey ? 'panel' : 'auto' }); });
    b.addEventListener('dblclick', function () { api.open({ kind: 'editor', path: m[1], line: +m[2], col: m[3] ? +m[3] : null, mode: 'keep' }); });
    return b;
  }

  function detailsSection() {
    var wrap = h('div', { class: 'pmw-br-sec' });
    if (S.session === 'protected') { wrap.appendChild(quiet('Nothing can be picked on the protected sign-in page.')); return wrap; }
    if (detailCap) {
      var c = detailCap;
      wrap.appendChild(h('div', { class: 'pmw-br-dtitle' }, [h('b', { text: capLabel(c) }), backLink('Back to the picked part', function () { detailCap = null; renderDock(); })]));
      wrap.appendChild(thumb(c, true));
      wrap.appendChild(kv([['Page', c.title], ['Address', h('span', { class: 'pmw-br-mono', text: shortUrl(c.url) })], ['Size', c.w ? c.w + ' × ' + c.h : ''], ['Taken', c.at]]));
      wrap.appendChild(quiet('Captures in this concept are drawings, not real screenshots.'));
      wrap.appendChild(h('div', { class: 'pmw-br-dacts' }, [
        PMW.frames.button({ label: 'Send to chat', icon: 'chat', detail: 'Sends the capture as its own message', run: function () { sendToChat('capture', c); } })
      ]));
      return wrap;
    }
    if (!picked) {
      wrap.appendChild(quiet('No part of the page picked yet. Use Select component, or pick a node under DevTools, or open a capture from Captures.'));
      return wrap;
    }
    var i = picked.info;
    wrap.appendChild(h('div', { class: 'pmw-br-dtitle' }, [h('b', { class: 'pmw-br-mono', text: i.comp ? '<' + i.comp + '>' : '<' + i.el + '>' })]));
    wrap.appendChild(kv([
      i.comp ? null : ['Component', 'None: this site has no source maps', 'dim'],
      ['Element', h('span', { class: 'pmw-br-mono', text: i.el })],
      ['Text', i.text],
      ['Page', page.title],
      ['Size', i.w + ' × ' + i.h + ' at (' + i.x + ', ' + i.y + ')'],
      ['Source', i.src ? sourceLink(i.src) : null],
      ['Inside', i.path],
      ['Locator', h('span', { class: 'pmw-br-mono', text: i.locator })]
    ]));
    wrap.appendChild(h('div', { class: 'pmw-br-dacts' }, [
      PMW.frames.button({ label: 'Send to chat', icon: 'chat', detail: 'The instruction and this component, sent right away', run: function () { sendToChat('send', i); } }),
      PMW.frames.button({ label: 'Copy locator', icon: 'link', run: function () { copyText(i.locator, 'Locator copied'); } })
    ]));
    return wrap;
  }
  function backLink(text, run) {
    var b = h('button', { type: 'button', class: 'pmw-br-back', text: text, 'data-pmh': 'off' });
    b.addEventListener('click', run);
    return b;
  }

  function devtoolsSection() {
    var wrap = h('div', { class: 'pmw-br-sec' });
    if (S.session === 'protected') {
      wrap.appendChild(PMW.frames.notice('DevTools is refused on the protected sign-in page. Switch to the ordinary session to use it.', { icon: 'lock' }));
      return wrap;
    }
    var cons = page.console || [], net = page.net || [];
    var seg = PMW.frames.seg([
      { value: 'elements', label: 'Elements' }, { value: 'console', label: 'Console', count: cons.length },
      { value: 'network', label: 'Network', count: net.length }, { value: 'access', label: 'Agent access' }
    ], S.toolTab, function (v) { S.toolTab = v; renderDock(); saveSoon(); }, { label: 'DevTools tools', cls: 'pmw-br-tseg' });
    wrap.appendChild(seg);
    if (S.toolTab === 'console') wrap.appendChild(consoleList(cons));
    else if (S.toolTab === 'network') wrap.appendChild(networkList(net));
    else if (S.toolTab === 'access') wrap.appendChild(accessList());
    else wrap.appendChild(elementTree());
    return wrap;
  }
  function consoleList(lines) {
    if (!lines.length) return quiet('No console messages on this page.');
    var ul = h('ul', { class: 'pmw-br-console', 'aria-label': 'Console' });
    lines.forEach(function (l) {
      var lv = l[0];
      ul.appendChild(h('li', { class: 'pmw-br-cline is-' + lv }, [
        lv === 'warn' || lv === 'error' || lv === 'info' ? mark(lv === 'error' ? 'error' : lv) : h('span', { class: 'pmw-br-cgap', 'aria-hidden': 'true' }),
        h('span', { class: 'pmw-br-ctext', text: l[1] })
      ]));
    });
    return ul;
  }
  function networkList(rows) {
    if (!rows.length) return quiet(page.missing ? 'Nothing was requested: this page is not part of the demo.' : 'No requests recorded on this page.');
    var t = h('div', { class: 'pmw-br-net', role: 'table', 'aria-label': 'Network' }, [
      h('div', { class: 'pmw-br-nrow is-head', role: 'row' }, ['Status', 'Method', 'Path', 'Time', 'Size'].map(function (c) { return h('span', { role: 'columnheader', text: c }); }))
    ]);
    rows.forEach(function (r) {
      var code = +r[0];
      t.appendChild(h('div', { class: 'pmw-br-nrow', role: 'row' }, [
        h('span', { role: 'cell', class: 'pmw-br-ncode ' + (code >= 400 ? 'is-bad' : code >= 300 ? 'is-dim' : 'is-ok'), text: r[0] }),
        h('span', { role: 'cell', text: r[1] }),
        h('span', { role: 'cell', class: 'pmw-br-npath', text: r[2], title: r[2] }),
        h('span', { role: 'cell', class: 'pmw-br-num', text: r[3] }),
        h('span', { role: 'cell', class: 'pmw-br-num', text: r[4] })
      ]));
    });
    return t;
  }
  function accessList() {
    var wrap = h('div', { class: 'pmw-br-access' }, [quiet('What agents may do in this browser. Click a row to change it: Off, Ask, On. A demo setting, not a live one.')]);
    POLICY.forEach(function (p) {
      var v = S.policy[p[0]] || p[2];
      var b = h('button', { type: 'button', class: 'pmw-br-prow pmw-cur', 'data-pmh': 'row', 'data-pm-hover-label': p[1], 'data-pm-hover-detail': 'Click to change: Off, Ask, On' }, [
        h('span', { class: 'pmw-br-plabel', text: p[1] }),
        h('span', { class: 'pmw-br-pstate is-' + v, text: POLICY_WORD[v] })
      ]);
      b.setAttribute('aria-label', p[1] + ': ' + POLICY_WORD[v]);
      b.addEventListener('click', function () {
        var nv = POLICY_NEXT[S.policy[p[0]] || p[2]];
        if (nv === p[2]) delete S.policy[p[0]]; else S.policy[p[0]] = nv;
        renderDock(); saveSoon();
        api.announce(p[1] + ': ' + POLICY_WORD[nv]);
        var again = dockEl.querySelectorAll('.pmw-br-prow')[POLICY.indexOf(p)];
        if (again) again.focus({ preventScroll: true });
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  /* the Elements tree: the page's own structure from data-el (what a site's DevTools would show) */
  function elementTree() {
    var nodes = [];
    function walk(el, depth, parentIdx) {
      for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
        if (c.hasAttribute('data-el')) {
          var idx = nodes.length;
          var kids = c.querySelector('[data-el]');
          var text = kids ? '' : (c.textContent || '').trim();
          nodes.push({ el: c, depth: depth, parent: parentIdx, leaf: !kids, text: text.length > 36 ? text.slice(0, 35) + '…' : text });
          walk(c, depth + 1, idx);
        } else walk(c, depth, parentIdx);
      }
    }
    walk(viewport, 0, -1);
    if (!nodes.length) return quiet('This page has no elements to show.');
    var ul = h('ul', { class: 'pmw-br-tree', role: 'tree', 'aria-label': 'Elements' });
    function isOpen(i) { return expanded[i] != null ? expanded[i] : nodes[i].depth < 2; }
    function visible(i) { var p = nodes[i].parent; while (p >= 0) { if (!isOpen(p)) return false; p = nodes[p].parent; } return true; }
    nodes.forEach(function (n, i) {
      if (!visible(i)) return;
      var parts = (n.el.getAttribute('data-el') || '').split('.');
      var tag = parts[0], cls = parts.slice(1).join(' ');
      var lbl = h('span', { class: 'pmw-br-tnode' }, [
        h('span', { class: 'pmw-br-ttag', text: '<' + tag }),
        cls ? h('span', { class: 'pmw-br-tattr', text: ' class="' + cls + '"' }) : null,
        h('span', { class: 'pmw-br-ttag', text: '>' }),
        n.leaf && n.text ? h('span', { class: 'pmw-br-ttext', text: n.text }) : null
      ]);
      var li = h('li', { class: 'pmw-br-titem' + (picked && picked.el === n.el ? ' is-on pmw-chosen' : ''), role: 'treeitem', style: { '--d': n.depth } });
      if (!n.leaf) li.setAttribute('aria-expanded', isOpen(i) ? 'true' : 'false');
      var tw = h('button', { type: 'button', class: 'pmw-br-ttw', tabindex: '-1', 'aria-label': isOpen(i) ? 'Collapse' : 'Expand', 'data-pmh': 'off' }, n.leaf ? null : [ico(isOpen(i) ? 'chevronDown' : 'chevronRight', 12)]);
      if (n.leaf) tw.style.visibility = 'hidden';
      tw.addEventListener('click', function (e) { e.stopPropagation(); expanded[i] = !isOpen(i); renderDock(); });
      var pick = h('button', { type: 'button', class: 'pmw-br-tpick pmw-cur', 'data-pmh': 'off' }, [lbl]);
      pick.addEventListener('mouseenter', function () { outline(hl, n.el, describe(n.el).comp); });
      pick.addEventListener('mouseleave', function () { hl.hidden = true; });
      pick.addEventListener('focus', function () { outline(hl, n.el, describe(n.el).comp); });
      pick.addEventListener('blur', function () { hl.hidden = true; });
      pick.addEventListener('click', function () { choose(n.el, { quiet: true }); });
      pick.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' && !n.leaf && !isOpen(i)) { e.preventDefault(); expanded[i] = true; renderDock(); }
        else if (e.key === 'ArrowLeft' && !n.leaf && isOpen(i)) { e.preventDefault(); expanded[i] = false; renderDock(); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var all = Array.prototype.slice.call(ul.querySelectorAll('.pmw-br-tpick')), at = all.indexOf(pick);
          var nx = all[at + (e.key === 'ArrowDown' ? 1 : -1)];
          if (nx) nx.focus();
        }
      });
      li.appendChild(tw); li.appendChild(pick);
      ul.appendChild(li);
    });
    return ul;
  }

  function capLabel(c) {
    if (c.kind === 'full') return 'Full screenshot';
    if (c.kind === 'page') return 'Full page screenshot';
    if (c.kind === 'region') return 'Region screenshot';
    if (c.kind === 'component') return 'Component · ' + c.comp;
    return c.what + ' refused';
  }
  function thumb(c, big) {
    var t = c.thumb || ['#888', '#aaa', '#ddd'];
    var el = h('span', { class: 'pmw-br-thumb' + (big ? ' is-big' : '') + (c.kind === 'region' || c.kind === 'component' ? ' is-crop' : ''), 'aria-hidden': 'true',
      style: { '--t1': t[0], '--t2': t[1], '--t3': t[2] } }, [h('i'), h('i'), h('i')]);
    return el;
  }
  function capturesSection() {
    var wrap = h('div', { class: 'pmw-br-sec' });
    if (!S.captures.length) {
      wrap.appendChild(quiet('No captures yet. Full screenshot, Region screenshot and Select component add them here.'));
      return wrap;
    }
    var ul = h('ul', { class: 'pmw-br-caps' });
    S.captures.forEach(function (c) {
      var refused = c.kind === 'refused';
      var b = h('button', { type: 'button', class: 'pmw-br-cap pmw-cur' + (refused ? ' is-refused' : ''), 'data-pmh': 'row' }, [
        refused ? h('span', { class: 'pmw-br-thumb is-refused', 'aria-hidden': 'true' }, [ico('lock', 14)]) : thumb(c),
        h('span', { class: 'pmw-br-capcopy' }, [
          h('b', { text: capLabel(c) }),
          h('span', { text: refused ? c.reason : (c.title + (c.w ? ' · ' + c.w + ' × ' + c.h : '')) })
        ]),
        h('span', { class: 'pmw-br-captime', text: c.at })
      ]);
      if (refused) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', function () { if (refused) return; detailCap = c; S.railTab = 'details'; renderDock(); });
      ul.appendChild(h('li', null, [b]));
    });
    wrap.appendChild(ul);
    wrap.appendChild(quiet('Captures in this concept are drawings, not real screenshots.'));
    return wrap;
  }

  /* ---- captures ---- */
  function addCapture(c) {
    c.at = clockNow();
    c.title = page.title; c.url = S.url; c.thumb = page.thumb;
    S.captures.unshift(c);
    if (S.captures.length > 24) S.captures.length = 24;
    renderDock();
    saveSoon();
    try { PMW.bus.emit('browser:capture', { tabId: api.id, capture: c }); } catch (_) {}
  }
  function refuse(what) {
    addCapture({ kind: 'refused', what: what, reason: 'Not allowed in the protected sign-in session' });
    PMW.toast(what + ' is refused in the protected sign-in session');
    api.announce(what + ' refused in the protected sign-in session');
  }
  function capture(kind) {
    if (S.session === 'protected') { refuse(kind === 'page' ? 'Full page screenshot' : 'Full screenshot'); return; }
    disarm();
    var w = viewport.clientWidth, hh = kind === 'page' ? viewport.scrollHeight : viewport.clientHeight;
    addCapture({ kind: kind, w: w, h: hh });
    if (!PMW.reduced()) {
      flash.classList.remove('is-on'); void flash.offsetWidth; flash.classList.add('is-on');
      timers.push(setTimeout(function () { flash.classList.remove('is-on'); }, 260));
    }
    PMW.toast('Captured');
    api.announce((kind === 'page' ? 'Full page' : 'Full') + ' screenshot captured');
  }
  function sendToChat(how, what) {
    try { PMW.bus.emit('browser:send', { tabId: api.id, how: how, what: what }); } catch (_) {}
    var msg = how === 'list' ? 'Added to the chat’s list' : how === 'insert' ? 'Inserted at the cursor in the chat' : 'Sent to the chat';
    PMW.toast(msg);
    api.announce(msg);
  }

  /* ---- arming: Region and Select ---- */
  function toggleArm(mode) {
    if (S.session === 'protected') { refuse(mode === 'region' ? 'Region screenshot' : 'Select component'); return; }
    if (armed === mode) { disarm(); api.announce(mode === 'region' ? 'Region screenshot cancelled' : 'Select component off'); return; }
    disarm();
    armed = mode;
    root.setAttribute('data-armed', mode);
    closePrompt();
    if (mode === 'region') { region.hidden = false; region.querySelector('.pmw-br-rbox').hidden = true; }
    refreshActions();
    viewport.focus({ preventScroll: true });
    api.announce(mode === 'region' ? 'Drag a rectangle on the page to capture it. Escape cancels.' : 'Point at part of the page and click to pick it. Escape cancels.');
  }
  function disarm() {
    if (!armed) return;
    armed = null;
    root.removeAttribute('data-armed');
    region.hidden = true;
    hl.hidden = true;
    refreshActions();
  }

  function viewRect() { return view.getBoundingClientRect(); }
  function outline(box, el, label) {
    var vr = viewRect(), r = el.getBoundingClientRect();
    var x = Math.max(0, r.left - vr.left), y = Math.max(0, r.top - vr.top);
    var w = Math.min(vr.width - x, r.right - vr.left - x), hh = Math.min(vr.height - y, r.bottom - vr.top - y);
    if (w <= 0 || hh <= 0) { box.hidden = true; return; }
    box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.width = w + 'px'; box.style.height = hh + 'px';
    var tag = box.querySelector('.pmw-br-hltag');
    if (tag) {
      tag.textContent = label;
      tag.hidden = !label;
      box.classList.toggle('is-tagbelow', y < 22);
    }
    box.hidden = false;
  }
  function describe(el) {
    var comp = el.getAttribute('data-c');
    var src = el.getAttribute('data-src');
    var path = [];
    for (var p = el.parentElement; p && p !== viewport; p = p.parentElement) if (p.getAttribute('data-c')) path.unshift(p.getAttribute('data-c'));
    var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    var vr = viewport.getBoundingClientRect(), r = el.getBoundingClientRect();
    var tagName = (el.getAttribute('data-el') || el.tagName.toLowerCase());
    var bare = tagName.split(/[.#[]/)[0];
    var role = { a: 'link', button: 'button', h1: 'heading', h2: 'heading', h3: 'heading', nav: 'navigation', img: 'img' }[bare];
    var head = el.querySelector && el.querySelector('h1, h2, h3');
    var nameSrc = head ? (head.innerText || head.textContent || '').replace(/\s+/g, ' ').trim() : text;
    var name = nameSrc.length > 40 ? nameSrc.slice(0, 40) + '…' : nameSrc;
    text = text.length > 80 ? text.slice(0, 80) + '…' : text;
    var label = comp ? '<' + comp + '>' + (src ? ' · ' + src.replace(/^.*\//, '').replace(/:\d+$/, '') : '') : '<' + tagName + '>';
    return {
      comp: comp ? label : '', compName: comp, src: src, el: tagName, text: name,
      path: path.length ? path.join(' › ') : '', x: Math.round(r.left - vr.left), y: Math.round(r.top - vr.top + viewport.scrollTop),
      w: Math.round(r.width), h: Math.round(r.height),
      locator: role && name ? "getByRole('" + role + "', { name: '" + name.replace(/'/g, "\\'") + "' })" : name ? "getByText('" + name.replace(/'/g, "\\'") + "')" : '[data-el="' + tagName + '"]'
    };
  }
  function pickable(t) {
    if (!t || !t.closest || !viewport.contains(t)) return null;
    return t.closest('[data-c]') || t.closest('[data-el]');
  }
  function choose(el, o) {
    o = o || {};
    var d = describe(el);
    picked = { el: el, info: { comp: d.compName, el: d.el, text: d.text, src: d.src, path: d.path, x: d.x, y: d.y, w: d.w, h: d.h, locator: d.locator } };
    detailCap = null;
    outline(pickBox, el, null);
    if (!o.quiet) {
      addCapture({ kind: 'component', comp: d.compName ? '<' + d.compName + '>' : '<' + d.el + '>', w: d.w, h: d.h });
      openPrompt(el, d);
    }
    if (S.devtools && !o.quiet) S.railTab = 'details';
    renderDock();
    api.announce('Picked ' + (d.compName || d.el));
  }

  viewport.addEventListener('pointermove', function (e) {
    if (armed !== 'select') return;
    var el = pickable(e.target);
    if (!el) { hl.hidden = true; return; }
    outline(hl, el, describe(el).comp || '<' + (el.getAttribute('data-el') || el.tagName.toLowerCase()) + '>');
  });
  viewport.addEventListener('pointerleave', function () { if (armed === 'select') hl.hidden = true; });
  viewport.addEventListener('click', function (e) {
    if (armed !== 'select') return;
    e.preventDefault(); e.stopPropagation();
    var el = pickable(e.target);
    if (!el) return;
    disarm();
    choose(el);
  }, true);
  viewport.addEventListener('scroll', function () { hl.hidden = true; if (picked) outline(pickBox, picked.el, null); positionPrompt(); });

  /* the prompt bar at the picked part: Send now, Add to list, Insert at cursor (it stays inside the tab) */
  var promptFor = null;
  function openPrompt(el, d) {
    promptFor = el;
    prompt.textContent = '';
    function pb(label, how, detail) {
      var b = h('button', { type: 'button', class: 'pmw-br-pbtn', 'data-pmh': 'icon', 'data-pm-hover-label': label, 'data-pm-hover-detail': detail, text: label });
      b.addEventListener('click', function () { sendToChat(how, picked && picked.info); closePrompt(); });
      return b;
    }
    var x = h('button', { type: 'button', class: 'pmw-br-pbtn is-icon', 'aria-label': 'Close', 'data-pm-hover-label': 'Close', 'data-pm-hover-detail': 'Esc', 'data-pmh': 'icon' }, [ico('close', 12)]);
    x.addEventListener('click', closePrompt);
    prompt.appendChild(h('span', { class: 'pmw-br-plab', text: d.compName ? '<' + d.compName + '>' : '<' + d.el + '>', title: d.src || '' }));
    prompt.appendChild(h('span', { class: 'pmw-br-pbtns' }, [
      pb('Send now', 'send', 'The instruction and this component, sent right away'),
      pb('Add to list', 'list', 'A numbered line in the chat draft, with this component attached'),
      pb('Insert at cursor', 'insert', 'A reference to this component at the cursor; sends nothing'),
      x
    ]));
    prompt.hidden = false;
    positionPrompt();
    var first = prompt.querySelector('.pmw-br-pbtn');
    if (first) first.focus({ preventScroll: true });
  }
  function positionPrompt() {
    if (prompt.hidden || !promptFor) return;
    var vr = viewRect(), r = promptFor.getBoundingClientRect();
    var pw = prompt.offsetWidth, ph = prompt.offsetHeight;
    var x = Math.max(8, Math.min(vr.width - pw - 8, r.left - vr.left));
    var y = r.bottom - vr.top + 6;
    if (y + ph > vr.height - 8) y = Math.max(8, r.top - vr.top - ph - 6);
    prompt.style.left = Math.round(x) + 'px'; prompt.style.top = Math.round(y) + 'px';
  }
  function closePrompt() { prompt.hidden = true; promptFor = null; }

  /* Region: drag a rectangle inside the page; release captures it */
  region.addEventListener('pointerdown', function (e) {
    if (armed !== 'region' || e.button !== 0) return;
    e.preventDefault();
    var vr = viewRect();
    var x0 = e.clientX - vr.left, y0 = e.clientY - vr.top;
    var box = region.querySelector('.pmw-br-rbox'), size = region.querySelector('.pmw-br-rsize');
    region.classList.add('is-dragging');
    try { region.setPointerCapture(e.pointerId); } catch (_) {}
    var rect = { x: x0, y: y0, w: 0, h: 0 };
    function move(ev) {
      var x1 = Math.max(0, Math.min(vr.width, ev.clientX - vr.left)), y1 = Math.max(0, Math.min(vr.height, ev.clientY - vr.top));
      rect = { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
      box.hidden = false;
      box.style.left = rect.x + 'px'; box.style.top = rect.y + 'px'; box.style.width = rect.w + 'px'; box.style.height = rect.h + 'px';
      size.textContent = Math.round(rect.w) + ' × ' + Math.round(rect.h);
    }
    function up() {
      region.removeEventListener('pointermove', move); region.removeEventListener('pointerup', up); region.removeEventListener('pointercancel', cancel);
      region.classList.remove('is-dragging');
      if (rect.w < 8 || rect.h < 8) { box.hidden = true; return; }
      disarm();
      addCapture({ kind: 'region', w: Math.round(rect.w), h: Math.round(rect.h) });
      PMW.toast('Captured');
      api.announce('Region captured, ' + Math.round(rect.w) + ' by ' + Math.round(rect.h) + ' pixels');
    }
    function cancel() { region.removeEventListener('pointermove', move); region.removeEventListener('pointerup', up); region.removeEventListener('pointercancel', cancel); region.classList.remove('is-dragging'); box.hidden = true; }
    region.addEventListener('pointermove', move); region.addEventListener('pointerup', up); region.addEventListener('pointercancel', cancel);
  });

  host.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (armed) { e.preventDefault(); e.stopPropagation(); var was = armed; disarm(); api.announce(was === 'region' ? 'Region screenshot cancelled' : 'Select component off'); return; }
    if (!prompt.hidden) { e.preventDefault(); e.stopPropagation(); closePrompt(); viewport.focus({ preventScroll: true }); }
  });

  function copyText(text, done) {
    var ok = function () { PMW.toast(done); api.announce(done); };
    var no = function () { PMW.toast('Could not copy: the browser did not allow it.'); };
    try { navigator.clipboard.writeText(text).then(ok, no); } catch (_) { no(); }
  }
  function setAttr(el, n, v) { if (v == null) el.removeAttribute(n); else el.setAttribute(n, v); }

  /* first paint */
  root.setAttribute('data-devtools', S.devtools ? 'on' : 'off');
  if (/^link:/.test(api.id) && st.url == null) S.pageTitle = parseLink(api.id).title;
  placeDock();
  show({});

  return {
    focus: function () { if (page && page.missing) addrIn.focus(); else viewport.focus({ preventScroll: true }); },
    onResize: function () { placeDock(); hl.hidden = true; if (picked) outline(pickBox, picked.el, null); positionPrompt(); },
    onHide: function () { disarm(); closePrompt(); },
    wantsKey: function (e) { return e.key === 'Escape' && (!!armed || !prompt.hidden); },
    reveal: function (s) { if (s && s.url && s.url !== S.url) navigate(s.url); },
    serialize: function () {
      return { url: S.url, session: S.session, devtools: S.devtools, railTab: S.railTab, toolTab: S.toolTab, dockW: S.dockW, dockH: Math.round(S.dockH * 100) / 100,
        history: S.history.slice(-20), hIndex: Math.max(0, S.hIndex - Math.max(0, S.history.length - 20)), ordinaryUrl: S.ordinaryUrl,
        captures: S.captures.slice(0, 12), policy: S.policy, pageTitle: S.pageTitle };
    },
    unmount: function () { timers.forEach(clearTimeout); timers = []; disarm(); }
  };
}
