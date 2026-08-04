import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { env } from 'process';

const prisma = new PrismaClient();

const redisOptions = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: parseInt(env.REDIS_PORT || '6379'),
};

console.log('Starting Notification Queue Worker...');

const worker = new Worker(
  'notifications',
  async (job) => {
    const data = job.data;
    console.log(`Processing job ${job.id}: ${data.type}`);

    // Simulate updating the NotificationQueue record
    if (data.queueId) {
      await prisma.notificationQueue.update({
        where: { id: data.queueId },
        data: { status: 'PROCESSING' },
      });
    }

    try {
      // Here you would implement integration with real providers
      // e.g., Resend/SendGrid for email, Twilio for SMS, Meta Cloud API for WhatsApp.

      const channels = data.channels || [];

      for (const channel of channels) {
        if (channel === 'IN_APP') continue;

        console.log(`Sending ${channel} notification to user...`);
        // await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
        // ... API calls based on channel ...

        // Log output to our global `NotificationLog` table (distinct from Queue)
        await prisma.notificationLog.create({
          data: {
            type: data.type,
            channel: channel,
            message: `[${data.priority || 'LOW'}] ${data.title} - ${data.message}`,
            status: 'SENT',
          },
        });
      }

      if (data.queueId) {
        await prisma.notificationQueue.update({
          where: { id: data.queueId },
          data: { status: 'COMPLETED' },
        });
      }

      console.log(`Job ${job.id} completed successfully`);
    } catch (err: any) {
      console.error(`Job ${job.id} failed:`, err);

      if (data.queueId) {
        const queueEntry = await prisma.notificationQueue.findUnique({
          where: { id: data.queueId },
        });
        if (queueEntry) {
          const newRetry = queueEntry.retryCount + 1;
          const status = newRetry >= queueEntry.maxRetries ? 'FAILED' : 'PENDING';

          await prisma.notificationQueue.update({
            where: { id: data.queueId },
            data: {
              status,
              retryCount: newRetry,
              error: err.message,
              // Next run could be exponentially backed off
              nextRunAt: new Date(Date.now() + 1000 * 60 * Math.pow(2, newRetry)),
            },
          });
        }
      }
      throw err;
    }
  },
  { connection: redisOptions }
);

worker.on('failed', (job, err) => {
  console.error(`[BullMQ] Job ${job?.id} failed with ${err.message}`);
});

process.on('SIGINT', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
