import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET() {
    try {
        const jobs = await prisma.manufacturingJob.findMany({
            include: { karigar: true, materials: true, Product: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, jobs });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const job = await prisma.manufacturingJob.create({
            data: {
                ...data,
                jobNumber: 'JOB-' + Math.floor(Math.random() * 100000)
            },
            include: { karigar: true, materials: true }
        });
        return NextResponse.json({ success: true, job });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
