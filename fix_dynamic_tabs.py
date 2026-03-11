with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make dynamically created tabs draggable
old_new_tab = r'''                    const newTab = document.createElement('span');
                    newTab.className = 'tab active';
                    newTab.innerHTML = `${filename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;'''
new_new_tab = r'''                    const newTab = document.createElement('span');
                    newTab.className = 'tab active';
                    newTab.draggable = true;
                    newTab.setAttribute('data-filename', filename);
                    newTab.addEventListener('dragstart', e => {
                        e.dataTransfer.setData('text/plain', filename);
                    });
                    newTab.innerHTML = `${filename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;'''
if old_new_tab in content:
    content = content.replace(old_new_tab, new_new_tab)
    print("Fixed dynamically created tabs logic")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
