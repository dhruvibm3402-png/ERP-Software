import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET() {
    try {
        const tenants = await prisma.tenant.findMany({
            include: { Subscription: true }
        });
        return NextResponse.json({ data: tenants });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const tenant = await prisma.tenant.create({
            data: {
                name: body.name,
                subdomain: body.subdomain,
            }
        });
        return NextResponse.json({ data: tenant });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
