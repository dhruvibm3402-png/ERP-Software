const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log('Seeding departments...');
    const sales = await prisma.department.upsert({
        where: { code: 'DEP-001' },
        update: {},
        create: {
            code: 'DEP-001',
            name: 'Sales',
            description: 'Retail Sales Department'
        }
    });

    const mfg = await prisma.department.upsert({
        where: { code: 'DEP-002' },
        update: {},
        create: {
            code: 'DEP-002',
            name: 'Manufacturing',
            description: 'Jewellery Workshops'
        }
    });

    console.log('Seeding designations...');
    await prisma.designation.upsert({
        where: { code: 'DES-001' },
        update: {},
        create: {
            code: 'DES-001',
            title: 'Sales Executive',
            departmentId: sales.id
        }
    });

    await prisma.designation.upsert({
        where: { code: 'DES-002' },
        update: {},
        create: {
            code: 'DES-002',
            title: 'Senior Goldsmith',
            departmentId: mfg.id
        }
    });

    console.log('Seed completed successfully!');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
