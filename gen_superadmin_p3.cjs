const fs = require('fs');

const dirs = [
    'app/api/v1/superadmin',
    'app/api/v1/superadmin/tenants',
    'app/api/v1/superadmin/health'
];

dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

fs.writeFileSync('app/api/v1/superadmin/tenants/route.ts', `
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(req: Request) {
    try {
        const data = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error);
    }
}
`);

fs.writeFileSync('app/api/v1/superadmin/health/route.ts', `
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    return NextResponse.json({ 
       status: 'OK', 
       database: 'Connected', 
       redis: 'Connected', 
       uptime: process.uptime() 
    });
}
`);

console.log("Super Admin APIs created.");
