const fs = require('fs');
let content = fs.readFileSync('src/components/Reports.tsx', 'utf8');

// Using regex to fix the unmatched tags

let fixed = content.replace(/<\/div>\s*\}\s*\)\s*\}\s*\{\/\* Other Tabs Template View \*\/ \}\s*\{\s*activeTab !== 'dashboard' && \(/, `            </div>
          </div>
        )}

        {/* Other Tabs Template View */}
        {activeTab !== 'dashboard' && (`);

fixed = fixed.replace(/<\/\s*div\s*>\s*\)\s*\}\s*<\/\s*div\s*>\s*<\/\s*div\s*>\s*\);\s*\}/, `          </div>
        )}

      </div>
    </div>
  );
}`);

fs.writeFileSync('src/components/Reports.tsx', fixed);
console.log('Done!');
