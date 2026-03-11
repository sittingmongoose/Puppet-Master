import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Title Bar CSS
css_old_titlebar = r'''    .title-bar {
      height: 28px;
      min-height: 28px;'''

css_new_titlebar = r'''    .title-bar {
      height: 40px;
      min-height: 40px;
      padding: var(--sm) var(--md);'''
      
content = content.replace(css_old_titlebar, css_new_titlebar)

# 2. Add .resizer-row to CSS
css_old_resizer = r'''    .resizer-col:hover, .resizer-col.resizing {
      background: var(--accent-blue);
    }
    [data-theme^="retro"] .resizer-col:hover, [data-theme^="retro"] .resizer-col.resizing {
      background: var(--accent-lime);
    }'''
    
css_new_resizer = r'''    .resizer-col:hover, .resizer-col.resizing {
      background: var(--accent-blue);
    }
    [data-theme^="retro"] .resizer-col:hover, [data-theme^="retro"] .resizer-col.resizing {
      background: var(--accent-lime);
    }

    .resizer-row {
      height: 4px;
      background: transparent;
      cursor: row-resize;
      transition: background 0.2s;
      z-index: 100;
    }
    .resizer-row:hover, .resizer-row.resizing {
      background: var(--accent-blue);
    }
    [data-theme^="retro"] .resizer-row:hover, [data-theme^="retro"] .resizer-row.resizing {
      background: var(--accent-lime);
    }'''

content = content.replace(css_old_resizer, css_new_resizer)

# 3. Add terminal resizer to HTML
html_old_terminal = r'''          </div>
        </div>

        <div class="bottom-panel" id="bottomPanel">
          <div class="bottom-tabs">'''
          
html_new_terminal = r'''          </div>
        </div>
        
        <div class="resizer-row" id="terminalResizer"></div>

        <div class="bottom-panel" id="bottomPanel">
          <div class="bottom-tabs">'''
          
content = content.replace(html_old_terminal, html_new_terminal)

# 4. JS Fixes
js_old_setup = r'''    function setupResizer(resizerId, prevElementId, nextElementId, isHorizontal=true) {
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
        setupResizer('editorDashResizer', 'editorView', 'dashboardView');'''
        
js_new_setup = r'''    function setupResizer(resizerId, prevElementId, nextElementId, isHorizontal=true) {
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
            
            if (isHorizontal && prev && resizer.parentNode) {
                const containerRect = resizer.parentNode.getBoundingClientRect();
                const newWidth = e.clientX - containerRect.left;
                if (newWidth > 100 && newWidth < containerRect.width - 100) {
                    prev.style.width = newWidth + 'px';
                    prev.style.flex = 'none';
                }
            } else if (!isHorizontal && next && resizer.parentNode) {
                // For terminal resizer, 'next' is the bottom panel
                const containerRect = resizer.parentNode.getBoundingClientRect();
                const newHeight = containerRect.bottom - e.clientY;
                if (newHeight > 50 && newHeight < containerRect.height - 100) {
                    next.style.height = newHeight + 'px';
                    next.style.flex = 'none';
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
        setupResizer('terminalResizer', 'center-row', 'bottomPanel', false);
        
        const chatResizer = document.getElementById('chatResizer');
        const chatPanel = document.getElementById('chatPanel');
        if (chatResizer && chatPanel) {
            let isChatResizing = false;
            chatResizer.addEventListener('mousedown', (e) => { isChatResizing = true; chatResizer.classList.add('resizing'); document.body.style.cursor = 'col-resize'; e.preventDefault();});
            document.addEventListener('mousemove', (e) => {
                if (!isChatResizing) return;
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 320 && newWidth <= 800) { chatPanel.style.width = newWidth + 'px'; chatPanel.style.maxWidth = 'none'; }
            });
            document.addEventListener('mouseup', () => {
                if (isChatResizing) { isChatResizing = false; chatResizer.classList.remove('resizing'); document.body.style.cursor = 'default'; }
            });
        }'''
        
content = content.replace(js_old_setup, js_new_setup)

js_old_chatresizer = r'''    function initChatResizer() {
      const resizer = document.getElementById('chatResizer');
      const panel = document.getElementById('chatPanel');
      if (!resizer || !panel) return;
      let isResizing = false;
      resizer.addEventListener('mousedown', (e) => { isResizing = true; resizer.classList.add('resizing'); document.body.style.cursor = 'col-resize'; });
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 320 && newWidth <= 800) { panel.style.width = newWidth + 'px'; panel.style.maxWidth = 'none'; }
      });
      document.addEventListener('mouseup', () => {
        if (isResizing) { isResizing = false; resizer.classList.remove('resizing'); document.body.style.cursor = 'default'; }
      });
    }'''

content = content.replace(js_old_chatresizer, '')

js_old_chat_init = r'''      initChatResizer();'''
content = content.replace(js_old_chat_init, '')

# 5. Fix body click handlers for editors and dashboard
js_old_body = r'''      document.body.addEventListener('click', (e) => {
        const target = e.target.closest('[data-step-target], [data-nav-step]');'''
        
js_new_body = r'''      document.body.addEventListener('click', (e) => {
        
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
            e.stopPropagation(); // stop click from bubbling
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
                if (tabs) {
                    tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    const newTab = document.createElement('span');
                    newTab.className = 'tab active';
                    newTab.innerHTML = `${filename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    tabs.appendChild(newTab);
                }
                const codeTarget = document.getElementById('editorCodeTarget');
                if (codeTarget) {
                    codeTarget.innerHTML = `// Viewing ${filename}\n\nfn process_${filename.replace(/[^a-z0-9]/gi, '_')}() {\n    println!("Hello from ${filename}");\n}`;
                }
            }
        }

        const target = e.target.closest('[data-step-target], [data-nav-step]');'''

content = content.replace(js_old_body, js_new_body)


# remove the duplicated handlers added at top level
js_old_dup = r'''        // Close editor tab
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

content = content.replace(js_old_dup, "")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished!")
