import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class SettingsRepository {
  async getSettingsByCategory(category: string, tenantId?: string) {
    const where: Prisma.SystemSettingWhereInput = { category };
    if (tenantId) where.tenantId = tenantId;

    const settings = await prisma.systemSetting.findMany({ where });
    return settings.reduce(
      (acc, s) => {
        try {
          acc[s.key] = JSON.parse(s.value);
        } catch {
          acc[s.key] = s.value;
        }
        return acc;
      },
      {} as Record<string, any>
    );
  }

  async upsertSettings(category: string, data: Record<string, any>, tenantId?: string) {
    const operations = Object.entries(data).map(([key, value]) => {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: stringValue, category, tenantId },
        create: { key, value: stringValue, category, tenantId },
      });
    });
    await prisma.$transaction(operations);
    return data;
  }

  // RBAC DB operations
  async getRoles() {
    return await prisma.role.findMany({
      include: { Permissions: { include: { Permission: true } } },
    });
  }

  async createRole(name: string, description: string, permissions: string[]) {
    const role = await prisma.role.create({
      data: {
        name,
        description,
        Permissions: {
          create: permissions.map((id) => ({ permissionId: id })),
        },
      },
    });
    return role;
  }

  async getPermissions() {
    return await prisma.permission.findMany();
  }
}
