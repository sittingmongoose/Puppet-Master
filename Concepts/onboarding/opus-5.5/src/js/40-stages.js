/* O55.stages — chapters, canonical stage mapping and path-correct progress. The rail shows chapters (never a fixed
   "3 of 12"); screen readers hear the chapter and the applicable path length. Canonical graphs: main (11 stages),
   connect-existing (6), deferred project (9) — product_onboarding_contracts.schema.json. */
(function () {
  'use strict';
  const O55 = window.O55;

  const CHAPTERS = ['welcome', 'computer', 'project', 'ai', 'ready'];
  const MAIN = ['welcome', 'simple_path', 'first_project', 'source_control_setup', 'server_storage_client', 'remote_access_setup', 'review_setup_plan', 'automatic_preparation', 'provider_setup', 'free_models_setup', 'ready'];
  const CONNECT = ['welcome', 'simple_path', 'remote_access_setup', 'review_setup_plan', 'automatic_preparation', 'ready'];
  const DEFERRED = ['welcome', 'simple_path', 'first_project', 'source_control_setup', 'server_storage_client', 'remote_access_setup', 'review_setup_plan', 'automatic_preparation', 'ready'];

  /* Which chapters apply to the current journey (connect-existing has no Project or AI chapter of its own). */
  function chapters(S) {
    const d = S.draft();
    if (S.sess.active === 'connect' && !S.sess.connect.newProject) return ['welcome', 'computer', 'ready'];
    if (d.project_mode === 'later') return ['welcome', 'computer', 'project', 'ready'];
    return CHAPTERS.slice();
  }
  function graph(S) {
    const d = S.draft();
    if (S.sess.active === 'connect' && !S.sess.connect.newProject) return CONNECT;
    return d.project_mode === 'later' ? DEFERRED : MAIN;
  }
  function progress(S, screen) {
    const list = chapters(S), ch = screen.chapter || 'welcome';
    const idx = Math.max(0, list.indexOf(ch));
    return { chapters: list, index: idx, current: ch, stage: screen.stage || null, graph: graph(S), announce: O55.t('chrome.progress', { n: idx + 1, total: list.length, name: O55.t('chapters.' + ch) }) };
  }

  O55.stages = { CHAPTERS, MAIN, CONNECT, DEFERRED, chapters, graph, progress };
})();
