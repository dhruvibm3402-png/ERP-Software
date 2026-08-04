import prisma from '../../lib/prisma';

export class TenantRepository {
  async findAll() {
    return prisma.tenant.findMany({ include: { Subscription: { include: { Plan: true } } } });
  }

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: { 
          Settings: true,
          Features: true,
          Domains: true,
          Subscription: { include: { Plan: true } }
      }
    });
  }

  async createTenant(data: any) {
     return prisma.tenant.create({ data });
  }

  async updateTenant(id: string, data: any) {
     return prisma.tenant.update({ where: { id }, data });
  }
}
