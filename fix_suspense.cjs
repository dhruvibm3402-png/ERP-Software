const fs = require('fs');
let c = fs.readFileSync('app/superadmin/page.tsx', 'utf8');

c = c.replace('export default function SuperAdminPage() {', 'function SuperAdminDashboardContent() {');
c += `
import { Suspense } from 'react';

export default function SuperAdminPage() {
    return (
        <Suspense fallback={<div className="p-8 text-gray-500">Loading Console...</div>}>
            <SuperAdminDashboardContent />
        </Suspense>
    );
}
`;

fs.writeFileSync('app/superadmin/page.tsx', c);
console.log('Fixed suspense');
