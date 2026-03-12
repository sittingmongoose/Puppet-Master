import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Missing closing div for page-dashboard
page_projects_str = r'''          <div class="page page-projects">'''
page_projects_new = r'''          </div> <!-- End page-dashboard -->
          <div class="page page-projects">'''
if '</div> <!-- End page-dashboard -->' not in content:
    content = content.replace(page_projects_str, page_projects_new)
    print("Fixed page-projects DOM")


# 2. Fix Chat Window positioning
# The current bottom of the file has the footer closing the center-column, then app-shell.
# Let's find exactly where center-row closes.
# Actually, the easiest way is to move chatResizer and chatPanel manually using regex.
chat_html_regex = r'(<div class="resizer-col hidden" id="chatResizer"></div>.*?)(<div class="floating-chat" id="floatingChat")'
chat_match = re.search(chat_html_regex, content, re.DOTALL)
if chat_match:
    chat_html = chat_match.group(1)
    content = content.replace(chat_html, '')
    
    # We want to put it inside center-row, after content-wrapper
    insert_target = r'''          </div>
          <div class="resizer-row" id="terminalResizer"></div>

        <div class="bottom-panel pane-container" id="bottomPanel"'''
        
    insert_new = f'''          </div>
          {chat_html}
        </div>
        <div class="resizer-row" id="terminalResizer"></div>

        <div class="bottom-panel pane-container" id="bottomPanel"'''
    
    # Wait, the structure is:
    # <div class="center-row">
    #   <div class="content-wrapper"> ... </div>
    # </div>
    # <div class="resizer-row" id="terminalResizer"></div>
    # <div class="bottom-panel ...">
    # So we need to insert chat_html BEFORE the closing </div> of center-row
    
    center_row_close = r'''          </div>
        </div>
        
        <div class="resizer-row" id="terminalResizer"></div>'''
        
    center_row_close_new = f'''          </div>
{chat_html}
        </div>
        
        <div class="resizer-row" id="terminalResizer"></div>'''
        
    if center_row_close in content:
        content = content.replace(center_row_close, center_row_close_new)
        print("Moved chat panel inside center-row")
    else:
        # Fallback search
        center_row_close2 = r'''          </div>
        </div>

        <div class="resizer-row" id="terminalResizer"></div>'''
        center_row_close_new2 = f'''          </div>
{chat_html}
        </div>

        <div class="resizer-row" id="terminalResizer"></div>'''
        if center_row_close2 in content:
            content = content.replace(center_row_close2, center_row_close_new2)
            print("Moved chat panel inside center-row (fallback)")
        else:
            # Let's find it more broadly
            match2 = re.search(r'(          </div>\s*</div>\s*<div class="resizer-row" id="terminalResizer"></div>)', content)
            if match2:
                content = content.replace(match2.group(1), f'          </div>\n{chat_html}\n        </div>\n        <div class="resizer-row" id="terminalResizer"></div>')
                print("Moved chat panel inside center-row (broad)")
            else:
                print("Could not find center-row closing div")


# 3. Tab drag and drop logic fix
old_drop_js = r'''                const draggedFilename = e.dataTransfer.getData('text/plain');
                if (draggedFilename) {
                    // Remove from previous
                    const existingTab = document.querySelector(`.tab[data-filename="${draggedFilename}"]`);
                    if (existingTab) existingTab.remove();

                    tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    const newTab = document.createElement('span');
                    newTab.className = 'tab active';
                    newTab.draggable = true;
                    newTab.setAttribute('data-filename', draggedFilename);
                    newTab.addEventListener('dragstart', e => {
                        e.dataTransfer.setData('text/plain', draggedFilename);
                    });
                    newTab.innerHTML = `${draggedFilename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    tabsContainer.appendChild(newTab);'''

new_drop_js = r'''                const draggedFilename = e.dataTransfer.getData('text/plain');
                if (draggedFilename) {
                    const existingTab = document.querySelector(`.tab[data-filename="${draggedFilename}"]`);
                    tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    
                    if (existingTab) {
                        existingTab.classList.add('active');
                        tabsContainer.appendChild(existingTab);
                    } else {
                        // Fallback if not found
                        const newTab = document.createElement('span');
                        newTab.className = 'tab active';
                        newTab.draggable = true;
                        newTab.setAttribute('data-filename', draggedFilename);
                        newTab.addEventListener('dragstart', ev => {
                            ev.dataTransfer.setData('text/plain', draggedFilename);
                        });
                        newTab.innerHTML = `${draggedFilename} <svg class="tab-close" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                        tabsContainer.appendChild(newTab);
                    }'''

if old_drop_js in content:
    content = content.replace(old_drop_js, new_drop_js)
    print("Fixed drop js")
else:
    # Need to handle exact match or regex
    match = re.search(r"const draggedFilename = e\.dataTransfer\.getData\('text/plain'\);.*?tabsContainer\.appendChild\(newTab\);", content, re.DOTALL)
    if match:
        content = content.replace(match.group(0), new_drop_js)
        print("Fixed drop js (regex)")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
