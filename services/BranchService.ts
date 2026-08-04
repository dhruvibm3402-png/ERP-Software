import { BranchRepository } from '../repositories/BranchRepository';
import prisma from '../lib/prisma';
import { generateUniqueId } from '../utils/generateUniqueId';

const branchRepo = new BranchRepository();

export class BranchService {
    async listBranches(query: any) {
        return await branchRepo.getBranches(query);
    }

    async getBranchInfo(id: string) {
        return await branchRepo.getBranchById(id);
    }

    async createBranch(data: any, userId: string) {
        if (!data.code) {
            data.code = `BR-${generateUniqueId().substring(0, 6).toUpperCase()}`;
        }

        if (data.isDefault) {
            await prisma.branch.updateMany({ data: { isDefault: false } });
        }

        const branch = await branchRepo.createBranch({
            code: data.code,
            name: data.name,
            location: data.location,
            status: data.status || 'ACTIVE',
            managerId: data.managerId,
            contactNumber: data.contactNumber,
            email: data.email,
            address: data.address,
            gstNumber: data.gstNumber,
            isDefault: data.isDefault || false,
        }, data.settings);

        await this.logAudit('CREATE', 'Branch', branch.id, userId, `Created branch ${branch.name}`);

        return branch;
    }

    async updateBranch(id: string, data: any, userId: string) {
        if (data.isDefault) {
            await prisma.branch.updateMany({ data: { isDefault: false } });
        }

        const branch = await branchRepo.updateBranch(id, data.branch, data.settings);
        await this.logAudit('UPDATE', 'Branch', id, userId, `Updated branch ${branch.name}`);
        return branch;
    }

    async deleteBranch(id: string, userId: string) {
        const branch = await branchRepo.deleteBranch(id);
        await this.logAudit('DELETE', 'Branch', id, userId, `Deleted branch ${branch.name}`);
        return branch;
    }

    async getInventory(branchId: string, skip: number, take: number) {
        return await branchRepo.getBranchInventory(branchId, skip, take);
    }

    async getEmployees(branchId: string, skip: number, take: number) {
        return await branchRepo.getBranchEmployees(branchId, skip, take);
    }

    async getAnalytics(branchId: string) {
        // Branch Sales
        const sales = await prisma.saleInvoice.aggregate({
            where: { branchId, status: 'PAID' },
            _sum: { grandTotal: true },
            _count: true,
        });

        // Branch Purchases
        const purchases = await prisma.purchaseOrder.aggregate({
            where: { branchId, status: { not: 'CANCELLED' } },
            _sum: { grandTotal: true }
        });

        // Active Employees
        const employeeCount = await prisma.employeeExt.count({
            where: { branchId, deletedAt: null }
        });

        // Inventory valuation (mocked as simple sum of net weight * rate, but here we just count for speed)
        // Actually we can sum `quantity` and `availableStock`
        const inventory = await prisma.inventory.aggregate({
            where: { branchId },
            _sum: { availableStock: true, grossWeight: true }
        });

        return {
            totalSales: sales._sum.grandTotal || 0,
            salesCount: sales._count || 0,
            totalPurchases: purchases._sum.grandTotal || 0,
            employeeCount,
            inventoryStock: inventory._sum.availableStock || 0,
            inventoryWeight: inventory._sum.grossWeight || 0
        };
    }

    private async logAudit(action: string, entity: string, entityId: string, userId: string, details: string) {
        await prisma.auditLog.create({
            data: { action, entity, entityId, userId, details }
        });
    }
}
