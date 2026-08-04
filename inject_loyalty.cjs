const fs = require('fs');

let c = fs.readFileSync('app/page.tsx', 'utf8');
if (!c.includes('import Loyalty')) {
    c = c.replace(/import Help from '..\/src\/components\/Help';/, "import Help from '../src/components/Help';\nimport Loyalty from '../src/components/Loyalty';\nimport { Award } from 'lucide-react';");
}
if (!c.includes("id: 'loyalty'")) {
    c = c.replace(/{ name: 'Reports', icon: FileBarChart, id: 'reports' },/, "{ name: 'Reports', icon: FileBarChart, id: 'reports' },\n  { name: 'Loyalty Program', icon: Award, id: 'loyalty' },");
}
if (!c.includes("case 'loyalty':")) {
    c = c.replace(/case 'reports':\s*return <Reports \/>;/, "case 'reports':\n          return <Reports />;\n        case 'loyalty':\n          return <Loyalty />;\n");
}
fs.writeFileSync('app/page.tsx', c);
console.log('Injected Loyalty into app/page.tsx');
