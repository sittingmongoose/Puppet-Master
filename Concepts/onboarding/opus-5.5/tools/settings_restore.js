/* Inserted inside the existing project Settings adapter by settings_layer.py. The demo uses the same projection
   key as ordinary edits. Defaults, history and the rollback snapshot are one atomic localStorage replacement. */
function restoreProjectDefaults(request) {
  var p = projectRecord(), k = key();
  if (window.PM_SETTINGS_REGISTRY || !CONCEPT_FIXTURE_MODE) return { ok: false, reason: 'The attached Settings owner must restore this project.' };
  if (!p || !k || !request || request.project_id !== p.id) return { ok: false, reason: 'Select the project whose defaults you want to restore.' };
  if (window.PM_SETTINGS_PROJECT_SNAPSHOTS && window.PM_SETTINGS_PROJECT_SNAPSHOTS[p.id]) return { ok: false, reason: 'This supplied project snapshot is read only.' };
  try {
    var before = scrubCredentialSettings(JSON.parse(localStorage.getItem(k) || '{}'));
    var next = clone(before), receipt = 'settings-restore-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));
    next.schema_version = 'pm7.settings.project_projection.v1';
    next.settings = {}; next.changed = {};
    next.settingsTransferRollbacks = next.settingsTransferRollbacks || {};
    next.settingsTransferRollbacks[receipt] = { settings: clone(before.settings || {}), changed: clone(before.changed || {}) };
    next.settingsTransferHistory = next.settingsTransferHistory || [];
    next.settingsTransferHistory.unshift({ time: new Date().toISOString(), action: 'Restored project defaults',
      result: 'Project settings restored. Saved sign-ins and project history were kept.',
      receipt_id: receipt, rollback_ref: receipt, rollback_available: true, fixture_mode: true });
    var bytes = JSON.stringify(next);
    localStorage.setItem(k, bytes);
    if (localStorage.getItem(k) !== bytes) return { ok: false, reason: 'The saved defaults could not be verified.' };
    return { ok: true, receipt_id: receipt, rollback_ref: receipt };
  } catch (error) {
    return { ok: false, reason: 'The project settings could not be saved. Check that browser storage is available and try again.' };
  }
}
