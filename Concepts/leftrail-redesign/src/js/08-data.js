/* PMR.data: the three redesigned panels' fixture (05-07, data only) behind one object. Review copy only: the view
   concepts A, B and C render from it; the published page (concept D, a skin) carries no fixture. */

PMR.data = {
  files: typeof FILES_DATA !== 'undefined' ? FILES_DATA : null,
  source: typeof SOURCE_DATA !== 'undefined' ? SOURCE_DATA : null,
  docker: typeof DOCKER_DATA !== 'undefined' ? DOCKER_DATA : null,
};
/* (PMR.PANELS and PMR.panelFor, the panels the view concepts redraw, live in the host: 30-host.js) */

/* Source Control's views for the current engine (presentation preview only: ui.source_control.profile.preview) */
PMR.sourceViews = () => {
  const d = PMR.data.source;
  if (!d) return [];
  const engine = PMR.state.get('source.engine', (d.engines && d.engines.current) || 'git');
  return engine === 'jj' && Array.isArray(d.jjViews) && d.jjViews.length ? d.jjViews : (d.views || []);
};
PMR.viewsOf = panel => (panel && panel.id === 'source' ? PMR.sourceViews() : ((panel && panel.views) || []));
