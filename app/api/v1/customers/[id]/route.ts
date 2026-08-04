import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const updateCustomerSchema = z.object({
    name: z.string().min(2, 'Name is required').optional(),
    mobile: z.string().min(10, 'Valid mobile is required').optional(),
    email: z.string().email().optional().or(z.literal('')).nullable(),
    address: z.string().optional().nullable(),
    gstNumber: z.string().optional().nullable(),
    aadhaar: z.string().optional().nullable(),
    pan: z.string().optional().nullable(),
    birthday: z.string().optional().nullable(),
    anniversary: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const include = searchParams.get('include') || '';

        const customer = await prisma.customer.findFirst({
            where: { id, isDeleted: false },
        });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        // When full history is requested, fetch all related data in parallel
        if (include === 'full') {
            const [
                sales,
                repairs,
                goldExchanges,
                auditLogs,
            ] = await Promise.all([
                // Purchase / sale history
                prisma.saleInvoice.findMany({
                    where: { customerId: id },
                    include: {
                        SaleItem: {
                            include: {
                                Product: { select: { id: true, name: true, sku: true, category: true, metal: true, purity: true } },
                            },
                        },
                        SalePayment: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                }),
                // Repair history
                (prisma as any).repairJob.findMany({
                    where: { customerId: id },
                    include: {
                        Employee: { select: { id: true, name: true, role: true } },
                        RepairImage: { select: { id: true, imageType: true, caption: true, uploadedAt: true } },
                        RepairHistory: { orderBy: { createdAt: 'asc' } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                }),
                // Gold exchange history
                prisma.goldExchange.findMany({
                    where: { customerId: id },
                    include: {
                        GoldExchangeItem: true,
                        ExchangePayment: true,
                        SaleInvoice: { select: { id: true, invoiceNumber: true, grandTotal: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                }),
                // Activity / audit trail for this customer
                prisma.auditLog.findMany({
                    where: { entity: 'Customer', entityId: id },
                    orderBy: { createdAt: 'desc' },
                    take: 100,
                }),
            ]);

            // Payment history — flatten from all sale invoices
            const payments = sales.flatMap(inv =>
                inv.SalePayment.map(p => ({
                    ...p,
                    invoiceNumber: inv.invoiceNumber,
                    invoiceDate: inv.createdAt,
                    invoiceTotal: inv.grandTotal,
                }))
            ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Notes — derived from customer.notes field + any audit entries
            const activityTimeline = [
                ...auditLogs.map(l => ({
                    id: l.id,
                    type: 'AUDIT',
                    action: l.action,
                    entity: l.entity,
                    details: l.details,
                    createdAt: l.createdAt,
                })),
                ...sales.map(s => ({
                    id: s.id,
                    type: 'SALE',
                    action: 'Sale Invoice',
                    entity: 'SaleInvoice',
                    details: `Invoice ${s.invoiceNumber} — ₹${s.grandTotal.toLocaleString('en-IN')}`,
                    createdAt: s.createdAt,
                })),
                ...repairs.map(r => ({
                    id: r.id,
                    type: 'REPAIR',
                    action: 'Repair Job',
                    entity: 'RepairJob',
                    details: `${r.jobNumber} — ${r.productType} (${r.status})`,
                    createdAt: r.createdAt,
                })),
                ...goldExchanges.map(g => ({
                    id: g.id,
                    type: 'GOLD_EXCHANGE',
                    action: 'Gold Exchange',
                    entity: 'GoldExchange',
                    details: `${g.exchangeNumber} — ${g.status}${g.totalExchangeValue ? ` — ₹${g.totalExchangeValue.toLocaleString('en-IN')}` : ''}`,
                    createdAt: g.createdAt,
                })),
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Aggregate stats
            const stats = {
                totalSales: sales.length,
                totalSaleValue: sales.reduce((s, i) => s + i.grandTotal, 0),
                totalRepairs: repairs.length,
                totalGoldExchanges: goldExchanges.length,
                totalGoldExchangeValue: goldExchanges.reduce((s, g) => s + (g.totalExchangeValue ?? 0), 0),
                totalPayments: payments.reduce((s, p) => s + p.amount, 0),
            };

            return NextResponse.json({
                ...customer,
                stats,
                sales,
                repairs,
                goldExchanges,
                payments,
                activityTimeline,
            });
        }

        return NextResponse.json(customer);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = updateCustomerSchema.parse(body);

        const customer = await prisma.$transaction(async (tx) => {
            const existing = await tx.customer.findFirst({ where: { id, isDeleted: false } });
            if (!existing) throw new Error('NOT_FOUND');

            const updateData: any = { ...data };
            if (data.birthday !== undefined) updateData.birthday = data.birthday ? new Date(data.birthday) : null;
            if (data.anniversary !== undefined) updateData.anniversary = data.anniversary ? new Date(data.anniversary) : null;

            const updated = await tx.customer.update({
                where: { id },
                data: updateData,
            });

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'Customer',
                    entityId: id,
                    details: `Customer ${updated.name} updated.`,
                }
            });

            return updated;
        });

        return NextResponse.json(customer);
    } catch (error: any) {
        if (error.message === 'NOT_FOUND') {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const { id } = await context.params;

        await prisma.$transaction(async (tx) => {
            const existing = await tx.customer.findFirst({ where: { id, isDeleted: false } });
            if (!existing) throw new Error('NOT_FOUND');

            await tx.customer.update({
                where: { id },
                data: { isDeleted: true },
            });

            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Customer',
                    entityId: id,
                    details: `Customer ${existing.name} soft deleted.`,
                }
            });
        });

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error: any) {
        if (error.message === 'NOT_FOUND') {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }
        return handleApiError(error);
    }
}
