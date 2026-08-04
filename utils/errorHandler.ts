import { NextResponse } from 'next/server';
import logger from '../lib/logger';
import { ZodError } from 'zod';

export function handleApiError(error: any) {
    if (error && error.name === 'ZodError') {
        logger.warn({ msg: 'Validation Error', errors: error.errors });
        return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }

    if (error instanceof Error) {
        logger.error({ msg: error.message, stack: error.stack });

        // Distinguish between client and server errors if custom error classes used
        if (error.name === 'UnauthorizedError') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        if (error.name === 'ForbiddenError') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
    }

    logger.error({ msg: 'Internal Server Error', error });
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
}
