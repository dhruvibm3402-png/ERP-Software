import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '../../../../../services/SettingsService';
import { handleApiError } from '../../../../../utils/errorHandler';

const settingsService = new SettingsService();

export async function POST(req: NextRequest) {
    try {
        const result = await settingsService.BackupSystem();
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return handleApiError(error);
    }
}
