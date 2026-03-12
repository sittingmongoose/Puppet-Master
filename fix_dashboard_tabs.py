import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# I will wrap the bento-dashboard content in #dashGridMain and create the other two grids.

dash_html_regex = r'(<div class="bento-dashboard" style="flex: 1; overflow-y: auto; padding: var\(--md\); display: flex; flex-wrap: wrap; gap: var\(--lg\); align-content: flex-start;">)(.*?)(          </div>\s*</div>\s*</div> <!-- End page-dashboard -->)'

dash_match = re.search(dash_html_regex, content, re.DOTALL)
if dash_match:
    bento_open = dash_match.group(1)
    main_widgets = dash_match.group(2)
    bento_close = dash_match.group(3)
    
    new_dash_content = f'''{bento_open}
            <div id="dashGridMain" style="display:contents;">
{main_widgets}            </div>
            <div id="dashGridMetrics" style="display:none; width: 100%;">
                <div class="bento-widget size-2x1" style="width:100%;">
                    <div class="widget-header">
                        <span class="widget-title">Token Usage Over Time</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:flex-end; gap:4px; padding-top:var(--md); border-bottom:1px solid var(--border-light);">
                        <!-- Fake bar chart -->
                        <div style="width:20px; height:20%; background:var(--accent-blue);"></div>
                        <div style="width:20px; height:40%; background:var(--accent-blue);"></div>
                        <div style="width:20px; height:35%; background:var(--accent-blue);"></div>
                        <div style="width:20px; height:60%; background:var(--accent-blue);"></div>
                        <div style="width:20px; height:90%; background:var(--accent-lime);"></div>
                        <div style="width:20px; height:50%; background:var(--accent-lime);"></div>
                        <div style="width:20px; height:70%; background:var(--accent-lime);"></div>
                    </div>
                </div>
                <div class="bento-widget size-1x1" style="width: calc(50% - (var(--lg) / 2)); margin-top:var(--lg);">
                    <div class="widget-header">
                        <span class="widget-title">Cost Summary</span>
                    </div>
                    <div style="font-size:24px; color:var(--accent-orange); font-family:var(--display-font);">$12.45</div>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:var(--xs);">This billing cycle</div>
                </div>
                <div class="bento-widget size-1x1" style="width: calc(50% - (var(--lg) / 2)); margin-top:var(--lg); margin-left:var(--lg);">
                    <div class="widget-header">
                        <span class="widget-title">SLA Status</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:var(--sm);">
                        <div style="width:12px; height:12px; border-radius:50%; background:var(--accent-lime);"></div>
                        <span style="font-size:14px;">All Systems Operational</span>
                    </div>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:var(--sm);">99.99% Uptime</div>
                </div>
            </div>
            <div id="dashGridMonitoring" style="display:none; width: 100%;">
                <div class="bento-widget size-2x2" style="width:100%;">
                    <div class="widget-header">
                        <span class="widget-title">Active Nodes</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:var(--md);">
                        <div style="display:flex; justify-content:space-between; padding:var(--sm); background:var(--surface); border:1px solid var(--border-light); border-radius:var(--border-radius);">
                            <span>worker-node-01</span>
                            <span style="color:var(--accent-lime);">CPU: 45% | RAM: 2.1GB</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:var(--sm); background:var(--surface); border:1px solid var(--border-light); border-radius:var(--border-radius);">
                            <span>worker-node-02</span>
                            <span style="color:var(--accent-orange);">CPU: 89% | RAM: 4.5GB</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:var(--sm); background:var(--surface); border:1px solid var(--border-light); border-radius:var(--border-radius);">
                            <span>db-master</span>
                            <span style="color:var(--accent-lime);">CPU: 12% | RAM: 8.0GB</span>
                        </div>
                    </div>
                </div>
            </div>
{bento_close}'''
    content = content.replace(dash_match.group(0), new_dash_content)
    print("Added dashboard tab grids")
else:
    print("Could not match bento dashboard")


js_tabs_old = r'''        // Dashboard tabs logic
        document.querySelectorAll('.dashboard-tabs').forEach(tabsContainer => {
            tabsContainer.addEventListener('click', e => {
                const tab = e.target.closest('.tab');
                if (tab) {
                    tabsContainer.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                        t.style.color = 'var(--text-secondary)';
                        t.style.background = 'transparent';
                        t.style.border = 'var(--border-width) solid transparent';
                    });
                    tab.classList.add('active');
                    tab.style.color = 'var(--text-primary)';
                    tab.style.background = 'var(--surface)';
                    tab.style.border = 'var(--border-width) solid var(--border)';
                    tab.style.borderBottom = 'none';
                    tab.style.borderRadius = 'var(--border-radius) var(--border-radius) 0 0';
                }
            });
        });'''

js_tabs_new = r'''        // Dashboard tabs logic
        document.querySelectorAll('.dashboard-tabs').forEach(tabsContainer => {
            tabsContainer.addEventListener('click', e => {
                const tab = e.target.closest('.tab');
                if (tab) {
                    tabsContainer.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                        t.style.color = 'var(--text-secondary)';
                        t.style.background = 'transparent';
                        t.style.border = 'var(--border-width) solid transparent';
                    });
                    tab.classList.add('active');
                    tab.style.color = 'var(--text-primary)';
                    tab.style.background = 'var(--surface)';
                    tab.style.border = 'var(--border-width) solid var(--border)';
                    tab.style.borderBottom = 'none';
                    tab.style.borderRadius = 'var(--border-radius) var(--border-radius) 0 0';
                    
                    const tabName = tab.textContent.trim();
                    const mainGrid = document.getElementById('dashGridMain');
                    const metricsGrid = document.getElementById('dashGridMetrics');
                    const monitoringGrid = document.getElementById('dashGridMonitoring');
                    
                    if (mainGrid) mainGrid.style.display = 'none';
                    if (metricsGrid) metricsGrid.style.display = 'none';
                    if (monitoringGrid) monitoringGrid.style.display = 'none';
                    
                    if (tabName === 'Main' && mainGrid) mainGrid.style.display = 'contents';
                    if (tabName === 'Metrics' && metricsGrid) metricsGrid.style.display = 'flex';
                    if (tabName === 'Monitoring' && monitoringGrid) monitoringGrid.style.display = 'flex';
                }
            });
        });'''
        
if js_tabs_old in content:
    content = content.replace(js_tabs_old, js_tabs_new)
    print("Updated dashboard tabs JS logic")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)

