const fs = require('fs');

let html = fs.readFileSync('Concepts/PuppetMasterDashComp.html', 'utf8');

const targetStr = `                    </div>
                  </div>
                </div>
              </div>
                    <span class="status-badge">Idle</span>`;

if (html.includes(targetStr)) {
    console.log("Found the broken block!");
} else {
    console.log("Could not find the exact string match for the start of the broken block.");
}
