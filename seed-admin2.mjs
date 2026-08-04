import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = [
        { email: 'admin@auraerp.com',   password: 'admin123', name: 'Admin User',    role: 'ADMIN'   },
        { email: 'admin123@gmail.com',   password: 'admin123', name: 'Admin',         role: 'ADMIN'   },
        { email: 'manager@auraerp.com',  password: 'manager123', name: 'Manager',     role: 'MANAGER' },
        { email: 'staff@auraerp.com',    password: 'staff123',   name: 'Staff User',  role: 'STAFF'   },
    ];

    for (const u of users) {
        const hash = await bcrypt.hash(u.password, 10);
        await prisma.user.upsert({
            where: { email: u.email },
            update: { password: hash, name: u.name, role: u.role },
            create: { email: u.email, password: hash, name: u.name, role: u.role },
        });
        console.log(`✅  ${u.role.padEnd(8)} → ${u.email}  /  ${u.password}`);
    }
    console.log('\nAll users seeded successfully!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
