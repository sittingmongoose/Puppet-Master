with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_file = r'''        // Click file in file tree to open tab
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
        }'''
        
new_file = r'''        // Click file in file tree to open tab
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
                const codeTarget = pane1.querySelector('.editor-code');
                if (codeTarget) {
                    codeTarget.innerHTML = `// Viewing ${filename}\n\nfn process_${filename.replace(/[^a-zA-Z0-9]/gi, '_')}() {\n    println!("Hello from ${filename}");\n}`;
                }
            }
        }'''
        
if old_file in content:
    content = content.replace(old_file, new_file)
    print("Replaced file click handler")
else:
    print("Could not find old file click handler")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
