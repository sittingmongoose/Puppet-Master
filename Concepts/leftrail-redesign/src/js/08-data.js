/* PMR.data: the three redesigned panels' fixture (05-07, data only) behind one object. */

PMR.data = {
  files: typeof FILES_DATA !== 'undefined' ? FILES_DATA : null,
  source: typeof SOURCE_DATA !== 'undefined' ? SOURCE_DATA : null,
  docker: typeof DOCKER_DATA !== 'undefined' ? DOCKER_DATA : null,
};
/* the panels the concepts redesign, in rail order, and their original .side-panel-view ids */
PMR.PANELS = [
  { id: 'files', target: 'panel-files' },
  { id: 'source', target: 'panel-source' },
  { id: 'docker', target: 'panel-docker' },
];
PMR.panelFor = target => PMR.PANELS.find(p => p.target === target || p.id === target) || null;

/* Source Control's views for the current engine (presentation preview only: ui.source_control.profile.preview) */
PMR.sourceViews = () => {
  const d = PMR.data.source;
  if (!d) return [];
  const engine = PMR.state.get('source.engine', (d.engines && d.engines.current) || 'git');
  return engine === 'jj' && Array.isArray(d.jjViews) && d.jjViews.length ? d.jjViews : (d.views || []);
};
PMR.viewsOf = panel => (panel && panel.id === 'source' ? PMR.sourceViews() : ((panel && panel.views) || []));
