import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class NotificationRepository {
  async create(data: Prisma.NotificationUncheckedCreateInput) {
    return await prisma.notification.create({ data });
  }

  async findMany(
    userId: string,
    query: { skip?: number; take?: number; unreadOnly?: boolean; type?: string }
  ) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      isDeleted: false,
    };

    if (query.unreadOnly) {
      where.status = 'UNREAD';
    }
    if (query.type) {
      where.type = query.type;
    }

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data,
      total,
      unreadCount: await prisma.notification.count({
        where: { userId, isDeleted: false, status: 'UNREAD' },
      }),
    };
  }

  async markAsRead(id: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { isDeleted: true },
    });
  }

  async getPreferences(userId: string) {
    return await prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async upsertPreferences(userId: string, data: Partial<Prisma.NotificationPreferenceUpdateInput>) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...(data as any),
      },
    });
  }
}
