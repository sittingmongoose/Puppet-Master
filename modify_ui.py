import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS to include minimap, split-pane, and resizer styles
css_insertion = r'''
    /* --- RESIZERS & EDITORS CSS --- */
    .resizer-col {
      width: 4px;
      background: transparent;
      cursor: col-resize;
      transition: background 0.2s;
      z-index: 100;
    }
    .resizer-col:hover, .resizer-col.resizing {
      background: var(--accent-blue);
    }
    [data-theme^="retro"] .resizer-col:hover, [data-theme^="retro"] .resizer-col.resizing {
      background: var(--accent-lime);
    }

    .editor-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      position: relative;
    }
    
    .editor-minimap {
      width: 60px;
      border-left: 1px solid var(--border-light);
      background: repeating-linear-gradient(
        transparent,
        transparent 2px,
        var(--text-muted) 2px,
        var(--text-muted) 3px
      );
      opacity: 0.3;
      margin-left: var(--md);
    }
    
    .tab-close {
      margin-left: 6px;
      font-size: 12px;
      line-height: 1;
      opacity: 0.6;
      cursor: pointer;
    }
    .tab-close:hover { opacity: 1; color: var(--accent-magenta); }
    
    .editor-tabs .tab { display: inline-flex; align-items: center; }
'''

content = content.replace('/* --- NEW PANELS CSS --- */', '/* --- NEW PANELS CSS --- */' + css_insertion)

# 2. Update panel-git to GitHub Actions
old_git_panel = r'''          <div class="side-panel-view" id="panel-git">
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
          </div>'''

new_github_actions_panel = r'''          <div class="side-panel-view" id="panel-git">
            <div class="panel-header">
              <span>GITHUB ACTIONS</span>
            </div>
            <div class="panel-content">
              <div style="font-weight:600; font-family:var(--display-font); font-size:10px; margin-bottom:var(--sm);">CURRENT RUNS</div>
              <div class="docker-container">
                <div style="display:flex; gap:var(--xs); align-items:center;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style="font-size: 11px;">build-linux (#42)</span>
                </div>
              </div>
              <div class="docker-container">
                <div style="display:flex; gap:var(--xs); align-items:center;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lime)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style="font-size: 11px;">tests-mac (#41)</span>
                </div>
              </div>

              <div style="font-weight:600; font-family:var(--display-font); font-size:10px; margin-top:var(--md); margin-bottom:var(--sm);">WORKFLOWS</div>
              <div class="file-tree">
                <div class="file">CI Pipeline</div>
                <div class="file">Release Installer</div>
                <div class="file" style="color:var(--text-muted);">Nightly Build</div>
              </div>

              <div style="font-weight:600; font-family:var(--display-font); font-size:10px; margin-top:var(--md); margin-bottom:var(--sm);">SECRETS</div>
              <div class="file-tree">
                <div class="file" style="display:flex; justify-content:space-between;">DOCKER_PAT <span>***</span></div>
                <div class="file" style="display:flex; justify-content:space-between;">NPM_TOKEN <span>***</span></div>
              </div>
              <div class="action-btn" style="margin-top:var(--sm);">Manage Secrets</div>
            </div>
          </div>'''

content = content.replace(old_git_panel, new_github_actions_panel)

# 3. Update panel-source to old Git functionality
old_source_panel = r'''          <div class="side-panel-view" id="panel-source">
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
          </div>'''

new_source_panel = r'''          <div class="side-panel-view" id="panel-source">
            <div class="panel-header">
              <span>SOURCE CONTROL</span>
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
          </div>'''

content = content.replace(old_source_panel, new_source_panel)

# 4. Update Docker panel
old_docker_panel = r'''          <div class="side-panel-view" id="panel-docker">
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
          </div>'''

new_docker_panel = r'''          <div class="side-panel-view" id="panel-docker">
            <div class="panel-header">
              <span>DOCKER MANAGE</span>
            </div>
            <div class="panel-content">
              <div style="font-weight:600; font-family:var(--display-font); font-size:10px; margin-bottom:var(--sm);">CONTAINERS</div>
              <div class="file-tree">
                <div class="file" style="color:var(--accent-lime);">▶ puppet-master-dev (Up 2h)</div>
                <div class="file" style="color:var(--text-muted);">■ db-redis (Exited)</div>
              </div>

              <div style="font-weight:600; font-family:var(--display-font); font-size:10px; margin-top:var(--md); margin-bottom:var(--sm);">IMAGES</div>
              <div class="file-tree">
                <div class="file">sittingmongoose/puppet-master:latest</div>
                <div class="file">node:18-alpine</div>
              </div>

              <div style="font-weight:600; font-family:var(--display-font); font-size:10px; margin-top:var(--md); margin-bottom:var(--sm);">VOLUMES & NETWORKS</div>
              <div class="file-tree">
                <div class="folder">▼ Volumes</div>
                <div class="file" style="padding-left:16px;">pm_db_data</div>
                <div class="folder">▼ Networks</div>
                <div class="file" style="padding-left:16px;">pm_default</div>
              </div>

              <div style="font-weight:600; margin-top:var(--md); font-family:var(--display-font); font-size:10px;">IMAGE PUBLISHING</div>
              <input type="text" class="git-branch-select" value="namespace/repo:tag">
              <div class="action-btn" style="margin-top:var(--xs);">Push to Registry</div>
              
              <div style="margin-top:var(--sm); font-size:10px; color:var(--accent-lime); display:flex; align-items:center; gap:var(--xs);">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Registry Authenticated
              </div>
            </div>
          </div>'''

content = content.replace(old_docker_panel, new_docker_panel)


# 5. Editor enhancements, splits, minimap, close tab, hide dashboard
editor_block_old = r'''          <div class="editor-view" id="editorView">
            <div class="editor-tabs">
              <span class="tab active">app.rs <span class="dot">*</span></span>
              <span class="tab">main.rs</span>
            </div>
            <div class="editor-area">
              <div class="editor-gutter">1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10</div>
              <div class="editor-code">fn main() {
    let app = App::new();
    app.run().unwrap();
}

pub struct Dashboard {
    widgets: Vec&lt;Widget&gt;,
}

impl Dashboard {
    pub fn new() -&gt; Self {
        Self { widgets: vec![] }
    }
}</div>
            </div>
          </div>
          <div class="dashboard-view" id="dashboardView">
          <div class="dashboard-header">'''

editor_block_new = r'''          <div class="resizer-col" id="leftPanelResizer"></div>
          <div class="editor-view" id="editorView" style="display:flex; flex-direction:row; gap:2px; flex:1;">
            
            <div class="editor-pane" id="editorPane1">
              <div class="editor-tabs">
                <span class="tab active">app.rs <span class="dot">*</span> <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
                <span class="tab">main.rs <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
              </div>
              <div class="editor-area">
                <div class="editor-gutter">1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10</div>
                <div class="editor-code" id="editorCodeTarget">fn main() {
    let app = App::new();
    app.run().unwrap();
}

pub struct Dashboard {
    widgets: Vec&lt;Widget&gt;,
}

impl Dashboard {
    pub fn new() -&gt; Self {
        Self { widgets: vec![] }
    }
}</div>
                <div class="editor-minimap"></div>
              </div>
            </div>
            
            <div class="resizer-col" id="editorSplitResizer"></div>

            <div class="editor-pane" id="editorPane2">
              <div class="editor-tabs">
                <span class="tab active">config.rs <span class="dot">*</span> <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
              </div>
              <div class="editor-area">
                <div class="editor-gutter">1<br>2<br>3<br>4</div>
                <div class="editor-code">pub fn load_config() -> Config {
    Config::default()
}</div>
                <div class="editor-minimap"></div>
              </div>
            </div>

          </div>
          <div class="resizer-col" id="editorDashResizer"></div>
          <div class="dashboard-view" id="dashboardView">
          <div class="dashboard-header">
            <button class="add-widget-btn" id="hideDashboardBtn" title="Hide Dashboard"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Hide</button>
            <button class="add-widget-btn">Add widget</button>'''

content = content.replace(editor_block_old, editor_block_new)

# 6. Adjust JavaScript to implement toggling side panels, new resizers, tab interactions.
js_old = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
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
        }'''

js_new = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
        if (iconBtn) {
            const title = iconBtn.getAttribute('title');
            const chatPanel = document.getElementById('chatPanel');
            
            if (title === 'Chat') {
                if (chatPanel) chatPanel.classList.toggle('hidden');
                iconBtn.classList.toggle('active');
            } else {
                const isActive = iconBtn.classList.contains('active');
                document.querySelectorAll('.activity-bar .icon:not([title="Chat"])').forEach(i => i.classList.remove('active'));
                
                const sidePanelSlot = document.getElementById('sidePanelSlot');
                if (isActive) {
                    // Close the panel
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                } else {
                    iconBtn.classList.add('active');
                    const targetId = iconBtn.getAttribute('data-target');
                    if (targetId) {
                        document.querySelectorAll('.side-panel-view').forEach(v => v.classList.remove('active'));
                        const targetView = document.getElementById(targetId);
                        if (targetView) targetView.classList.add('active');
                        if (sidePanelSlot) sidePanelSlot.classList.remove('hidden');
                    }
                }
            }
        }

        // Close editor tab
        const tabCloseBtn = e.target.closest('.tab-close');
        if (tabCloseBtn) {
            const tab = tabCloseBtn.closest('.tab');
            const pane = tab.closest('.editor-pane');
            if (tab) tab.remove();
            
            // If no tabs left in pane, close pane
            if (pane && !pane.querySelector('.tab')) {
                pane.style.display = 'none';
                // If both panes hidden, hide editor view
                const edView = document.getElementById('editorView');
                if (edView && !edView.querySelector('.editor-pane:not([style*="display: none"])')) {
                    edView.style.display = 'none';
                    const splitResizer = document.getElementById('editorSplitResizer');
                    if (splitResizer) splitResizer.style.display = 'none';
                }
            }
        }

        // Hide Dashboard toggle
        const hideDashBtn = e.target.closest('#hideDashboardBtn');
        if (hideDashBtn) {
            const dash = document.getElementById('dashboardView');
            if (dash) {
                dash.style.display = dash.style.display === 'none' ? 'flex' : 'none';
                const dashResizer = document.getElementById('editorDashResizer');
                if (dashResizer) dashResizer.style.display = dash.style.display;
            }
        }

        // Click file in file tree to open tab
        const fileItem = e.target.closest('.file-tree .file');
        if (fileItem && !e.target.closest('.git-status') && !e.target.closest('.folder')) {
            const filename = fileItem.textContent.trim().split(' ')[0];
            const pane1 = document.getElementById('editorPane1');
            const edView = document.getElementById('editorView');
            if (edView) edView.style.display = 'flex';
            if (pane1) {
                pane1.style.display = 'flex';
                const tabs = pane1.querySelector('.editor-tabs');
                tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                const newTab = document.createElement('span');
                newTab.className = 'tab active';
                newTab.innerHTML = `${filename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                tabs.appendChild(newTab);
                
                const codeTarget = document.getElementById('editorCodeTarget');
                if (codeTarget) {
                    codeTarget.innerHTML = `// Viewing ${filename}\n\nfn process_${filename.replace(/[^a-z0-9]/gi, '_')}() {\n    println!("Hello from ${filename}");\n}`;
                }
            }
        }'''

content = content.replace(js_old, js_new)

# 7. Setup resizers in JS
js_resizer_setup = r'''
    function setupResizer(resizerId, prevElementId, nextElementId, isHorizontal=true) {
        const resizer = document.getElementById(resizerId);
        if (!resizer) return;
        
        let isResizing = false;
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizer.classList.add('resizing');
            document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const prev = document.getElementById(prevElementId);
            const next = document.getElementById(nextElementId);
            
            if (isHorizontal && prev) {
                // simple naive implementation for left panel
                // assuming prev is left side, next is right
                const containerRect = resizer.parentNode.getBoundingClientRect();
                const newWidth = e.clientX - containerRect.left;
                if (newWidth > 100 && newWidth < containerRect.width - 100) {
                    prev.style.width = newWidth + 'px';
                    prev.style.flex = 'none';
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = 'default';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // init generic resizers
        setupResizer('leftPanelResizer', 'sidePanelSlot', 'editorView');
        setupResizer('editorSplitResizer', 'editorPane1', 'editorPane2');
        setupResizer('editorDashResizer', 'editorView', 'dashboardView');
'''

content = content.replace("    document.addEventListener('DOMContentLoaded', () => {", js_resizer_setup)

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML successfully updated with split panes, github actions, and resizers.")
