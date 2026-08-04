import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const report = searchParams.get('report') || 'trial-balance';

    const accounts = await prisma.ledgerAccount.findMany();

    if (report === 'trial-balance') {
      const debits = accounts
        .filter((a) => ['ASSET', 'EXPENSE'].includes(a.type))
        .reduce((acc, curr) => acc + curr.balance, 0);
      const credits = accounts
        .filter((a) => ['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type))
        .reduce((acc, curr) => acc + curr.balance, 0);

      return NextResponse.json({
        accounts,
        totals: { debits, credits },
      });
    }

    if (report === 'pnl') {
      const incomes = accounts.filter((a) => a.type === 'REVENUE');
      const expenses = accounts.filter((a) => a.type === 'EXPENSE');

      const totalIncome = incomes.reduce((acc, curr) => acc + curr.balance, 0);
      const totalExpense = expenses.reduce((acc, curr) => acc + curr.balance, 0);
      const netProfit = totalIncome - totalExpense;

      return NextResponse.json({
        incomes,
        expenses,
        totalIncome,
        totalExpense,
        netProfit,
      });
    }

    if (report === 'balance-sheet') {
      const assets = accounts.filter((a) => a.type === 'ASSET');
      const liabilities = accounts.filter((a) => a.type === 'LIABILITY');
      const equity = accounts.filter((a) => a.type === 'EQUITY');

      // Include retained earnings loosely for demo
      const incomes = accounts
        .filter((a) => a.type === 'REVENUE')
        .reduce((acc, curr) => acc + curr.balance, 0);
      const expenses = accounts
        .filter((a) => a.type === 'EXPENSE')
        .reduce((acc, curr) => acc + curr.balance, 0);
      const netProfit = incomes - expenses;

      const totalAssets = assets.reduce((acc, curr) => acc + curr.balance, 0);
      const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.balance, 0);
      const totalEquity = equity.reduce((acc, curr) => acc + curr.balance, 0) + netProfit;

      return NextResponse.json({
        assets,
        liabilities,
        equity,
        netProfit,
        totalAssets,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      });
    }

    return NextResponse.json({ message: 'Unknown report type' }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
