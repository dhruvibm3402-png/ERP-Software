import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import logger from '../../../../../lib/logger';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF')
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
        });

        logger.info(`New user registered: ${newUser.email}`);

        return NextResponse.json({
            message: 'Registration successful',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        }, { status: 201 });

    } catch (error) {
        return handleApiError(error);
    }
}
