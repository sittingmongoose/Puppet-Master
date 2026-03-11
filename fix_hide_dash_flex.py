with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure hideDashBtn removes flex from dashboardView
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
        const hideDashBtn = e.target.closest('#hideDashboardBtn');
        if (hideDashBtn) {
            const dash = document.getElementById('dashboardView');
            if (dash) {
                if (dash.style.display === 'none') {
                    dash.style.display = 'flex';
                    hideDashBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Hide`;
                } else {
                    dash.style.display = 'none';
                    hideDashBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Show`;
                }
                const dashResizer = document.getElementById('editorDashResizer');
                if (dashResizer) dashResizer.style.display = dash.style.display;
            }
        }
        
        // Ensure show dashboard works if dashboard is hidden but we click hide dashboard btn which is inside dashboard?
        // Wait, if the dashboard is hidden, you can't click the hide button inside it!
        // We need the hide button to be somewhere persistent, like the title bar, OR we just let the editorView have a "Show Dashboard" button when it's hidden.
'''

# Wait, if `dashboardView` is display:none, you can't click the button inside it. 
# We should probably put the "Toggle Dashboard" button in the title-bar.
