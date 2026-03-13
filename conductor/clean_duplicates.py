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
        
        # Skip the duplicate style line
        if 'style="display:flex; flex-direction:row; gap:2px; flex:1; position:relative;">' in line and '<div' not in line:
             i += 1
             continue

        new_lines.append(line)
        i += 1

    # Clean up page nesting
    final_lines = []
    stack = []
    in_primary_content = False
    in_page = False
    
    # We will do a simpler approach: 
    # Ensure every <div class="page ..."> is preceded by a </div> if one was open
    # and followed by its content, then closed before the next page.
    
    # Actually, let's just use the markers I know.
    
    processed_lines = []
    for line in new_lines:
        if '<div class="page page-projects">' in line:
            # Check if we need to close the previous page
            # We add TWO divs just in case, to close page-dashboard and maybe one internal one
            # No, that's too risky. 
            pass
        processed_lines.append(line)

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(processed_lines)
    print("Cleaned duplicate lines.")

if __name__ == "__main__":
    main()
