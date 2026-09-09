"""Authored browser-only sound preview for the PM7 Settings concept.

The pinned K3 Settings source animates sound rows but does not play audio and
does not ship the named WAV/MP3 assets.  This transform adds a deliberately
small Web Audio synthesizer so the browser concept can provide audible,
locally generated feedback without pretending to exercise Puppet Master's
native ``rodio`` player or the real sound-pack files.

Call :func:`apply_to_adapted_js` after ``settings_tome_source._adapt_js``.  The
helper is private to the Settings IIFE, starts only from the existing click
handler, and owns/cleans every AudioContext, node, listener, and timer it
creates.
"""

from __future__ import annotations


TRANSFORM_MARKER = "PM7 Settings synthesized sound-preview helper v1"


FACTORY_JS = r"""
  /* PM7 Settings synthesized sound-preview helper v1.
     Browser concept simulation only: this does not exercise native Slint or rodio audio. */
  function createSettingsSoundPreview(options = {}) {
    const hostWindow = options.window || window;
    const hostDocument = options.document || document;
    const AudioContextClass = options.AudioContextClass || hostWindow.AudioContext || hostWindow.webkitAudioContext;
    const onState = typeof options.onState === 'function' ? options.onState : () => {};
    let active = null;
    let sequence = 0;
    let disposed = false;
    const localFiles = new Map();
    const builtinIds = new Set(['attention', 'soft-warning']);
    const availability = sound => localFiles.has(String(sound?.id)) ? 'local_file'
      : sound?.source === 'Built-in' && builtinIds.has(sound?.id) ? 'concept_tone' : 'file_unavailable';

    const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
    const safeMessage = error => {
      const text = error && typeof error.message === 'string' ? error.message.trim() : '';
      return text ? text.slice(0, 180) : 'Browser audio output is unavailable.';
    };
    const emit = detail => {
      try { onState({ ...detail, simulation: 'synthesized_browser_concept' }); } catch (_) {}
    };
    const durationSeconds = value => {
      const text = String(value || '').trim();
      const match = text.match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
      if (!match) return 1.2;
      return clamp((Number(match[1] || 0) * 60) + Number(match[2]), .45, 2.8);
    };
    const profileFor = sound => {
      const key = `${sound && sound.id || ''} ${sound && sound.name || ''}`.toLowerCase();
      if (key.includes('failure') || key.includes('error')) return [
        [220, 0, .28, 'sawtooth'], [164.81, .30, .28, 'sawtooth'], [110, .62, .34, 'triangle']
      ];
      if (key.includes('warning')) return [
        [440, 0, .22, 'triangle'], [349.23, .28, .24, 'triangle'], [293.66, .58, .34, 'triangle']
      ];
      if (key.includes('attention') || key.includes('approval')) return [
        [523.25, 0, .22, 'sine'], [659.25, .24, .22, 'sine'], [783.99, .48, .42, 'sine']
      ];
      if (key.includes('soft')) return [
        [392, 0, .38, 'sine'], [329.63, .42, .48, 'sine']
      ];
      return [
        [392, 0, .24, 'sine'], [523.25, .24, .24, 'sine'], [659.25, .48, .42, 'sine']
      ];
    };
    const closeContext = context => {
      if (!context || context.state === 'closed' || typeof context.close !== 'function') return;
      try {
        const closing = context.close();
        if (closing && typeof closing.catch === 'function') closing.catch(() => {});
      } catch (_) {}
    };
    const cleanSession = session => {
      if (!session || session.cleaned) return;
      session.cleaned = true;
      if (session.timer !== null) {
        hostWindow.clearTimeout(session.timer);
        session.timer = null;
      }
      for (const node of session.nodes) {
        try { if (typeof node.stop === 'function') node.stop(); } catch (_) {}
        try { if (typeof node.disconnect === 'function') node.disconnect(); } catch (_) {}
      }
      session.nodes.length = 0;
      closeContext(session.context);
    };
    const finish = token => {
      const session = active;
      if (!session || session.token !== token) return;
      active = null;
      cleanSession(session);
      emit({ phase: 'ended', id: session.id, reason: 'natural-end' });
    };
    const stop = (reason = 'user-stop') => {
      const session = active;
      if (!session) return false;
      active = null;
      cleanSession(session);
      emit({ phase: 'stopped', id: session.id, reason });
      return true;
    };
    const fail = (session, code, error) => {
      const superseded = session.cleaned || (active && active.token !== session.token);
      if (!superseded) active = null;
      cleanSession(session);
      if (superseded) return { ok: true, state: 'stopped', reason: 'superseded' };
      const message = safeMessage(error);
      emit({ phase: 'error', id: session.id, code, message });
      return { ok: false, state: 'error', code, message };
    };

    async function play(sound) {
      const id = String(sound && sound.id || 'sound-preview');
      if (disposed) {
        const message = 'The Settings sound preview has already been disposed.';
        emit({ phase: 'error', id, code: 'preview_disposed', message });
        return { ok: false, state: 'error', code: 'preview_disposed', message };
      }
      stop('replaced');
      const mode = availability(sound);
      if (mode === 'file_unavailable') {
        const message = 'This recording is not bundled. Choose Replace file to attach it for this session.';
        emit({ phase: 'error', id, code: 'sound_file_unavailable', message });
        return { ok: false, state: 'error', code: 'sound_file_unavailable', message };
      }
      if (!AudioContextClass) {
        const message = 'This browser does not expose Web Audio output.';
        emit({ phase: 'error', id, code: 'audio_api_unavailable', message });
        return { ok: false, state: 'error', code: 'audio_api_unavailable', message };
      }

      const token = ++sequence;
      let context;
      try { context = new AudioContextClass(); }
      catch (error) {
        const session = { token, id, context: null, nodes: [], timer: null };
        return fail(session, 'audio_context_failed', error);
      }
      const session = { token, id, context, nodes: [], timer: null };
      active = session;
      emit({ phase: 'starting', id });

      try {
        if (context.state === 'suspended' && typeof context.resume === 'function') await context.resume();
      } catch (error) {
        return fail(session, 'audio_resume_failed', error);
      }
      if (!active || active.token !== token) {
        cleanSession(session);
        return { ok: true, state: 'stopped', reason: 'superseded' };
      }
      if (context.state && context.state !== 'running') {
        return fail(session, 'audio_not_running', new Error(`AudioContext remained ${context.state}.`));
      }

      try {
        const duration = durationSeconds(sound && sound.duration);
        const requestedVolume = Number(sound?.volume ?? 70);
        const volume = clamp(Number.isFinite(requestedVolume) ? requestedVolume : 70, 0, 100) / 100;
        let buffer = null;
        if (mode === 'local_file') {
          buffer = await context.decodeAudioData(await localFiles.get(id).arrayBuffer());
          if (!active || active.token !== token) {
            cleanSession(session);
            return { ok: true, state: 'stopped', reason: 'superseded' };
          }
        }
        const startAt = context.currentTime + .025;
        const master = context.createGain();
        master.gain.setValueAtTime((buffer ? 1 : .195) * volume, startAt);
        master.connect(context.destination);
        session.nodes.push(master);

        if (buffer) {
          const clip = context.createBufferSource();
          session.nodes.push(clip);
          clip.buffer = buffer;
          clip.connect(master);
          clip.onended = () => finish(token);
          // Preview only: bound decoding input and playback to avoid a long-running background clip.
          clip.start(startAt, 0, Math.min(buffer.duration, 30));
          session.timer = hostWindow.setTimeout(() => finish(token), (Math.min(buffer.duration, 30) + .2) * 1000);
          emit({ phase: 'playing', id, duration: Math.min(buffer.duration, 30), volume: volume * 100 });
          return { ok: true, state: 'playing', id, mode, volume: volume * 100 };
        }

        for (const [frequency, offset, length, type] of profileFor(sound)) {
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          session.nodes.push(oscillator, envelope);
          const noteStart = startAt + (offset * duration);
          const noteEnd = Math.min(startAt + duration, noteStart + (length * duration));
          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, noteStart);
          envelope.gain.setValueAtTime(.0001, noteStart);
          envelope.gain.exponentialRampToValueAtTime(.42, noteStart + Math.min(.025, duration * .04));
          envelope.gain.exponentialRampToValueAtTime(.0001, noteEnd);
          oscillator.connect(envelope);
          envelope.connect(master);
          oscillator.start(noteStart);
          oscillator.stop(noteEnd + .02);
        }
        session.timer = hostWindow.setTimeout(() => finish(token), Math.ceil((duration + .14) * 1000));
        emit({ phase: 'playing', id, duration, volume: Math.round(volume * 100) });
        return { ok: true, state: 'playing', id, duration, mode, volume: volume * 100 };
      } catch (error) {
        return fail(session, 'audio_start_failed', error);
      }
    }

    async function toggle(sound) {
      const id = String(sound && sound.id || 'sound-preview');
      if (active && active.id === id) {
        stop('user-stop');
        return { ok: true, state: 'stopped', id, reason: 'user-stop' };
      }
      return play(sound);
    }

    const onVisibilityChange = () => { if (hostDocument.hidden) stop('document-hidden'); };
    const onPageHide = () => stop('page-hidden');
    hostDocument.addEventListener('visibilitychange', onVisibilityChange);
    hostWindow.addEventListener('pagehide', onPageHide);

    return Object.freeze({
      play,
      toggle,
      stop,
      availability,
      attachFile: (id, file) => {
        if (!file || typeof file.arrayBuffer !== 'function' || file.size > 32 * 1024 * 1024) return false;
        if (active?.id === String(id)) stop('file-replaced');
        localFiles.set(String(id), file);
        return true;
      },
      releaseFile: id => { if (active?.id === String(id)) stop('file-removed'); localFiles.delete(String(id)); },
      clearFiles: () => { stop('project-changed'); localFiles.clear(); },
      getState: () => active ? { state: active.context && active.context.state === 'running' ? 'playing' : 'starting', id: active.id } : { state: disposed ? 'disposed' : 'idle', id: null },
      dispose: () => {
        if (disposed) return;
        disposed = true;
        stop('disposed');
        localFiles.clear();
        hostDocument.removeEventListener('visibilitychange', onVisibilityChange);
        hostWindow.removeEventListener('pagehide', onPageHide);
      }
    });
  }
""".strip("\n")


SETTINGS_BINDING_JS = r"""  const settingsSoundPreview = createSettingsSoundPreview({
    onState: event => {
      state.soundPlaying = event.phase === 'playing' ? event.id : null;
      syncSoundPreviewRows(state.soundPlaying);
      if (event.phase === 'error') {
        showToast('Sound preview did not play', `${event.message} No sound was played.`, 'error', 5200);
      }
    }
  });"""


PLAY_HANDLER_BEFORE = r"""      case 'play-sound': {
        const s=state.notifications.sounds.find(x=>x.id===ds(el,'id'));
        if(!s)return;
        clearTimeout(soundTimer);
        const stopRow=row=>{row.classList.remove('is-playing');const b=row.querySelector('.sound-play.is-playing');if(b){b.classList.remove('is-playing');b.innerHTML=icon('play');}};
        root.querySelectorAll('.sound-row.is-playing').forEach(stopRow);
        state.soundPlaying=s.id;
        const row=el.closest('.sound-row');
        if(row){row.classList.add('is-playing');el.classList.add('is-playing');el.innerHTML=icon('volume');}
        showToast(`Playing ${s.name}`,`Preview volume ${s.volume||70}% · ${s.duration||'short clip'}`,'info',1800);
        soundTimer=setTimeout(()=>{state.soundPlaying=null;root.querySelectorAll('.sound-row.is-playing').forEach(stopRow);},1200);
        return;
      }"""


PLAY_HANDLER_AFTER = r"""      case 'play-sound': {
        const s=state.notifications.sounds.find(x=>x.id===ds(el,'id'));
        if(!s)return;
        settingsSoundPreview.toggle(s).then(result=>{
          if(result.ok&&result.state==='playing'&&result.volume===0)showToast('Preview volume is zero','Increase this sound’s preview volume to hear it.','info',1800);
        });
        return;
      }"""


SYNC_ROWS_JS = r"""
  function syncSoundPreviewRows(activeId = null) {
    root.querySelectorAll('.sound-row').forEach(row => {
      const button = row.querySelector('.sound-play');
      const playing = !!button && button.dataset.id === activeId;
      row.classList.toggle('is-playing', playing);
      if (!button) return;
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', playing ? 'true' : 'false');
      button.setAttribute('aria-label', `${playing ? 'Stop' : 'Play'} ${row.querySelector('.sound-copy strong')?.textContent || 'sound'} preview`);
      button.dataset.pmHoverLabel = button.getAttribute('aria-label');
      button.dataset.pmHoverDetail = playing ? 'Stop this local preview.' : 'Preview this sound locally.';
      button.innerHTML = icon(playing ? 'volume' : 'play');
    });
  }
""".rstrip("\n")


def _replace_once(source: str, old: str, new: str, need, label: str) -> str:
    count = source.count(old)
    need(count == 1, f"Settings sound preview: expected one {label}, found {count}")
    return source.replace(old, new, 1)


def apply_to_adapted_js(source: str, need) -> str:
    """Inject sound playback into post-``_adapt_js`` K3 Settings JavaScript."""

    need(TRANSFORM_MARKER not in source, "Settings sound preview: transform already applied")
    source = _replace_once(
        source,
        "  'use strict';",
        "  'use strict';\n\n" + FACTORY_JS,
        need,
        "strict-mode factory anchor",
    )
    source = _replace_once(
        source,
        "  let soundTimer = null;",
        SETTINGS_BINDING_JS,
        need,
        "legacy animation timer",
    )
    source = _replace_once(
        source,
        "    function renderNotificationSounds() {",
        SYNC_ROWS_JS + "\n    function renderNotificationSounds() {",
        need,
        "sound-row renderer anchor",
    )
    source = _replace_once(source, PLAY_HANDLER_BEFORE, PLAY_HANDLER_AFTER, need, "play-sound handler")
    source = _replace_once(source, "      case 'notification-tab': switchManagerTab(el);return;",
        "      case 'notification-tab': settingsSoundPreview.stop('notification-tab');switchManagerTab(el);return;", need, "tab cleanup")
    source = _replace_once(source, "reloadProject:()=>{state=loadState();", "reloadProject:()=>{settingsSoundPreview.clearFiles();state=loadState();", need, "project file cleanup")
    source = _replace_once(source, "reset:()=>{window.PM7_SETTINGS_TOME.reset();", "reset:()=>{settingsSoundPreview.clearFiles();window.PM7_SETTINGS_TOME.reset();", need, "reset file cleanup")
    source = _replace_once(source, "state.notifications.sounds=state.notifications.sounds.filter(x=>x.id!==s.id);", "settingsSoundPreview.releaseFile(s.id);state.notifications.sounds=state.notifications.sounds.filter(x=>x.id!==s.id);", need, "delete file cleanup")
    source = _replace_once(source, "${escapeHtml(meta)}</span></span>\n        ${waveform()}",
        "${escapeHtml(meta)}${settingsSoundPreview.availability(s)==='file_unavailable'?' · File unavailable':settingsSoundPreview.availability(s)==='local_file'?' · Local file · session only':''}</span></span>\n        ${waveform()}", need, "honest row availability")
    source = _replace_once(source, "Upload, play, validate, rename, replace, export, delete, and assign sounds.",
        "Built-in previews use generated tones. Attached recordings stay in this tab until reload.", need, "sound library description")
    source = _replace_once(source, "WAV, MP3, OGG, or M4A. The concept stores only filename and metadata.",
        "WAV, MP3, OGG, or M4A supported by your browser. Up to 32 MB; previews play up to 30 seconds. File stays in this tab until reload.", need, "upload disclosure")
    source = _replace_once(source, "const v=readForm(form);let target=sound;if(!target)",
        "const v=readForm(form),file=form.querySelector('input[type=\"file\"]')?.files?.[0];if(file&&file.size>32*1024*1024){showToast('File too large','Choose a sound file under 32 MB.','error');return false;}let target=sound;if(!target)", need, "upload size boundary")
    source = _replace_once(source, "target.source='Custom upload';}saveState();renderApp();showToast('Sound library updated',`${target.name} is available for preview and event assignment.`);",
        "target.source='Custom upload';}if(file)settingsSoundPreview.attachFile(target.id,file);state.home=false;state.domain='general';state.workspace='notifications';state.notificationTab='sounds';pendingScroll={workspace:'notifications',section:'notifications:main'};saveState();closeOverlay(false);renderApp({soft:true});requestAnimationFrame(()=>root.querySelector('.sound-play[data-id=\"'+cssEscape(target.id)+'\"]')?.focus({preventScroll:true}));showToast('Sound library updated',settingsSoundPreview.availability(target)==='file_unavailable'?'Metadata saved. Attach the recording to preview it.':'Ready for a local preview. Event delivery is not exercised.');return true;", need, "retain chosen file in memory")
    # The generic object editor performs its own save/render after a custom
    # callback. This editor already owns that operation: use the shared dialog
    # and form builder directly to prevent a second render and lost return route.
    start = source.index("  function editSound(sound = null, fileName = '') {")
    end = source.index("  function editPermissionProfile(", start)
    editor = source[start:end]
    editor = _replace_once(editor, "editObjectDialog({title:", "openDialog({title:", need, "single sound save owner")
    editor = _replace_once(editor, "object:sound||{},fields:[", "body:formGrid([", need, "sound form builder")
    editor = _replace_once(editor, "],saveLabel:creating?'Add sound'", "]),saveLabel:creating?'Add sound'", need, "sound form builder closing")
    source = source[:start] + editor + source[end:]
    source = _replace_once(source, "case 'preview-sound-pack': showToast('Previewing pack','Playing a short sample from each validated sound.','info');return;",
        "case 'preview-sound-pack': showToast('Pack audio unavailable','The example pack contains metadata only. Attach recordings individually to preview them.','warning');return;", need, "honest pack preview")
    source = _replace_once(source, "case 'test-sound-mapping': taskDrawer('Test exact sound mapping',[['Resolve event','Selected event mapping'],['Apply quiet hours','Respect urgent override'],['Play assigned sound','Preview volume'],['Record receipt','Delivery history']],{successMessage:'Event, destination, and sound mapping validated.'});return;",
        "case 'test-sound-mapping': infoDrawer('Sound mapping preview','Saved example assignments only. This does not send notifications, play audio, validate delivery, or issue a receipt.',state.notifications.events.map(e=>[e.name,e.sound]));return;", need, "no false mapping delivery receipt")
    source = _replace_once(
        source,
        "  function navigate(domainId, workspaceId, options = {}) {",
        "  function navigate(domainId, workspaceId, options = {}) {\n    settingsSoundPreview.stop('settings-navigation');",
        need,
        "Settings navigation cleanup",
    )
    source = _replace_once(
        source,
        "  function renderApp(options = {}) {",
        "  function renderApp(options = {}) {\n    settingsSoundPreview.stop('settings-rerender');",
        need,
        "Settings rerender cleanup",
    )
    source = _replace_once(
        source,
        "closeTransientUi:()=>{hideTooltip();",
        "closeTransientUi:()=>{settingsSoundPreview.stop('settings-surface-close');hideTooltip();",
        need,
        "host close cleanup",
    )
    need("new AudioContextClass()" in source, "Settings sound preview: Web Audio context missing")
    need("audio_resume_failed" in source, "Settings sound preview: resume failure state missing")
    need("settingsSoundPreview.toggle(s)" in source, "Settings sound preview: click gesture is not wired")
    need("simulation: 'synthesized_browser_concept'" in source, "Settings sound preview: concept boundary missing")
    need("soundTimer" not in source, "Settings sound preview: visual-only timer survived")
    return source


if __name__ == "__main__":
    print(FACTORY_JS)
