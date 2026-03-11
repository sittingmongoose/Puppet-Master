import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add draggable headers to editor and terminal
editor_old = r'''          <div class="editor-view" id="editorView" style="display:flex; flex-direction:row; gap:2px; flex:1;">'''
editor_new = r'''          <div class="editor-view pane-container" id="editorView" style="display:flex; flex-direction:row; gap:2px; flex:1; position:relative;">
            <div class="pane-header-drag" draggable="true" data-pane="editorView" style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); width:40px; height:10px; background:var(--border-light); border-radius:4px; cursor:grab; z-index:50;"></div>'''

if editor_old in content:
    content = content.replace(editor_old, editor_new)

terminal_old = r'''        <div class="bottom-panel" id="bottomPanel">
          <div class="bottom-tabs">'''
terminal_new = r'''        <div class="bottom-panel pane-container" id="bottomPanel" style="position:relative;">
          <div class="pane-header-drag" draggable="true" data-pane="bottomPanel" style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); width:40px; height:6px; background:var(--border-light); border-radius:4px; cursor:grab; z-index:50;"></div>
          <div class="bottom-tabs">'''

if terminal_old in content:
    content = content.replace(terminal_old, terminal_new)
    
dash_old = r'''          <div class="dashboard-header pane-header-drag" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); cursor: grab; padding: var(--xs) var(--sm);">'''
dash_new = r'''          <div class="dashboard-header pane-header-drag" draggable="true" data-pane="dashboardView" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); cursor: grab; padding: var(--xs) var(--sm);">'''

if dash_old in content:
    content = content.replace(dash_old, dash_new)

# JS for swapping flex order
js_drag_logic = r'''
        // Setup Drag & Drop for Panels
        let draggedPaneId = null;
        document.querySelectorAll('.pane-header-drag').forEach(header => {
            header.addEventListener('dragstart', e => {
                draggedPaneId = header.getAttribute('data-pane');
                e.dataTransfer.effectAllowed = 'move';
            });
        });
        
        document.querySelectorAll('.pane-container').forEach(pane => {
            pane.addEventListener('dragover', e => {
                e.preventDefault();
                pane.style.opacity = '0.5';
            });
            pane.addEventListener('dragleave', e => {
                pane.style.opacity = '1';
            });
            pane.addEventListener('drop', e => {
                e.preventDefault();
                pane.style.opacity = '1';
                if (draggedPaneId && draggedPaneId !== pane.id) {
                    const draggedPane = document.getElementById(draggedPaneId);
                    if (draggedPane) {
                        // Simple visual swap using flex order
                        const tempOrder = getComputedStyle(pane).order || 0;
                        pane.style.order = getComputedStyle(draggedPane).order || 0;
                        draggedPane.style.order = tempOrder === '0' ? '1' : tempOrder;
                    }
                }
            });
        });
'''

content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + js_drag_logic)

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added pane drag to reorder logic")
