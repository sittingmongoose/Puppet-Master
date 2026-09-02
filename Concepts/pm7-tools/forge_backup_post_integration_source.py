"""Authored T46F Forge, Source Control, and backup post-integration UI.

This transform consumes the September 1, 2026 post-integration packet without
changing the selected PM7 shell or K3 Settings geometry.  It generalizes the
legacy GitHub Actions occupant, adds an engine-correct Jujutsu projection next
to the retained Git projection, and deepens the existing backup manager.  All
owner operations remain unavailable browser-concept projections; the visible
controls carry canonical command identities but never mint runtime receipts.
"""

from __future__ import annotations

from pm7_transform_guards import assert_effect_delta, capture_effect_surfaces


TRANSFORM_MARKER = "PM7 T46F: Forge Backup tsnet post-integration GUI"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T46F %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _replace_in_band(doc, start, end, old, new, need, label):
    need(doc.count(start) == 1, "T46F %s: start anchor count %d" % (label, doc.count(start)))
    need(doc.count(end) == 1, "T46F %s: end anchor count %d" % (label, doc.count(end)))
    begin = doc.index(start)
    finish = doc.index(end, begin)
    need(finish > begin, "T46F %s: invalid anchor order" % label)
    band = doc[begin:finish]
    count = band.count(old)
    need(count == 1, "T46F %s: expected one in-band anchor, found %d" % (label, count))
    return doc[:begin] + band.replace(old, new, 1) + doc[finish:]


POST_INTEGRATION_CSS = r'''
<style id="pm7-t46f-forge-backup-css">
/* PM7 T46F: Forge Backup tsnet post-integration GUI */
.pm7-scm-context,
.pm7-automation-context { display:grid; gap:8px; padding:9px 10px; border-bottom:1px solid var(--border); background:var(--surface-alt); }
.pm7-scm-context-row,
.pm7-automation-context-row { display:flex; align-items:center; gap:7px; min-width:0; }
.pm7-scm-context-main,
.pm7-automation-context-main { min-width:0; flex:1 1 auto; display:grid; gap:2px; }
.pm7-context-title { color:var(--text-primary); font-size:12px; font-weight:780; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pm7-context-detail { color:var(--text-muted); font:10px/1.35 var(--mono-font); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pm7-scm-engine-switch { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px; }
.pm7-scm-engine-button { min-height:30px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); color:var(--text-secondary); font:700 11px/1.2 var(--body-font); cursor:pointer; }
.pm7-scm-engine-button[aria-pressed="true"] { border-color:var(--accent-primary); color:var(--text-primary); background:color-mix(in srgb,var(--accent-primary) 12%,var(--surface)); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent-primary) 30%,transparent); }
.pm7-scm-engine-button:focus-visible,
.pm7-automation-select:focus-visible { outline:2px solid var(--accent-primary); outline-offset:2px; }
#panel-source[data-scm-engine="jj"] > .pm-segtab,
#panel-source[data-scm-engine="jj"] > .sh-scroll,
#panel-source[data-scm-engine="jj"] > .pm7-scm-git-footer { display:none!important; }
#panel-source[data-scm-engine="git"] > .pm7-scm-jj-view { display:none!important; }
.pm7-scm-jj-view { min-height:0; overflow:auto; padding:var(--md); display:grid; gap:var(--md); }
.pm7-scm-git-footer { padding:0 var(--md) var(--md); }
.pm7-post-card { padding:10px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); min-width:0; }
.pm7-post-card-head { display:flex; gap:8px; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
.pm7-post-card-title { color:var(--text-primary); font-size:11px; font-weight:800; letter-spacing:.03em; text-transform:uppercase; }
.pm7-post-card-subtitle { color:var(--text-muted); font-size:10px; line-height:1.35; margin-top:2px; }
.pm7-post-actions { display:flex; flex-wrap:wrap; gap:5px; margin-top:9px; }
.pm7-post-actions .pm-btn { min-height:28px; }
.pm7-post-kv { display:grid; grid-template-columns:minmax(76px,.65fr) minmax(0,1.35fr); gap:5px 9px; font-size:10px; line-height:1.4; }
.pm7-post-kv dt { color:var(--text-muted); }
.pm7-post-kv dd { min-width:0; margin:0; color:var(--text-secondary); overflow-wrap:anywhere; }
.pm7-post-state { display:inline-flex; align-items:center; min-height:22px; padding:2px 7px; border:1px solid var(--border); border-radius:var(--radius-pill); color:var(--text-secondary); font-size:10px; font-weight:760; }
.pm7-post-state[data-state="ready"] { color:var(--success,var(--accent-lime)); }
.pm7-post-state[data-state="pending"],
.pm7-post-state[data-state="unknown"],
.pm7-post-state[data-state="attention"] { color:var(--accent-warning); }
.pm7-post-state[data-state="blocked"] { color:var(--accent-error); }
.pm7-automation-select { width:100%; min-height:32px; padding:5px 28px 5px 9px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); color:var(--text-primary); font:700 11px/1.2 var(--body-font); }
.pm7-automation-common { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
.pm7-automation-fact { min-width:0; padding:7px 8px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface); }
.pm7-automation-fact small { display:block; color:var(--text-muted); font-size:9px; text-transform:uppercase; letter-spacing:.05em; }
.pm7-automation-fact strong { display:block; margin-top:2px; color:var(--text-primary); font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
#panel-git:not([data-automation-service="github"]) > .pm-segtab,
#panel-git:not([data-automation-service="github"]) > .sh-scroll { display:none!important; }
#panel-git[data-automation-service="github"] > .pm7-automation-provider-view { display:none!important; }
.pm7-automation-provider-view { min-height:0; overflow:auto; padding:var(--md); display:grid; gap:var(--md); }
.pm7-automation-run { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:7px; padding:7px 0; border-top:1px solid var(--border-light); }
.pm7-automation-run:first-child { border-top:0; }
.pm7-automation-run-copy { min-width:0; }
.pm7-automation-run-copy strong,
.pm7-automation-run-copy small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pm7-automation-run-copy strong { color:var(--text-primary); font-size:10px; }
.pm7-automation-run-copy small { color:var(--text-muted); font-size:9px; margin-top:2px; }
.pm7-backup-status-strip { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:10px; }
.pm7-backup-destination-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.pm7-backup-destination { min-width:0; display:grid; gap:9px; padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface); }
.pm7-backup-destination-head { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
.pm7-backup-destination-name { min-width:0; }
.pm7-backup-destination-name strong,
.pm7-backup-destination-name small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pm7-backup-destination-name strong { color:var(--text-primary); }
.pm7-backup-destination-name small { color:var(--text-muted); font-size:10px; margin-top:3px; }
.pm7-backup-destination-detail { display:grid; gap:6px; padding-top:8px; border-top:1px solid var(--border-light); }
.pm7-backup-safety-note { padding:10px 11px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface-alt); color:var(--text-secondary); font-size:11px; line-height:1.45; }
html[data-theme^="retro"] .pm7-scm-engine-button,
html[data-theme^="retro"] .pm7-post-card,
html[data-theme^="retro"] .pm7-post-state,
html[data-theme^="retro"] .pm7-automation-select,
html[data-theme^="retro"] .pm7-automation-fact,
html[data-theme^="retro"] .pm7-backup-destination,
html[data-theme^="retro"] .pm7-backup-safety-note { border-radius:0; box-shadow:none; }
@media (max-width:520px) {
  .pm7-backup-status-strip,
  .pm7-backup-destination-grid { grid-template-columns:minmax(0,1fr); }
  .pm7-post-kv { grid-template-columns:minmax(0,1fr); gap:1px; }
}
@media (prefers-reduced-motion:reduce) {
  .pm7-scm-jj-view,
  .pm7-automation-provider-view,
  .pm7-backup-destination { animation:none!important; transition:none!important; }
}
</style>'''


SOURCE_BANNER_OLD = '''          <div class="sh-banner"><span class="sh-bico"><i data-ico="source" class="pm-ico"></i></span><span class="sh-title">SOURCE CONTROL</span><span class="sh-bstatus" data-narrow="short" title="repo tastebook · remote origin"><span class="sh-btext sh-bfull">tastebook · origin</span><span class="sh-btext sh-bshort">origin</span></span></div>'''


SOURCE_BANNER_NEW = '''          <div class="sh-banner"><span class="sh-bico"><i data-ico="source" class="pm-ico"></i></span><span class="sh-title">SOURCE CONTROL</span><span class="sh-bstatus" data-narrow="short" data-pm-hover-label="Repository and online service" data-pm-hover-detail="tastebook uses local Git with GitHub as its current online service."><span class="sh-btext sh-bfull">tastebook · Git / GitHub</span><span class="sh-btext sh-bshort">Git · GitHub</span></span></div>
          <div class="pm7-scm-context" data-requirements="GUI-002 GUI-003 GUI-004 GUI-006 GUI-007">
            <div class="pm7-scm-context-row"><div class="pm7-scm-context-main"><span class="pm7-context-title">tastebook</span><span class="pm7-context-detail">Home computer · this computer · Projects/tastebook</span></div><span class="pm7-post-state" data-state="ready">current</span></div>
            <div class="pm7-scm-engine-switch" role="group" aria-label="Local history engine">
              <button type="button" class="pm7-scm-engine-button" aria-pressed="true" data-pm7-scm-engine="git" data-command-id="cmd.source_control.backend.select" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable" data-pm-hover-label="Show Git history" data-pm-hover-detail="Git separates changes waiting to be saved from changes already staged for the next commit.">Git</button>
              <button type="button" class="pm7-scm-engine-button" aria-pressed="false" data-pm7-scm-engine="jj" data-command-id="cmd.source_control.backend.select" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable" data-pm-hover-label="Show Jujutsu history" data-pm-hover-detail="Jujutsu keeps a current change and operation history instead of Git staging and stashes.">Jujutsu</button>
            </div>
          </div>'''


SOURCE_GIT_FOOTER = r'''
          <div class="pm7-scm-git-footer">
            <section class="pm7-post-card" data-scm-section="publication-review">
              <div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Publish and review</div><div class="pm7-post-card-subtitle">The destination and every remote effect stay visible before anything is sent.</div></div><span class="pm7-post-state" data-state="pending">outcome pending</span></div>
              <dl class="pm7-post-kv"><dt>Fetch from</dt><dd>origin · GitHub</dd><dt>Push to</dt><dd>origin/main plus Origin mirror</dd><dt>Expected head</dt><dd class="sh-mono">abc12ef · checked now</dd><dt>Protection</dt><dd>Review required · direct push blocked</dd><dt>Review</dt><dd>Pull request #128 · 2 comments · checks running</dd></dl>
              <div class="pm7-post-actions"><button class="pm-btn" data-command-id="cmd.source_control.remote.publish" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable" data-pm-hover-label="Preview publication" data-pm-hover-detail="Shows every push destination, permission check, and possible partial outcome before publishing.">Preview publish</button><button class="pm-btn" data-command-id="cmd.forge.review.open" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable" data-pm-hover-label="Open pull request" data-pm-hover-detail="Opens the common review view with GitHub's pull-request wording and current checks.">Open PR</button><button class="pm-btn" data-pm7-open-backup="project" data-ui-action-id="ui.source_control.backup_history.open" data-availability="concept_local_controller_available" data-pm-hover-label="Browse project backups" data-pm-hover-detail="Opens read-only backup history for this project; it does not change the current files.">Backup history</button></div>
            </section>
          </div>'''


SOURCE_JJ_VIEW = r'''
          <div class="pm7-scm-jj-view" data-scm-engine-view="jj" data-requirements="GUI-002 GUI-003 GUI-004 GUI-006 GUI-007">
            <section class="pm7-post-card" data-scm-section="current-change">
              <div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Current Change @</div><div class="pm7-post-card-subtitle">Make quantity parsing accept mixed fractions</div></div><span class="pm7-post-state" data-state="attention">conflicted</span></div>
              <dl class="pm7-post-kv"><dt>Change ID</dt><dd class="sh-mono">nkmwqzvw</dd><dt>Commit ID</dt><dd class="sh-mono">e19a8b3f</dd><dt>Parent</dt><dd class="sh-mono">qoxlywut · main@origin</dd><dt>Files</dt><dd>6 changed · 1 conflict</dd></dl>
              <div class="pm7-post-actions"><button class="pm-btn" data-command-id="cmd.jujutsu.change.new" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">New Change</button><button class="pm-btn" data-command-id="cmd.jujutsu.change.edit" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Edit</button><button class="pm-btn" data-command-id="cmd.jujutsu.change.split" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Split</button><button class="pm-btn" data-command-id="cmd.jujutsu.change.squash" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Squash</button></div>
            </section>
            <section class="pm7-post-card" data-scm-section="jj-files-bookmarks">
              <div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Changes and bookmarks</div><div class="pm7-post-card-subtitle">No staging or stash controls appear in Jujutsu mode.</div></div><span class="pm7-post-state" data-state="ready">3 tracked</span></div>
              <div class="sh-chg"><div class="sh-chg-h"><span class="sh-main"><span class="sh-name">recipes.rs</span><span class="sh-meta">working change vs parent</span></span><span class="sh-ds"><b class="add">+18</b> <b class="del">-3</b></span></div></div>
              <div class="sh-chg"><div class="sh-chg-h"><span class="sh-main"><span class="sh-name">main</span><span class="sh-meta">tracked at origin/main · behind 0</span></span><span class="pm-chip pm-chip-ok">current</span></div></div>
              <div class="sh-chg"><div class="sh-chg-h"><span class="sh-main"><span class="sh-name">feature/mixed-fractions</span><span class="sh-meta">local bookmark · ahead 2</span></span><span class="pm-chip">local</span></div></div>
              <div class="pm7-post-actions"><button class="pm-btn" data-command-id="cmd.jujutsu.diff.open" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Open diff</button><button class="pm-btn" data-command-id="cmd.jujutsu.bookmark.track" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Track bookmark</button><button class="pm-btn" data-command-id="cmd.jujutsu.git.push" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Preview publish</button></div>
            </section>
            <section class="pm7-post-card" data-scm-section="jj-operation-history">
              <div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Operation History</div><div class="pm7-post-card-subtitle">Jujutsu operations are separate from backup snapshots.</div></div><span class="pm7-post-state" data-state="ready">current</span></div>
              <dl class="pm7-post-kv"><dt>14:32</dt><dd>describe change · op 8f314d</dd><dt>14:28</dt><dd>import Git refs · op 9c20ab</dd><dt>14:18</dt><dd>new change · op 38b7ca</dd></dl>
              <div class="pm7-post-actions"><button class="pm-btn" data-command-id="cmd.jujutsu.operation.log" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Inspect operations</button><button class="pm-btn" data-command-id="cmd.jujutsu.operation.restore" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Preview restore</button><button class="pm-btn" data-pm7-open-backup="project" data-ui-action-id="ui.source_control.backup_history.open" data-availability="concept_local_controller_available">Browse backups</button></div>
            </section>
            <section class="pm7-post-card" data-scm-section="review-publication">
              <div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Pull request and checks</div><div class="pm7-post-card-subtitle">Forgejo vocabulary and permissions remain provider-native.</div></div><span class="pm7-post-state" data-state="unknown">could not check</span></div>
              <dl class="pm7-post-kv"><dt>Service</dt><dd>Forgejo · code.example.test</dd><dt>Review</dt><dd>Pull request #42 · draft</dd><dt>Publish target</dt><dd>origin/feature/mixed-fractions</dd><dt>Protection</dt><dd>Permission unknown · refresh required</dd></dl>
              <div class="pm7-post-actions"><button class="pm-btn" data-command-id="cmd.forge.review.refresh" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Check again</button><button class="pm-btn" aria-disabled="true" data-command-id="cmd.forge.review.open" data-availability="unknown" data-disabled-reason="review_capability_not_current">Open review</button></div>
            </section>
          </div>'''


AUTOMATION_BANNER_OLD = '''          <div class="sh-banner"><span class="sh-bico"><i data-ico="actions" class="pm-ico"></i></span><span class="sh-title">GITHUB ACTIONS</span><span class="sh-bstatus" title="4 success · 2 failed · 1 running"><span class="dot dot-run"></span>4 - 2 - 1</span></div>'''


AUTOMATION_BANNER_NEW = '''          <div class="sh-banner"><span class="sh-bico"><i data-ico="actions" class="pm-ico"></i></span><span class="sh-title">ACTIONS &amp; PIPELINES</span><span class="sh-bstatus" data-pm-hover-label="Automation status" data-pm-hover-detail="Four successful runs, two failed runs, and one run still working."><span class="dot dot-run"></span>4 - 2 - 1</span></div>
          <div class="pm7-automation-context" data-requirements="GUI-001 GUI-005 GUI-006 GUI-007">
            <label class="pm7-automation-context-main"><span class="pm7-context-title">Automation service</span><select class="pm7-automation-select" id="pm7AutomationService" data-ui-action-id="ui.repository_automation.binding.select" data-availability="concept_local_controller_available" aria-label="Automation service"><option value="github">GitHub Actions</option><option value="gitlab">GitLab Pipelines</option><option value="azure">Azure Pipelines</option><option value="bitbucket">Bitbucket Pipelines</option><option value="forgejo">Forgejo Actions</option><option value="gitea">Gitea Actions</option><option value="origin">Origin checks</option><option value="generic">No automation service</option></select></label>
            <div class="pm7-automation-common"><div class="pm7-automation-fact"><small>Revision</small><strong class="sh-mono">abc12ef · current</strong></div><div class="pm7-automation-fact"><small>Pinned</small><strong>CI · release</strong></div></div>
          </div>'''


AUTOMATION_PROVIDER_VIEW = r'''
          <div class="pm7-automation-provider-view" id="pm7AutomationProviderView" aria-live="polite"></div>'''


BACKUP_HELPER = r'''  function pm7BackupDestinationCard(d){var stateLabel=d.status==='ready'?'Ready':d.status==='needs_sign_in'?'Needs sign-in':d.status==='quota_full'?'Quota full':d.status==='waiting'?'Waiting':'Failed',stateKind=d.status==='ready'?'ready':d.status==='waiting'?'pending':d.status==='failed'||d.status==='quota_full'?'blocked':'attention';return `<article class="pm7-backup-destination" data-destination-id="${escapeHtml(d.id)}" data-auth-state="${escapeHtml(d.authState||'unknown')}" data-decryption-state="${escapeHtml(d.decryptionState||'unknown')}"><div class="pm7-backup-destination-head"><div class="pm7-backup-destination-name"><strong>${escapeHtml(d.name)}</strong><small>${escapeHtml(d.type)} · ${escapeHtml(d.account||'Account not attached')}</small></div><span class="pm7-post-state" data-state="${stateKind}">${stateLabel}</span></div><div class="info-grid">${infoRow('Location',d.path)}${infoRow('Last complete backup',d.lastComplete||'No complete backup yet')}${infoRow('Storage account',d.authState||'Unknown')}${infoRow('Decryption key',d.decryptionState||'Unknown')}${infoRow('Verification',d.lastVerified||'Not verified')}${infoRow('Retention',d.retention||'Owner policy required')}</div><div class="pm7-backup-destination-detail">${infoRow('Permissions',d.permissions||'Read/write check required')}${infoRow('Bandwidth',d.bandwidth||'Use schedule limits')}${infoRow('Encryption domain',d.encryption||'Required')}${infoRow('Cost note',d.cost||'No estimate available')}</div><div class="table-actions"><button class="btn" data-action="test-backup-destination" data-command-id="cmd.backup.destination.test" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable" data-id="${escapeHtml(d.id)}">Test connection</button><button class="icon-btn" data-action="backup-destination-menu" data-ui-action-id="ui.settings.backup_destination.menu.open" data-availability="available" data-id="${escapeHtml(d.id)}">${icon('more')}</button></div></article>`;}
'''


BACKUP_RECOVERY_BRANCH = r'''if(state.backupTab==='recovery')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Recovery Kit</div><div class="panel-subtitle">The storage account and the key that unlocks a backup are checked separately.</div></div>${renderStatus('attention','Needs confirmation')}</div><div class="info-grid">${infoRow('Recovery set','Home Server backups')}${infoRow('Storage sign-in','Ready')}${infoRow('Saved kit','Not confirmed')}${infoRow('Verified unlock','Not tested')}${infoRow('Human step-up','Required for reveal, copy, or export')}</div><div class="table-actions"><button class="btn" data-command-id="cmd.backup.recovery_key.export" data-availability="owner_unavailable_concept_preview" data-disabled-reason="human_protected_owner_unavailable">Save Recovery Kit</button><button class="btn" data-command-id="cmd.backup.recovery_key.copy" data-availability="owner_unavailable_concept_preview" data-disabled-reason="human_protected_owner_unavailable">Copy key</button><button class="btn primary" data-command-id="cmd.backup.recovery_key.test" data-availability="owner_unavailable_concept_preview" data-disabled-reason="native_handler_unavailable">Test saved kit</button></div><div class="pm7-backup-safety-note">Keep the Recovery Kit separately from this Server and its encrypted backups. Puppet Master cannot recover the backup if every usable key copy is lost.</div></section><section class="panel-card"><div class="panel-title">Recovery choices</div><div class="workflow-list">${workflowStep(1,'Choose a snapshot','Read-only history and file tree','Ready','open-restore-step',{'ui-action-id':'ui.settings.restore_step.inspect',availability:'concept_preview_only',id:'snapshot'})}${workflowStep(2,'Inspect coverage','Puppet Master data, files, Git and Jujutsu history','Ready','open-restore-step',{'ui-action-id':'ui.settings.restore_step.inspect',availability:'concept_preview_only',id:'coverage'})}${workflowStep(3,'Choose restore mode','Restore as new is the safe default','Ready','open-restore-step',{'ui-action-id':'ui.settings.restore_step.inspect',availability:'concept_preview_only',id:'mode'})}${workflowStep(4,'Preview and verify','No activation before approval','Ready','open-restore-step',{'ui-action-id':'ui.settings.restore_step.inspect',availability:'concept_preview_only',id:'verify'})}</div><div class="table-actions"><button class="btn primary" data-action="start-restore" data-command-id="cmd.restore.preview" data-availability="owner_unavailable_concept_preview">Open restore preview</button></div></section></div>`;if(state.backupTab==='advanced')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title">Advanced and diagnostics</div><div class="panel-subtitle">Healthy setups stay simple. Detailed owner evidence appears only when you ask for it.</div><div class="info-grid">${infoRow('Capture barriers','Storage owners report readiness')}${infoRow('Project boundaries','One repository per Project')}${infoRow('Object lock','Compatibility not tested in this concept')}${infoRow('Cold retrieval','Cost and delay shown before restore')}${infoRow('Cancellation','Resumable owner work required')}${infoRow('Logs','Bounded and redacted')}</div><div class="table-actions"><button class="btn" data-command-id="cmd.backup.open_details" data-availability="owner_unavailable_concept_preview">Open diagnostics</button><button class="btn" data-command-id="cmd.backup.verify" data-availability="owner_unavailable_concept_preview">Verify recovery point</button></div></section><section class="panel-card"><div class="panel-title">Doctor handoff</div><div class="panel-subtitle">Doctor reads the same owner projections and routes repairs back here.</div><div class="info-grid">${infoRow('Destination authentication','Storage owner')}${infoRow('Path access','Project and Storage owners')}${infoRow('Recent complete backup','Backup owner')}${infoRow('Git / Jujutsu coverage','Source Control owner')}${infoRow('Retention and holds','Backup policy')}${infoRow('Recovery Kit','Human-protected key flow')}</div><div class="table-actions"><button class="btn primary" data-action="navigate" data-ui-action-id="ui.settings.route.open" data-availability="available" data-domain="system" data-workspace="doctor">Open Doctor</button></div></section></div>`;'''


POST_INTEGRATION_SCRIPT = r'''
<script id="pm7-t46f-forge-backup-js">
/* PM7 T46F: Forge Backup tsnet post-integration GUI */
(function(){
  'use strict';
  var providers={
    gitlab:{name:'GitLab Pipelines',review:'Merge request !84',definition:'Build, test, publish',hierarchy:'Pipeline → stage → job',run:'Pipeline #991',state:'running',external:'Open in GitLab'},
    azure:{name:'Azure Pipelines',review:'Pull request 204',definition:'CI / azure-pipelines.yml',hierarchy:'Run → stage → job → task',run:'Run 20260901.17',state:'waiting',external:'Open in Azure DevOps'},
    bitbucket:{name:'Bitbucket Pipelines',review:'Pull request #55',definition:'Default pipeline',hierarchy:'Pipeline → step',run:'Build #418',state:'failed',external:'Open in Bitbucket'},
    forgejo:{name:'Forgejo Actions',review:'Pull request #42',definition:'CI / checks.yml',hierarchy:'Workflow → job → step',run:'Run #214',state:'running',external:'Open in Forgejo'},
    gitea:{name:'Gitea Actions',review:'Pull request #17',definition:'Build / build.yml',hierarchy:'Workflow → job → step when supported',run:'Run #81',state:'unknown',external:'Open in Gitea'},
    origin:{name:'Connected checks',review:'Origin mirror → GitHub PR #128',definition:'Checks supplied by GitHub',hierarchy:'Connected service job trace',run:'Check suite abc12ef',state:'pending',external:'Open connected service'},
    generic:{name:'No automation service',review:'No hosted review service',definition:'No definitions are fabricated',hierarchy:'Not applicable',run:'No remote run',state:'unknown',external:'Connect a service'}
  };
  function escapeText(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function commandButton(label,id,disabledReason){return '<button class="pm-btn" data-command-id="'+id+'" data-availability="owner_unavailable_concept_preview" data-disabled-reason="'+(disabledReason||'native_handler_unavailable')+'">'+label+'</button>';}
  function renderProvider(service){var p=providers[service],root=document.getElementById('pm7AutomationProviderView');if(!p||!root)return;var unknown=p.state==='unknown',generic=service==='generic';root.innerHTML='<section class="pm7-post-card"><div class="pm7-post-card-head"><div><div class="pm7-post-card-title">'+escapeText(p.name)+'</div><div class="pm7-post-card-subtitle">Current revision checks and provider-native names</div></div><span class="pm7-post-state" data-state="'+escapeText(p.state)+'">'+escapeText(p.state==='unknown'?'could not check':p.state)+'</span></div><dl class="pm7-post-kv"><dt>Revision</dt><dd class="sh-mono">abc12ef · current</dd><dt>Review</dt><dd>'+escapeText(p.review)+'</dd><dt>Definition</dt><dd>'+escapeText(p.definition)+'</dd><dt>Hierarchy</dt><dd>'+escapeText(p.hierarchy)+'</dd></dl><div class="pm7-post-actions">'+(generic?commandButton('Connect automation','cmd.forge.pipeline.open_in_browser','automation_service_not_configured'):commandButton('Refresh','cmd.forge.pipeline.refresh')+commandButton('Run','cmd.forge.pipeline.run')+commandButton(p.external,'cmd.forge.pipeline.open_in_browser'))+'</div></section><section class="pm7-post-card"><div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Active and recent runs</div><div class="pm7-post-card-subtitle">Unknown and outcome-pending states never masquerade as failures.</div></div><span class="pm7-post-state" data-state="'+(unknown?'unknown':'pending')+'">'+(unknown?'unknown':'outcome pending')+'</span></div><div class="pm7-automation-run"><span class="dot '+(p.state==='running'?'dot-run':p.state==='failed'?'dot-err':'')+'"></span><span class="pm7-automation-run-copy"><strong>'+escapeText(p.run)+'</strong><small>'+escapeText(p.hierarchy)+' · logs bounded</small></span><span class="pm-chip">'+escapeText(p.state)+'</span></div><div class="pm7-post-actions">'+commandButton('Open job','cmd.forge.pipeline.open_job')+commandButton('Open logs','cmd.forge.pipeline.open_logs')+commandButton('Retry','cmd.forge.pipeline.retry')+'</div></section><section class="pm7-post-card"><div class="pm7-post-card-head"><div><div class="pm7-post-card-title">Artifacts, deployments, and settings</div><div class="pm7-post-card-subtitle">Provider artifacts stay distinct from Puppet Master outputs and backup exports.</div></div></div><dl class="pm7-post-kv"><dt>Artifact</dt><dd>test-report · checksum retained · expires in 6 days</dd><dt>Environment</dt><dd>staging · approval required</dd><dt>Runner</dt><dd>Self-hosted runner unavailable in this concept</dd><dt>Secrets</dt><dd>Names only · values never displayed</dd></dl><div class="pm7-post-actions">'+commandButton('Open artifacts in service','cmd.forge.pipeline.open_in_browser')+commandButton('Review gate','cmd.forge.pipeline.approve')+commandButton('Open service settings','cmd.forge.pipeline.open_in_browser')+'</div></section>';if(window.PM_HOVER_TAGS&&typeof window.PM_HOVER_TAGS.refresh==='function')window.PM_HOVER_TAGS.refresh(root);}
  function setEngine(engine,focus){var panel=document.getElementById('panel-source');if(!panel||['git','jj'].indexOf(engine)<0)return;panel.dataset.scmEngine=engine;panel.querySelectorAll('[data-pm7-scm-engine]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.pm7ScmEngine===engine));});if(focus){var target=engine==='jj'?panel.querySelector('.pm7-scm-jj-view'):panel.querySelector('.pm-segtab');if(target)target.focus({preventScroll:true});}}
  function setService(service){var panel=document.getElementById('panel-git'),select=document.getElementById('pm7AutomationService');if(!panel||!select)return;if(service!=='github'&&!providers[service])service='github';panel.dataset.automationService=service;select.value=service;if(service!=='github')renderProvider(service);}
  function openBackup(){var tab=document.getElementById('tab-settings');if(tab)tab.click();if(window.PM12_KIMI&&typeof window.PM12_KIMI.navigate==='function')window.PM12_KIMI.navigate('system','backup');}
  document.addEventListener('click',function(event){var engine=event.target.closest('[data-pm7-scm-engine]');if(engine){event.preventDefault();setEngine(engine.dataset.pm7ScmEngine,true);return;}var backup=event.target.closest('[data-pm7-open-backup]');if(backup){event.preventDefault();openBackup();return;}},true);
  document.addEventListener('change',function(event){if(event.target&&event.target.id==='pm7AutomationService')setService(event.target.value);},true);
  setEngine('git',false);setService('github');
  window.PM7_FORGE_BACKUP_POST_INTEGRATION={schema_id:'pm.pmconcept7.forge_backup_post_integration.v1',browser_concept_only:true,production_runtime_state:'unavailable',native_runtime_state:'unavailable',set_engine:function(value){setEngine(value,false);},set_automation_service:setService,legacy_panel_aliases:Object.freeze({github_actions:'repository_automation','gh-actions':'repository_automation',git:'repository_automation'}),visible_owner_routes:Object.freeze({source_control:'panel-source',repository_automation:'panel-git',backup:'system/backup'}),requirements:Object.freeze(['GUI-001','GUI-002','GUI-003','GUI-004','GUI-005','GUI-006','GUI-007','GUI-008','BGUI-001','BGUI-002','BGUI-003','BGUI-004','BGUI-005'])};
})();
</script>'''


CONTRACT_DATA = r'''<script id="pm7-t46f-contracts" type="application/json">
{
  "schema_id":"pm.pmconcept7.forge_backup_post_integration_contract_projection.v1",
  "browser_concept_only":true,
  "production_runtime_state":"unavailable",
  "native_runtime_state":"unavailable",
  "visual_motion_performance_evidence":"deferred_until_user_approval",
  "requirements":["GUI-001","GUI-002","GUI-003","GUI-004","GUI-005","GUI-006","GUI-007","GUI-008","BGUI-001","BGUI-002","BGUI-003","BGUI-004","BGUI-005"],
  "activity_bar_migration":{"canonical_id":"repository_automation","aliases":["github_actions","gh-actions","git"],"panel_id_preserved":"panel-git","position_order_width_hidden_keyboard_and_undocked_state_preserved_by_alias" : true},
  "source_control":{"single_occupant":true,"engines":["git","jj_git"],"git_staging_visible_only_for_git":true,"jj_operation_history_distinct_from_backup":true},
  "automation":{"single_occupant":true,"providers":["github","gitlab","azure_devops","bitbucket","forgejo","gitea","origin_connected_checks","generic_git"],"origin_actions_engine_fabricated":false,"missing_step_api_invents_steps":false},
  "backup":{"single_owner_projection":true,"account_and_decryption_state_separate":true,"browse_is_read_only":true,"secret_fixture_values_present":false}
}
</script>'''


ALLOWED_EFFECT_DELTA = {
    "command_ids": {
        "added": [
            "cmd.backup.recovery_key.copy",
            "cmd.backup.recovery_key.export",
            "cmd.backup.recovery_key.test",
            "cmd.forge.pipeline.approve",
            "cmd.forge.pipeline.open_in_browser",
            "cmd.forge.pipeline.open_job",
            "cmd.forge.pipeline.open_logs",
            "cmd.forge.pipeline.refresh",
            "cmd.forge.pipeline.retry",
            "cmd.forge.pipeline.run",
        ],
        "removed": [],
    },
    "domain_event_ids": {"added": [], "removed": []},
    "dom_event_types": {"added": [], "removed": []},
    "persistence_targets": {"added": [], "removed": []},
}


def apply(doc, notes, need):
    need(TRANSFORM_MARKER not in doc, "T46F: transform already applied")
    need("PM7 T46: operational systems integration and K3 host adaptation" in doc, "T46F: T46 systems transform marker missing")
    need("['forgejo','Forgejo','forgejo']" in doc and "['gitea','Gitea','gitea']" in doc, "T46F: first-class Forgejo/Gitea onboarding choices missing")
    effects_before = capture_effect_surfaces(doc)

    doc = _replace_once(doc, "</head>", POST_INTEGRATION_CSS + "\n</head>", need, "CSS insertion")
    doc = _replace_once(
        doc,
        '<div class="icon" title="GitHub Actions" data-ab-id="gh-actions" data-target="panel-git">',
        '<div class="icon" data-ab-id="repository_automation" data-legacy-ab-id="gh-actions github_actions git" data-canonical-occupant="repository_automation" data-target="panel-git" data-pm-hover-label="Actions &amp; Pipelines" data-pm-hover-detail="See checks, workflows, pipelines, logs, artifacts, and approvals from the connected service.">',
        need,
        "provider-neutral activity item",
    )
    doc = _replace_once(doc, '<span class="icon-label">ACTIONS</span></div>', '<span class="icon-label">PIPELINES</span></div>', need, "provider-neutral activity label")
    doc = _replace_once(
        doc,
        "if (!saved || Object.prototype.toString.call(saved) !== '[object Array]') saved = null;",
        "if (!saved || Object.prototype.toString.call(saved) !== '[object Array]') saved = null;\n      if (saved) saved = saved.map(function (id) { return id === 'gh-actions' || id === 'github_actions' || id === 'git' ? 'repository_automation' : id; });",
        need,
        "legacy activity state migration",
    )
    doc = _replace_once(
        doc,
        "search: 'panel-search', github_actions: 'panel-git', git: 'panel-git',",
        "search: 'panel-search', repository_automation: 'panel-git', github_actions: 'panel-git', 'gh-actions': 'panel-git', git: 'panel-git',",
        need,
        "legacy command-route aliases",
    )

    source_start = '<div class="side-panel-view" id="panel-source">'
    source_end = "          <!-- ACTIONS -->"
    source_start_new = '<div class="side-panel-view" id="panel-source" data-scm-engine="git" data-canonical-occupant="source_control">'
    doc = _replace_in_band(doc, source_start, source_end, source_start, source_start_new, need, "Source Control owner metadata")
    doc = _replace_in_band(doc, source_start_new, source_end, SOURCE_BANNER_OLD, SOURCE_BANNER_NEW, need, "Source Control header")
    doc = _replace_in_band(
        doc,
        '<div class="side-panel-view" id="panel-source" data-scm-engine="git" data-canonical-occupant="source_control">',
        source_end,
        "          </div>\n          </div>\n          </div>\n\n",
        "          </div>\n          </div>\n" + SOURCE_GIT_FOOTER + "\n" + SOURCE_JJ_VIEW + "\n          </div>\n\n",
        need,
        "Source Control Git footer and JJ view",
    )

    automation_start = '<div class="side-panel-view" id="panel-git">'
    automation_end = "          <!-- DOCKER -->"
    doc = _replace_in_band(doc, automation_start, automation_end, automation_start, '<div class="side-panel-view" id="panel-git" data-canonical-occupant="repository_automation" data-legacy-occupant="github_actions" data-automation-service="github">', need, "automation owner metadata")
    automation_start_new = '<div class="side-panel-view" id="panel-git" data-canonical-occupant="repository_automation" data-legacy-occupant="github_actions" data-automation-service="github">'
    doc = _replace_in_band(doc, automation_start_new, automation_end, AUTOMATION_BANNER_OLD, AUTOMATION_BANNER_NEW, need, "automation header and selector")
    doc = _replace_in_band(
        doc,
        automation_start_new,
        automation_end,
        "          </div>\n          </div>\n          </div>\n\n",
        "          </div>\n          </div>\n" + AUTOMATION_PROVIDER_VIEW + "\n          </div>\n\n",
        need,
        "provider automation projection",
    )

    doc = _replace_once(doc, "  function renderBackup(){", BACKUP_HELPER + "  function renderBackup(){", need, "backup destination helper")
    doc = _replace_once(
        doc,
        "const tabs=[['overview','Overview'],['destinations','Destinations'],['schedules','Schedules'],['retention','Retention & Cleanup'],['restore','Restore'],['history','History']]",
        "const tabs=[['overview','Overview'],['destinations','Destinations'],['schedules','Schedules'],['retention','Retention & Cleanup'],['restore','Restore'],['history','History'],['recovery','Recovery & Keys'],['advanced','Advanced']]",
        need,
        "backup detail area census",
    )
    doc = _replace_once(doc, "pageHeader('archive','Full Server Backup · concept fixture'", "pageHeader('archive','Data Backup & Retention · concept fixture'", need, "backup manager title")
    doc = _replace_once(
        doc,
        '<div class="workflow-list">${B.destinations.map((d,i)=>workflowStep(i+1,d.name,`${d.type} · ${d.path} · ${d.encryption}`,cap(d.status),\'test-backup-destination\',{\'command-id\':\'cmd.backup.destination.test\',availability:\'owner_unavailable_concept_preview\',id:d.id})).join(\'\')}</div>${B.destinations.map(d=>`<div class="table-actions" style="justify-content:flex-end"><button class="icon-btn" data-action="backup-destination-menu" data-ui-action-id="ui.settings.backup_destination.menu.open" data-availability="available" data-id="${d.id}">${icon(\'more\')}</button></div>`).join(\'\')}',
        '<div class="pm7-backup-destination-grid">${B.destinations.map(pm7BackupDestinationCard).join(\'\')}</div>',
        need,
        "backup destination cards",
    )
    doc = _replace_once(doc, "if(state.backupTab==='history')return", BACKUP_RECOVERY_BRANCH + "if(state.backupTab==='history')return", need, "backup Recovery and Advanced branches")
    doc = _replace_in_band(
        doc,
        "  function renderBackupTab(){",
        "  const PM7_DOCTOR_STATUS_CATALOG=",
        "return `<div class=\"card-grid four\">",
        "return `<div class=\"pm7-backup-status-strip\"><article class=\"stat-card\"><div class=\"stat-label\">Automatic backups</div><div class=\"stat-value\" style=\"font-size:13px\">On</div><div class=\"stat-note\">All Projects</div></article><article class=\"stat-card\"><div class=\"stat-label\">Protected data</div><div class=\"stat-value\" style=\"font-size:13px\">Complete</div><div class=\"stat-note\">PM data, files, Git and Jujutsu</div></article><article class=\"stat-card\"><div class=\"stat-label\">Last complete remote backup</div><div class=\"stat-value\" style=\"font-size:13px\">Today · 2:00 AM</div><div class=\"stat-note\">Scope-complete receipt</div></article><article class=\"stat-card\"><div class=\"stat-label\">Recovery Kit</div><div class=\"stat-value\" style=\"font-size:13px\">Needs confirmation</div><div class=\"stat-note\">Storage sign-in is ready</div></article></div><div class=\"card-grid four\">",
        need,
        "backup normal overview",
    )
    doc = _replace_once(
        doc,
        "{ id: 'truenas', name: 'TrueNAS backup', type: 'Network storage', path: 'Backups/Puppet-Master', status: 'ready', encryption: 'On', lastVerified: 'Yesterday' },",
        "{ id: 'truenas', name: 'TrueNAS backup', type: 'Network storage', account: 'Home NAS', path: 'Backups/Puppet-Master', status: 'ready', authState: 'Signed in', decryptionState: 'Key ready', encryption: 'Recovery Set · encrypted', lastComplete: 'Today · 2:00 AM', lastVerified: 'Today · full verification', retention: '30 daily · 12 weekly', permissions: 'Read and write verified', bandwidth: 'Night schedule · 40 MB/s', cost: 'Local storage' },",
        need,
        "TrueNAS destination fixture",
    )
    doc = _replace_once(
        doc,
        "{ id: 'local', name: 'Local recovery cache', type: 'This device', path: 'Managed app data', status: 'ready', encryption: 'OS protected', lastVerified: 'Today' }",
        "{ id: 'local', name: 'Local recovery cache', type: 'This device', account: 'Operating-system storage', path: 'Managed app data', status: 'needs_sign_in', authState: 'Account needs attention', decryptionState: 'Key ready', encryption: 'OS protected', lastComplete: 'Yesterday · 11:40 PM', lastVerified: 'Today · metadata only', retention: '7 days', permissions: 'Write check waiting', bandwidth: 'No limit', cost: 'Uses device storage' }",
        need,
        "local destination independent auth fixture",
    )

    doc = _replace_once(doc, "</body>", POST_INTEGRATION_SCRIPT + "\n" + CONTRACT_DATA + "\n</body>", need, "controller and contract projection")

    need(doc.count('id="pm7-t46f-forge-backup-css"') == 1, "T46F: CSS identity mismatch")
    need(doc.count('id="pm7-t46f-forge-backup-js"') == 1, "T46F: script identity mismatch")
    need(doc.count('id="pm7-t46f-contracts"') == 1, "T46F: contract projection identity mismatch")
    need(doc.count(TRANSFORM_MARKER) == 2, "T46F: marker census mismatch")
    need('data-ab-id="gh-actions"' not in doc, "T46F: legacy activity ID survived as a primary identity")
    need(doc.count('data-ab-id="repository_automation"') == 1, "T46F: provider-neutral activity occupant mismatch")
    need("GITHUB ACTIONS</span>" not in doc, "T46F: GitHub-only panel heading survived")
    need("Jujutsu operations are separate from backup snapshots." in doc, "T46F: JJ and backup separation missing")
    need("No staging or stash controls appear in Jujutsu mode." in doc, "T46F: JJ semantic negative missing")
    need("Origin checks" in doc and "No automation service" in doc, "T46F: Origin/generic automation profiles missing")
    need("No definitions are fabricated" in POST_INTEGRATION_SCRIPT, "T46F: generic Git no-fabrication boundary missing")
    need("Recovery Kit" in doc and "Storage sign-in" in doc and "Decryption key" in doc, "T46F: independent backup auth/key readiness missing")
    need("['forgejo','Forgejo','forgejo']" in doc and "['gitea','Gitea','gitea']" in doc, "T46F: Forgejo/Gitea onboarding regression")
    need(":has(" not in POST_INTEGRATION_CSS and "backdrop-filter" not in POST_INTEGRATION_CSS, "T46F: nonportable CSS entered transform")

    effect_receipt = assert_effect_delta(effects_before, capture_effect_surfaces(doc), ALLOWED_EFFECT_DELTA, need, "T46F")
    notes.update({
        "decision": "September 1 Forge/Backup post-integration GUI inside the existing PM7 and K3 owners",
        "activity_bar_migration": "repository_automation canonical ID with github_actions, gh-actions, and git aliases; panel-git stays stable",
        "source_control_contract": "retained Git panel plus engine-correct JJ Current Change, bookmarks, operation history, reviews, publication, and backup links",
        "automation_contract": "one Actions & Pipelines occupant with GitHub functionality retained and provider-native GitLab, Azure, Bitbucket, Forgejo, Gitea, Origin-check, and generic profiles",
        "backup_contract": "K3 manager overview, reusable destination projections, independent storage-account/decryption readiness, Recovery Kit, restore, and Doctor routes",
        "onboarding_contract": "Forgejo and Gitea remain independent first-class forge selections with separate instance fields",
        "simulation_boundary": "browser concept only; production and native handlers unavailable; no owner receipt or mutation is fabricated",
        "slint_portability": "ordinary lists, cards, selectors, opacity/paint tokens, and bounded local view state; no Canvas, WebGL, backdrop blur, or filter storytelling",
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
