import { NextRequest, NextResponse } from 'next/server';
import { BranchService } from '../../../../../../services/BranchService';
import { handleApiError } from '../../../../../../utils/errorHandler';

const branchService = new BranchService();

export async function GET(req: NextRequest, { params }: any) {
    try {
        const { id } = await params;
        const analytics = await branchService.getAnalytics(id);
        return NextResponse.json({ success: true, data: analytics });
    } catch (error) {
        return handleApiError(error);
    }
}
