import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../../utils/errorHandler';
import prisma from '../../../../../lib/prisma';
import { z } from 'zod';

const updateVendorSchema = z.object({
    vendorName: z.string().min(2, 'Vendor Name is required').optional(),
    companyName: z.string().optional(),
    vendorType: z.string().optional(),
    contactPerson: z.string().optional(),
    mobile: z.string().min(10, 'Mobile Number is required').optional(),
    alternateMobile: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().optional(),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    msmeNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
    creditLimit: z.number().optional(),
    openingBalance: z.number().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

export async function GET(request: Request, context: any) {
    try {
        const params = await context.params;
        const id = params.id;
        const vendor = await prisma.vendorRecord.findUnique({
            where: { id, isDeleted: false },
        });

        if (!vendor) {
            return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
        }

        return NextResponse.json(vendor);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: Request, context: any) {
    try {
        const params = await context.params;
        const id = params.id;
        const body = await request.json();
        const data = updateVendorSchema.parse(body);

        const vendor = await prisma.$transaction(async (tx) => {
            const existing = await tx.vendorRecord.findUnique({ where: { id } });
            if (!existing || existing.isDeleted) {
                throw new Error('Vendor not found');
            }

            const updatedVendor = await tx.vendorRecord.update({
                where: { id },
                data: {
                    vendorName: data.vendorName,
                    companyName: data.companyName,
                    vendorType: data.vendorType,
                    contactPerson: data.contactPerson,
                    mobile: data.mobile,
                    alternateMobile: data.alternateMobile,
                    email: data.email,
                    website: data.website,
                    gstNumber: data.gstNumber,
                    panNumber: data.panNumber,
                    msmeNumber: data.msmeNumber,
                    paymentTerms: data.paymentTerms,
                    creditLimit: data.creditLimit,
                    openingBalance: data.openingBalance,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                    bankName: data.bankName,
                    accountHolderName: data.accountHolderName,
                    accountNumber: data.accountNumber,
                    ifscCode: data.ifscCode,
                    notes: data.notes,
                    status: data.status,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'Vendor',
                    entityId: updatedVendor.id,
                    details: `Vendor ${updatedVendor.vendorName} updated.`
                }
            });

            return updatedVendor;
        });

        return NextResponse.json(vendor);
    } catch (error: any) {
        if (error.message === 'Vendor not found') {
            return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
        }
        return handleApiError(error);
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const params = await context.params;
        const id = params.id;

        await prisma.$transaction(async (tx) => {
            const existing = await tx.vendorRecord.findUnique({ where: { id } });
            if (!existing || existing.isDeleted) {
                throw new Error('Vendor not found');
            }

            await tx.vendorRecord.update({
                where: { id },
                data: {
                    isDeleted: true,
                    status: 'INACTIVE',
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Vendor',
                    entityId: id,
                    details: `Vendor ${existing.vendorName} soft deleted.`
                }
            });
        });

        return NextResponse.json({ message: 'Vendor deleted successfully' });
    } catch (error: any) {
        if (error.message === 'Vendor not found') {
            return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
        }
        return handleApiError(error);
    }
}
