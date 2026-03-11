import sys

def cleanup():
    file_path = '/home/sittingmongoose/Cursor/Puppet Master/Concepts/PuppetMasterDashComp.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # check if there's an extra </div> after </footer> and before the chat panels
    # The last </div> should close the app-shell
    
    # We will just ensure the structure is exactly:
    # ...
    # </footer>
    # </div>
    # <div class="chat-resizer" ...
    
    import re
    # Look for the gap between footer and resizer
    footer_match = re.search(r'</footer>\s*(</div>\s*)+<div class="chat-resizer"', content, flags=re.DOTALL)
    if footer_match:
        # replace multiple </div> with just one
        new_gap = '</footer>\n  </div>\n\n  <div class="chat-resizer"'
        content = content[:footer_match.start()] + new_gap + content[footer_match.end()-22:] # -22 to skip <div class="chat-resizer"
        # wait, that's not safe. Let's do a simple replace.
        content = re.sub(r'</footer>\s*(</div>\s*)+<div class="chat-resizer"', '</footer>\n  </div>\n\n  <div class="chat-resizer"', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleanup done.")

cleanup()
