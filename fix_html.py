import re

html_path = 'Concepts/PuppetMasterDashComp.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

css_old = r'''    [data-theme^="retro"] .interview-text-input input { border-radius: 0; }
    </style>'''

css_new = r'''    [data-theme^="retro"] .interview-text-input input { border-radius: 0; }

    /* --- NEW PANELS CSS --- */
    .side-panel-slot {
      width: 280px;
      min-width: 240px;
      background: var(--surface);
      border-right: var(--border-width) solid var(--border);
      display: flex;
      flex-direction: column;
      min-height: 0;
      box-shadow: var(--shadow);
      z-index: 10;
      transition: width 0.3s ease;
    }
    .side-panel-slot.hidden {
      display: none;
    }
    .side-panel-view {
      display: none;
      flex-direction: column;
      height: 100%;
      animation: slideInLeft 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .side-panel-view.active {
      display: flex;
    }
    .panel-header {
      padding: var(--md);
      font-family: var(--display-font);
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 1px;
      border-bottom: var(--border-width) solid var(--border);
      background: var(--surface-elevated);
      border-left: 4px solid var(--accent-lime);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    [data-theme^="basic"] .panel-header { border-left-color: var(--accent-blue); }
    
    .files-search {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--border-light);
    }
    .search-input-wrap {
      display: flex;
      padding: var(--md);
      gap: var(--xs);
    }
    .search-input-wrap input {
      flex: 1;
      padding: var(--sm) var(--md);
      background: var(--surface-elevated);
      border: var(--border-width) solid var(--border);
      border-radius: var(--border-radius);
      color: var(--text-primary);
      font-size: 12px;
      transition: all 0.2s;
    }
    .adv-search-btn {
      padding: 0 var(--sm);
      background: var(--surface-elevated);
      border: var(--border-width) solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius);
    }
    .adv-search-btn:hover { color: var(--text-primary); }
    .advanced-search-panel {
      display: none;
      padding: 0 var(--md) var(--md);
      flex-direction: column;
      gap: var(--xs);
      animation: fadeIn 0.2s ease-out;
    }
    .advanced-search-panel.open { display: flex; }
    .adv-input-row { display: flex; gap: var(--xs); }
    .adv-input-row input {
      flex: 1; padding: 4px 6px; font-size: 10px; background: var(--surface); border: 1px solid var(--border-light); color: var(--text-primary); border-radius: var(--border-radius);
    }
    .search-toggles { display: flex; gap: 2px; }
    .search-toggle {
      font-size: 10px; font-weight: bold; padding: 2px 4px; cursor: pointer; border: 1px solid var(--border-light); background: var(--surface); color: var(--text-secondary); border-radius: var(--border-radius);
    }
    .search-toggle.on { background: var(--accent-blue); color: var(--surface); border-color: var(--accent-blue); }
    [data-theme^="retro"] .search-toggle.on { background: var(--accent-lime); color: #1a1a1a; }
    
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--md);
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: var(--md);
    }
    
    .git-branch-select, .unraid-select {
      width: 100%;
      padding: var(--sm);
      background: var(--surface-elevated);
      border: var(--border-width) solid var(--border);
      color: var(--text-primary);
      font-size: 11px;
      border-radius: var(--border-radius);
    }
    .commit-box { display: flex; flex-direction: column; gap: var(--xs); }
    .commit-box textarea { width: 100%; min-height: 60px; font-family: var(--body-font); font-size: 12px; padding: var(--sm); background: var(--surface); border: 1px solid var(--border-light); color: var(--text-primary); border-radius: var(--border-radius); }
    .ai-btn { background: var(--surface-elevated); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: var(--xs) var(--sm); font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: var(--xs); font-weight: 600; border-radius: var(--border-radius); }
    [data-theme^="retro"] .ai-btn { border-color: var(--accent-lime); color: var(--accent-lime); }
    .ai-btn:hover { background: var(--accent-blue); color: var(--surface); }
    [data-theme^="retro"] .ai-btn:hover { background: var(--accent-lime); color: #1a1a1a; }
    
    .action-btn { background: var(--surface-elevated); border: var(--border-width) solid var(--border); color: var(--text-primary); padding: var(--sm) var(--md); cursor: pointer; font-size: 11px; text-align: center; border-radius: var(--border-radius); font-weight: 600; }
    .action-btn:hover { background: var(--surface); border-color: var(--accent-blue); }
    [data-theme^="retro"] .action-btn:hover { border-color: var(--accent-lime); color: var(--accent-lime); }
    
    .docker-container { display: flex; justify-content: space-between; align-items: center; padding: var(--sm); background: var(--surface-elevated); border: 1px solid var(--border-light); margin-bottom: var(--xs); border-radius: var(--border-radius); }
    .docker-status { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-lime); }
    .docker-status.stopped { background: var(--accent-magenta); }
    
    .artifact-item { border: 1px solid var(--border-light); padding: var(--sm); margin-bottom: var(--sm); cursor: pointer; background: var(--surface-elevated); border-radius: var(--border-radius); }
    .artifact-item:hover { border-color: var(--accent-blue); }
    [data-theme^="retro"] .artifact-item:hover { border-color: var(--accent-lime); }
    .artifact-meta { font-size: 10px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: var(--xs); }
    .artifact-actions { display: flex; gap: var(--xs); margin-top: var(--sm); }
    .artifact-btn { font-size: 9px; padding: 2px 6px; background: var(--surface); border: 1px solid var(--border-light); cursor: pointer; color: var(--text-secondary); border-radius: var(--border-radius); }
    .artifact-btn:hover { color: var(--text-primary); border-color: var(--accent-blue); }
    [data-theme^="retro"] .artifact-btn:hover { border-color: var(--accent-lime); color: var(--accent-lime); }
    
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    </style>'''

html_old = r'''        <nav class="activity-bar collapsed" id="activityBar">
          <div class="icon active" title="Run"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></span><span class="icon-label">RUN</span></div>
          <div class="icon" title="Github Actions"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3.18-.35 6.53-1.6 6.53-7.06a5.4 5.4 0 0 0-1.5-3.8 5.1 5.1 0 0 0-.15-3.7s-1.2-.38-3.9 1.4a13.38 13.38 0 0 0-7 0C6.2 2.7 5 3 5 3a5.1 5.1 0 0 0-.15 3.7A5.4 5.4 0 0 0 3 10.5c0 5.45 3.35 6.7 6.5 7.05a4.8 4.8 0 0 0-1 3.24V22"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></span><span class="icon-label">GITHUB</span></div>
          <div class="icon" title="Docker"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span><span class="icon-label">DOCKER</span></div>
          <div class="icon" title="Source Control"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/><line x1="6" y1="9" x2="6" y2="15"/></svg></span><span class="icon-label">SOURCE</span></div>
          <div class="icon" title="Chat"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><span class="icon-label">CHAT</span></div>
          <div class="icon" title="Files"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg></span><span class="icon-label">FILES</span></div>
          <button class="activity-bar-toggle" id="activityBarToggle" title="Expand/Collapse">&gt;</button>
        </nav>

        <aside class="files-panel" id="filesPanel">
        <div class="files-panel-header">
          <span class="files-title">FILES</span>
        </div>
        <div class="files-search">
          <input type="text" placeholder="Search files...">
        </div>
        <div class="file-tree">
          <div class="folder">▼ src/</div>
          <div class="file" data-open="app.rs">  app.rs <span class="git-status">M</span></div>
          <div class="file" data-open="main.rs">  main.rs</div>
          <div class="folder">  ▼ views/</div>
          <div class="file">    dashboard.rs</div>
          <div class="file">    config.rs <span class="git-status added">A</span></div>
          <div class="folder">▼ tests/</div>
          <div class="file">  integration.rs</div>
          <div class="file">Cargo.toml</div>
          <div class="file">README.md</div>
        </div>
        <div class="files-status">42 files | 3 modified | main up2</div>
        </aside>'''

html_new = r'''        <nav class="activity-bar collapsed" id="activityBar">
          <div class="icon" title="Chat"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><span class="icon-label">CHAT</span></div>
          <div class="icon active" title="Files" data-target="panel-files"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg></span><span class="icon-label">FILES</span></div>
          <div class="icon" title="Run & Debug" data-target="panel-run"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></span><span class="icon-label">RUN</span></div>
          <div class="icon" title="Git" data-target="panel-git"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/><line x1="6" y1="9" x2="6" y2="15"/></svg></span><span class="icon-label">GIT</span></div>
          <div class="icon" title="Docker" data-target="panel-docker"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span><span class="icon-label">DOCKER</span></div>
          <div class="icon" title="Source Control" data-target="panel-source"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></span><span class="icon-label">SOURCE</span></div>
          <div class="icon" title="Unraid" data-target="panel-unraid"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></span><span class="icon-label">UNRAID</span></div>
          <div class="icon" title="Artifacts" data-target="panel-artifacts"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg></span><span class="icon-label">ARTIFACTS</span></div>
          <button class="activity-bar-toggle" id="activityBarToggle" title="Expand/Collapse">&gt;</button>
        </nav>

        <aside class="side-panel-slot" id="sidePanelSlot">
          <div class="side-panel-view active" id="panel-files">
            <div class="panel-header">
              <span class="files-title">FILES</span>
            </div>
            <div class="files-search">
              <div class="search-input-wrap">
                <input type="text" placeholder="Search files...">
                <button class="adv-search-btn" id="advSearchToggle" title="Advanced Search"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
              <div class="advanced-search-panel" id="advSearchPanel">
                <div class="adv-input-row">
                  <input type="text" placeholder="Replace with...">
                </div>
                <div class="adv-input-row">
                  <input type="text" placeholder="Files to include (*.rs, src/)">
                </div>
                <div class="adv-input-row">
                  <input type="text" placeholder="Files to exclude (*.tmp)">
                </div>
                <div class="search-toggles">
                  <div class="search-toggle" title="Match Case">Aa</div>
                  <div class="search-toggle" title="Whole Word">ab</div>
                  <div class="search-toggle" title="Regular Expression">.*</div>
                </div>
              </div>
            </div>
            <div class="panel-content" style="padding:var(--md) 0;">
              <div class="file-tree">
                <div class="folder">▼ src/</div>
                <div class="file" data-open="app.rs">  app.rs <span class="git-status">M</span></div>
                <div class="file" data-open="main.rs">  main.rs</div>
                <div class="folder">  ▼ views/</div>
                <div class="file">    dashboard.rs</div>
                <div class="file">    config.rs <span class="git-status added">A</span></div>
                <div class="folder">▼ tests/</div>
                <div class="file">  integration.rs</div>
                <div class="file">Cargo.toml</div>
                <div class="file">README.md</div>
              </div>
              <div class="files-status" style="padding:var(--md); border-top:1px solid var(--border-light); margin-top:auto;">42 files | 3 modified</div>
            </div>
          </div>

          <div class="side-panel-view" id="panel-run">
            <div class="panel-header">
              <span>RUN & DEBUG</span>
            </div>
            <div class="panel-content">
              <div class="action-btn" style="background: var(--accent-lime); color: #1a1a1a; font-weight: bold; border-color: var(--accent-lime);">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start Debugging (F5)
              </div>
              <div style="font-weight: 600; margin-top: var(--sm); font-family: var(--display-font); font-size: 10px;">VARIABLES</div>
              <div class="file-tree">
                <div class="folder">▼ Locals</div>
                <div class="file">  app: App { ... }</div>
                <div class="file">  config: String "dev"</div>
              </div>
              <div style="font-weight: 600; margin-top: var(--sm); font-family: var(--display-font); font-size: 10px;">CALL STACK</div>
              <div class="file-tree">
                <div class="file">main.rs:14</div>
                <div class="file" style="color:var(--text-muted)">app.run() app.rs:42</div>
              </div>
            </div>
          </div>

          <div class="side-panel-view" id="panel-git">
            <div class="panel-header">
              <span>GIT (GITHUB)</span>
            </div>
            <div class="panel-content">
              <select class="git-branch-select">
                <option>main</option>
                <option>feature/gui-update</option>
              </select>
              <div style="display:flex; justify-content:space-between; font-weight:600; font-family:var(--display-font); font-size:10px; margin-top:var(--xs);">
                <span>CHANGES</span>
                <span class="git-status">2</span>
              </div>
              <div class="file-tree">
                <div class="file">src/app.rs <span class="git-status">M</span></div>
                <div class="file">src/config.rs <span class="git-status added">A</span></div>
              </div>
              <div class="commit-box">
                <textarea placeholder="Message (Ctrl+Enter to commit)"></textarea>
                <button class="ai-btn"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> Generate with AI</button>
                <div class="action-btn" style="background:var(--accent-blue); color:var(--surface);">Commit</div>
                <div class="action-btn">Sync Changes <span>&#8593;1 &#8595;0</span></div>
              </div>
            </div>
          </div>

          <div class="side-panel-view" id="panel-docker">
            <div class="panel-header">
              <span>DOCKER MANAGE</span>
            </div>
            <div class="panel-content">
              <div style="font-weight:600; font-family:var(--display-font); font-size:10px;">ACTIVE CONTAINERS</div>
              <div class="docker-container">
                <div style="display:flex; gap:var(--xs); align-items:center;">
                  <div class="docker-status"></div>
                  <span>puppet-master-dev</span>
                </div>
                <span style="font-size:10px; cursor:pointer;">Stop</span>
              </div>
              <div class="docker-container">
                <div style="display:flex; gap:var(--xs); align-items:center;">
                  <div class="docker-status stopped"></div>
                  <span>db-redis</span>
                </div>
                <span style="font-size:10px; cursor:pointer;">Start</span>
              </div>
              
              <div style="font-weight:600; margin-top:var(--md); font-family:var(--display-font); font-size:10px;">IMAGE PUBLISHING</div>
              <input type="text" class="git-branch-select" value="namespace/repo:tag">
              <div class="action-btn">Push to DockerHub</div>
              
              <div style="margin-top:var(--md); font-size:10px; color:var(--accent-lime); display:flex; align-items:center; gap:var(--xs);">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Registry Authenticated
              </div>
            </div>
          </div>

          <div class="side-panel-view" id="panel-source">
            <div class="panel-header">
              <span>SOURCE CONTROL</span>
            </div>
            <div class="panel-content">
              <div class="file-tree">
                <div class="folder">▼ puppet-master (main)</div>
                <div class="file" style="padding-left:16px;">src/app.rs <span class="git-status">M</span></div>
                <div class="folder" style="margin-top:var(--sm);">▼ puppet-master-rs (dev)</div>
                <div class="file" style="padding-left:16px; color:var(--text-muted);">No changes</div>
              </div>
            </div>
          </div>

          <div class="side-panel-view" id="panel-unraid">
            <div class="panel-header">
              <span>UNRAID TEMPLATES</span>
            </div>
            <div class="panel-content">
              <div style="font-weight:600; font-family:var(--display-font); font-size:10px;">MANAGED PUBLISHING</div>
              <label style="display:flex; gap:var(--xs); font-size:11px; align-items:center; margin-bottom:var(--sm);">
                <input type="checkbox" checked> Auto-update XML on push
              </label>
              <div class="action-btn">Generate Template XML</div>
              <div class="action-btn">Push Template Repo</div>
              
              <div style="font-weight:600; margin-top:var(--md); font-family:var(--display-font); font-size:10px;">CA_PROFILE.XML</div>
              <div class="action-btn">Edit Maintainer Profile</div>
            </div>
          </div>

          <div class="side-panel-view" id="panel-artifacts">
            <div class="panel-header">
              <span>RUNTIME ARTIFACTS</span>
            </div>
            <div class="files-search">
              <div class="search-input-wrap">
                <input type="text" placeholder="Filter by type...">
              </div>
            </div>
            <div class="panel-content" style="padding-top:var(--sm);">
              <div class="artifact-item">
                <div style="font-weight:600;">cost_usage</div>
                <div class="artifact-meta">
                  <span>task_id: 8f92a</span>
                  <span>Tokens: 1420 / 300</span>
                </div>
                <div class="artifact-actions">
                  <div class="artifact-btn">Show in Ledger</div>
                  <div class="artifact-btn">Show in Usage</div>
                </div>
              </div>
              
              <div class="artifact-item">
                <div style="font-weight:600;">code_diff</div>
                <div class="artifact-meta">
                  <span>task_id: 8f92a</span>
                  <span>reasoning_tokens: 150</span>
                </div>
              </div>
              
              <div class="artifact-item">
                <div style="font-weight:600;">browser_recording</div>
                <div class="artifact-meta">
                  <span>run_id: 11bb2</span>
                </div>
                <div class="artifact-actions">
                  <div class="artifact-btn">Play Video</div>
                </div>
              </div>
            </div>
          </div>
        </aside>'''

js_old = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
        if (iconBtn) {
            document.querySelectorAll('.activity-bar .icon').forEach(i => i.classList.remove('active'));
            iconBtn.classList.add('active');

            const title = iconBtn.getAttribute('title');
            const filesPanel = document.getElementById('filesPanel');
            const chatPanel = document.getElementById('chatPanel');

            if (title === 'Files') {
                if (filesPanel) filesPanel.classList.toggle('hidden');
                if (chatPanel) chatPanel.classList.add('hidden');
            } else if (title === 'Chat') {
                if (chatPanel) chatPanel.classList.toggle('hidden');
                if (filesPanel) filesPanel.classList.add('hidden');
            } else {
                if (filesPanel) filesPanel.classList.add('hidden');
                if (chatPanel) chatPanel.classList.add('hidden');
            }
        }'''

js_new = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
        if (iconBtn) {
            const title = iconBtn.getAttribute('title');
            const chatPanel = document.getElementById('chatPanel');
            
            if (title === 'Chat') {
                if (chatPanel) chatPanel.classList.toggle('hidden');
                iconBtn.classList.toggle('active');
            } else {
                document.querySelectorAll('.activity-bar .icon:not([title="Chat"])').forEach(i => i.classList.remove('active'));
                iconBtn.classList.add('active');

                const targetId = iconBtn.getAttribute('data-target');
                if (targetId) {
                    document.querySelectorAll('.side-panel-view').forEach(v => v.classList.remove('active'));
                    const targetView = document.getElementById(targetId);
                    if (targetView) targetView.classList.add('active');
                    
                    const sidePanelSlot = document.getElementById('sidePanelSlot');
                    if (sidePanelSlot) sidePanelSlot.classList.remove('hidden');
                }
            }
        }

        const advSearchToggle = e.target.closest('#advSearchToggle');
        if (advSearchToggle) {
            const advSearchPanel = document.getElementById('advSearchPanel');
            if (advSearchPanel) advSearchPanel.classList.toggle('open');
        }
        
        const searchToggle = e.target.closest('.search-toggle');
        if (searchToggle) {
            searchToggle.classList.toggle('on');
        }'''

if css_old in content:
    content = content.replace(css_old, css_new)
else:
    print("CSS block not found!")
    
if html_old in content:
    content = content.replace(html_old, html_new)
else:
    print("HTML block not found!")
    
if js_old in content:
    content = content.replace(js_old, js_new)
else:
    print("JS block not found!")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete.")
