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

/* SP-333 / SSYS-054: wallpaper custody stays with this Project Settings adapter.
   The old browser-wide preference is a one-time migration input, never a current writer. */
function validWallpaper(value) {
  if (value === 'look') return true;
  var catalog = window.PM_WALLPAPERS_CATALOG;
  return typeof value === 'string' && !!(catalog && catalog.families && catalog.families.some(function (f) {
    return f.wallpapers.some(function (w) { return w.id === value; });
  }));
}
function wallpaperSnapshot() {
  var p = projectRecord();
  return p ? { project_id: p.id, snapshot: projectSnapshot(p.id) } : { project_id: null, snapshot: null };
}
function writeProjectWallpaper(request) {
  var p = projectRecord(), k = key(), id = 'general.visual.wallpaper', legacy = 'general.visual.glass-background-mode';
  if (!p || !k || !request || request.project_id !== p.id) return { ok: false, reason: 'Select the Project whose wallpaper you want to change.' };
  if (!validWallpaper(request.value)) return { ok: false, reason: 'This wallpaper is not in the shared catalog.' };
  var owner = window.PM_SETTINGS_REGISTRY, written = null;
  try {
    if (owner) {
      if (typeof owner.setProjectValue !== 'function') return { ok: false, reason: 'The Settings owner has no Project-value transaction.' };
      var result = owner.setProjectValue({ project_id: p.id, setting_id: id, value: request.value });
      if (!result || result.ok === false || typeof result.then === 'function') return { ok: false, reason: 'The Settings owner has not accepted this wallpaper change.' };
    } else {
      if (!CONCEPT_FIXTURE_MODE || (window.PM_SETTINGS_PROJECT_SNAPSHOTS && window.PM_SETTINGS_PROJECT_SNAPSHOTS[p.id])) return { ok: false, reason: 'This supplied Project snapshot is read only.' };
      written = scrubCredentialSettings(JSON.parse(localStorage.getItem(k) || '{}'));
      written.schema_version = 'pm7.settings.project_projection.v1';
      written.settings = written.settings || {}; written.changed = written.changed || {};
      written.settings[id] = request.value; written.changed[id] = true;
      var bytes = JSON.stringify(written);
      localStorage.setItem(k, bytes);
      if (localStorage.getItem(k) !== bytes) return { ok: false, reason: 'The saved wallpaper could not be verified.' };
    }
    var current = projectRecord(), readback = projectSnapshot(p.id);
    if (!current || current.id !== p.id || !readback || !readback.settings || readback.settings[id] !== request.value) return { ok: false, reason: 'The Project wallpaper readback did not match.' };
    /* Browser fixtures can retire their compatibility field only after the owner value is verified.
       An attached native owner retains its field until its own migration clears it; no shadow is edited. */
    var projection = readback, pending = !!(request.retire_legacy && Object.prototype.hasOwnProperty.call(readback.settings, legacy));
    if (pending && !owner) {
      var retained = null, cleanupWritten = false;
      try {
        retained = localStorage.getItem(k);
        var latest = JSON.parse(retained || 'null');
        if (latest && latest.settings && latest.settings[id] === request.value) {
          delete latest.settings[legacy]; if (latest.changed) delete latest.changed[legacy];
          var cleaned = JSON.stringify(latest);
          localStorage.setItem(k, cleaned); cleanupWritten = true;
          pending = localStorage.getItem(k) !== cleaned;
          if (!pending) projection = latest;
        }
      } catch (cleanupError) { pending = true; }
      /* Keep the accepted value and compatibility input if cleanup cannot be verified. */
      if (pending && cleanupWritten) try { localStorage.setItem(k, retained); } catch (cleanupError) {}
    }
    if (window.PM12_KIMI && typeof window.PM12_KIMI.syncWallpaperProjection === 'function') window.PM12_KIMI.syncWallpaperProjection({ project_id: p.id, snapshot: projection });
    return { ok: true, value: request.value, cleanup_pending: pending };
  } catch (error) {
    return { ok: false, reason: 'The Project wallpaper could not be saved and verified.' };
  }
}
function migrateGlassWallpaper(preference) {
  var context = wallpaperSnapshot(), snapshot = context.snapshot, id = 'general.visual.wallpaper', legacy = 'general.visual.glass-background-mode';
  if (!context.project_id) return { ok: true, value: 'look', ephemeral: true };
  if (!snapshot || !snapshot.settings) return { ok: false, retryable: true, reason: 'The Project Settings snapshot is not available yet.' };
  var settings = snapshot.settings, has = Object.prototype.hasOwnProperty;
  var explicit = has.call(settings, id), old = has.call(settings, legacy);
  var value = validWallpaper(settings[id]) ? settings[id] : (!explicit && validWallpaper(preference) ? preference : 'look');
  if (!old && (!explicit || validWallpaper(settings[id])) && (explicit || !validWallpaper(preference))) return { ok: true, value: value, migrated: false };
  var result = writeProjectWallpaper({ project_id: context.project_id, value: value, retire_legacy: old });
  if (result.ok && !explicit && validWallpaper(preference)) {
    /* Consume only after owner acceptance/readback, so later Projects use their own default. */
    var key = 'pm-lg-wallpaper';
    try {
      localStorage.removeItem(key);
      if (localStorage.getItem(key) !== null) throw new Error('Legacy wallpaper cleanup was not verified.');
    } catch (cleanupError) {
      /* A consumed marker in the same legacy slot also prevents fan-out if removal is unavailable. */
      var consumed = '{"consumed":true}';
      try { localStorage.setItem(key, consumed); if (localStorage.getItem(key) !== consumed) result.cleanup_pending = true; }
      catch (markerError) { result.cleanup_pending = true; }
    }
  }
  return result;
}
