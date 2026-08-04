import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req: Request) {
    try {
        const suppliers = await (prisma as any).supplier.findMany({ orderBy: { name: 'asc' } });
        return NextResponse.json(suppliers);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const supplier = await (prisma as any).supplier.create({ data: body });
        return NextResponse.json(supplier);
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
