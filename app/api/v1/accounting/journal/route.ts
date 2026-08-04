import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';
import { AccountingService } from '../../../../../services/accounting.service';

const journalSchema = z.object({
  reference: z.string().optional().default(''),
  narration: z.string().min(1, 'Narration is required'),
  entries: z
    .array(
      z.object({
        accountCode: z.string(),
        accountName: z.string(),
        accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
        type: z.enum(['DEBIT', 'CREDIT']),
        amount: z.number().positive(),
      })
    )
    .min(2, 'At least 2 entries required for double entry'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = journalSchema.parse(body);

    const journal = await prisma.$transaction(async (tx) => {
      const entry = await AccountingService.postJournal(tx, data);
      if (!entry) {
        throw new Error('Failed to post journal or zero amounts');
      }
      return entry;
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const journals = await prisma.journalEntry.findMany({
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        JournalLine: { include: { LedgerAccount: true } },
      },
    });
    const total = await prisma.journalEntry.count();

    return NextResponse.json({
      data: journals,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
