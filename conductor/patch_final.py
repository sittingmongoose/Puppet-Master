import re
import sys

def main():
    file_path = "Concepts/PuppetMasterDashComp.html"
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fix the </body> error in the source JS
    content = content.replace('Integration </body> Tests', 'Integration Tests')

    # 2. Add Bento Card CSS
    bento_css = """
    /* Shared Bento Card Styling */
    .bento-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: var(--xl);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      gap: var(--sm);
      max-height: 420px;
      height: max-content;
      overflow-y: auto;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.6s;
      animation-fill-mode: forwards;
      animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
      view-transition-name: bento-card;
    }
    .bento-card:hover {
      border-color: var(--accent-blue);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }
    [data-theme^="retro"] .bento-card:hover {
      border-color: var(--accent-lime);
    }
    .bento-widget {
      background: var(--surface);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .widget-header {
      padding: var(--sm) var(--md);
      background: var(--surface-elevated);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .widget-title {
      font-family: var(--display-font);
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: 0.5px;
    }
    """
    content = content.replace('    .page-dashboard {', bento_css + '\n    .page-dashboard {')

    # 3. Add JS for Tabs
    js_tabs = """
      document.querySelectorAll('.orch-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          var tabId = this.getAttribute('data-tab');
          if (!tabId) return;
          var parent = this.closest('.page-orchestrator');
          if (!parent) return;
          parent.querySelectorAll('.orch-tab').forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
          parent.querySelectorAll('.orch-tab-content').forEach(function(c) {
            c.classList.remove('active');
            if (c.getAttribute('data-tab') === tabId) { c.classList.add('active'); }
          });
        });
      });
"""
    content = content.replace('window.switchWizardStep(0);', js_tabs + '\n      window.switchWizardStep(0);')

    # 4. Fix .orch-tab-content CSS
    content = content.replace(
        '.orch-tab-content {\n      display: none;\n      height: 100%;\n      padding: var(--md);\n      overflow: auto;\n    }',
        '.orch-tab-content {\n      display: none;\n      height: 100%;\n      padding: var(--md);\n      overflow-y: auto;\n      flex-direction: column;\n    }'
    )
    content = content.replace(
        '.orch-tab-content.active {\n      display: block;\n    }',
        '.orch-tab-content.active {\n      display: flex !important;\n    }'
    )

    # 5. New Styled Left Panels
    files_panel = """          <div class="side-panel-view active" id="panel-files">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center;">
              <span>FILES</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            </div>
            <div class="files-search" style="padding:var(--md); border-bottom:1px solid var(--border-light);">
              <div class="search-input-wrap" style="display:flex; gap:var(--xs);">
                <input type="text" placeholder="Search files..." class="wizard-input" style="padding:4px 8px; font-size:11px; flex:1;">
                <button class="wizard-btn" style="padding:4px; font-size:11px;">🔍</button>
              </div>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">WORKSPACE</summary>
                <div class="file-tree" style="padding:var(--sm);">
                  <div class="folder" style="font-weight:bold; font-size:11px; padding:4px 0;">▼ src/</div>
                  <div class="file" style="font-size:11px; padding:4px 0; padding-left:12px; color:var(--accent-blue);">app.rs <span class="git-status" style="color:var(--accent-orange); float:right;">M</span></div>
                  <div class="file" style="font-size:11px; padding:4px 0; padding-left:12px;">main.rs</div>
                  <div class="folder" style="font-weight:bold; font-size:11px; padding:4px 0; padding-left:12px;">▼ views/</div>
                  <div class="file" style="font-size:11px; padding:4px 0; padding-left:24px;">dashboard.rs</div>
                  <div class="file" style="font-size:11px; padding:4px 0; padding-left:24px;">config.rs <span class="git-status added" style="color:var(--accent-lime); float:right;">A</span></div>
                  <div class="folder" style="font-weight:bold; font-size:11px; padding:4px 0;">▼ tests/</div>
                  <div class="file" style="font-size:11px; padding:4px 0; padding-left:12px;">integration.rs</div>
                  <div class="file" style="font-size:11px; padding:4px 0;">Cargo.toml</div>
                  <div class="file" style="font-size:11px; padding:4px 0;">README.md</div>
                </div>
              </details>
            </div>
          </div>"""

    run_panel = """          <div class="side-panel-view" id="panel-run">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center;">
              <span>RUN & DEBUG</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <button class="wizard-btn primary" style="width:100%; margin-bottom:var(--md); padding:8px; font-weight:bold; font-size:11px; display:flex; justify-content:center; align-items:center; gap:var(--xs);">
                ▶ Start Debugging (F5)
              </button>
              
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">VARIABLES</summary>
                <div class="file-tree" style="padding:var(--sm); font-size:11px;">
                  <div class="folder" style="font-weight:bold; padding:4px 0;">▼ Locals</div>
                  <div class="file" style="padding:4px 0; padding-left:12px;">app: App { ... }</div>
                  <div class="file" style="padding:4px 0; padding-left:12px;">config: String "dev"</div>
                </div>
              </details>

              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">CALL STACK</summary>
                <div class="file-tree" style="padding:var(--sm); font-size:11px;">
                  <div class="file" style="padding:4px 0; color:var(--accent-blue);">main.rs:14</div>
                  <div class="file" style="padding:4px 0; color:var(--text-muted);">app.run() app.rs:42</div>
                </div>
              </details>
            </div>
          </div>"""

    source_panel = """          <div class="side-panel-view" id="panel-source">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center;">
              <span>SOURCE CONTROL</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <div style="margin-bottom:var(--lg);">
                <select class="wizard-select" style="padding:var(--xs); font-size:11px;">
                  <option>main</option>
                  <option>feature/gui-update</option>
                  <option>hotfix/auth-bug</option>
                </select>
              </div>
              
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">CHANGES <span class="git-status" style="float:right; color:var(--accent-orange);">3</span></summary>
                <div class="file-tree" style="padding:var(--sm);">
                  <div class="file" style="font-size:12px; padding:4px 0;">src/app.rs <span class="git-status" style="color:var(--accent-orange);">M</span></div>
                  <div class="file" style="font-size:12px; padding:4px 0;">src/config.rs <span class="git-status added" style="color:var(--accent-lime);">A</span></div>
                  <div class="file" style="font-size:12px; padding:4px 0; color:var(--text-muted);">Cargo.lock <span class="git-status" style="color:var(--text-muted);">U</span></div>
                  <div style="margin-top:var(--sm); display:flex; gap:var(--xs);">
                    <input type="text" class="wizard-input" placeholder="Message..." style="padding:4px; font-size:11px; flex:1;">
                    <button class="wizard-btn primary" style="padding:4px 8px; font-size:11px;">Commit</button>
                  </div>
                </div>
              </details>

              <details class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">WORKTREES <span class="git-status" style="float:right;">2</span></summary>
                <div class="file-tree" style="padding:var(--sm);">
                  <div class="file" style="font-size:11px; padding:4px 0; border-bottom:1px solid var(--border-light);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <b>main</b> <span class="status-badge" style="font-size:9px; padding:1px 4px;">Active</span>
                    </div>
                    <div style="color:var(--text-muted); margin-top:2px;">/puppet-master</div>
                  </div>
                  <div class="file" style="font-size:11px; padding:4px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <b>feature/gui-update</b> <span class="status-badge" style="font-size:9px; padding:1px 4px; background:var(--accent-orange); color:#000;">Stale</span>
                    </div>
                    <div style="color:var(--text-muted); margin-top:2px;">/.puppet-master/worktrees/wt-1</div>
                    <div style="margin-top:4px;"><a href="#" style="color:var(--accent-blue);">Recover</a> | <a href="#" style="color:var(--accent-magenta);">Prune</a></div>
                  </div>
                </div>
              </details>

              <details class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">HISTORY & GRAPH</summary>
                <div style="padding:var(--sm); font-size:11px; color:var(--text-secondary);">
                  <div style="padding:4px 0; border-left: 2px solid var(--accent-blue); padding-left:var(--sm); margin-bottom:var(--xs);">abc12ef - Initial commit</div>
                  <div style="padding:4px 0; border-left: 2px solid var(--accent-lime); padding-left:var(--sm);">def34ab - Update README</div>
                  <button class="wizard-btn" style="width:100%; margin-top:var(--sm); padding:4px; font-size:10px;">View Full Graph</button>
                </div>
              </details>
            </div>
          </div>"""

    git_panel = """          <div class="side-panel-view" id="panel-git">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center; border-left-color:var(--accent-blue);">
              <span>GITHUB ACTIONS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">CURRENT BRANCH RUNS</summary>
                <div style="padding:var(--sm);">
                  <div class="docker-container" style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-light);">
                    <div style="display:flex; gap:var(--xs); align-items:center;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span style="font-size: 11px;">build-linux (#42)</span>
                    </div>
                    <a href="#" style="font-size:9px; color:var(--text-secondary);">Logs</a>
                  </div>
                  <div class="docker-container" style="display:flex; justify-content:space-between; align-items:center; padding:4px 0;">
                    <div style="display:flex; gap:var(--xs); align-items:center;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lime)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span style="font-size: 11px;">tests-mac (#41)</span>
                    </div>
                    <a href="#" style="font-size:9px; color:var(--text-secondary);">Logs</a>
                  </div>
                </div>
              </details>
              
              <details class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">WORKFLOWS</summary>
                <div style="padding:var(--sm); font-size:11px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:var(--xs);">
                    <span>CI Pipeline</span>
                    <button class="wizard-btn" style="padding:2px 6px; font-size:9px;">Dispatch</button>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span>Release</span>
                    <button class="wizard-btn" style="padding:2px 6px; font-size:9px;">Dispatch</button>
                  </div>
                </div>
              </details>

              <details class="bento-widget" style="border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">SETTINGS (SECRETS & VARS)</summary>
                <div style="padding:var(--sm); font-size:11px; color:var(--text-secondary);">
                  <div>DOCKER_USER (Secret) <span style="float:right; color:var(--accent-lime);">Set</span></div>
                  <div style="margin-top:var(--xs);">DOCKER_PAT (Secret) <span style="float:right; color:var(--accent-magenta);">Missing</span></div>
                  <button class="wizard-btn primary" style="width:100%; margin-top:var(--sm); padding:4px; font-size:10px;">Manage Secrets</button>
                </div>
              </details>
            </div>
          </div>"""

    docker_panel = """<div class="side-panel-view" id="panel-docker">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center; border-left-color:var(--accent-orange);">
              <span>DOCKER MANAGER</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">CONTAINERS</summary>
                <div class="file-tree" style="padding:var(--sm);">
                  <div class="file" style="color:var(--accent-lime); font-size:11px;">▶ puppet-master-dev <span style="color:var(--text-muted); float:right;">Up 2h</span></div>
                  <div class="file" style="color:var(--text-muted); font-size:11px;">■ db-redis <span style="float:right;">Exited</span></div>
                </div>
              </details>

              <details class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">IMAGES & REGISTRIES</summary>
                <div class="file-tree" style="padding:var(--sm); font-size:11px;">
                  <div class="file">sittingmongoose/puppet-master:latest</div>
                  <div class="file" style="color:var(--text-muted);">node:18-alpine</div>
                  <button class="wizard-btn" style="width:100%; margin-top:var(--sm); padding:4px; font-size:10px;">Browse DockerHub</button>
                </div>
              </details>
              
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">BUILD / BAKE</summary>
                <div style="padding:var(--sm); font-size:11px;">
                  <div style="margin-bottom:var(--xs); display:flex; justify-content:space-between;">Target: <span style="color:var(--accent-blue);">default</span></div>
                  <button class="wizard-btn primary" style="width:100%; padding:4px; font-size:10px;">Build Image</button>
                </div>
              </details>

              <details open class="bento-widget" style="border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">PUBLISH / UNRAID</summary>
                <div style="padding:var(--sm); font-size:11px;">
                  <div style="margin-bottom:var(--xs); display:flex; justify-content:space-between;">Docker Auth: <span style="color:var(--accent-lime);">Authenticated</span></div>
                  <div style="margin-bottom:var(--sm); display:flex; justify-content:space-between;">Unraid Repo: <span style="color:var(--accent-orange);">Dirty</span></div>
                  <div style="display:flex; gap:var(--xs);">
                    <button class="wizard-btn" style="flex:1; padding:4px; font-size:10px;">Push Image</button>
                    <button class="wizard-btn" style="flex:1; padding:4px; font-size:10px;">Push XML</button>
                  </div>
                </div>
              </details>
            </div>
          </div>"""

    unraid_panel = """          <div class="side-panel-view" id="panel-unraid">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center;">
              <span>UNRAID TEMPLATES</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">MANAGED PUBLISHING</summary>
                <div style="padding:var(--sm); font-size:11px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:var(--xs);"><span style="color:var(--text-secondary);">Template Repo</span><span style="color:var(--accent-lime);">Ready</span></div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:var(--sm);"><span style="color:var(--text-secondary);">ca_profile.xml</span><span style="color:var(--accent-lime);">Valid</span></div>
                  <button class="wizard-btn primary" style="width:100%; padding:4px; font-size:10px;">Sync Templates</button>
                </div>
              </details>
            </div>
          </div>"""

    artifacts_panel = """          <div class="side-panel-view" id="panel-artifacts">
            <div class="files-panel-header" style="display:flex; justify-content:space-between; align-items:center;">
              <span>RUNTIME ARTIFACTS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            </div>
            <div class="panel-content" style="flex:1; overflow-y:auto; padding:var(--md);">
              <details open class="bento-widget" style="margin-bottom:var(--md); border: 1px solid var(--border-light); background:var(--surface); border-radius:4px;">
                <summary style="padding:var(--sm) var(--md); font-weight:600; font-family:var(--display-font); font-size:10px; cursor:pointer; background:var(--surface-elevated);">RECENT ARTIFACTS</summary>
                <div style="padding:var(--sm); font-size:11px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-light);">
                    <span style="color:var(--accent-blue);">plan_graph.json</span>
                    <span style="color:var(--text-muted);">10:45 AM</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-light);">
                    <span style="color:var(--accent-blue);">evidence_2.2.json</span>
                    <span style="color:var(--text-muted);">10:38 AM</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0;">
                    <span style="color:var(--accent-blue);">build_dist.zip</span>
                    <span style="color:var(--text-muted);">Yesterday</span>
                  </div>
                </div>
              </details>
            </div>
          </div>"""

    # Inject all panels into the aside slot
    new_aside = f"""<aside class="side-panel-slot" id="sidePanelSlot">
{files_panel}
{run_panel}
{source_panel}
{git_panel}
{docker_panel}
{unraid_panel}
{artifacts_panel}
        </aside>"""
    
    content = re.sub(r'<aside class="side-panel-slot" id="sidePanelSlot">.*?</aside>', new_aside, content, flags=re.DOTALL)

    # 6. Dashboard Progress Tab
    progress_tab = """<div class="orch-tab-content active" data-tab="progress">
                <div class="dashboard-grid" style="padding:var(--md);">
                  <div class="bento-card cta-card" style="grid-column: span 2; border-left-color: var(--accent-blue);">
                    <div class="orch-card-title" style="font-family:var(--display-font); font-size:14px; margin-bottom:var(--md);">ORCHESTRATOR STATUS</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--md);">
                      <span class="status-badge" style="background:var(--accent-lime); color:#000; padding:4px 8px; font-size:12px;">Running</span>
                      <span style="font-size:12px; color:var(--text-muted);">Elapsed: 12m 34s</span>
                    </div>
                    <div class="orchestrator-buttons" style="display:flex; gap:var(--sm); flex-wrap:wrap;">
                      <button class="wizard-btn">START</button>
                      <button class="wizard-btn primary">PAUSE</button>
                      <button class="wizard-btn">RESUME</button>
                      <button class="wizard-btn" style="color:var(--accent-magenta);">STOP</button>
                      <button class="wizard-btn">PREVIEW</button>
                      <button class="wizard-btn">BUILD</button>
                    </div>
                    <div class="preview-build-strip" style="margin-top:var(--md); padding-top:var(--sm); border-top:1px solid var(--border-light); font-size:11px; display:flex; justify-content:space-between;">
                      <span>Preview: <span style="color:var(--accent-lime);">running</span></span>
                      <span>Build: <a href="#">success</a> (artifacts/dist)</span>
                    </div>
                  </div>
                  
                  <div class="bento-card" style="grid-column: span 2;">
                    <div class="orch-card-title" style="font-family:var(--display-font); font-size:14px; margin-bottom:var(--md);">CURRENT TASK</div>
                    <div style="font-size:14px; font-weight:bold; margin-bottom:var(--xs);">Task 2.2: Implement Dashboard Widgets</div>
                    <div style="font-size:12px; color:var(--text-secondary); margin-bottom:var(--md);">Refactoring the orchestrator tabs to use the new bento grid layout system.</div>
                    <div style="display:flex; gap:var(--md); font-size:11px; color:var(--text-muted);">
                      <span>Platform: <b style="color:var(--text-primary);">Claude</b></span>
                      <span>Model: <b style="color:var(--text-primary);">sonnet-4.5</b></span>
                      <span>Worktree: <b style="color:var(--accent-blue);">wt-2</b></span>
                    </div>
                    <div style="margin-top:var(--sm); font-size:11px; color:var(--text-secondary); display:flex; align-items:center; gap:var(--xs);">
                      <div class="wizard-activity-pulse" style="width:6px; height:6px;"></div> > 2 subagents active
                    </div>
                  </div>

                  <div class="bento-card" style="grid-column: span 4;">
                    <div class="orch-card-title" style="font-family:var(--display-font); font-size:12px; margin-bottom:var(--sm);">PROGRESS</div>
                    <div class="orch-progress-row" style="display:flex; align-items:center; gap:var(--md); margin-bottom:var(--xs);">
                      <span class="orch-progress-label" style="width:60px; font-size:11px;">Phase 1</span>
                      <div class="progress-bar" style="flex:1; height:6px; background:var(--border-light); border-radius:3px;"><div class="fill" style="width:100%; background:var(--accent-lime);"></div></div>
                      <span style="font-size:11px;">3/3</span>
                    </div>
                    <div class="orch-progress-row" style="display:flex; align-items:center; gap:var(--md); margin-bottom:var(--xs);">
                      <span class="orch-progress-label" style="width:60px; font-size:11px;">Phase 2</span>
                      <div class="progress-bar" style="flex:1; height:6px; background:var(--border-light); border-radius:3px;"><div class="fill" style="width:66%; background:var(--accent-blue);"></div></div>
                      <span style="font-size:11px;">2/3</span>
                    </div>
                  </div>
                  
                  <div class="bento-card" style="grid-column: span 2;">
                    <div class="orch-card-title" style="font-family:var(--display-font); font-size:12px; margin-bottom:var(--sm);">CALLS TO ACTION</div>
                    <div class="orch-prose-block" style="border:1px solid var(--border-light); border-left:3px solid var(--accent-orange); border-radius:4px; margin-bottom:var(--xs); background:var(--surface-elevated);">
                      <div style="padding:var(--sm) var(--md); font-size:12px; font-weight:bold;">Phase 1 complete - approval required</div>
                      <div style="padding:var(--xs) var(--md) var(--sm); display:flex; gap:var(--sm);">
                        <button class="wizard-btn primary" style="font-size:10px; padding:2px 8px;">Approve & Continue</button>
                        <button class="wizard-btn" style="font-size:10px; padding:2px 8px;">Reject</button>
                      </div>
                    </div>
                  </div>

                  <div class="bento-card" style="grid-column: span 2; display:flex; flex-direction:column;">
                    <div class="orch-card-title" style="font-family:var(--display-font); font-size:12px; margin-bottom:var(--sm); display:flex; justify-content:space-between;">
                      AGENT TERMINAL <button class="wizard-btn" style="padding:2px 4px; font-size:9px;">Clear</button>
                    </div>
                    <div class="terminal-output" style="flex:1; background:#0d1117; color:var(--text-primary); font-size:11px; padding:var(--sm); border-radius:4px; font-family:monospace; overflow-y:auto; max-height:150px;">
                      <div style="color:var(--text-muted);">$ cargo check</div>
                      <div>Checking puppet-master v0.1.0</div>
                      <div style="color:var(--accent-lime);">Finished dev [unoptimized + debuginfo] target(s) in 0.12s</div>
                      <div style="color:var(--accent-orange);">[INFO] Subagent architect-reviewer spawned.</div>
                    </div>
                  </div>
                </div>
              </div>"""
    
    content = re.sub(r'<div class="orch-tab-content active" data-tab="progress">.*?</div>', progress_tab, content, flags=re.DOTALL)

    # 7. Node Graph Details
    graph_detail = """<div class="orch-rungraph-detail" style="border-left: 1px solid var(--border-light); background: var(--surface); display:flex; flex-direction:column;">
                            <div class="orch-rungraph-detail-title" style="padding:var(--md); font-family:var(--display-font); font-size:13px; font-weight:bold; border-bottom:1px solid var(--border-light); background:var(--surface-elevated);">Node Detail</div>
                            <div class="orch-rungraph-detail-body" id="orchGraphDetailBody" style="flex:1; overflow-y:auto; padding:var(--md);">
                              
                              <details open class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);">
                                <summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C1 Node Summary</summary>
                                <div style="padding:var(--sm) var(--md); font-size:11px;">
                                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Node ID</span> <b>2.2</b></div>
                                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">State</span> <span class="status-badge" style="background:var(--accent-lime); color:#000; padding:1px 4px; font-size:9px;">Running</span></div>
                                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Attempts</span> <b>1 (Retry 0)</b></div>
                                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Safe-Point ID</span> <b style="color:var(--accent-blue);">sp-49a8f</b></div>
                                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-secondary);">Worktree</span> <b>wt-2</b></div>
                                  <div style="margin-top:var(--sm); border-top:1px dashed var(--border-light); padding-top:4px;">
                                    <span style="color:var(--text-secondary);">Queue Analysis:</span>
                                    <div style="color:var(--text-muted); margin-top:2px;">Last wake: Dependency Resolved</div>
                                  </div>
                                </div>
                              </details>
                              
                              <details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);">
                                <summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C2 Plan Mapping</summary>
                                <div style="padding:var(--sm) var(--md); font-size:11px;">
                                  <div style="color:var(--text-secondary); margin-bottom:4px;">Breadcrumb: Phase 2 > Task 2 > Subtask 2</div>
                                  <button class="wizard-btn" style="font-size:9px; padding:2px 6px;">Open plan at section</button>
                                </div>
                              </details>
                              
                              <details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);">
                                <summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C3 Worker Activity</summary>
                                <div style="padding:var(--sm) var(--md); font-size:11px;">
                                  <div><span style="color:var(--text-secondary);">Identity:</span> rust-engineer</div>
                                  <div><span style="color:var(--text-secondary);">Model:</span> Claude sonnet-4.5</div>
                                  <div style="margin-top:var(--xs);"><a href="#" style="color:var(--accent-blue);">View logs...</a></div>
                                </div>
                              </details>
                              
                              <details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);">
                                <summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C4 Verifier Activity</summary>
                                <div style="padding:var(--sm) var(--md); font-size:11px; color:var(--text-muted);">
                                  Waiting for worker completion...
                                </div>
                              </details>
                              
                              <details class="bento-widget" style="margin-bottom:var(--sm); border:1px solid var(--border-light); border-radius:4px; background:var(--surface-elevated);">
                                <summary style="padding:var(--sm) var(--md); font-weight:bold; font-size:11px; cursor:pointer;">C6 HITL & Recovery</summary>
                                <div style="padding:var(--sm) var(--md); font-size:11px;">
                                  <div style="color:var(--text-muted); margin-bottom:var(--sm);">No pending approvals.</div>
                                  <div style="border-top:1px dashed var(--border-light); padding-top:var(--sm); display:flex; flex-direction:column; gap:var(--xs);">
                                    <button class="wizard-btn" style="font-size:10px;">Retry from safe point</button>
                                    <button class="wizard-btn" style="font-size:10px;">Start fresh attempt</button>
                                  </div>
                                </div>
                              </details>
                              
                            </div>
                          </div>"""
    content = re.sub(r'<div class="orch-rungraph-detail">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>', graph_detail + '\n                        </div>\n                      </div>\n                    </div>\n                  </div>', content, flags=re.DOTALL)

    # 8. Final Fixes
    content = content.replace(
        '<div class="orch-rungraph-empty" id="orchGraphPlaceholder">',
        '<div class="orch-rungraph-empty" id="orchGraphPlaceholder" style="display: none;">'
    )
    content = content.replace(
        '<div class="orch-rungraph-full" id="orchDagPreview">',
        '<div class="orch-rungraph-full" id="orchDagPreview" style="display: flex;">'
    )
    content = content.replace('animation-duration: 0.6s;', 'animation-name: slideUp; animation-duration: 0.6s;')

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Final fix applied successfully.")

if __name__ == "__main__":
    main()
