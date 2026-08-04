import { ReportRepository } from '../repositories/ReportRepository';

const repo = new ReportRepository();

export class ReportService {
  async getDashboard() { return repo.getDashboardKPIs(); }
}
