import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class EmployeeRepository {
  async findAll({ skip, take, where, orderBy }: { skip?: number; take?: number; where?: Prisma.EmployeeWhereInput; orderBy?: Prisma.EmployeeOrderByWithRelationInput }) {
    return prisma.employee.findMany({
      skip, take, where, orderBy,
      include: {
        EmployeeExt: { include: { Department: true, Designation: true } },
      }
    });
  }
  async count(where?: Prisma.EmployeeWhereInput) {
    return prisma.employee.count({ where });
  }
  async findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        EmployeeExt: { include: { Department: true, Designation: true } },
        EmployeeSalary: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
        EmployeeDocument: true
      }
    });
  }
  async create(data: Prisma.EmployeeCreateInput) {
    return prisma.employee.create({
      data,
      include: { EmployeeExt: true, EmployeeSalary: true }
    });
  }
  async update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({
      where: { id },
      data,
      include: { EmployeeExt: true, EmployeeSalary: true }
    });
  }
  async softDelete(id: string) {
    return prisma.employee.update({
      where: { id },
      data: { isActive: false, EmployeeExt: { update: { deletedAt: new Date() } } }
    });
  }
}
