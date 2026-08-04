import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const updateProductSchema = z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    price: z.number().positive().optional(),
    status: z.string().optional(),
    isDeleted: z.boolean().optional(),
});

export async function GET(request: Request, context: any) {
    try {
        const { params } = context;
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                inventory: true,
                Branch: true
            }
        });

        if (!product || product.isDeleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: Request, context: any) {
    try {
        const { params } = context;
        const body = await request.json();
        const data = updateProductSchema.parse(body);

        const updated = await prisma.$transaction(async (tx) => {
            const prod = await tx.product.update({
                where: { id: params.id },
                data
            });
            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'Product',
                    entityId: prod.id,
                    details: `Product updated with payload changes`
                }
            });
            return prod;
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const { params } = context;
        const deleted = await prisma.$transaction(async (tx) => {
            const prod = await tx.product.update({
                where: { id: params.id },
                data: { isDeleted: true, status: 'Archived' }
            });
            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Product',
                    entityId: prod.id,
                    details: `Soft deleted product ${prod.sku}`
                }
            });
            return prod;
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
