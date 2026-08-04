const fs = require('fs');
let content = fs.readFileSync('src/components/Reports.tsx', 'utf8');

const target = `
    </div>
  )
}

{/* Other Tabs Template View */ }
{
  activeTab !== 'dashboard' && (
`;

const replacement = `
            </div>

          </div>
        )}

        {/* Other Tabs Template View */}
        {activeTab !== 'dashboard' && (
`;

content = content.replace(target.trim(), replacement.trim());

// also fix the weird ending
const endTarget = `
  )
}

      </div >
    </div >
  );
}
`;

const endReplacement = `
        )}

      </div>
    </div>
  );
}
`;

content = content.replace(endTarget.trim(), endReplacement.trim());

fs.writeFileSync('src/components/Reports.tsx', content);
console.log('Fixed file');
