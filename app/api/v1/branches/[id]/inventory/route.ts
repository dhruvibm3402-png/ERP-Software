import { NextRequest, NextResponse } from 'next/server';
import { BranchService } from '../../../../../../services/BranchService';
import { handleApiError } from '../../../../../../utils/errorHandler';

const branchService = new BranchService();

export async function GET(req: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const skip = parseInt(searchParams.get('skip') || '0');
        const take = parseInt(searchParams.get('take') || '50');

        const result = await branchService.getInventory(id, skip, take);
        return NextResponse.json({ success: true, data: result.data, total: result.total });
    } catch (error) {
        return handleApiError(error);
    }
}
