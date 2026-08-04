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
