"""Narrow presentation repairs applied after the pinned K3 adaptation.

No manager identity, owner command, permission, theme, or motion contract is
changed here. Manager destinations retain the K3 continuous-document shell.
"""

import json


MANAGER_DESCRIPTIONS = {
    "notifications": "Choose where alerts go and how they sound.",
    "providers": "Connect AI providers, then choose accounts and models.",
    "web": "Choose the tools and models used for web research.",
    "media": "Set up image, audio, video, and document output.",
    "bsd": "Choose when the advisor helps and which model it uses.",
    "toolchain": "Manage project tools, language services, and extensions.",
    "testing": "Configure test profiles, debugging, and captured evidence.",
    "context-memory": "Manage saved memories and what enters your context.",
    "goals": "Review Goal and automation defaults.",
    "personas": "Choose personas and manage their defaults.",
    "owners": "Find the manager responsible for each shared resource.",
    "source-manager": "Connect forges and manage repositories, tools, and policies.",
    "browser-scm": "Manage browser, capture, and source-control connections.",
    "project-sync": "Manage project locations, clients, and continuity.",
    "project-history": "Browse sessions, history, and saved artifacts.",
    "permissions": "Control access, approvals, and safety rules.",
    "settings-transfer": "Copy or transfer selected project settings.",
    "backup": "Manage backup destinations, retention, and recovery.",
    "doctor": "Review health checks and follow up on issues.",
    "servers": "Connect servers and review their setup.",
    "updates": "Check for app updates and review update history.",
    "readiness": "Review setup dependencies and open the next step.",
}


PROVIDER_OVERVIEW = r"""  function renderProviderOverview(provider) {
    const activeAccounts = provider.accounts.filter(a => a.active).length;
    const readyModels = provider.models.filter(m => m.enabled && m.health === 'Ready').length;
    const account = provider.accounts.find(a => a.id === provider.defaultAccount);
    return `<div class="provider-overview">
      <div class="alert-strip info provider-example-note">${icon('info')}<div><strong>Example data</strong> · Accounts, models, and health below are not live.</div></div>
      ${provider.status !== 'active' ? `<div class="alert-strip">${icon('alert')}<div><strong>${escapeHtml(provider.statusLabel)}</strong><br>${escapeHtml(provider.diagnostics[provider.diagnostics.length - 1] || 'Complete setup before routing work here.')}</div></div>` : ''}
      <div class="provider-summary-stats">
        <article class="stat-card"><div class="stat-label">Active accounts</div><div class="stat-value">${activeAccounts}</div></article>
        <article class="stat-card"><div class="stat-label">Ready models</div><div class="stat-value">${readyModels}</div></article>
        <article class="stat-card"><div class="stat-label">Plan</div><div class="stat-value provider-plan-value">${escapeHtml(provider.product || 'Not selected')}</div></article>
      </div>
      <section class="panel-card">
        <div class="panel-title-row"><div class="panel-title">Connection</div></div>
        <div class="info-grid">
          ${infoRow('Live installation', providerOwnerInstalled(provider) ? 'Installation identity received' : 'Not connected to the owner')}
          ${infoRow('Example sign-in', provider.signedIn ? 'Signed in' : 'Not signed in')}
          ${infoRow('Default account', account?.nickname || 'None selected')}
          ${infoRow('Models in catalog', String(provider.models.length))}
        </div>
      </section>
      <details class="panel-card settings-secondary-details">
        <summary>Connection details</summary>
        <div class="info-grid">
          ${infoRow('Example installation', provider.installed ? 'Installed' : 'Not installed')}
          ${infoRow('Installation source', provider.installSource)}
          ${infoRow('Example catalog state', provider.signedIn ? 'Current or refreshable' : 'Last known / unavailable')}
        </div>
        <p class="section-description">Installation, sign-in, plan access, catalog freshness, and invocation are checked separately. Install, Repair, and Verify require a current provider-bound owner projection.</p>
      </details>
      <details class="panel-card settings-secondary-details">
        <summary>How model capabilities work</summary>
        <p class="section-description">Vision, browser use, image generation, tools, and context limits belong to individual model endpoints. Use Models &amp; Plans to inspect them and Routing &amp; Fallback to choose an endpoint.</p>
      </details>
    </div>`;
  }

"""


def _once(source, before, after, need, label):
    need(source.count(before) == 1, f"Settings polish: {label} anchor count changed")
    return source.replace(before, after, 1)


def apply_to_adapted_js(source, need):
    source = _once(source,
        "    return { title: workspace.label, description: domain.summary };",
        "    const managerDescriptions = " + json.dumps(MANAGER_DESCRIPTIONS, ensure_ascii=False) + ";\n"
        "    return { title: workspace.label, description: managerDescriptions[workspace.id] || domain.summary };",
        need, "specific manager descriptions")
    source = _once(source, "        sections.map(s => `<button type=\"button\" class=\"index-link",
        "        sections.filter(s => !(sections.length === 1 && s.id === `${w.id}:main`)).map(s => `<button type=\"button\" class=\"index-link",
        need, "single-entry page index")
    source = _once(source,
        '<div class="roster-title">Providers (${state.providers.length})</div><button class="icon-btn" data-action="add-provider" data-tooltip="Set up provider">${icon(\'plus\')}</button>',
        '<div class="roster-title">Providers (${state.providers.length})</div>',
        need, "duplicate provider setup control")
    begin = source.index("  function renderProviderOverview(provider) {")
    end = source.index("  function renderProviderAccounts(provider) {", begin)
    previous = source[begin:end]
    need("Owner installation state" in previous and "Quick actions" in previous,
         "Settings polish: adapted provider overview contract missing")
    source = source[:begin] + PROVIDER_OVERVIEW + source[end:]
    source = _once(source,
        '`<button class="btn" data-action="send-test-notification">${icon(\'test\')} Test exact route</button><button class="btn primary" data-action="add-notification-destination">${icon(\'plus\')} Add destination</button>`',
        "''", need, "notification actions already in destination and testing tabs")
    # Keep packs reachable without competing with preview and event assignment.
    begin = source.index("function renderNotificationSounds() {")
    end = source.index("function renderNotificationQuiet()", begin)
    sound_view = source[begin:end]
    sound_view = _once(sound_view,
        "const meta = `${s.source} · ${s.duration}${assigned.length ? ' · ' + assigned.join(', ') : ' · Unassigned'}`;",
        "const meta = `${s.source} · ${assigned.length ? `${assigned.length} event${assigned.length===1?'':'s'}` : 'Unassigned'}`;", need, "compact sound metadata")
    sound_view = _once(sound_view,
        '<button class="btn small" data-action="sound-menu" data-id="${escAttr(s.id)}">${icon(\'sliders\')} Manage</button>',
        '<button class="icon-btn" data-action="sound-menu" data-id="${escAttr(s.id)}" aria-label="Manage ${escAttr(s.name)}" data-pm-hover-label="Manage ${escAttr(s.name)}" data-pm-hover-detail="Replace the file, edit metadata, or assign events.">${icon(\'more\')}</button>', need, "named sound overflow menu")
    sound_view = _once(sound_view,
        '<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">PeonPing / OpenPeon packs</div><div class="panel-subtitle">Import with format, provenance, license, and duplicate validation.</div></div><button class="btn primary" data-action="import-peonping-pack">${icon(\'download\')} Import pack</button></div>',
        '<details class="panel-card settings-secondary-details"><summary>Sound packs</summary><div class="panel-title-row"><span class="panel-subtitle">PeonPing / OpenPeon-compatible packs</span><button class="btn" data-action="import-peonping-pack">${icon(\'download\')} Import pack</button></div>',
        need, "pack disclosure")
    sound_view = _once(sound_view,
        'Compatible packs remain visibly identified before any sound becomes available.',
        'Example pack metadata only; recordings and validation are unavailable in this preview.', need, "pack boundary")
    sound_view = _once(sound_view, "pack ? renderStatus(pack.status, `${cap(pack.status)} · ${pack.sounds} sounds`) : '—'",
        "pack ? `${pack.sounds} example entries` : '—'", need, "pack status truth")
    sound_view = _once(sound_view, "escapeHtml(pack ? 'Passed' : 'Not run')", "escapeHtml('Not run in this preview')", need, "pack validation truth")
    sound_view = _once(sound_view, '</section>\n        <section class="panel-card" style="margin-top:10px"><div class="panel-title">Event sound assignments',
        '</details>\n        <section class="panel-card" style="margin-top:10px"><div class="panel-title">Event sound assignments', need, "pack disclosure closing")
    sound_view = _once(sound_view, '${icon(\'test\')} Test exact mapping', '${icon(\'eye\')} Preview mapping', need, "non-delivery mapping label")
    # Common assignments precede secondary pack administration in reading order.
    pack_start = sound_view.index('<details class="panel-card settings-secondary-details">')
    pack_end = sound_view.index('</details>', pack_start) + len('</details>')
    assignment_end = sound_view.index('</section>', pack_end) + len('</section>')
    pack = sound_view[pack_start:pack_end]
    assignments = sound_view[pack_end:assignment_end]
    sound_view = sound_view[:pack_start] + assignments.strip() + '\n        ' + pack + sound_view[assignment_end:]
    return source[:begin] + sound_view + source[end:]
