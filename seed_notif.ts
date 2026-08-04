import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: 'default-user-id',
                email: 'test@example.com',
                password: 'hash',
                name: 'Test User'
            }
        });
    }

    const userId = user.id;

    const existing = await prisma.notification.count({ where: { userId } });
    if (existing > 0) {
        console.log(`Already have ${existing} notifications for ${userId}.`);
        return;
    }

    const types = ['New Customer Registration', 'Invoice Generated', 'Low Stock Alert', 'Security Alert'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    console.log(`Seeding notifications for user ${userId}...`);

    for (let i = 0; i < 20; i++) {
        await prisma.notification.create({
            data: {
                userId,
                title: `Notification ${i + 1}`,
                message: `This is the body of notification ${i + 1}. Please review the details.`,
                type: types[i % types.length],
                priority: priorities[i % priorities.length],
                channels: ['IN_APP', 'EMAIL'],
                status: i < 5 ? 'READ' : 'UNREAD',
            }
        });
    }

    // also create preferences
    await prisma.notificationPreference.upsert({
        where: { userId },
        update: {},
        create: {
            userId,
            emailEnabled: true,
            smsEnabled: false,
            whatsappEnabled: true,
            inAppEnabled: true,
        }
    });

    console.log('Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
