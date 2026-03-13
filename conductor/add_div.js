const fs = require('fs');

let content = fs.readFileSync('Concepts/PuppetMasterDashComp.html', 'utf8');

const targetSnippet = `                              </details>
                              
                            </div>
                          </div>
                    </div>
                    <div class="orch-rungraph-topbar-footer">`;

const replacementSnippet = `                              </details>
                              
                            </div>
                          </div>
                        </div>
                    </div>
                    <div class="orch-rungraph-topbar-footer">`;

if (content.includes(targetSnippet)) {
    content = content.replace(targetSnippet, replacementSnippet);
    fs.writeFileSync('Concepts/PuppetMasterDashComp.html', content, 'utf8');
    console.log("Added missing closing tag!");
} else {
    console.log("Could not find the snippet.");
}
