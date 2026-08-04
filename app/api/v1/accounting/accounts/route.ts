import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    return handleApiError(error);
  }
}
