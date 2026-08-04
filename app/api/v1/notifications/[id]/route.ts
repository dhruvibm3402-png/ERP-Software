import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../../services/NotificationService';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';

const notificationService = new NotificationService();

export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const userId = (await prisma.user.findFirst())?.id || '';
    await notificationService.markAsRead(id, userId);
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const userId = (await prisma.user.findFirst())?.id || '';
    await notificationService.deleteNotification(id, userId);
    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
