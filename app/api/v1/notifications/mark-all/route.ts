import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../../services/NotificationService';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

const notificationService = new NotificationService();

export async function PUT(req: NextRequest) {
  try {
    const userId = (await prisma.user.findFirst())?.id || '';
    await notificationService.markAllAsRead(userId);
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return handleApiError(error);
  }
}
