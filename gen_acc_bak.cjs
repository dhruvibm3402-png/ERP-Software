const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const repoContent = `
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
      monthlyRevenue: [ { month: 'Jan', value: inc }, { month: 'Feb', value: 0 } ],
      monthlyExpense: [ { month: 'Jan', value: exp }, { month: 'Feb', value: 0 } ]
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
    return prisma.cashBook.create({ data: { ...data, balance } });
  }

  async addBank(data: any) {
    const last = await prisma.bankBook.findFirst({ orderBy: { createdAt: 'desc' } });
    let balance = last?.balance || 0;
    balance = data.type === 'DEPOSIT' ? balance + data.amount : balance - data.amount;
    return prisma.bankBook.create({ data: { ...data, balance } });
  }

  async addExpense(data: any) { return prisma.expense.create({ data }); }
  async addIncome(data: any) { return prisma.income.create({ data }); }
}
`;

const serviceContent = `
import { AccountingRepository } from '../repositories/AccountingRepository';

const repo = new AccountingRepository();

export class AccountingService {
  async getDashboard() { return repo.getDashboardStats(); }
  async getCashBook() { return repo.getCashBook(); }
  async getBankBook() { return repo.getBankBook(); }
  async getExpenses() { return repo.getExpenses(); }
  async getIncomes() { return repo.getIncomes(); }

  async addCash(data: any) { return repo.addCash(data); }
  async addBank(data: any) { return repo.addBank(data); }
  async addExpense(data: any) { return repo.addExpense(data); }
  async addIncome(data: any) { return repo.addIncome(data); }
}
`;

const apiDashboard = `
import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();

export async function GET() {
  try {
    const data = await svc.getDashboard();
    return NextResponse.json({ data });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
`;

const apiCash = `
import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();
export async function GET() { return NextResponse.json({ data: await svc.getCashBook() }); }
export async function POST(req: Request) { return NextResponse.json({ data: await svc.addCash(await req.json()) }); }
`;

const apiBank = `
import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();
export async function GET() { return NextResponse.json({ data: await svc.getBankBook() }); }
export async function POST(req: Request) { return NextResponse.json({ data: await svc.addBank(await req.json()) }); }
`;

const apiExpenses = `
import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();
export async function GET() { return NextResponse.json({ data: await svc.getExpenses() }); }
export async function POST(req: Request) { return NextResponse.json({ data: await svc.addExpense(await req.json()) }); }
`;

const apiIncomes = `
import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();
export async function GET() { return NextResponse.json({ data: await svc.getIncomes() }); }
export async function POST(req: Request) { return NextResponse.json({ data: await svc.addIncome(await req.json()) }); }
`;

write('repositories/AccountingRepository.ts', repoContent);
write('services/AccountingService.ts', serviceContent);
write('app/api/v1/accounting/dashboard/route.ts', apiDashboard);
write('app/api/v1/accounting/cash/route.ts', apiCash);
write('app/api/v1/accounting/bank/route.ts', apiBank);
write('app/api/v1/accounting/expenses/route.ts', apiExpenses);
write('app/api/v1/accounting/incomes/route.ts', apiIncomes);

console.log('Accounting backend ready.');
