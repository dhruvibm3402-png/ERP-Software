import { Prisma } from '@prisma/client';

export type JournalEntryInput = {
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
};

export class AccountingService {
  static async getOrCreateAccount(
    tx: Prisma.TransactionClient,
    code: string,
    name: string,
    type: string
  ) {
    let account = await tx.ledgerAccount.findUnique({ where: { code } });
    if (!account) {
      account = await tx.ledgerAccount.create({
        data: {
          code,
          name,
          type,
          isSystem: true,
        },
      });
    }
    return account;
  }

  static async postJournal(
    tx: Prisma.TransactionClient,
    params: {
      reference: string;
      narration: string;
      entries: JournalEntryInput[];
    }
  ) {
    // Validate Double Entry Math
    const totalDebit = params.entries
      .filter((e) => e.type === 'DEBIT')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalCredit = params.entries
      .filter((e) => e.type === 'CREDIT')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Small epsilon check for floating point precision
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(
        `Double entry validation failed. Debits (${totalDebit}) do not equal Credits (${totalCredit})`
      );
    }

    if (totalDebit <= 0) return null; // No entry needed if zero

    const entryNumber = `JRNL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const journal = await tx.journalEntry.create({
      data: {
        entryNumber,
        reference: params.reference,
        narration: params.narration,
        amount: totalDebit,
      },
    });

    for (const entry of params.entries) {
      if (entry.amount <= 0) continue;

      const account = await this.getOrCreateAccount(
        tx,
        entry.accountCode,
        entry.accountName,
        entry.accountType
      );

      await tx.journalLine.create({
        data: {
          entryId: journal.id,
          accountId: account.id,
          type: entry.type,
          amount: entry.amount,
        },
      });

      // Update Account Balance
      // Normal Balances:
      // Assets / Expenses = DEBIT increases balance
      // Liabilities, Equity, Revenue = CREDIT increases balance

      let impact = 0;
      if (['ASSET', 'EXPENSE'].includes(account.type)) {
        impact = entry.type === 'DEBIT' ? entry.amount : -entry.amount;
      } else {
        impact = entry.type === 'CREDIT' ? entry.amount : -entry.amount;
      }

      await tx.ledgerAccount.update({
        where: { id: account.id },
        data: { balance: { increment: impact } },
      });
    }

    return journal;
  }
}
