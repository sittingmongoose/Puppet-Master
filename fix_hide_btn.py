with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a toggle button to the title bar instead of inside the dashboard itself.
old_title_bar = r'''    <header class="title-bar">
      <span class="app-name">Puppet Master</span>
      <div class="project-dropdown">
        <span>puppet-master-rs</span>
        <span>&#9660;</span>
      </div>
      <nav class="page-tabs">'''
      
new_title_bar = r'''    <header class="title-bar">
      <span class="app-name">Puppet Master</span>
      <div class="project-dropdown">
        <span>puppet-master-rs</span>
        <span>&#9660;</span>
      </div>
      <button id="globalDashToggle" title="Toggle Dashboard" style="margin-left: 8px; background: none; border: none; cursor: pointer; color: var(--text-secondary);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg></button>
      <nav class="page-tabs">'''
      
if old_title_bar in content:
    content = content.replace(old_title_bar, new_title_bar)
    print("Added toggle to title bar")
else:
    print("Could not find title bar")
    
# Remove old hide dashboard btn
old_dash_btn = r'''          <div class="dashboard-header">
            <button class="add-widget-btn" id="hideDashboardBtn" title="Hide Dashboard"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Hide</button>
            <button class="add-widget-btn">Add widget</button>'''

new_dash_btn = r'''          <div class="dashboard-header">
            <button class="add-widget-btn">Add widget</button>'''

if old_dash_btn in content:
    content = content.replace(old_dash_btn, new_dash_btn)
    print("Removed old hide btn")

# Fix JS for global dash toggle
old_hide = r'''        // Hide Dashboard toggle
        const hideDashBtn = e.target.closest('#hideDashboardBtn');
        if (hideDashBtn) {
            const dash = document.getElementById('dashboardView');
            if (dash) {
                if (dash.style.display === 'none') {
                    dash.style.display = 'flex';
                    hideDashBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Hide Dashboard`;
                } else {
                    dash.style.display = 'none';
                    hideDashBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Show Dashboard`;
                }
                const dashResizer = document.getElementById('editorDashResizer');
                if (dashResizer) dashResizer.style.display = dash.style.display;
            }
        }'''
        
new_hide = r'''        // Hide Dashboard toggle
        const globalDashToggle = e.target.closest('#globalDashToggle');
        if (globalDashToggle) {
            const dash = document.getElementById('dashboardView');
            if (dash) {
                if (dash.style.display === 'none') {
                    dash.style.display = 'flex';
                    globalDashToggle.style.color = 'var(--accent-lime)';
                } else {
                    dash.style.display = 'none';
                    globalDashToggle.style.color = 'var(--text-secondary)';
                }
                const dashResizer = document.getElementById('editorDashResizer');
                if (dashResizer) dashResizer.style.display = dash.style.display;
            }
        }'''

if old_hide in content:
    content = content.replace(old_hide, new_hide)
    print("Replaced JS dash toggle")
else:
    print("Could not find old JS dash toggle")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
