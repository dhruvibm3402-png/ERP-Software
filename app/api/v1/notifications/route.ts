import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../services/NotificationService';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';

const notificationService = new NotificationService();

export async function GET(req: NextRequest) {
  try {
    const userId = (await prisma.user.findFirst())?.id || '';

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    const result = await notificationService.getUserNotifications(userId, {
      skip,
      take,
      unreadOnly,
      type,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = (await prisma.user.findFirst())?.id || '';
    const body = await req.json();

    await notificationService.dispatchNotification({
      userId: body.userId || userId,
      title: body.title,
      message: body.message,
      type: body.type || 'SYSTEM_ALERT',
      priority: body.priority || 'LOW',
      channels: body.channels || ['IN_APP'],
      referenceId: body.referenceId,
      referenceType: body.referenceType,
    });

    return NextResponse.json({ success: true, message: 'Notification queued successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
