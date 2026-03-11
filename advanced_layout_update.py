import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Title Bar "Dashboard" -> "Home"
content = content.replace('<span class="page-tab active" tabindex="0" data-page="dashboard">Dashboard</span>', '<span class="page-tab active" tabindex="0" data-page="dashboard">Home</span>')
content = content.replace('<button id="globalDashToggle"', '<!-- globalDashToggle removed -->\n      <button style="display:none;" id="globalDashToggle"')

# 2. Activity Bar - Add Dashboard Icon at the top
activity_bar_old = r'''        <nav class="activity-bar collapsed" id="activityBar">
          <div class="icon" title="Chat">'''
activity_bar_new = r'''        <nav class="activity-bar collapsed" id="activityBar">
          <div class="icon" title="Dashboard" id="dashboardToggleIcon"><span class="symbol"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg></span><span class="icon-label">HOME</span></div>
          <div class="icon" title="Chat">'''
if activity_bar_old in content:
    content = content.replace(activity_bar_old, activity_bar_new)

# 3. Dashboard Header and Bento Grid
dashboard_old = r'''          <div class="dashboard-view" id="dashboardView">
          <div class="dashboard-header">
            <button class="add-widget-btn">Add widget</button>
            <button class="add-widget-btn">Add widget</button>
            <button class="customize-widgets-btn">Customize</button>
          </div>
          <div class="dashboard-grid">
            <div class="widget-card">
              <div class="drag-handle"></div>
              <div class="widget-title">Orchestrator Status</div>
              <span class="status-badge">Running</span>
              <div class="orchestrator-buttons">
                <button>START</button>
                <button class="primary">PAUSE</button>
                <button>RESUME</button>
                <button>STOP</button>
                <button>RESET</button>
                <button>PREVIEW</button>
                <button>BUILD</button>
                <button class="kill-btn">Kill</button>
              </div>
              <div class="preview-build-strip">
                <span>Preview: running</span>
                <a href="#">Open preview</a>
                <span>|</span>
                <span>Build: success</span>
                <a href="#">Open artifact</a>
              </div>
            </div>
            <div class="widget-card">
              <div class="drag-handle"></div>
              <div class="widget-title">Current Task</div>
              <div style="font-size:12px; margin-bottom:var(--sm);">Refactor authentication module</div>
              <div class="progress-bar"><div class="fill" style="width:45%"></div></div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted);">
                <span>Step 3 of 7</span>
                <span>45%</span>
              </div>
            </div>
            <div class="widget-card">
              <div class="drag-handle"></div>
              <div class="widget-title">Recent Commits</div>
              <div class="terminal-output">
                <div class="line">$ git log --oneline -2</div>
                <div class="line">a3f2c1d feat: add auth handler</div>
                <div class="line">b7e4a09 refactor: provider trait</div>
              </div>
            </div>
          </div>
        </div>'''

dashboard_new = r'''          <div class="dashboard-view pane-container" id="dashboardView">
          <div class="dashboard-header pane-header-drag" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); cursor: grab; padding: var(--xs) var(--sm);">
            <div class="dashboard-tabs" style="display: flex; gap: 2px;">
              <span class="tab active" style="padding: var(--xs) var(--md); font-size: 11px; cursor: pointer; color: var(--text-primary); background: var(--surface); border: var(--border-width) solid var(--border); border-bottom: none; border-radius: var(--border-radius) var(--border-radius) 0 0;">Main</span>
              <span class="tab" style="padding: var(--xs) var(--md); font-size: 11px; cursor: pointer; color: var(--text-secondary); border: var(--border-width) solid transparent;">Metrics</span>
              <span class="tab" style="padding: var(--xs) var(--md); font-size: 11px; cursor: pointer; color: var(--text-secondary); border: var(--border-width) solid transparent;">Monitoring</span>
            </div>
            <div style="display: flex; align-items: center; gap: var(--sm);">
              <button class="customize-widgets-btn" style="padding: var(--xs) var(--md); font-size: 11px; background: var(--surface-elevated); border: var(--border-width) solid var(--border); border-radius: var(--border-radius); cursor: pointer; color: var(--text-primary);">Customize</button>
            </div>
          </div>
          <div class="bento-dashboard" style="flex: 1; overflow-y: auto; padding: var(--md); display: flex; flex-wrap: wrap; gap: var(--lg); align-content: flex-start;">
            <div class="bento-widget size-2x2">
              <div class="widget-header">
                <span class="widget-title">Orchestrator Status</span>
                <div class="widget-settings"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              </div>
              <span class="status-badge" style="margin-bottom:var(--md);">Running</span>
              <div class="orchestrator-buttons">
                <button>START</button>
                <button class="primary">PAUSE</button>
                <button>RESUME</button>
                <button>STOP</button>
                <button>RESET</button>
                <button>PREVIEW</button>
                <button>BUILD</button>
                <button class="kill-btn">Kill</button>
              </div>
              <div class="preview-build-strip">
                <span>Preview: running</span>
                <a href="#">Open preview</a>
                <span>|</span>
                <span>Build: success</span>
                <a href="#">Open artifact</a>
              </div>
            </div>
            
            <div class="bento-widget size-2x1">
              <div class="widget-header">
                <span class="widget-title">Current Task</span>
                <div class="widget-settings"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              </div>
              <div style="font-size:12px; margin-bottom:var(--sm);">Refactor authentication module</div>
              <div class="progress-bar"><div class="fill" style="width:45%"></div></div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted);">
                <span>Step 3 of 7</span>
                <span>45%</span>
              </div>
            </div>
            
            <div class="bento-widget size-1x1">
              <div class="widget-header">
                <span class="widget-title">Metrics</span>
                <div class="widget-settings"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15..."></path></svg></div>
              </div>
              <div style="display:flex; flex-direction:column; gap:var(--xs); font-size:11px;">
                <div style="display:flex; justify-content:space-between;"><span>Token Usage</span><span style="color:var(--accent-lime);">14.2k</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Cost</span><span style="color:var(--accent-orange);">$0.12</span></div>
              </div>
            </div>
          </div>
        </div>'''
if dashboard_old in content:
    content = content.replace(dashboard_old, dashboard_new)

# 4. Terminal Grid Update for resizers
terminal_old = r'''            <div class="terminal-grid" data-group="build">
              <div class="terminal-pane">
                <div class="line">$ cargo build</div>
                <div class="line">   Compiling puppet-master v0.1.0</div>
                <div class="line">   Compiling slint v1.5.1</div>
                <div class="line stderr">error[E0433]: unresolved import `slint`</div>
                <div class="line info">  --> src/main.rs:12:5</div>
              </div>
              <div class="terminal-pane">
                <div class="line">$ cargo test</div>
                <div class="line">running 3 tests</div>
                <div class="line">test tests::it_works ... ok</div>
                <div class="line">test tests::it_fails ... FAILED</div>
              </div>
              <div class="terminal-pane">
                <div class="line">$ npm run lint</div>
                <div class="line">> puppet-master@0.1.0 lint</div>
                <div class="line info">Warning: unused variable 'x'</div>
              </div>
              <div class="terminal-pane">
                <div class="line">$ git log --oneline -2</div>
                <div class="line">a3f2c1d feat: add auth handler</div>
                <div class="line">b7e4a09 refactor: provider trait</div>
              </div>
            </div>'''
            
terminal_new = r'''            <div class="terminal-grid-flex" data-group="build" style="display:flex; flex-direction:column; flex:1; min-height:0;">
              <div style="display:flex; flex:1; min-height:0;">
                  <div class="terminal-pane" id="term1" style="flex:1;">
                    <div class="line">$ cargo build</div>
                    <div class="line">   Compiling puppet-master v0.1.0</div>
                    <div class="line">   Compiling slint v1.5.1</div>
                    <div class="line stderr">error[E0433]: unresolved import `slint`</div>
                    <div class="line info">  --> src/main.rs:12:5</div>
                  </div>
                  <div class="resizer-col" id="termSplitH1"></div>
                  <div class="terminal-pane" id="term2" style="flex:1;">
                    <div class="line">$ cargo test</div>
                    <div class="line">running 3 tests</div>
                    <div class="line">test tests::it_works ... ok</div>
                    <div class="line">test tests::it_fails ... FAILED</div>
                  </div>
              </div>
              <div class="resizer-row" id="termSplitV"></div>
              <div style="display:flex; flex:1; min-height:0;" id="termBottomRow">
                  <div class="terminal-pane" id="term3" style="flex:1;">
                    <div class="line">$ npm run lint</div>
                    <div class="line">> puppet-master@0.1.0 lint</div>
                    <div class="line info">Warning: unused variable 'x'</div>
                  </div>
                  <div class="resizer-col" id="termSplitH2"></div>
                  <div class="terminal-pane" id="term4" style="flex:1;">
                    <div class="line">$ git log --oneline -2</div>
                    <div class="line">a3f2c1d feat: add auth handler</div>
                    <div class="line">b7e4a09 refactor: provider trait</div>
                  </div>
              </div>
            </div>'''
if terminal_old in content:
    content = content.replace(terminal_old, terminal_new)

# 5. Add Drag to Editor Tabs and Draggable headers
css_additions = r'''
    /* --- BENTO WIDGETS CSS --- */
    .bento-widget {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: var(--lg);
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      position: relative;
    }
    [data-theme^="retro"] .bento-widget { border-radius: 0; box-shadow: 4px 4px 0 rgba(0,0,0,0.5); border-width: 2px; }
    .bento-widget.size-1x1 { width: calc(50% - (var(--lg) / 2)); min-height: 120px; }
    .bento-widget.size-2x1 { width: 100%; min-height: 120px; }
    .bento-widget.size-2x2 { width: 100%; min-height: 240px; }
    
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--md);
    }
    .widget-title {
      font-weight: 700;
      font-family: var(--display-font);
      font-size: 11px;
      color: var(--text-primary);
    }
    .widget-settings {
      opacity: 0;
      cursor: pointer;
      color: var(--text-muted);
      transition: opacity 0.2s;
    }
    .bento-widget:hover .widget-settings { opacity: 1; }
    .widget-settings:hover { color: var(--text-primary); }

    .pane-header-drag {
      cursor: grab;
    }
    .pane-header-drag:active {
      cursor: grabbing;
    }
'''
if '/* --- BENTO WIDGETS CSS --- */' not in content:
    content = content.replace('/* --- NEW PANELS CSS --- */', '/* --- NEW PANELS CSS --- */\n' + css_additions)


# 6. Update JS logic for Dashboard Toggle in left bar
js_dashboard_toggle = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
        if (iconBtn) {
            const title = iconBtn.getAttribute('title');
            const chatPanel = document.getElementById('chatPanel');
            
            if (title === 'Chat') {
                if (chatPanel) chatPanel.classList.toggle('hidden');
                iconBtn.classList.toggle('active');
            } else if (title === 'Dashboard') {
                const dash = document.getElementById('dashboardView');
                if (dash) {
                    if (dash.style.display === 'none') {
                        dash.style.display = 'flex';
                        iconBtn.classList.add('active');
                    } else {
                        dash.style.display = 'none';
                        iconBtn.classList.remove('active');
                    }
                    const dashResizer = document.getElementById('editorDashResizer');
                    if (dashResizer) dashResizer.style.display = dash.style.display;
                }
            } else {'''
content = re.sub(r'''const iconBtn = e\.target\.closest\('\.activity-bar \.icon'\);\s*if \(iconBtn\) \{\s*const title = iconBtn\.getAttribute\('title'\);\s*const chatPanel = document\.getElementById\('chatPanel'\);\s*if \(title === 'Chat'\) \{\s*if \(chatPanel\) chatPanel\.classList\.toggle\('hidden'\);\s*iconBtn\.classList\.toggle\('active'\);\s*\} else \{''', js_dashboard_toggle, content, flags=re.DOTALL)


# 7. Update file generation logic
js_file_logic_old = r'''                if (codeTarget) {
                    codeTarget.innerHTML = `// Viewing ${filename}\n\nfn process_${filename.replace(/[^a-zA-Z0-9]/gi, '_')}() {\n    println!("Hello from ${filename}");\n}`;
                }'''

js_file_logic_new = r'''                if (codeTarget) {
                    let fakeCode = `// Viewing ${filename}\n\n`;
                    if (filename.endsWith('.rs')) {
                        fakeCode += `pub fn process_${filename.replace(/[^a-zA-Z0-9]/gi, '_')}() -> Result<(), Error> {\n    println!("Executing logic for ${filename}");\n    let state = load_state()?;\n    \n    if state.is_active() {\n        perform_action(&state);\n    }\n    \n    Ok(())\n}\n\n#[cfg(test)]\nmod tests {\n    #[test]\n    fn test_process() {\n        assert!(true);\n    }\n}`;
                    } else if (filename === 'Cargo.toml') {
                        fakeCode += `[package]\nname = "puppet-master"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nserde = { version = "1.0", features = ["derive"] }\ntokio = { version = "1.30", features = ["full"] }\nreqwest = { version = "0.11", features = ["json"] }`;
                    } else if (filename === 'README.md') {
                        fakeCode += `# Puppet Master\n\nA modern, highly extensible orchestrator and agentic IDE.\n\n## Getting Started\n\n\`\`\`bash\ncargo build --release\n./target/release/puppet-master\n\`\`\`\n\n## Features\n- AI Integration\n- Workspace Management`;
                    } else {
                        fakeCode += `// Generic content for ${filename}\n\nfunction init() {\n  console.log("Initialized");\n}`;
                    }
                    codeTarget.innerHTML = fakeCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }'''
if js_file_logic_old in content:
    content = content.replace(js_file_logic_old, js_file_logic_new)

# 8. Setup Internal Resizers & Fix Chat Resizer CSS/JS
# Fix the terminal grid to hide old CSS
content = content.replace('.terminal-grid {', '.terminal-grid-old {')
content = content.replace('grid-template-columns: 1fr 1fr;', '')

# Fix JS for terminal internal resizers
resizer_setup_old = r'''        setupResizer('editorDashResizer', 'editorView', 'dashboardView');
        setupResizer('terminalResizer', 'center-row', 'bottomPanel', false);'''
        
resizer_setup_new = r'''        setupResizer('editorDashResizer', 'editorView', 'dashboardView');
        setupResizer('terminalResizer', 'center-row', 'bottomPanel', false);
        setupResizer('termSplitH1', 'term1', 'term2');
        setupResizer('termSplitH2', 'term3', 'term4');
        setupResizer('termSplitV', 'term1', 'termBottomRow', false); // simple vertical'''
content = content.replace(resizer_setup_old, resizer_setup_new)

# Chat Resizer Flex CSS fix
chat_resizer_css = r'''    .chat-panel {
      width: 420px;
      min-width: 320px;
      max-width: 520px;
      background: var(--surface);
      border-left: var(--border-width) solid var(--border);
      display: flex;
      flex-direction: column;
      min-height: 0;
    }'''
chat_resizer_css_new = r'''    .chat-panel {
      width: 420px;
      min-width: 320px;
      background: var(--surface);
      border-left: var(--border-width) solid var(--border);
      display: flex;
      flex-direction: column;
      min-height: 0;
      flex: none; /* prevent flex from overriding width */
    }'''
content = content.replace(chat_resizer_css, chat_resizer_css_new)


# Tab Drag & Drop JS
tab_drag_js = r'''
        // Setup Drag & Drop for editor tabs
        document.querySelectorAll('.editor-tabs').forEach(tabsContainer => {
            tabsContainer.addEventListener('dragover', e => {
                e.preventDefault();
                tabsContainer.classList.add('drag-over');
            });
            tabsContainer.addEventListener('dragleave', e => {
                tabsContainer.classList.remove('drag-over');
            });
            tabsContainer.addEventListener('drop', e => {
                e.preventDefault();
                tabsContainer.classList.remove('drag-over');
                const draggedFilename = e.dataTransfer.getData('text/plain');
                if (draggedFilename) {
                    // Remove from previous
                    const existingTab = document.querySelector(`.tab[data-filename="${draggedFilename}"]`);
                    if (existingTab) existingTab.remove();
                    
                    tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    const newTab = document.createElement('span');
                    newTab.className = 'tab active';
                    newTab.setAttribute('data-filename', draggedFilename);
                    newTab.draggable = true;
                    newTab.innerHTML = `${draggedFilename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    tabsContainer.appendChild(newTab);
                    
                    // Simple mock: just make pane visible and update code target if it's pane1
                    const pane = tabsContainer.closest('.editor-pane');
                    if (pane) {
                        pane.style.display = 'flex';
                        const codeTarget = pane.querySelector('.editor-code');
                        if (codeTarget) {
                            codeTarget.innerHTML = `// Viewing ${draggedFilename}\n\nfn imported_${draggedFilename.replace(/[^a-zA-Z0-9]/gi, '_')}() {\n    println!("Dropped ${draggedFilename}");\n}`;
                        }
                    }
                }
            });
        });
        
        // Add draggable to existing tabs
        document.querySelectorAll('.editor-tabs .tab').forEach(t => {
            t.draggable = true;
            t.setAttribute('data-filename', t.textContent.trim().split(' ')[0]);
            t.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', t.getAttribute('data-filename'));
            });
        });
'''
content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + tab_drag_js)


with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished structural updates")
