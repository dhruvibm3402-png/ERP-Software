import { NextRequest, NextResponse } from 'next/server';
import { BranchService } from '../../../../services/BranchService';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';

const branchService = new BranchService();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const skip = parseInt(searchParams.get('skip') || '0');
        const take = parseInt(searchParams.get('take') || '50');
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;

        const result = await branchService.listBranches({ skip, take, search, status });
        return NextResponse.json({ success: true, data: result.data, total: result.total });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = (await prisma.user.findFirst())?.id || '';

        const branch = await branchService.createBranch(body, userId);
        return NextResponse.json({ success: true, data: branch });
    } catch (error) {
        return handleApiError(error);
    }
}
