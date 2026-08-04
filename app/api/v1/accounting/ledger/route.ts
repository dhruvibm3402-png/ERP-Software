import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      const allLedgers = await prisma.ledgerAccount.findMany();
      return NextResponse.json({ data: allLedgers });
    }

    const account = await prisma.ledgerAccount.findUnique({
      where: { id: accountId },
      include: {
        JournalLine: {
          include: { JournalEntry: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    return NextResponse.json(account);
  } catch (error) {
    return handleApiError(error);
  }
}
