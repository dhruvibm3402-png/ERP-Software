const { PrismaClient } = require from ('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const plan1 = await prisma.subscriptionPlan.create({
        data: {
            name: 'Basic',
            priceMonthly: 49,
            priceYearly: 490,
            userLimit: 5,
            branchLimit: 1,
            features: JSON.stringify(['POS', 'INVENTORY']),
        }
    });

    const tenant1 = await prisma.tenant.create({
        data: {
            name: 'Acme Jewellers',
            subdomain: 'acme',
            Subscription: {
                create: { planId: plan1.id, status: 'ACTIVE' }
            }
        }
    });

    console.log('Seeded tenant:', tenant1);
}

main().catch(console.error).finally(() => prisma.$disconnect());
