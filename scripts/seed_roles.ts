import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Permissions and Roles...');

    // Seed Permissions
    const perms = [
        { module: 'INVENTORY', action: 'READ', description: 'Can view inventory' },
        { module: 'INVENTORY', action: 'WRITE', description: 'Can add/edit inventory' },
        { module: 'SALES', action: 'READ', description: 'Can view sales' },
        { module: 'SALES', action: 'WRITE', description: 'Can invoice sales' },
        { module: 'SETTINGS', action: 'MANAGE', description: 'Can manage all settings' },
    ];

    for (const p of perms) {
        await prisma.permission.upsert({
            where: { module_action: { module: p.module, action: p.action } },
            update: {},
            create: p
        });
    }

    const allPerms = await prisma.permission.findMany();

    // Create Super Admin Role
    const superAdmin = await prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: {
            name: 'SUPER_ADMIN',
            description: 'Full system access',
            isSystem: true,
            Permissions: {
                create: allPerms.map(p => ({ permissionId: p.id }))
            }
        }
    });

    const staffPerms = allPerms.filter(p => p.module !== 'SETTINGS');
    const staff = await prisma.role.upsert({
        where: { name: 'STAFF' },
        update: {},
        create: {
            name: 'STAFF',
            description: 'Basic staff access',
            isSystem: true,
            Permissions: {
                create: staffPerms.map(p => ({ permissionId: p.id }))
            }
        }
    });

    console.log(`Created roles: ${superAdmin.name}, ${staff.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
