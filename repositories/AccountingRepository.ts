import prisma from '../lib/prisma';

export class AccountingRepository {
  async getDashboardStats() {
    const expenses = await prisma.expense.aggregate({ _sum: { amount: true } });
    const incomes = await prisma.income.aggregate({ _sum: { amount: true } });

    // Fallback to ledger if needed
    const inc = incomes._sum.amount || 0;
    const exp = expenses._sum.amount || 0;

    return {
      totalRevenue: inc,
      totalExpenses: exp,
      netProfit: inc - exp,
      cashBalance: (await prisma.cashBook.findFirst({ orderBy: { createdAt: 'desc' } }))?.balance || 0,
      bankBalance: (await prisma.bankBook.findFirst({ orderBy: { createdAt: 'desc' } }))?.balance || 0,
      monthlyRevenue: [{ month: 'Jan', value: inc }, { month: 'Feb', value: 0 }],
      monthlyExpense: [{ month: 'Jan', value: exp }, { month: 'Feb', value: 0 }]
    };
  }

  async getCashBook() { return prisma.cashBook.findMany({ orderBy: { date: 'desc' } }); }
  async getBankBook() { return prisma.bankBook.findMany({ orderBy: { date: 'desc' } }); }
  async getExpenses() { return prisma.expense.findMany({ orderBy: { date: 'desc' } }); }
  async getIncomes() { return prisma.income.findMany({ orderBy: { date: 'desc' } }); }

  async addCash(data: any) {
    const last = await prisma.cashBook.findFirst({ orderBy: { createdAt: 'desc' } });
    let balance = last?.balance || 0;
    balance = data.type === 'IN' ? balance + data.amount : balance - data.amount;
    return prisma.cashBook.create({
      data: {
        description: data.description,
        type: data.type,
        amount: data.amount,
        balance
      }
    });
  }

  async addBank(data: any) {
    const last = await prisma.bankBook.findFirst({ orderBy: { createdAt: 'desc' } });
    let balance = last?.balance || 0;
    balance = data.type === 'DEPOSIT' ? balance + data.amount : balance - data.amount;
    return prisma.bankBook.create({
      data: {
        description: data.description,
        type: data.type,
        amount: data.amount,
        balance
      }
    });
  }

  async addExpense(data: any) {
    return prisma.expense.create({
      data: {
        title: data.title,
        category: data.category,
        amount: data.amount,
        status: data.status || 'PENDING'
      }
    });
  }

  async addIncome(data: any) {
    return prisma.income.create({
      data: {
        title: data.title,
        category: data.category,
        amount: data.amount
      }
    });
  }
}
