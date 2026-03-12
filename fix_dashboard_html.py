with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
match = re.search(r'<div class="dashboard-view" id="dashboardView">.*?<div class="page page-projects">', content, re.DOTALL)
if match:
    old_html = match.group(0)
    new_html = r'''<div class="dashboard-view pane-container" id="dashboardView">
          <div class="dashboard-header pane-header-drag" draggable="true" data-pane="dashboardView" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); cursor: grab; padding: var(--xs) var(--sm);">
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
            <div class="bento-widget size-2x2" style="width: calc(100% - var(--lg)); min-width: 400px; max-width: 600px;">
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
            
            <div class="bento-widget size-2x1" style="width: calc(100% - var(--lg)); min-width: 400px; max-width: 600px;">
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
            
            <div class="bento-widget size-1x1" style="width: calc(50% - var(--lg)); min-width: 200px; max-width: 290px;">
              <div class="widget-header">
                <span class="widget-title">Metrics</span>
                <div class="widget-settings"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              </div>
              <div style="display:flex; flex-direction:column; gap:var(--xs); font-size:11px;">
                <div style="display:flex; justify-content:space-between;"><span>Token Usage</span><span style="color:var(--accent-lime);">14.2k</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Cost</span><span style="color:var(--accent-orange);">$0.12</span></div>
              </div>
            </div>
            
            <div class="bento-widget size-1x1" style="width: calc(50% - var(--lg)); min-width: 200px; max-width: 290px;">
              <div class="widget-header">
                <span class="widget-title">Background Runs</span>
                <div class="widget-settings"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
              </div>
              <div style="font-size: 11px; color: var(--text-muted);">0 active</div>
            </div>
          </div>
          </div>
          <div class="page page-projects">'''
    content = content.replace(old_html, new_html)
    print("Replaced dashboard layout")
else:
    print("Could not find dashboard layout to replace")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
