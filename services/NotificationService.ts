import { NotificationRepository } from '../repositories/NotificationRepository';
import prisma from '../lib/prisma';
import { Queue } from 'bullmq';
import { env } from 'process';

const notificationRepo = new NotificationRepository();

// Optional: Configure BullMQ Queue if REDIS_URL is available
const redisOptions = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: parseInt(env.REDIS_PORT || '6379'),
};
export const notificationQueue = new Queue('notifications', { connection: redisOptions });

export class NotificationService {
  async getUserNotifications(
    userId: string,
    query: { skip?: number; take?: number; unreadOnly?: boolean; type?: string }
  ) {
    return notificationRepo.findMany(userId, query);
  }

  async markAsRead(id: string, userId: string) {
    return notificationRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepo.markAllAsRead(userId);
  }

  async deleteNotification(id: string, userId: string) {
    return notificationRepo.delete(id, userId);
  }

  async getPreferences(userId: string) {
    let prefs = await notificationRepo.getPreferences(userId);
    if (!prefs) {
      prefs = await notificationRepo.upsertPreferences(userId, {
        emailEnabled: true,
        smsEnabled: true,
        whatsappEnabled: false,
        inAppEnabled: true,
      });
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: any) {
    return notificationRepo.upsertPreferences(userId, data);
  }

  /**
   * Helper to dispatch a notification via the unified background queue
   */
  async dispatchNotification(payload: {
    userId?: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
    channels?: string[];
    referenceId?: string;
    referenceType?: string;
  }) {
    const {
      userId,
      title,
      message,
      type,
      priority = 'LOW',
      channels = ['IN_APP'],
      referenceId,
      referenceType,
    } = payload;

    // 1. If IN_APP, create directly in DB so it's instantly available on the bell
    if (channels.includes('IN_APP') && userId) {
      await notificationRepo.create({
        userId,
        title,
        message,
        type,
        priority,
        channels: channels,
        referenceId,
        referenceType,
      });
    }

    // 2. Queue for background processing (Email, SMS, WhatsApp)
    const asyncChannels = channels.filter((c) => c !== 'IN_APP');
    if (asyncChannels.length > 0) {
      const queueEntry = await prisma.notificationQueue.create({
        data: {
          type,
          payload: JSON.stringify(payload),
          status: 'PENDING',
        },
      });

      try {
        await notificationQueue.add(
          'send-notification',
          {
            queueId: queueEntry.id,
            ...payload,
          },
          { removeOnComplete: true }
        );
      } catch (err) {
        console.error('Failed to add to BullMQ, check Redis connection', err);
      }
    }

    return { success: true };
  }
}
