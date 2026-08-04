import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating admin user...');

    const email = 'admin@auraerp.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', admin.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
