import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '../../../../services/SettingsService';
import { handleApiError } from '../../../../utils/errorHandler';

const settingsService = new SettingsService();

export async function GET(req: NextRequest) {
    try {
        const permissions = await settingsService.getPermissions();
        return NextResponse.json({ success: true, data: permissions });
    } catch (error) {
        return handleApiError(error);
    }
}
