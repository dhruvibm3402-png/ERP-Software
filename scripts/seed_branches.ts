import { PrismaClient } from '@prisma/client';
import { generateUniqueId } from '../utils/generateUniqueId';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding branches...');
    const b1 = await prisma.branch.upsert({
        where: { name: 'Main HQ Branch' },
        update: {},
        create: {
            code: 'HQ-001',
            name: 'Main HQ Branch',
            location: 'Mumbai Central',
            contactNumber: '+91-9876543210',
            address: '123 Jewelry Lane, Mumbai',
            status: 'ACTIVE',
            isDefault: true,
            BranchSettings: {
                create: {
                    openTime: '10:00',
                    closeTime: '20:00'
                }
            }
        }
    });

    const b2 = await prisma.branch.upsert({
        where: { name: 'Delhi South Ex' },
        update: {},
        create: {
            code: 'DL-002',
            name: 'Delhi South Ex',
            location: 'New Delhi',
            contactNumber: '+91-8765432109',
            address: '45 South Ex Market, Delhi',
            status: 'ACTIVE',
            BranchSettings: {
                create: {
                    openTime: '10:30',
                    closeTime: '21:00'
                }
            }
        }
    });

    console.log(`Created branches: ${b1.name} and ${b2.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
