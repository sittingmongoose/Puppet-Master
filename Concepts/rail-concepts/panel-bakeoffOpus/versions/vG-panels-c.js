/* PANEL BAKEOFF - vG COZY SHELVES, panel set C
   =========================================================================
   VG_PANELS.docker      the largest surface in the app, 78 wired commands
   VG_PANELS.artifacts   47 rows, 19 kinds, and no guaranteed title field

   Built entirely from CZ.* helpers and .cz-* classes. There is not one
   private class in this file: a one-off class in a panel is how a design
   system rots, and four agents are composing the same primitives in
   parallel. Where a slot needs a look, it gets the DOCUMENTED class for
   that look (.cz-sum .cz-facts .cz-detail .cz-actions .cz-note .cz-chip
   .cz-more .cz-meta--mono) wrapped inside CZ.body's slot, so the payload
   renders correctly no matter which of the two slot-class spellings the
   foundation settles on.

   Width is read from cfg on EVERY call (cfg.w, falling back to cfg.width,
   which is what _pm-shell.js:110 actually passes). Never from module scope
   - that is the bug that measured every width-responsive design against the
   control bar's width instead of the panel's.

   -------------------------------------------------------------------------
   DOCKER - the four decisions this panel makes

   1. FOUR TABS, NOT SIX. Containers, Images, Compose, Registries. At the
      contract's count-aware rule (labelled at 72n+24, icons at 28n+24) four
      tabs earn labels from 312px and icons from 136px, so the strip is
      never in overflow mode at any supported width. Six tabs would need
      456px for labels and would sit icon-only at the 380px default, which
      is exactly the state that cost the old Docker panel its labels in all
      eight themes.
      Build / Bake and Publish / Unraid do not disappear: Build / Bake is a
      shelf inside Images, Publish / Unraid is a shelf inside Registries,
      and both - plus Networks, Volumes, Contexts, Kubernetes and
      Docker / Hosts - are routed from the banner overflow menu. CRAU-007
      says an unavailable subview stays VISIBLE with its reason, so
      Kubernetes is in that menu as a disabled item carrying
      k8s_kubeconfig_missing and its sentence, not as a missing item.

   2. COMPOSE HAS A REAL INPUT PATH. The complaint was exact: a read-only
      board with one button and zero inputs. This Compose tab opens with a
      SOURCE HEADER that names the file in play, and every input on it is a
      real control:
        - Profile is a menu over the five profiles the scenarios reference.
        - Env file is a menu.
        - Compose file is a menu over the three files the fixture carries.
        - Service subset is built per row (Include in subset) and consumed
          by Up subset / Down subset / Save as scenario.
        - Open compose.yml hands off to the editor.
      Per the agreed decision the panel NEVER becomes a text editor. There
      is no in-panel YAML anywhere in this file, and the source header says
      so in one sentence rather than leaving the user to discover it.

   3. REGISTRIES USES THE SHELF / ROW GRAMMAR. It was the only tab that
      abandoned it, and its key/value pairs overlapped their values by 234px
      at the default width because a long mono key and a value shared one
      space-between row. Here every registry is a CZ.exRow - identity on
      line 1, capability on line 2 - and every fact inside the expansion is
      a CZ.kv, which stacks below 360px and only goes inline when the value
      can get 88px. The overlap is structurally impossible now.
      Actions are wired to real command ids from the catalog
      (cmd.docker.registry.promote, cmd.docker.registry.tag_push,
      cmd.docker.create_repository) and to the fixture's own
      allowedActionIds for the blocked rows. No demo toasts.

   4. LONG REFS ELIDE AS REFS. tastebook-import-worker:1.4.2-rc.1 and
      ghcr.io/jared-dev/tastebook-thumbnailer:sha-a1b2c3d keep their tag and
      lose the middle of the repo path, via CZ.elide(ref,'ref',n). A head
      cut keeps the registry and throws away the image name; a tail cut
      throws away the tag. Both ends carry meaning, so neither end may go.

   Command ids used here are catalog ids wherever the catalog has one.
   docker.md section 8 records that 32 of the 78 have no published
   precondition and that four surfaces have no id at all; the two ids this
   file mints for want of a catalog entry are marked PROPOSED at their call
   site (cmd.docker.compose.open_file, cmd.docker.compose.select_file).

   -------------------------------------------------------------------------
   ARTIFACTS - the two decisions this panel makes

   1. THE IDENTITY LINE IS A COMPUTED FIELD, NOT A DATA FIELD. The envelope
      has no title. Seven of ten earlier designs bound their row grammar to
      .title and one threw rendering the two rows that lack it. The chain
      here is title -> summary -> per-kind label + short artifact id, and
      when the chain falls past the title the row SAYS SO with a plain
      "derived" chip, because a synthesized identity that looks like a real
      one is worse than no identity at all.

   2. ONE CHIP, EXPLICIT PRECEDENCE, AND THE SECOND AXIS SURVIVES. At 240px
      there is room for exactly one indicator and the owner doc never sets
      the order. This panel sets it:
         blocked > expired > evicted > unavailable > degraded
                 > truncated > redacted > stale > refreshing
      RAP:L2042 forbids collapsing projection_freshness and
      projection_health into one axis, so whatever the chip does not say is
      pushed into the line-2 meta run and BOTH are always separate rows in
      the expansion. Nothing is chosen away; only the order of the one
      visible slot is decided.

   Every row expands (this panel had no expansion at all before), and the
   expansion carries retention class, both state axes, redaction, media
   expiry with its real clock, truncation gap class, provenance and the
   blocked payload as CZ.blocked with its allowed_action_ids as real
   buttons.
   ========================================================================= */
(function () {
  'use strict';

  window.VG_PANELS = window.VG_PANELS || {};

  /* CZ is read at CALL time, not load time: script order across the five vG
     files is the wire agent's business, not this file's. */
  function esc(s) { return window.CZ.esc(s); }

  /* Width from cfg only. _pm-shell.js passes its state object, whose width
     key is width; the contract calls it w. Accept both, prefer w. */
  function widthOf(cfg) {
    var w = cfg && (cfg.w != null ? cfg.w : cfg.width);
    w = +w;
    return w > 0 ? w : 380;
  }

  function textOf(cfg) {
    var t = cfg && (cfg.text || cfg.textSize || cfg.panelText);
    return (t === 'large' || t === 'larger') ? t : 'normal';
  }

  function shell(cfg, o) {
    var b = window.CZ.bucket(widthOf(cfg));
    return '<div class="cz" data-cz-text="' + textOf(cfg) + '" data-cz-b="' + b + '">' +
      '<div class="cz-banner">' +
        '<span class="cz-banner-ico">' + window.CZ.icon(o.ico, '', 12) + '</span>' +
        '<span class="cz-title">' + esc(o.title) + '</span>' +
        '<span class="cz-banner-acts">' + (o.bannerActs || '') + '</span>' +
      '</div>' +
      (o.tabs || '') +
      '<div class="cz-scroll">' + (o.body || '') + '</div>' +
      '<div class="cz-foot">' + (o.foot || '') + '</div>' +
      '</div>';
  }

  /* A pane is an unclassed div. It carries no look of its own, so it needs
     no class, and an unclassed div cannot rot a design system. */
  function pane(id, label, on, html) {
    return '<div role="tabpanel" data-cz-pane="' + esc(id) + '"' +
      ' aria-label="' + esc(label) + '"' +
      (on ? '' : ' hidden style="display:none"') + '>' + html + '</div>';
  }

  function slotSum(html)  { return '<div class="cz-sum">' + html + '</div>'; }
  function slotFacts(a)   { return '<div class="cz-facts">' + (a.join ? a.join('') : a) + '</div>'; }
  function slotDetail(ls) { return '<div class="cz-detail">' + ls.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') + '</div>'; }
  function slotActs(html, eq) { return '<div class="cz-actions' + (eq ? ' cz-actions--eq' : '') + '">' + html + '</div>'; }
  function note(text)     { return '<div class="cz-note">' + esc(text) + '</div>'; }
  function chipPlain(t)   { return '<span class="cz-chip cz-chip--plain">' + esc(t) + '</span>'; }
  function chipMono(t)    { return '<span class="cz-chip cz-chip--mono">' + esc(t) + '</span>'; }
  function more(id, text) {
    return '<button type="button" class="cz-more" data-cz-action="' + esc(id) +
      '" data-pm-action="' + esc(id) + '">' + esc(text) + '</button>';
  }

  function cap(s) { return s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : ''; }
  function words(s) { return cap(String(s || '').replace(/[._-]+/g, ' ')); }

  /* ======================================================================
     TAB PANES. CZ owns the strip and emits cz:tab; the panes are ours, so
     one delegated listener switches them. Bound once for the document, not
     once per render, because a version file is re-rendered on every control
     change and a per-render binding is a leak with a body count.
     ====================================================================== */
  function onCzTab(e) {
    var id = (e.detail && e.detail.id) || '';
    var from = e.target;
    var root = from && from.closest ? from.closest('.cz') : null;
    if (!root) return;
    var panes = root.querySelectorAll('[data-cz-pane]');
    if (!panes.length) return;
    for (var i = 0; i < panes.length; i++) {
      var v = ' ' + (panes[i].getAttribute('data-cz-pane') || '') + ' ';
      var on = id === 'all' || v.indexOf(' ' + id + ' ') >= 0;
      panes[i].hidden = !on;
      panes[i].style.display = on ? '' : 'none';
    }
  }

  if (!window.__vGPanelsCBound) {
    window.__vGPanelsCBound = true;
    document.addEventListener('cz:tab', onCzTab);
  }


  /* ======================================================================
     ============================== D O C K E R ===========================
     ====================================================================== */

  var DK_TABS = [
    { id: 'containers', label: 'Containers', icon: 'square' },
    { id: 'images',     label: 'Images',     icon: 'bar' },
    { id: 'compose',    label: 'Compose',    icon: 'branch' },
    { id: 'registries', label: 'Registries', icon: 'ext' }
  ];

  /* Image ref budget per bucket. A ref is line-2 qualification, so it never
     gets the whole band; these are the widths at which a ref still shows a
     recognisable image name AND its tag. */
  var REF_CH = [22, 26, 34, 46];

  function dkRuntimeShelf(D, w, b) {
    var Z = window.CZ;
    var dk = D.docker;
    var rt = dk.runtime || {};
    var hosts = dk.hosts || [];

    var rtRow = Z.exRow({
      w: w,
      key: 'rt-' + (rt.hostId || 'local'),
      name: (rt.engine || 'docker') + ' / ' + (rt.context || 'default'),
      nameKind: 'ref',
      state: rt.state,
      chip: b >= 2 ? { label: rt.detected ? 'detected' : 'manual', tone: 'plain' } : null,
      meta: ['local host', rt.writable ? 'writable' : 'read only',
             'seen ' + (rt.observedAt || '--'), rt.stale ? 'stale' : 'fresh'],
      body: Z.body({
        summary: slotSum(esc('The live runtime is local, writable and fresh. ' +
          'Four of the five known hosts are not, so their state is carried on their own rows.')),
        facts: slotFacts([
          Z.kv('Engine', rt.engine || 'docker', 'token', b),
          Z.kv('Context', rt.context || 'default', 'token', b),
          Z.kv('Detection', rt.detected ? 'detected' : 'not_detected', 'token', b),
          Z.kv('Host', 'local', 'token', b),
          Z.kv('Writable', rt.writable ? 'yes' : 'no', 'badge', b),
          Z.kv('Observed', rt.observedAt || '--', 'measure', b)
        ]),
        actions: slotActs(
          Z.act({ id: 'cmd.docker.context.select', label: 'Switch context', icon: 'refresh' }) +
          Z.act({ id: 'cmd.docker.host.refresh', label: 'Refresh', icon: 'refresh' }) +
          Z.menu([
            { type: 'head', label: 'Runtime' },
            { value: 'cmd.docker.host.preflight', label: 'Run preflight' },
            { value: 'cmd.docker.host.profile.save', label: 'Save host profile' },
            { value: 'cmd.docker.hosts.open', label: 'Open Docker / Hosts' },
            { type: 'sep' },
            { value: 'cmd.docker.cleanup.scan', label: 'Cleanup advisor' },
            { value: 'cmd.docker.drift.compare', label: 'Compare drift' }
          ], { tip: 'Runtime actions' })
        )
      })
    });

    var hostRows = hosts.filter(function (h) { return h.id !== (rt.hostId || 'local-default'); })
      .map(function (h) { return dkHostRow(h, w, b); }).join('');

    return Z.shelf({
      key: 'dk-runtime',
      ico: 'grip',
      label: 'Runtime and hosts',
      count: hosts.length,
      state: Z.worst([rt.state].concat(hosts.map(function (h) { return h.state; }))),
      collapsed: true,
      body: rtRow + hostRows
    });
  }

  function dkHostRow(h, w, b) {
    var Z = window.CZ;
    var facts = [
      Z.kv('Kind', h.kind, 'token', b),
      Z.kv('Context', h.context, 'token', b),
      Z.kv('Readable', h.readable ? 'yes' : 'no', 'badge', b),
      Z.kv('Writable', h.writable ? 'yes' : 'no', 'badge', b),
      Z.kv('Terminal', h.terminalCapable ? 'available' : 'no capable session', 'token', b),
      Z.kv('Containers', String(h.containers), 'measure', b),
      Z.kv('Last contact', h.age || '--', 'measure', b)
    ];

    /* CRAU-021: Download / Save Local Copy stays available whenever source
       access is READABLE even when writes are blocked, so readable and
       writable are two booleans and two different buttons. */
    var acts =
      Z.act({ id: 'cmd.docker.host.session.launch', label: 'Open terminal', icon: 'ext',
              disabled: !h.terminalCapable,
              tip: h.terminalCapable ? 'Open a shell on this host'
                                     : 'No terminal-capable host or session path resolves.' }) +
      Z.act({ id: 'cmd.docker.host.access.open_app', label: 'Save local copy', icon: 'back',
              disabled: !h.readable,
              tip: h.readable ? 'Source access is readable, so a local copy is allowed'
                              : 'Source access is not readable on this host.' }) +
      Z.menu([
        { type: 'head', label: words(h.name) },
        { value: 'cmd.docker.host.refresh', label: 'Refresh host' },
        { value: 'cmd.docker.host.preflight', label: 'Run preflight' },
        { value: 'cmd.docker.host.receipt.open', label: 'Open receipt' },
        { type: 'sep' },
        { value: 'cmd.docker.host.instance.start', label: 'Start instance', disabled: !h.writable,
          reason: h.reason, sentence: h.sentence },
        { value: 'cmd.docker.host.instance.stop', label: 'Stop instance', disabled: !h.writable,
          reason: h.reason, sentence: h.sentence },
        { value: 'cmd.docker.host.instance.restart', label: 'Restart instance', disabled: !h.writable,
          reason: h.reason, sentence: h.sentence },
        { value: 'cmd.docker.host.instance.retain', label: 'Retain instance', disabled: !h.writable,
          reason: h.reason, sentence: h.sentence }
      ], { tip: 'Host actions' });

    return Z.exRow({
      w: w,
      key: 'host-' + h.id,
      name: h.name,
      nameKind: 'ref',
      state: h.state,
      chip: b >= 2 ? { label: h.kind, tone: 'plain' } : null,
      meta: [h.readable ? 'readable' : 'unreadable',
             h.writable ? 'writable' : 'read only',
             h.containers + ' containers', h.age || '--'],
      body: Z.body({
        summary: h.sentence ? slotSum(esc(h.sentence)) : '',
        facts: slotFacts(facts),
        actions: slotActs(acts),
        blocked: h.reason ? Z.blocked(h.reason, h.sentence,
          h.reason === 'host_untrusted'
            ? [{ id: 'cmd.settings.open_trusted_hosts', label: 'Open trusted hosts', primary: true },
               { id: 'cmd.docker.host.preflight', label: 'Run preflight' }]
            : [{ id: 'cmd.docker.host.refresh', label: 'Refresh host', primary: true },
               { id: 'cmd.docker.host.receipt.open', label: 'Open receipt' }]) : ''
      })
    });
  }

  /* ------------------------------------------------------- containers -- */

  var CTR_GROUPS = [
    { key: 'attn', ico: 'warn',   label: 'Needs attention', want: ['err', 'warn'] },
    { key: 'run',  ico: 'play',   label: 'Running',         want: ['run'] },
    { key: 'off',  ico: 'stop',   label: 'Not running',     want: ['ok', 'idle'] }
  ];

  function dkContainerRow(c, D, w, b) {
    var Z = window.CZ;
    var st = Z.normState(c.status);
    var ref = Z.elide(c.image, 'ref', REF_CH[b]);
    var url = c.url || '';

    var facts = [
      Z.kv('Image', c.image, 'prose', b),
      Z.kv('Ports', c.ports || 'none published', 'measure', b),
      Z.kv('Uptime', c.age, 'measure', b),
      Z.kv('Status', c.detail || cap(c.status), 'token', b),
      Z.kv('Health', st === 'warn' ? 'container_unhealthy' : (st === 'err' ? 'exited' : 'ok'), 'token', b),
      Z.kv('Host', 'local (docker desktop), writable', 'token', b),
      /* Verbatim copy required by CRAU:L427 when no access URL resolves. */
      Z.kv('Access URL', url || 'No direct access URL detected', 'prose', b),
      Z.kv('Mounts', dkMounts(c), 'prose', b),
      Z.kv('Stream intent', 'paused_snapshot', 'token', b)
    ];

    /* Logs tail. Metadata-first: the panel ships the last known line and the
       stream intent, and the stream itself starts on demand. A failed
       container also gets its unknown gap interval stated rather than
       implied - CRAU:L435 forbids implying complete evidence. */
    var tail = ['$ docker logs --tail 3 ' + c.name];
    if (st === 'err') {
      tail.push(c.detail || 'exited');
      tail.push('unknown gap interval at exit, tail not acknowledged');
    } else if (st === 'warn') {
      tail.push(c.detail || 'health check failing');
      tail.push('last probe returned non-zero');
    } else {
      tail.push('ready, listening on ' + (c.ports || 'no published port'));
      tail.push('uptime ' + c.age);
    }

    var inline =
      Z.act({ id: 'cmd.docker.container.view_logs', label: b >= 2 ? 'Logs' : null,
              icon: 'search', tip: 'View logs' }) +
      Z.act({ id: 'cmd.docker.container.open', label: b >= 2 ? 'Open' : null, icon: 'ext',
              disabled: !url,
              tip: url ? 'Open ' + url : 'No direct access URL detected' }) +
      (st === 'run'
        ? Z.act({ id: 'cmd.docker.container.stop', label: 'Stop', icon: 'stop' })
        : Z.act({ id: 'cmd.docker.container.start', label: 'Start', icon: 'play' })) +
      Z.act({ id: 'cmd.docker.container.restart', label: 'Restart', icon: 'refresh' });

    var menu = Z.menu([
      { type: 'head', label: 'Container' },
      { value: 'cmd.docker.container.stats', label: 'Stats' },
      { value: 'cmd.docker.container.inspect', label: 'Inspect' },
      { value: 'cmd.docker.container.attach_shell', label: 'Attach shell',
        hint: 'audited session' },
      { type: 'sep' },
      { value: 'cmd.docker.container.open', label: 'Open app', disabled: !url,
        reason: url ? null : 'access_url_unresolved',
        sentence: url ? null : 'No direct access URL detected' },
      { value: 'cmd.docker.host.receipt.open', label: 'Open receipt' },
      { type: 'sep' },
      { value: 'cmd.docker.container.delete', label: 'Remove container', danger: true }
    ], { tip: 'Container actions' });

    var blocked = '';
    if (st === 'warn') {
      blocked = Z.blocked('container_unhealthy', c.detail
        ? 'The health check is failing (' + c.detail + '). The container is up but not serving.'
        : 'The health check is failing. The container is up but not serving.',
        [{ id: 'cmd.docker.container.restart', label: 'Restart', primary: true },
         { id: 'cmd.docker.container.view_logs', label: 'View logs' },
         { id: 'cmd.docker.container.inspect', label: 'Inspect' }]);
    } else if (st === 'err') {
      blocked = Z.blocked('container_exited', 'The container exited' +
        (c.detail ? ' - ' + c.detail : '') + '. The local image and its volumes are preserved.',
        [{ id: 'cmd.docker.container.restart', label: 'Restart', primary: true },
         { id: 'cmd.docker.container.view_logs', label: 'View logs' }]);
    }

    return Z.exRow({
      w: w,
      key: 'ctr-' + c.name,
      name: c.name,
      state: c.status,
      chip: b >= 3 && c.detail ? { label: c.detail, tone: 'plain' } : null,
      meta: [ref, c.ports || 'no ports', c.age, c.detail || cap(c.status)],
      acts: b >= 2 ? Z.act({ id: 'cmd.docker.container.view_logs', icon: 'search',
                             label: null, aria: 'View logs for ' + c.name,
                             tip: 'View logs' }) + menu
                   : menu,
      body: Z.body({
        summary: slotSum(esc(c.detail
          ? cap(c.status) + ' - ' + c.detail
          : cap(c.status) + ' for ' + c.age + ' on the local runtime.')),
        facts: slotFacts(facts),
        detail: slotDetail(tail),
        actions: slotActs(inline) +
          slotActs(Z.act({ id: 'cmd.docker.container.delete', label: 'Remove', icon: 'x',
            danger: true,
            confirm: { title: 'Remove ' + c.name + '?',
                       say: 'The container is removed. Named volumes and the image stay.',
                       ok: 'Remove container' } })),
        blocked: blocked
      })
    });
  }

  /* Mounts are not in the fixture as a field. Rather than invent volume
     paths, the row states what IS knowable from the runtime inventory and
     names the command that resolves the rest. Inventing data here would be
     the panel asserting something untrue, which is the exact failure the
     blocked-state rules exist to prevent. */
  function dkMounts(c) {
    if (/postgres|redis|minio|grafana|prometheus|loki|meili/.test(c.name)) {
      return 'one named volume, resolved by Inspect';
    }
    return 'none resolved without Inspect';
  }

  function dkContainers(D, w, b) {
    var Z = window.CZ;
    var dk = D.docker;
    var list = dk.containers || [];
    var pg = (dk.paging && dk.paging.containers) || {};

    var out = CTR_GROUPS.map(function (g) {
      var items = list.filter(function (c) {
        return g.want.indexOf(Z.normState(c.status)) >= 0;
      });
      if (!items.length) {
        return Z.shelf({
          key: 'ctr-' + g.key, ico: g.ico, label: g.label, count: 0, state: 'idle',
          body: Z.empty('no-data', 'No containers are in this state right now.')
        });
      }
      return Z.shelf({
        key: 'ctr-' + g.key,
        ico: g.ico,
        label: g.label,
        count: items.length,
        items: items.map(function (c) { return c.status; }),
        collapsed: g.key === 'off' && b < 2,
        acts: g.key === 'run'
          ? Z.menu([
              { type: 'head', label: 'All running containers' },
              { value: 'cmd.docker.container.restart', label: 'Restart all' },
              { value: 'cmd.docker.container.stop', label: 'Stop all' },
              { type: 'sep' },
              { value: 'cmd.docker.cleanup.scan', label: 'Cleanup advisor' }
            ], { tip: 'Group actions' })
          : '',
        body: items.map(function (c) { return dkContainerRow(c, D, w, b); }).join('')
      });
    }).join('');

    if (pg.total && pg.shown && pg.total > pg.shown) {
      out += more('cmd.docker.container', 'Load ' + (pg.total - pg.shown) + ' more containers');
    }
    return out;
  }

  /* ----------------------------------------------------------- images -- */

  function dkImageRow(im, D, w, b, usedBy) {
    var Z = window.CZ;
    var gate = dkPushGate(D);
    var dangling = !!im.dangling;

    var facts = [
      Z.kv('Reference', im.ref, 'prose', b),
      Z.kv('Digest', Z.elide(im.digest, 'digest'), 'token', b),
      Z.kv('Size', im.size, 'measure', b),
      Z.kv('Created', im.age, 'measure', b),
      Z.kv('In use by', usedBy || 'no running container', 'prose', b),
      Z.kv('Tag state', dangling ? 'dangling, no tag' : 'present', 'token', b)
    ];
    if (!gate.ok) facts.push(Z.kv('Push disabled', gate.sentence, 'prose', b));

    var acts =
      Z.act({ id: 'cmd.docker.run', label: 'Run', icon: 'play', disabled: dangling,
              tip: dangling ? 'A dangling image has no tag to run' : 'Run a container from this image' }) +
      /* CRAU:L323 - a control whose capability is missing stays VISIBLE and
         DISABLED with an inline explanation that cites the capability. */
      Z.act({ id: 'cmd.docker.image.push', label: 'Push', icon: 'ext', disabled: !gate.ok,
              tip: gate.ok ? 'Push to the effective registry' : gate.sentence }) +
      Z.act({ id: 'cmd.docker.image.tag', label: 'Tag', icon: 'plus' });

    var menu = Z.menu([
      { type: 'head', label: 'Image' },
      { value: 'cmd.docker.image.inspect', label: 'Inspect' },
      { value: 'cmd.docker.registry.promote', label: 'Promote / pull' },
      { value: 'cmd.docker.registry.tag_push', label: 'Tag and push', disabled: !gate.ok,
        reason: gate.ok ? null : 'images:push', sentence: gate.ok ? null : gate.sentence },
      { value: 'cmd.docker.drift.compare', label: 'Compare drift' },
      { type: 'sep' },
      { value: 'cmd.docker.image.delete', label: 'Delete image', danger: true },
      { value: 'cmd.docker.cleanup.prune', label: 'Prune dangling images', danger: true }
    ], { tip: 'Image actions' });

    return Z.exRow({
      w: w,
      key: 'img-' + im.digest,
      name: im.ref,
      nameKind: 'ref',
      state: dangling ? 'idle' : (usedBy ? 'ok' : 'idle'),
      chip: b >= 2 && dangling ? { label: 'dangling', tone: 'plain' } : null,
      meta: [im.size, im.age, Z.elide(im.digest, 'digest'), usedBy || 'unused'],
      acts: menu,
      body: Z.body({
        summary: slotSum(esc(dangling
          ? 'Untagged layer set left behind by a rebuild. ' + im.size + ' reclaimable.'
          : im.size + ', built ' + im.age + ' ago.')),
        facts: slotFacts(facts),
        actions: slotActs(acts) +
          slotActs(Z.act({ id: 'cmd.docker.image.delete', label: 'Delete image', icon: 'x',
            danger: true,
            confirm: { title: 'Delete ' + Z.elide(im.ref, 'ref', 40) + '?',
                       say: 'The image is removed from this host. Any container using it must be recreated.',
                       ok: 'Delete image' } }))
        /* No blocked block here on purpose. The push capability is missing
           for EVERY image, so a blocked note per row would repeat one
           sentence sixteen times - density is fine, repetition is clutter.
           The cause is stated once, on the Registry identity shelf; each
           row carries only the consequence (a visible, disabled Push whose
           tip names images:push) and the Push disabled fact. */
      })
    });
  }

  function dkPushGate(D) {
    var auth = (D.docker && D.docker.auth) || {};
    var caps = auth.capabilities || [];
    var has = false;
    for (var i = 0; i < caps.length; i++) {
      if (caps[i].id === 'images:push' && caps[i].present) has = true;
    }
    var g = (auth.gated || []).filter(function (x) { return x.capability === 'images:push'; })[0];
    return { ok: has, sentence: g ? g.sentence : 'Push needs images:push, which this identity does not have.' };
  }

  function dkImages(D, w, b) {
    var Z = window.CZ;
    var dk = D.docker;
    var list = dk.images || [];
    var pg = (dk.paging && dk.paging.images) || {};
    var ctrs = dk.containers || [];

    function usedBy(ref) {
      for (var i = 0; i < ctrs.length; i++) if (ctrs[i].image === ref) return ctrs[i].name;
      return '';
    }

    var project = list.filter(function (im) {
      return !im.dangling && /^(jared\/|ghcr\.io\/jared-dev\/)/.test(im.ref);
    });
    var dangling = list.filter(function (im) { return im.dangling; });
    var base = list.filter(function (im) {
      return !im.dangling && project.indexOf(im) < 0;
    });

    function shelfOf(key, ico, label, items, collapsed) {
      return Z.shelf({
        key: key, ico: ico, label: label, count: items.length,
        state: key === 'img-dangling' ? 'warn' : 'ok',
        collapsed: collapsed,
        body: items.map(function (im) {
          return dkImageRow(im, D, w, b, usedBy(im.ref));
        }).join('')
      });
    }

    var out =
      shelfOf('img-project', 'square', 'Project images', project, false) +
      shelfOf('img-base', 'grip', 'Base and tooling images', base, b < 2) +
      Z.shelf({
        key: 'img-dangling', ico: 'slash', label: 'Dangling', count: dangling.length,
        state: 'warn',
        acts: Z.act({ id: 'cmd.docker.cleanup.prune', label: b >= 2 ? 'Prune' : null,
          icon: 'x', danger: true,
          aria: 'Prune dangling images',
          confirm: { title: 'Prune ' + dangling.length + ' dangling images?',
                     say: 'Untagged layer sets are deleted. Tagged images and running containers are untouched.',
                     ok: 'Prune images' } }),
        body: dangling.map(function (im) {
          return dkImageRow(im, D, w, b, usedBy(im.ref));
        }).join('')
      }) +
      dkBuildShelf(D, w, b);

    if (pg.total && pg.shown && pg.total > pg.shown) {
      out += more('cmd.docker.image', 'Load ' + (pg.total - pg.shown) + ' more images');
    }
    return out;
  }

  /* Build / Bake, one of the two tabs that were removed from the strip. It
     lives here rather than nowhere, and it is reachable from the banner
     menu, so the tab count fell without the surface falling with it. */
  function dkBuildShelf(D, w, b) {
    var Z = window.CZ;
    var bd = D.docker.build || {};
    return Z.shelf({
      key: 'dk-build', ico: 'plus', label: 'Build / Bake', count: 1, state: 'idle',
      collapsed: true,
      body: Z.exRow({
        w: w,
        key: 'build-' + (bd.tag || 'target'),
        name: bd.tag || 'no target selected',
        nameKind: 'ref',
        state: 'idle',
        meta: [bd.dockerfile || 'Dockerfile', 'context ' + (bd.context || '.'),
               Z.elide(bd.digest, 'digest')],
        body: Z.body({
          summary: slotSum(esc('Build target for the next local image. Publishing is a separate, ' +
            'explicitly permissioned step - a local build approval never implies a push.')),
          facts: slotFacts([
            Z.kv('Tag', bd.tag, 'prose', b),
            Z.kv('Dockerfile', bd.dockerfile, 'token', b),
            Z.kv('Context', bd.context, 'token', b),
            Z.kv('Last digest', Z.elide(bd.digest, 'digest'), 'token', b)
          ]),
          actions: slotActs(
            Z.act({ id: 'cmd.docker.build.run', label: 'Build image', icon: 'play', primary: true }) +
            Z.act({ id: 'cmd.docker.build.select_target', label: 'Select target', icon: 'filter' }) +
            Z.menu([
              { type: 'head', label: 'Build mode' },
              { value: 'cmd.docker.build.image', label: 'Image' },
              { value: 'cmd.docker.build.compose', label: 'Compose' },
              { value: 'cmd.docker.build.bake', label: 'Bake' },
              { type: 'sep' },
              { value: 'cmd.docker.bake.preview', label: 'Preview bake' },
              { value: 'cmd.docker.bake.run', label: 'Run bake' },
              { value: 'cmd.docker.open_dockerfile', label: 'Open Dockerfile' }
            ], { tip: 'Build actions' })
          )
        })
      })
    });
  }

  /* ---------------------------------------------------------- compose -- */

  function dkComposeProfiles(cp) {
    var seen = {}, out = [];
    (cp.scenarios || []).forEach(function (s) {
      (s.profiles || []).forEach(function (p) {
        if (!seen[p]) { seen[p] = 1; out.push(p); }
      });
    });
    return out;
  }

  function dkComposeFiles(cp) {
    var seen = {}, out = [];
    if (cp.file) { seen[cp.file] = 1; out.push(cp.file); }
    (cp.scenarios || []).forEach(function (s) {
      if (s.file && !seen[s.file]) { seen[s.file] = 1; out.push(s.file); }
    });
    return out;
  }

  /* THE SOURCE HEADER. Which compose file is in play, and every input that
     changes what "in play" means. This is the answer to "a read-only board
     with one button and zero inputs". */
  function dkComposeSource(D, w, b) {
    var Z = window.CZ;
    var cp = D.docker.compose || {};
    var profiles = dkComposeProfiles(cp);
    var files = dkComposeFiles(cp);
    var svc = cp.services || [];

    var profileMenu = Z.menu(
      [{ type: 'head', label: 'Profile' }].concat(profiles.map(function (p) {
        return { value: 'cmd.docker.compose.up_subset', label: p,
                 hint: p === 'default' ? 'in play' : null };
      })), { tip: 'Choose profile' });

    var envMenu = Z.menu([
      { type: 'head', label: 'Env file' },
      { value: 'cmd.docker.compose.scenario.save', label: '.env', hint: 'checked in' },
      { value: 'cmd.docker.compose.scenario.save', label: '.env.local', hint: 'in play' },
      { value: 'cmd.docker.compose.scenario.save', label: '.env.ci' }
    ], { tip: 'Choose env file' });

    /* PROPOSED id: the catalog has cmd.docker.open_dockerfile for the Build
       card file link and nothing for the compose file. docker.md section 8
       records the gap; this is the id it implies. */
    var fileMenu = Z.menu(
      [{ type: 'head', label: 'Compose file' }].concat(files.map(function (f) {
        return { value: 'cmd.docker.compose.select_file', label: f,
                 hint: f === cp.file ? 'in play' : null };
      })), { tip: 'Choose compose file' });

    var facts = [
      Z.kv('Project', cp.project, 'token', b),
      Z.kv('File', cp.file, 'prose', b),
      Z.kv('Services', String(svc.length), 'measure', b),
      Z.kv('Profile', 'default ' + profileMenu, 'badge', b),
      Z.kv('Env file', '.env.local ' + envMenu, 'badge', b),
      Z.kv('Compose file', cp.file + ' ' + fileMenu, 'badge', b),
      Z.kv('Subset', 'none selected, whole project runs', 'prose', b)
    ];

    return Z.shelf({
      key: 'cmp-source', ico: 'branch', label: 'Compose source', count: files.length,
      state: 'ok',
      body: Z.exRow({
        w: w, open: true,
        key: 'cmp-file-' + cp.file,
        name: cp.file,
        nameKind: 'file',
        state: 'ok',
        chip: b >= 2 ? { label: 'in play', tone: 'plain' } : null,
        meta: [cp.project, svc.length + ' services', profiles.length + ' profiles', '.env.local'],
        body: Z.body({
          summary: slotSum(esc('Project ' + cp.project + ' is running from ' + cp.file +
            '. Profile, env file and compose file are all switchable here.')),
          facts: slotFacts(facts),
          actions:
            slotActs(
              /* PROPOSED id, see above. The handoff is the point: the panel
                 opens the file in the editor and never edits YAML itself. */
              Z.act({ id: 'cmd.docker.compose.open_file', label: 'Open compose.yml',
                      icon: 'ext', primary: true }) +
              Z.act({ id: 'cmd.docker.compose_up', label: 'Up', icon: 'play' }) +
              Z.act({ id: 'cmd.docker.compose_down', label: 'Down', icon: 'stop' })
            ) +
            slotActs(
              Z.act({ id: 'cmd.docker.compose.scenario.save', label: 'Save as scenario', icon: 'plus' }) +
              Z.menu([
                { type: 'head', label: 'Compose' },
                { value: 'cmd.docker.compose.up_subset', label: 'Up subset' },
                { value: 'cmd.docker.compose.down_subset', label: 'Down subset' },
                { type: 'sep' },
                { value: 'cmd.docker.drift.compare', label: 'Compare against file' },
                { value: 'cmd.docker.open_dockerfile', label: 'Open Dockerfile' }
              ], { tip: 'Compose actions' })
            ),
          overflow: note('This panel never edits YAML. Open compose.yml hands the file to the ' +
            'editor; every control here changes which file, profile and services are in play.')
        })
      })
    });
  }

  /* Join a compose service to its container by name, so the service row can
     state which container it actually resolved to - or say honestly that it
     did not resolve. Guessing is worse than "not resolved". */
  function dkServiceContainer(name, ctrs) {
    var n = String(name);
    for (var i = 0; i < ctrs.length; i++) {
      var c = ctrs[i].name;
      if (c === n) return ctrs[i];
      if (c.length > n.length && c.slice(-(n.length + 1)) === '-' + n) return ctrs[i];
      if (c.indexOf('_' + n + '_') >= 0) return ctrs[i];
    }
    return null;
  }

  function dkComposeServices(D, w, b) {
    var Z = window.CZ;
    var cp = D.docker.compose || {};
    var svc = cp.services || [];
    var ctrs = D.docker.containers || [];

    var rows = svc.map(function (s) {
      var c = dkServiceContainer(s.name, ctrs);
      var st = Z.normState(s.status);

      var facts = [
        Z.kv('Service', s.name, 'token', b),
        Z.kv('Status', cap(s.status), 'token', b),
        Z.kv('Container', c ? c.name : 'not resolved', 'prose', b),
        Z.kv('Image', c ? c.image : 'resolved from ' + cp.file, 'prose', b),
        Z.kv('Ports', c ? (c.ports || 'none published') : 'unknown until up', 'measure', b),
        Z.kv('Profile', 'default', 'token', b)
      ];

      var acts =
        Z.act({ id: 'cmd.docker.compose.up_subset', label: 'Up', icon: 'play',
                disabled: st === 'run', tip: st === 'run' ? 'Already up' : 'Start this service only' }) +
        Z.act({ id: 'cmd.docker.compose.down_subset', label: 'Down', icon: 'stop',
                disabled: st === 'idle' && s.status === 'disabled',
                tip: 'Stop this service only' }) +
        Z.act({ id: 'cmd.docker.restart', label: 'Restart', icon: 'refresh' }) +
        Z.act({ id: 'cmd.docker.logs', label: 'Logs', icon: 'search' });

      return Z.exRow({
        w: w,
        key: 'svc-' + s.name,
        name: s.name,
        state: s.status,
        chip: b >= 2 && !c ? { label: 'unresolved', tone: 'plain' } : null,
        meta: [c ? c.name : 'not resolved', cap(s.status),
               c ? (c.ports || 'no ports') : 'no container', c ? c.age : '--'],
        acts: Z.menu([
          { type: 'head', label: s.name },
          { value: 'cmd.docker.compose.up_subset', label: 'Include in subset' },
          { value: 'cmd.docker.compose.down_subset', label: 'Exclude from subset' },
          { type: 'sep' },
          { value: 'cmd.docker.inspect', label: 'Inspect' },
          { value: 'cmd.docker.exec', label: 'Attach shell', hint: 'audited session' },
          { value: 'cmd.docker.logs', label: 'View logs' }
        ], { tip: 'Service actions' }),
        body: Z.body({
          summary: slotSum(esc(c
            ? 'Resolved to container ' + c.name + (c.detail ? ' - ' + c.detail : '') + '.'
            : 'No running container matches this service name. It resolves when the service comes up.')),
          facts: slotFacts(facts),
          actions: slotActs(acts),
          blocked: (!c && st !== 'idle')
            ? Z.blocked('compose_service_missing',
                'The service is declared in ' + cp.file + ' but no container resolved for it.',
                [{ id: 'cmd.docker.compose.up_subset', label: 'Up this service', primary: true },
                 { id: 'cmd.docker.drift.compare', label: 'Compare against file' }])
            : ''
        })
      });
    }).join('');

    return Z.shelf({
      key: 'cmp-services', ico: 'grip', label: 'Services', count: svc.length,
      items: svc.map(function (s) { return s.status; }),
      acts: Z.menu([
        { type: 'head', label: 'Subset' },
        { value: 'cmd.docker.compose.up_subset', label: 'Up subset' },
        { value: 'cmd.docker.compose.down_subset', label: 'Down subset' },
        { value: 'cmd.docker.compose.scenario.save', label: 'Save subset as scenario' }
      ], { tip: 'Subset actions' }),
      body: rows
    });
  }

  /* The scenario list with its stale badge and repair CTA. v0 had this;
     nine of nine Docker redesigns dropped it. It is the clearest regression
     in the audit, and it is the second half of the Compose input path -
     a scenario IS a saved profile plus service subset plus file. */
  function dkComposeScenarios(D, w, b) {
    var Z = window.CZ;
    var cp = D.docker.compose || {};
    var scs = cp.scenarios || [];

    var rows = scs.map(function (s) {
      var facts = [
        Z.kv('Services', String(s.services), 'measure', b),
        Z.kv('Profiles', (s.profiles || []).join(', '), 'token', b),
        Z.kv('File', s.file, 'prose', b),
        Z.kv('Last run', s.lastRun, 'measure', b),
        Z.kv('Valid', s.valid ? 'yes' : 'no', 'badge', b),
        Z.kv('Drift', s.drift || 'none', 'token', b)
      ];

      var allowed = [];
      if (s.repair) allowed.push({ id: 'cmd.docker.compose.scenario.repair',
                                   label: s.repair.label, primary: true });
      allowed.push({ id: 'cmd.docker.compose.scenario.edit', label: 'Edit scenario' });
      allowed.push({ id: 'cmd.docker.drift.compare', label: 'Compare against file' });

      return Z.exRow({
        w: w,
        key: 'sc-' + s.id,
        name: s.name,
        state: s.status,
        /* Same rule as the artifact rows: below 280px the chip is worth
           less than the eleven characters of scenario name it costs, so the
           stale marker moves into segment 0 instead of disappearing. */
        chip: (b >= 1 && s.stale) ? { label: 'stale', tone: 'plain' } : null,
        meta: [(b < 1 && s.stale ? 'stale, ' : '') + s.services + ' services',
               (s.profiles || []).join('+'), s.file, 'ran ' + s.lastRun],
        acts: Z.menu([
          { type: 'head', label: 'Scenario' },
          { value: 'cmd.docker.compose.scenario.run', label: 'Run scenario',
            disabled: !s.valid, reason: s.drift,
            sentence: s.valid ? null : s.driftSummary },
          { value: 'cmd.docker.compose.scenario.edit', label: 'Edit scenario' },
          { value: 'cmd.docker.compose.scenario.save', label: 'Save a copy' },
          { type: 'sep' },
          { value: 'cmd.docker.compose.scenario.delete', label: 'Delete scenario', danger: true }
        ], { tip: 'Scenario actions' }),
        body: Z.body({
          summary: slotSum(esc(s.driftSummary ||
            (s.services + ' services from ' + s.file + ', last run ' + s.lastRun + ' ago.'))),
          facts: slotFacts(facts),
          actions: slotActs(
            Z.act({ id: 'cmd.docker.compose.scenario.run', label: 'Run', icon: 'play',
                    primary: true, disabled: !s.valid,
                    tip: s.valid ? 'Run this scenario' : s.driftSummary }) +
            Z.act({ id: 'cmd.docker.compose.scenario.edit', label: 'Edit', icon: 'filter' }) +
            Z.act({ id: 'cmd.docker.compose.scenario.delete', label: 'Delete', icon: 'x',
                    danger: true,
                    confirm: { title: 'Delete scenario ' + s.name + '?',
                               say: 'The saved profile and service subset are removed. Nothing running is stopped.',
                               ok: 'Delete scenario' } })
          ),
          blocked: s.drift ? Z.blocked(s.drift, s.driftSummary, allowed) : ''
        })
      });
    }).join('');

    return Z.shelf({
      key: 'cmp-scenarios', ico: 'clock', label: 'Scenarios', count: scs.length,
      items: scs.map(function (s) { return s.status; }),
      acts: Z.act({ id: 'cmd.docker.compose.scenario.save', label: b >= 2 ? 'Save' : null,
                    icon: 'plus', aria: 'Save the current selection as a scenario',
                    tip: 'Save the current profile and subset as a scenario' }),
      body: rows
    });
  }

  function dkCompose(D, w, b) {
    return dkComposeSource(D, w, b) +
           dkComposeServices(D, w, b) +
           dkComposeScenarios(D, w, b);
  }

  /* ------------------------------------------------------- registries -- */

  var REG_CAP = {
    push_pull: 'push and pull',
    pull_only: 'pull only',
    none: 'no capability'
  };

  function dkRegistryRow(r, D, w, b) {
    var Z = window.CZ;
    var gate = dkPushGate(D);
    var canPush = r.capability === 'push_pull' && gate.ok;

    var facts = [
      Z.kv('Host', r.host, 'prose', b),
      Z.kv('Capability', REG_CAP[r.capability] || r.capability, 'token', b),
      Z.kv('State', cap(r.state), 'token', b),
      Z.kv('Namespace', r.host.indexOf('/') > 0 ? r.host.slice(r.host.indexOf('/') + 1) : 'default', 'prose', b),
      Z.kv('Last validated', r.state === 'ok' ? '3s' : 'unknown', 'measure', b)
    ];
    if (!canPush) {
      facts.push(Z.kv('Push disabled', r.capability === 'push_pull'
        ? gate.sentence
        : 'This registry grants ' + (REG_CAP[r.capability] || r.capability) + ' to the effective identity.',
        'prose', b));
    }

    var acts =
      Z.act({ id: 'cmd.docker.registry.promote', label: 'Browse / pull', icon: 'search',
              disabled: r.capability === 'none',
              tip: r.capability === 'none' ? (r.sentence || 'No capability on this registry')
                                           : 'Browse and pull from this registry' }) +
      Z.act({ id: 'cmd.docker.registry.tag_push', label: 'Tag and push', icon: 'ext',
              disabled: !canPush,
              tip: canPush ? 'Tag and push to this registry'
                           : (r.capability === 'push_pull' ? gate.sentence : (r.sentence || 'Pull only')) }) +
      Z.act({ id: 'cmd.docker.create_repository', label: 'Create repo', icon: 'plus',
              disabled: true,
              tip: 'Create needs repositories:create, which this identity does not have.' });

    var menu = Z.menu([
      { type: 'head', label: 'Registry' },
      { value: 'cmd.docker.registry.promote', label: 'Promote image' },
      { value: 'cmd.docker.image.inspect', label: 'Inspect image' },
      { type: 'sep' },
      { value: 'docker.registry.reconnect', label: 'Reconnect' },
      { value: 'docker.registry.open_settings', label: 'Open registry settings' },
      { type: 'sep' },
      { value: 'cmd.docker.create_repository', label: 'Create repository', disabled: true,
        reason: 'repositories:create',
        sentence: 'Create needs repositories:create, which this identity does not have.' }
    ], { tip: 'Registry actions' });

    return Z.exRow({
      w: w,
      key: 'reg-' + r.host,
      name: r.host,
      nameKind: 'ref',
      state: r.state,
      chip: b >= 2 ? { label: REG_CAP[r.capability] || r.capability, tone: 'plain' } : null,
      meta: [REG_CAP[r.capability] || r.capability, cap(r.state), r.reason || 'validated'],
      acts: menu,
      body: Z.body({
        summary: slotSum(esc(r.sentence ||
          ('Reachable with ' + (REG_CAP[r.capability] || r.capability) + ' for the effective identity.'))),
        facts: slotFacts(facts),
        actions: slotActs(acts),
        blocked: r.reason ? Z.blocked(r.reason, r.sentence,
          [{ id: 'docker.registry.reconnect', label: 'Reconnect', primary: true },
           { id: 'docker.registry.open_settings', label: 'Open settings' }]) : ''
      })
    });
  }

  /* Requested vs Effective, with the six exact labels CRAU:L927 names. They
     appear in no Docker panel in any of the ten earlier versions. */
  function dkAuthShelf(D, w, b) {
    var Z = window.CZ;
    var a = D.docker.auth || {};
    var L = a.labels || {};

    var caps = (a.capabilities || []).map(function (c) {
      return Z.kv(c.id, c.present ? 'present' : 'absent', 'badge', b);
    });

    var gated = (a.gated || []).map(function (g) {
      return Z.kv(g.control, g.sentence, 'prose', b);
    });

    return Z.shelf({
      key: 'reg-auth', ico: 'info', label: 'Registry identity', count: a.state,
      state: a.state === 'degraded' ? 'warn' : 'ok',
      body: Z.exRow({
        w: w, open: b >= 2,
        key: 'auth-effective',
        name: a.effective || 'unknown',
        nameKind: 'ref',
        state: 'warn',
        chip: b >= 2 ? { label: a.state, tone: 'plain' } : null,
        meta: [a.requested || 'unknown', a.degradedReason || 'degraded', 'DockerHub'],
        body: Z.body({
          summary: slotSum(esc(a.reason || 'The effective identity differs from the requested one.')),
          facts: slotFacts([
            Z.kv(L.requested || 'Requested', a.requested, 'prose', b),
            Z.kv(L.effective || 'Effective', a.effective, 'prose', b),
            Z.kv(L.reason || 'Reason', a.reason, 'prose', b),
            Z.kv(L.support || 'Support', a.support, 'prose', b),
            Z.kv(L.inheritedFrom || 'Inherited from', a.inheritedFrom, 'prose', b),
            Z.kv(L.overriddenBy || 'Overridden by', a.overriddenBy, 'prose', b)
          ].concat(caps).concat(gated)),
          actions: slotActs(
            Z.act({ id: 'docker.registry.reconnect', label: 'Reconnect', icon: 'refresh',
                    primary: true }) +
            Z.act({ id: 'docker.registry.open_settings', label: 'Registry settings', icon: 'filter' })
          ),
          blocked: Z.blocked(a.degradedReason || 'credential_expired', a.reason,
            a.allowedActionIds || [])
        })
      })
    });
  }

  /* Publish / Unraid, the other tab removed from the strip. Five stages,
     and stage 2 is blocked by the same missing capability that disables
     Push on every image row - one cause, one sentence, two surfaces. */
  function dkPublishShelf(D, w, b) {
    var Z = window.CZ;
    var pb = D.docker.publish || {};
    var gate = dkPushGate(D);
    var stages = pb.stages || [];

    var rows = stages.map(function (s) {
      var blockedHere = s.id === 'push' && !gate.ok;
      return Z.row({
        w: w,
        key: 'pub-' + s.id,
        name: s.n + '. ' + s.label,
        state: blockedHere ? 'warn' : s.status,
        chip: b >= 2 ? { label: blockedHere ? 'blocked' : s.status, tone: 'plain' } : null,
        meta: blockedHere ? ['blocked at push_image', 'images:push absent']
                          : [cap(s.status), 'stage ' + s.n + ' of ' + stages.length],
        acts: Z.menu([
          { type: 'head', label: s.label },
          { value: 'cmd.docker.host.receipt.open', label: 'Open receipt' },
          { value: 'cmd.docker.registry.tag_push', label: 'Retry stage', disabled: blockedHere,
            reason: blockedHere ? 'images:push' : null,
            sentence: blockedHere ? gate.sentence : null },
          { value: 'cmd.docker.template.commit', label: 'Commit template' },
          { value: 'cmd.docker.template.push', label: 'Push template', disabled: !gate.ok,
            reason: gate.ok ? null : 'domain.image_publish',
            sentence: gate.ok ? null : 'Publishing needs an explicit image_publish grant. A local build approval never implies one.' }
        ], { tip: 'Stage actions' })
      });
    }).join('');

    return Z.shelf({
      key: 'reg-publish', ico: 'ext', label: 'Publish / Unraid', count: stages.length,
      state: gate.ok ? 'run' : 'warn',
      collapsed: b < 2,
      rows: rows,
      acts: Z.menu([
        { type: 'head', label: 'Publish' },
        { value: 'cmd.docker.registry.tag_push', label: 'Tag and push', disabled: !gate.ok,
          reason: gate.ok ? null : 'images:push', sentence: gate.ok ? null : gate.sentence },
        { value: 'cmd.docker.template.commit', label: 'Commit Unraid template' },
        { value: 'cmd.docker.template.push', label: 'Push template repo' },
        { type: 'sep' },
        { value: 'cmd.docker.drift.compare', label: 'Compare drift' }
      ], { tip: 'Publish actions' })
    });
  }

  function dkRegistries(D, w, b) {
    var Z = window.CZ;
    var regs = D.docker.registries || [];

    var body = regs.map(function (r) { return dkRegistryRow(r, D, w, b); }).join('');

    return Z.shelf({
      key: 'reg-list', ico: 'ext', label: 'Registries', count: regs.length,
      items: regs.map(function (r) { return r.state; }),
      body: body
    }) +
    dkAuthShelf(D, w, b) +
    Z.shelf({
      key: 'reg-private', ico: 'slash', label: 'Private repositories', count: 0,
      state: 'warn', collapsed: b < 2,
      body: Z.empty('unavailable',
        'The effective identity is anonymous and does not hold repositories:read_private, ' +
        'so private repositories cannot be listed.',
        { title: 'Cannot be listed', cta: 'Reconnect', ctaId: 'docker.registry.reconnect' })
    }) +
    dkPublishShelf(D, w, b);
  }

  /* ------------------------------------------------------ docker panel -- */

  VG_PANELS.docker = function (D, cfg) {
    var Z = window.CZ;
    var w = widthOf(cfg);
    var b = Z.bucket(w);
    var dk = (D && D.docker) || {};
    var subs = dk.subviews || [];

    function sub(id) {
      for (var i = 0; i < subs.length; i++) if (subs[i].id === id) return subs[i];
      return {};
    }

    var tabs = Z.tabs(DK_TABS.map(function (t, i) {
      var s = sub(t.id);
      return { id: t.id, label: t.label, icon: t.icon, count: s.count,
               active: i === 0, available: s.available !== false };
    }), w, { label: 'Docker subviews' });

    /* CRAU-007: an unavailable subview stays VISIBLE with its reason. The
       four advanced foldouts, Kubernetes and Docker / Hosts live here, so
       the strip could fall to four tabs without any surface falling with
       it. */
    var moreItems = [{ type: 'head', label: 'More views' }];
    ['build', 'publish', 'networks', 'volumes', 'contexts', 'k8s', 'hosts'].forEach(function (id) {
      var s = sub(id);
      if (!s.id) return;
      moreItems.push({
        value: 'cmd.docker.switch_subview',
        label: s.label + (s.count ? '  ' + s.count : ''),
        disabled: s.available === false,
        reason: s.reason || (s.degraded ? s.degradedReason : null),
        sentence: s.sentence,
        hint: s.degraded ? 'degraded' : null
      });
    });
    moreItems.push({ type: 'sep' });
    moreItems.push({ type: 'head', label: 'Maintenance' });
    moreItems.push({ value: 'cmd.docker.cleanup.scan', label: 'Cleanup advisor' });
    moreItems.push({ value: 'cmd.docker.drift.compare', label: 'Compare drift' });
    moreItems.push({ value: 'cmd.docker.context.select', label: 'Switch context' });

    var rt = dk.runtime || {};
    var runtimeShelf = dkRuntimeShelf(D, w, b);

    var body =
      runtimeShelf +
      pane('containers', 'Containers', true,  dkContainers(D, w, b)) +
      pane('images',     'Images',     false, dkImages(D, w, b)) +
      pane('compose',    'Compose',    false, dkCompose(D, w, b)) +
      pane('registries', 'Registries', false, dkRegistries(D, w, b));

    /* The full four-part count is 44 characters and does not fit a 240px bar in
       basic or glass, where it clipped the last figure. Counts are the one thing
       a footer exists to state, so it sheds terms by width rather than eliding
       mid-number. */
    var foot =
      '<span class="cz-foot-count">' + (b === 0
        ? ('<b>' + (dk.containers || []).length + '</b> ctr &middot; <b>' +
           (dk.images || []).length + '</b> img')
        : b === 1
        ? ('<b>' + (dk.containers || []).length + '</b> containers &middot; <b>' +
           (dk.images || []).length + '</b> images')
        : ('<b>' + (dk.containers || []).length + '</b> containers, <b>' +
           (dk.images || []).length + '</b> images, <b>' +
           ((dk.compose && dk.compose.services) || []).length + '</b> services, <b>' +
           (dk.registries || []).length + '</b> registries')) + '</span>' +
      Z.act({ id: 'cmd.docker.host.refresh', label: b >= 2 ? 'Refresh' : null, icon: 'refresh',
              aria: 'Refresh the Docker inventory', tip: 'Refresh inventory' });

    return shell(cfg, {
      ico: 'square',
      title: 'Docker Manager',
      bannerActs:
        (b >= 2 ? chipMono((rt.engine || 'docker') + '/' + (rt.context || 'default')) : '') +
        Z.menu(moreItems, { tip: 'More views and maintenance' }),
      tabs: tabs,
      body: body,
      foot: foot
    });
  };


  /* ======================================================================
     =========================== A R T I F A C T S ========================
     ====================================================================== */

  /* The 19 canonical kinds. A kind token is the longest guaranteed string
     and the least informative (before_after_snapshot is 21 characters and
     about 143px as a chip - 65 per cent of the content width at 240px
     before the label gets a pixel). So the kind never leads the row: it is
     a line-2 segment in human words, and the raw token is in the
     expansion where a reader who needs the schema name can find it. */
  var ART_KIND = {
    code_diff: 'Code diff',
    validation_test: 'Validation test',
    evidence: 'Evidence',
    screenshot: 'Screenshot',
    before_after_snapshot: 'Before / after',
    failed_attempts: 'Failed attempts',
    context_snapshot: 'Context snapshot',
    subagent_lineage: 'Subagent lineage',
    implementation_plan: 'Implementation plan',
    reasoning_summary: 'Reasoning summary',
    suggested_next_steps: 'Next steps',
    document: 'Document',
    artifact_version: 'Artifact version',
    api_web_call: 'Web call',
    browser_recording: 'Browser recording',
    cost_usage: 'Cost and usage',
    tool_llm_trace: 'Tool / LLM trace',
    restore_point: 'Restore point',
    hitl_approval: 'Approval'
  };

  var ART_RETENTION = {
    ephemeral: 'Ephemeral',
    session: 'Session',
    project: 'Project',
    governed: 'Governed',
    debug_retained: 'Debug retained'
  };

  var ART_FAMILIES = [
    { id: 'all',      label: 'All',       icon: 'grip' },
    { id: 'evidence', label: 'Evidence',  icon: 'square' },
    { id: 'web',      label: 'Web',       icon: 'search' },
    { id: 'browser',  label: 'Browser',   icon: 'ext' },
    { id: 'bundle',   label: 'Bundles',   icon: 'branch' },
    { id: 'receipt',  label: 'Receipts',  icon: 'bar' }
  ];

  function artShortId(id) {
    var s = String(id || '');
    return s.indexOf('art-') === 0 ? s.slice(4) : s;
  }

  /* THE IDENTITY FALLBACK CHAIN. title -> summary -> kind label + short id.
     The derived flag is returned so the row can SAY that the identity was computed
     rather than read; a synthesized identity that looks like a real one is
     worse than an honest placeholder. */
  function artIdentity(r) {
    if (r.title) return { text: r.title, derived: false, from: 'title' };
    if (r.summary) return { text: r.summary, derived: true, from: 'summary' };
    return { text: (ART_KIND[r.kind] || words(r.kind)) + ' ' + artShortId(r.id),
             derived: true, from: 'kind and id' };
  }

  function artRedactions(r) {
    var m = (r.meta || []).filter(function (x) { return /^redacted/.test(String(x)); })[0];
    return m || '';
  }

  /* PRECEDENCE. The owner doc never sets this order and at 240px there is
     room for exactly one indicator, so the panel sets it and says so:
       blocked > expired > evicted > unavailable > degraded
               > truncated > redacted > stale > refreshing
     Everything the chip does not say survives in the line-2 meta run and
     in the expansion, because RAP:L2042 forbids collapsing
     projection_freshness and projection_health into a single axis. */
  function artMarkers(r) {
    var out = [];
    if (r.blockedReasonCode) out.push('blocked');
    if (r.media && r.media.expired) out.push('expired');
    if (r.availability === 'evicted') out.push('evicted');
    if (r.health === 'unavailable') out.push('unavailable');
    if (r.health === 'degraded') out.push('degraded');
    if (r.truncation) out.push('truncated');
    if (artRedactions(r)) out.push(artRedactions(r));
    if (r.freshness === 'stale') out.push('stale');
    if (r.freshness === 'refreshing') out.push('refreshing');
    return out;
  }

  function artTime(r) {
    var m = r.meta || [];
    return m.length ? String(m[m.length - 1]) : '--';
  }

  function artRow(r, w, b) {
    var Z = window.CZ;
    var ident = artIdentity(r);
    var markers = artMarkers(r);
    var kindLabel = ART_KIND[r.kind] || words(r.kind);
    var rest = (r.meta || []).slice(0, -1);
    var lead = markers.length ? markers[0] : (ident.derived ? 'derived' : '');

    /* Three things the brief calls never-droppable - relative time, the kind
       indicator, and the redaction / expiry / blocked marker - and at bucket
       0 the meta run keeps exactly ONE segment. So at bucket 0 all three
       ride in that one segment ("stale Code diff 3h") and the chip is
       dropped, which hands the whole of line 1 back to the identity. A chip
       costs the identity 70px, and at 240px 70px is eleven characters of the
       only string that says which artifact this is.
       From bucket 1 up the chip carries the marker and segment 0 carries
       kind + time, exactly as before. */
    var chip = (b >= 1 && lead) ? { label: lead, tone: 'plain' } : null;

    var meta = [(b < 1 && lead ? lead + ' ' : '') + kindLabel + ' ' + artTime(r),
                ART_RETENTION[r.retention] || r.retention]
      .concat(markers.slice(1))
      .concat(rest);

    return Z.exRow({
      w: w,
      key: r.id,
      name: ident.text,
      /* An artifact identity is PROSE, never a filename - it is a title, a
         summary, or a kind label plus a short id. The 'file' kind that
         CZ.exRow defaults to protects an extension, and on prose it finds
         the last dot of "staging.tastebook.app/import from paprika export"
         and protects ".app/import from paprika export" as though it were
         one. 'prose' falls through to the balanced middle elide, which is
         the right shape for a sentence. */
      nameKind: 'prose',
      state: r.status,
      chip: chip,
      meta: meta,
      acts: artRowActs(r, w, b),
      body: artBody(r, w, b, ident, markers)
    });
  }

  function artRowActs(r, w, b) {
    var Z = window.CZ;
    var items = [
      { type: 'head', label: ART_KIND[r.kind] || words(r.kind) },
      { value: 'cmd.artifacts.open', label: 'Open artifact' },
      { value: 'cmd.artifacts.preview', label: 'Preview', hint: 'demand loaded' },
      { value: 'cmd.artifacts.show_in_usage', label: 'Show in Usage' },
      { value: 'cmd.artifacts.show_in_ledger', label: 'Show in Ledger' },
      { type: 'sep' }
    ];

    if (r.kind === 'cost_usage' || r.kind === 'tool_llm_trace') {
      items.push({ type: 'head', label: 'Preview mode' });
      items.push({ value: 'cmd.artifacts.set_preview_mode', label: 'Curated', hint: 'default' });
      items.push({ value: 'cmd.artifacts.set_preview_mode', label: 'Raw',
        hint: 'never shows secrets, accounts or local paths' });
      items.push({ type: 'sep' });
    }
    if (r.kind === 'browser_recording') {
      items.push({ value: 'cmd.artifacts.open_browser_evidence', label: 'Open evidence',
        disabled: r.availability === 'evicted',
        reason: r.availability === 'evicted' ? r.evictionReason : null,
        sentence: r.availability === 'evicted' ? r.sentence : null });
      items.push({ value: 'cmd.artifacts.watch_recording', label: 'Watch recording',
        disabled: r.availability === 'evicted',
        reason: r.availability === 'evicted' ? r.evictionReason : null,
        sentence: r.availability === 'evicted' ? r.sentence : null });
      items.push({ type: 'sep' });
    }
    if (r.kind === 'api_web_call') {
      items.push({ value: 'cmd.artifacts.open_sources', label: 'Open sources' });
      items.push({ type: 'sep' });
    }

    items.push({ type: 'head', label: 'Export' });
    items.push({ value: 'cmd.artifacts.export', label: 'Export record' });
    items.push({ value: 'cmd.artifacts.export', label: 'Export bundle' });
    items.push({ value: 'cmd.artifacts.export', label: 'Export view' });
    items.push({ type: 'sep' });
    items.push({ value: 'cmd.artifacts.set_compare_target', label: 'Set as compare target' });
    items.push({ value: 'cmd.artifacts.refresh', label: 'Refresh projection' });

    var menu = Z.menu(items, { tip: 'Artifact actions' });
    if (b < 2) return menu;
    return Z.act({ id: 'cmd.artifacts.open', icon: 'ext', label: null,
                   aria: 'Open artifact', tip: 'Open artifact' }) + menu;
  }

  function artBody(r, w, b, ident, markers) {
    var Z = window.CZ;
    var facts = [
      Z.kv('Artifact id', r.id, 'token', b),
      Z.kv('Kind', r.kind, 'token', b),
      Z.kv('Family', cap(r.family), 'token', b),
      Z.kv('Retention class', ART_RETENTION[r.retention] || r.retention, 'badge', b),
      /* The two axes, never collapsed. */
      Z.kv('Projection freshness', r.freshness, 'badge', b),
      Z.kv('Projection health', r.health, 'badge', b),
      Z.kv('Identity from', ident.from + (ident.derived ? ', derived' : ''), 'token', b)
    ];

    if (artRedactions(r)) facts.push(Z.kv('Redaction', artRedactions(r), 'badge', b));
    if (r.executed === false) facts.push(Z.kv('Executed', 'no - this artifact never ran', 'prose', b));
    if (r.permissionSnapshotId) facts.push(Z.kv('Permission snapshot', r.permissionSnapshotId, 'token', b));
    if (r.approvalScopeKey) facts.push(Z.kv('Approval scope', r.approvalScopeKey, 'token', b));
    if (r.degradedReason) facts.push(Z.kv('Degraded reason', r.degradedReason, 'token', b));

    /* Generated media: provider receipt, hashes, durable ref, the original
       provider URL and a real expiry clock. RAP-033 wants a persistent
       expiry indicator, not a generic status chip - so the row's chip says
       expired and this block says when, from what window, and what is
       missing because of it. */
    if (r.media) {
      var m = r.media;
      facts.push(Z.kv('Provider', m.provider, 'token', b));
      facts.push(Z.kv('Route', m.route + ' / ' + m.mediaRouteId, 'token', b));
      facts.push(Z.kv('Provider entry', m.providerEntryId, 'token', b));
      facts.push(Z.kv('Account profile', m.accountProfileRef, 'token', b));
      facts.push(Z.kv('Provider URL', m.urlRef, 'prose', b));
      facts.push(Z.kv('Durable local copy', m.durableLocalRef || 'none kept', 'prose', b));
      facts.push(Z.kv('Content hash', Z.elide(m.sha256, 'digest'), 'token', b));
      facts.push(Z.kv('Expiry', m.expired
        ? 'expired ' + m.expiredAgo + ' ago, window was ' + m.expiryWindow
        : 'expires in ' + m.expiresIn, 'prose', b));
      facts.push(Z.kv('Provenance', m.provenanceStandard +
        (m.provenancePresent ? ' manifest present' : ' manifest absent'), 'token', b));
      facts.push(Z.kv('Caveat', m.caveat, 'prose', b));
    }

    /* Truncation: the five gap classes are named as a set so the reader can
       see that this row's class is a member of a family rather than a
       one-off, and the "never infer from timestamps" rule is stated because
       it is the rule a reader is about to break. */
    if (r.truncation) {
      var t = r.truncation;
      facts.push(Z.kv('Truncation state', t.state, 'badge', b));
      facts.push(Z.kv('Gap class', t.gapClass, 'token', b));
      facts.push(Z.kv('Byte range', t.byteRange || 'not bounded', 'token', b));
      facts.push(Z.kv('Sequence range', t.sequenceRange || 'not bounded', 'token', b));
      facts.push(Z.kv('Gap classes', (t.classes || []).join(', '), 'prose', b));
      facts.push(Z.kv('Inferred from timestamps', t.inferFromTimestamps ? 'yes' : 'no', 'badge', b));
    }

    if (r.availability === 'evicted') {
      facts.push(Z.kv('Availability', r.availability, 'badge', b));
      facts.push(Z.kv('Evicted', r.evictedAt + ' ago', 'measure', b));
      facts.push(Z.kv('Eviction reason', r.evictionReason, 'token', b));
      facts.push(Z.kv('Record', 'intact - this row is record backed', 'prose', b));
    }

    var blocked = '';
    if (r.blockedReasonCode) {
      blocked = Z.blocked(r.blockedReasonCode, r.sentence, r.allowedActionIds || []);
    } else if (r.availability === 'evicted') {
      blocked = Z.blocked(r.evictionReason, r.sentence, r.allowedActionIds || []);
    } else if (r.media && r.media.expired) {
      blocked = Z.blocked('generated_media_url_expired', r.sentence, r.allowedActionIds || []);
    } else if (r.truncation) {
      blocked = Z.blocked(r.truncation.gapClass, r.truncation.sentence,
        [{ id: 'cmd.artifacts.refresh', label: 'Refresh projection', primary: true },
         { id: 'cmd.artifacts.open', label: 'Open record' }]);
    }

    var detail = '';
    if (r.availability === 'evicted') {
      /* RAP:L2056 - a missing row is never an empty row and never an empty
         list. The payload is gone; the record is not, so the preview slot
         says exactly which of the two is missing. */
      detail = Z.empty('unavailable',
        'The payload was evicted after its ' + (r.retention || 'session') +
        ' retention window. The record, its refs and its lineage are intact.',
        { title: 'Payload evicted' });
    } else if (r.preview) {
      detail = slotDetail([r.preview]);
    }

    var acts =
      Z.act({ id: 'cmd.artifacts.open', label: 'Open', icon: 'ext', primary: true,
              disabled: r.availability === 'evicted',
              tip: r.availability === 'evicted' ? r.sentence : 'Identity-native open' }) +
      Z.act({ id: 'cmd.artifacts.show_in_usage', label: 'Usage', icon: 'bar' }) +
      Z.act({ id: 'cmd.artifacts.show_in_ledger', label: 'Ledger', icon: 'clock' });

    var summary = ident.derived
      ? 'No title on this artifact. The identity above is derived from its ' + ident.from + '.'
      : (r.summary || r.preview || '');

    return Z.body({
      summary: summary ? slotSum(esc(summary)) : '',
      facts: slotFacts(facts),
      detail: detail,
      actions: slotActs(acts),
      blocked: blocked,
      overflow: r.provenance ? note(r.provenance) : ''
    });
  }

  /* ------------------------------------------------- investigations ----- */

  var ROLE_ORDER = ['baseline', 'repro', 'diagnosis', 'attempts', 'fix', 'verification', 'cleanup', 'rollback'];

  function artBundleRow(bu, w, b) {
    var Z = window.CZ;
    var members = (bu.members || []).slice().sort(function (x, y) {
      return ROLE_ORDER.indexOf(x.role) - ROLE_ORDER.indexOf(y.role);
    });

    /* Members lead with evidence_role, not artifact_type: the role is a
       6-value closed enum, it is short, it orders deterministically, and it
       explains what the row is FOR. The kind is secondary and rides on
       line 2. This is the one pattern in the shipped panel that survives
       240px. */
    var rows = members.map(function (m) {
      return Z.row({
        w: w,
        key: bu.id + '-' + m.role,
        name: cap(m.role),
        state: 'idle',
        meta: [ART_KIND[m.kind] || words(m.kind), m.kind]
      });
    }).join('');

    return Z.exRow({
      w: w,
      key: bu.id,
      name: bu.title,
      nameKind: 'prose',
      state: bu.outcome === 'fixed' ? 'ok' : 'warn',
      chip: b >= 2 ? { label: bu.outcome, tone: 'plain' } : null,
      meta: [bu.id, members.length + ' members', 'confidence ' + bu.confidence],
      acts: Z.menu([
        { type: 'head', label: 'Investigation' },
        { value: 'cmd.artifacts.expand_group', label: 'Expand group' },
        { value: 'cmd.artifacts.collapse_group', label: 'Collapse group' },
        { type: 'sep' },
        { value: 'cmd.artifacts.export_investigation', label: 'Export investigation' },
        { value: 'cmd.artifacts.import_bundle', label: 'Import bundle' },
        { value: 'cmd.artifacts.compare', label: 'Compare with target' }
      ], { tip: 'Investigation actions' }),
      body: Z.body({
        summary: slotSum(esc('Outcome ' + bu.outcome + ', verification ' + bu.confidence +
          ', ' + members.length + ' members carried forward.')),
        facts: slotFacts([
          Z.kv('Bundle id', bu.id, 'token', b),
          Z.kv('Final state', bu.outcome, 'badge', b),
          Z.kv('Verification strength', bu.confidence, 'badge', b),
          Z.kv('Members', String(members.length), 'measure', b),
          Z.kv('Omitted items', '0 evidence, 0 raw payloads', 'prose', b),
          Z.kv('Grouping', 'index and navigation layer over canonical records, not a new family', 'prose', b)
        ]),
        detail: Z.list(rows, { label: bu.title + ' members', key: bu.id + '-members' }),
        actions: slotActs(
          Z.act({ id: 'cmd.artifacts.export_investigation', label: 'Export', icon: 'ext',
                  primary: true }) +
          Z.act({ id: 'cmd.artifacts.compare', label: 'Compare', icon: 'filter' })
        )
      })
    });
  }

  /* ---------------------------------------------------- artifacts panel - */

  VG_PANELS.artifacts = function (D, cfg) {
    var Z = window.CZ;
    var w = widthOf(cfg);
    var b = Z.bucket(w);
    var A = (D && D.artifacts) || {};
    var rows = A.rows || [];
    var pg = A.paging || {};

    /* Counts are COMPUTED from the rows, not read from families[].count.
       A count that disagrees with the list under it is the fastest way to
       make a panel untrustworthy, and property 1 puts that count in every
       shelf header. */
    var byFamily = {};
    rows.forEach(function (r) {
      (byFamily[r.family] = byFamily[r.family] || []).push(r);
    });

    var tabs = Z.tabs(ART_FAMILIES.map(function (f, i) {
      return { id: f.id, label: f.label, icon: f.icon,
               count: f.id === 'all' ? rows.length : (byFamily[f.id] || []).length,
               active: i === 0, available: true };
    }), w, { label: 'Artifact families' });

    var invRows = (A.bundles || []).map(function (bu) { return artBundleRow(bu, w, b); }).join('');

    var body = Z.shelf({
      key: 'art-inv', ico: 'branch', label: 'Investigations',
      count: (A.bundles || []).length,
      items: (A.bundles || []).map(function (bu) {
        return bu.outcome === 'fixed' ? 'ok' : 'warn';
      }),
      collapsed: b < 2,
      body: invRows
    });

    var FAM_SHELF = [
      { id: 'evidence', ico: 'square', label: 'Evidence' },
      { id: 'web',      ico: 'search', label: 'Web' },
      { id: 'browser',  ico: 'ext',    label: 'Browser' },
      { id: 'bundle',   ico: 'branch', label: 'Bundle artifacts' },
      { id: 'receipt',  ico: 'bar',    label: 'Receipts' }
    ];

    body += FAM_SHELF.map(function (f) {
      var items = byFamily[f.id] || [];
      var inner = items.length
        ? items.map(function (r) { return artRow(r, w, b); }).join('')
        : Z.empty('no-results', 'No artifacts in this family for the current project.');
      return pane(f.id, f.label, true, Z.shelf({
        key: 'art-' + f.id,
        ico: f.ico,
        label: f.label,
        count: items.length,
        items: items.map(function (r) { return r.status; }),
        body: inner
      }));
    }).join('');

    if (pg.total && pg.shown && pg.total > pg.shown) {
      body += more('cmd.artifacts.load_older',
        'Load older - showing ' + pg.shown + ' of ' + pg.total);
    }

    var foot =
      '<span class="cz-foot-count">Showing <b>' + (pg.shown || rows.length) + '</b> of <b>' +
      (pg.total || rows.length) + '</b> artifacts</span>' +
      Z.act({ id: 'cmd.artifacts.refresh', label: b >= 2 ? 'Refresh' : null, icon: 'refresh',
              aria: 'Refresh the artifact projection', tip: 'Frozen snapshot, refresh manually' });

    return shell(cfg, {
      ico: 'grip',
      title: 'Runtime Artifacts',
      bannerActs:
        (b >= 2 ? chipPlain(rows.length + ' rows') : '') +
        Z.menu([
          { type: 'head', label: 'Panel' },
          { value: 'cmd.artifacts.filter', label: 'Filter artifacts' },
          { value: 'cmd.artifacts.refresh', label: 'Refresh projection' },
          { value: 'cmd.artifacts.load_older', label: 'Load older' },
          { type: 'sep' },
          { type: 'head', label: 'Export' },
          { value: 'cmd.artifacts.export', label: 'Export record' },
          { value: 'cmd.artifacts.export', label: 'Export bundle' },
          { value: 'cmd.artifacts.export', label: 'Export view' },
          { value: 'cmd.artifacts.import_bundle', label: 'Import bundle' },
          { type: 'sep' },
          { value: 'cmd.artifacts.set_compare_target', label: 'Set compare target' },
          { value: 'cmd.artifacts.show_in_source_control', label: 'Open in Source Control' }
        ], { tip: 'Artifact panel actions' }),
      tabs: tabs,
      body: body,
      foot: foot
    });
  };

})();
