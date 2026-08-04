import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '../../../../services/SettingsService';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';

const settingsService = new SettingsService();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const tenantId = (await prisma.user.findFirst())?.tenantId || undefined;

        if (!category) {
            return NextResponse.json({ error: 'Category query parameter is required' }, { status: 400 });
        }

        const data = await settingsService.getCategory(category, tenantId ?? undefined);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { category, data } = body;
        const user = await prisma.user.findFirst();

        if (!category || !data) {
            return NextResponse.json({ error: 'category and data required' }, { status: 400 });
        }

        const res = await settingsService.saveCategory(category, data, user?.tenantId ?? undefined, user?.id);
        return NextResponse.json({ success: true, data: res });
    } catch (error) {
        return handleApiError(error);
    }
}
