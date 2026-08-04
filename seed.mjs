import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    const mockCustomers = Array.from({ length: 12 }).map((_, i) => ({
        customerId: `CUS-${1000 + i}`,
        name: ['Aarav Patel', 'Priya Sharma', 'Rahul Desai', 'Kavita Iyer', 'Vikram Singh', 'Neill B'][i % 6],
        mobile: `+91 98765 ${43210 + i}`,
        email: `customer${i}@example.com`,
        tier: ['Gold', 'Platinum', 'Silver', 'Gold', 'Silver', 'Silver'][i % 6],
        loyaltyPoints: Math.floor(Math.random() * 5000),
        outstandingBalance: Math.floor(Math.random() * 20000),
        totalSpent: 50000 + i * 15000,
        address: '123 Test Street, Mumbai, India',
        notes: 'Mock data generated from seed file.',
    }));

    for (const data of mockCustomers) {
        // Upsert so if we run it multiple times it won't crash
        await prisma.customer.upsert({
            where: { customerId: data.customerId },
            update: {},
            create: data,
        });
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
