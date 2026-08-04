import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
import { z } from 'zod';
import { AccountingService } from '../../../../../services/accounting.service';

const incomeSchema = z.object({
  category: z.string().min(1, 'Income category is required'),
  amount: z.number().positive(),
  paymentMode: z.string().default('CASH'), // CASH, BANK, UPI
  reference: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required'),
  gstAmount: z.number().default(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = incomeSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // Log income in abstract AccountingEntry table
      const entry = await tx.accountingEntry.create({
        data: {
          type: 'INCOME',
          category: data.category,
          amount: data.amount,
          description: data.description,
          referenceId: data.reference,
        },
      });

      const assetAccountCode = data.paymentMode === 'CASH' ? 'CASH-01' : 'BANK-01';
      const assetAccountName = data.paymentMode === 'CASH' ? 'Cash in Hand' : 'Main Bank Account';

      // Post to Journal
      // Asset increases (DEBIT), Revenue increases (CREDIT)
      const journalEntries = [
        {
          accountCode: assetAccountCode,
          accountName: assetAccountName,
          accountType: 'ASSET' as const,
          type: 'DEBIT' as const,
          amount: data.amount,
        },
        {
          accountCode: `INC-${data.category.toUpperCase().replace(/\s+/g, '-')}`,
          accountName: `${data.category} Income`,
          accountType: 'REVENUE' as const,
          type: 'CREDIT' as const,
          amount: data.amount - data.gstAmount,
        },
      ];

      if (data.gstAmount > 0) {
        journalEntries.push({
          accountCode: 'GST-OUTPUT',
          accountName: 'Output GST',
          accountType: 'LIABILITY' as const,
          type: 'CREDIT' as const,
          amount: data.gstAmount,
        } as any);
      }

      await AccountingService.postJournal(tx, {
        reference: entry.id,
        narration: data.description,
        entries: journalEntries,
      });

      return entry;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
