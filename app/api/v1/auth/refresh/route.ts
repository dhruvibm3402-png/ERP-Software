import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import { verifyRefreshToken, generateAccessToken } from '../../../../../utils/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ message: 'Refresh token missing' }, { status: 401 });
        }

        const payload = verifyRefreshToken(refreshToken);
        const newAccessToken = generateAccessToken({ userId: payload.userId, role: payload.role });

        return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
    } catch (error) {
        return handleApiError(error);
    }
}
