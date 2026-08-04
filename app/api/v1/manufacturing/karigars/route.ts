import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET() {
    try {
        const karigars = await prisma.karigar.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ success: true, karigars });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const karigar = await prisma.karigar.create({
            data: { ...data, karigarId: 'KAR-' + Math.floor(Math.random() * 100000) }
        });
        return NextResponse.json({ success: true, karigar });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
