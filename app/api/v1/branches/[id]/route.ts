import { NextRequest, NextResponse } from 'next/server';
import { BranchService } from '../../../../../services/BranchService';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

const branchService = new BranchService();

export async function GET(req: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const branch = await branchService.getBranchInfo(id);
        if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: branch });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(req: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const body = await req.json();
        const userId = (await prisma.user.findFirst())?.id || '';

        const branch = await branchService.updateBranch(id, body, userId);
        return NextResponse.json({ success: true, data: branch });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(req: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const userId = (await prisma.user.findFirst())?.id || '';
        await branchService.deleteBranch(id, userId);
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
