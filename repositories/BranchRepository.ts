import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class BranchRepository {
    async getBranches(query: { skip?: number; take?: number; search?: string; status?: string }) {
        const where: Prisma.BranchWhereInput = { deletedAt: null };

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
                { location: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.status) {
            where.status = query.status;
        }

        const [data, total] = await Promise.all([
            prisma.branch.findMany({
                where,
                skip: query.skip,
                take: query.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.branch.count({ where }),
        ]);

        return { data, total };
    }

    async getBranchById(id: string) {
        return await prisma.branch.findUnique({
            where: { id },
            include: {
                BranchSettings: true,
            }
        });
    }

    async createBranch(data: Prisma.BranchUncheckedCreateInput, settings?: Prisma.BranchSettingsUncheckedCreateWithoutBranchInput) {
        return await prisma.branch.create({
            data: {
                ...data,
                BranchSettings: {
                    create: settings || {}
                }
            }
        });
    }

    async updateBranch(id: string, data: Prisma.BranchUncheckedUpdateInput, settings?: Prisma.BranchSettingsUncheckedUpdateWithoutBranchInput) {
        return await prisma.branch.update({
            where: { id },
            data: {
                ...data,
                ...(settings ? {
                    BranchSettings: {
                        upsert: {
                            create: settings as any,
                            update: settings
                        }
                    }
                } : {})
            }
        });
    }

    async deleteBranch(id: string) {
        return await prisma.branch.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' }
        });
    }

    // Related Modules
    async getBranchInventory(branchId: string, skip = 0, take = 50) {
        const [data, total] = await Promise.all([
            prisma.inventory.findMany({
                where: { branchId },
                include: { Product: true },
                skip,
                take,
                orderBy: { lastUpdated: 'desc' },
            }),
            prisma.inventory.count({ where: { branchId } })
        ]);
        return { data, total };
    }

    async getBranchEmployees(branchId: string, skip = 0, take = 50) {
        const [data, total] = await Promise.all([
            prisma.employeeExt.findMany({
                where: { branchId, deletedAt: null },
                include: { Employee: true, Designation: true },
                skip,
                take,
            }),
            prisma.employeeExt.count({ where: { branchId, deletedAt: null } })
        ]);
        return { data, total };
    }
}
