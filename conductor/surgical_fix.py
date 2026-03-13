import sys

def main():
    file_path = "Concepts/PuppetMasterDashComp.html"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        sys.exit(1)

    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Issue 1: Duplicate style text in editorView
        if 'style="display:flex; flex-direction:row; gap:2px; flex:1; position:relative;">' in line and 'div' not in line and 'id="editorView"' not in lines[i-1]:
             # Check if the previous line opened editorView
             if i > 0 and 'id="editorView"' in lines[i-1]:
                 # This is the duplicate style line, skip it
                 i += 1
                 continue

        # Issue 2: Malformed dashboardView header
        if 'draggable="true" data-pane="dashboardView"' in line and '<div' not in line:
            line = '          <div class="dashboard-header pane-header-drag" ' + line.lstrip()
            
        # Issue 3: Incorrect page closure/nesting
        if '<div class="page page-projects">' in line:
            # We need to ensure page-dashboard is closed BEFORE page-projects
            # Let's add a closure if the previous lines didn't have one
            # Actually, I'll just look for my comment "End page-dashboard"
            pass

        new_lines.append(line)
        i += 1

    # Second pass for tag balancing
    final_lines = []
    found_pd_start = False
    pd_closed = False
    
    for line in new_lines:
        if '<div class="page page-dashboard active">' in line:
            found_pd_start = True
        
        if '<div class="page page-projects">' in line and found_pd_start and not pd_closed:
            final_lines.append('              </div> <!-- Fixed closure for page-dashboard -->\n')
            pd_closed = True
            
        # Clean up my previous incorrect comment if it's there
        if '</div> <!-- End page-dashboard -->' in line:
            # If we're already past page-projects, this is likely the misplaced one
            continue
            
        final_lines.append(line)

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(final_lines)
    print("Surgical repair complete.")

if __name__ == "__main__":
    main()
