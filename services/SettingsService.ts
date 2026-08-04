import { SettingsRepository } from '../repositories/SettingsRepository';
import prisma from '../lib/prisma';

const repo = new SettingsRepository();

export class SettingsService {
  async getCategory(category: string, tenantId?: string) {
    return await repo.getSettingsByCategory(category, tenantId);
  }

  async saveCategory(category: string, data: any, tenantId?: string, userId?: string) {
    const res = await repo.upsertSettings(category, data, tenantId);
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'SystemSetting',
          entityId: category,
          userId,
          details: `Updated settings for category ${category}`,
        },
      });
    }
    return res;
  }

  async BackupSystem() {
    // Mock process for DB backup scheduling
    return { success: true, timestamp: new Date(), file: 'backup-v1.sql.gz' };
  }

  async TestSMTP(config: any) {
    // Mock Test SMTP connection logic
    return { success: true, message: 'SMTP Connection Successful' };
  }

  // Role Logic
  async getRoles() {
    return await repo.getRoles();
  }
  async getPermissions() {
    return await repo.getPermissions();
  }
}
