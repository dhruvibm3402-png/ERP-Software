import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany();
        return NextResponse.json({ data: plans });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
