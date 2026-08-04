import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../../services/NotificationService';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

const notificationService = new NotificationService();

export async function GET(req: NextRequest) {
  try {
    const userId = (await prisma.user.findFirst())?.id || '';
    const preferences = await notificationService.getPreferences(userId);
    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = (await prisma.user.findFirst())?.id || '';
    const body = await req.json();
    const preferences = await notificationService.updatePreferences(userId, body);
    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    return handleApiError(error);
  }
}
