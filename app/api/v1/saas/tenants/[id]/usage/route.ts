import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const usage = await prisma.tenantUsage.findMany({
            where: { tenantId: params.id }
        });
        return NextResponse.json({ data: usage });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500});
    }
}
