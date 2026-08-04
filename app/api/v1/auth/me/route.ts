import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { verifyAccessToken } from '../../../../../utils/jwt';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        return handleApiError(error);
    }
}
