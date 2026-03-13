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
    for line in lines:
        # Fix 1: Close editor-view before the dash resizer
        if 'id="editorDashResizer"' in line:
            new_lines.append('                </div> <!-- Close editorView -->\n')
        
        new_lines.append(line)
        
        # Fix 2: Close page-dashboard before page-projects
        if '<div class="page page-projects">' in line:
            # We insert it BEFORE the projects page line
            # Wait, new_lines already has the projects page line at the end.
            projects_line = new_lines.pop()
            new_lines.append('              </div> <!-- Close page-dashboard -->\n')
            new_lines.append(projects_line)

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Tags balanced successfully.")

if __name__ == "__main__":
    main()
