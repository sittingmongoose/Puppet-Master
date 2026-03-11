import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure tab-close works cleanly. SVG elements can swallow the click, so we use e.target.closest
# Actually e.target.closest('.tab-close') works even if you click an interior SVG path.

# Let's fix the hide Dashboard button listener.
old_hide = r'''        // Hide Dashboard toggle
        const hideDashBtn = e.target.closest('#hideDashboardBtn');
        if (hideDashBtn) {
            const dash = document.getElementById('dashboardView');
            if (dash) {
                dash.style.display = dash.style.display === 'none' ? 'flex' : 'none';
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
                    hideDashBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Hide Dashboard`;
                } else {
                    dash.style.display = 'none';
                    hideDashBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Show Dashboard`;
                }
                const dashResizer = document.getElementById('editorDashResizer');
                if (dashResizer) dashResizer.style.display = dash.style.display;
            }
        }'''
        
if old_hide in content:
    content = content.replace(old_hide, new_hide)
    print("Replaced hide dash")
else:
    print("Could not find old hide dash")
    
# Let's fix chat resizer. We added it to DOMContentLoaded setupResizer, but we should make sure the element exists and works properly.
old_chat = r'''        const chatResizer = document.getElementById('chatResizer');
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
new_chat = r'''        const chatResizer = document.getElementById('chatResizer');
        const chatPanel = document.getElementById('chatPanel');
        if (chatResizer && chatPanel) {
            let isChatResizing = false;
            chatResizer.addEventListener('mousedown', (e) => { isChatResizing = true; chatResizer.classList.add('resizing'); document.body.style.cursor = 'col-resize'; e.preventDefault();});
            document.addEventListener('mousemove', (e) => {
                if (!isChatResizing) return;
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 320 && newWidth <= 1200) { 
                    chatPanel.style.width = newWidth + 'px'; 
                    chatPanel.style.minWidth = 'none';
                    chatPanel.style.maxWidth = 'none'; 
                    chatPanel.style.flex = 'none';
                }
            });
            document.addEventListener('mouseup', () => {
                if (isChatResizing) { isChatResizing = false; chatResizer.classList.remove('resizing'); document.body.style.cursor = 'default'; }
            });
        }'''
        
if old_chat in content:
    content = content.replace(old_chat, new_chat)
    print("Replaced chat resizer")
else:
    print("Could not find old chat resizer")


with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
