import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const createVendorSchema = z.object({
    vendorName: z.string().min(2, 'Vendor Name is required'),
    companyName: z.string().optional(),
    vendorType: z.string(),
    contactPerson: z.string().optional(),
    mobile: z.string().min(10, 'Mobile Number is required'),
    alternateMobile: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().optional(),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    msmeNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
    creditLimit: z.number().optional().default(0),
    openingBalance: z.number().optional().default(0),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional().default('India'),
    pincode: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional().default('ACTIVE'),
});

function generateVendorCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const vendorType = searchParams.get('vendorType');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        const where: any = { isDeleted: false };
        if (search) {
            where.OR = [
                { vendorName: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { gstNumber: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { vendorCode: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (vendorType) {
            where.vendorType = vendorType;
        }

        const [vendors, total] = await Promise.all([
            prisma.vendorRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.vendorRecord.count({ where }),
        ]);

        return NextResponse.json({
            data: vendors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = createVendorSchema.parse(body);

        // Check duplicates if needed: gst, mobile, vendorName
        if (data.mobile) {
            const existingMobile = await prisma.vendorRecord.findFirst({
                where: { mobile: data.mobile, isDeleted: false }
            });
            if (existingMobile) {
                return NextResponse.json({ message: 'Vendor with this mobile number already exists' }, { status: 400 });
            }
        }

        if (data.gstNumber) {
            const existingGst = await prisma.vendorRecord.findFirst({
                where: { gstNumber: data.gstNumber, isDeleted: false }
            });
            if (existingGst) {
                return NextResponse.json({ message: 'Vendor with this GST already exists' }, { status: 400 });
            }
        }

        let vendorCode = `VEND-${generateVendorCode()}`;
        // Ensure unique
        let existing = await prisma.vendorRecord.findUnique({ where: { vendorCode } });
        while (existing) {
            vendorCode = `VEND-${generateVendorCode()}`;
            existing = await prisma.vendorRecord.findUnique({ where: { vendorCode } });
        }

        const vendor = await prisma.$transaction(async (tx) => {
            const newVendor = await tx.vendorRecord.create({
                data: {
                    vendorCode,
                    vendorName: data.vendorName,
                    companyName: data.companyName,
                    vendorType: data.vendorType,
                    contactPerson: data.contactPerson,
                    mobile: data.mobile,
                    alternateMobile: data.alternateMobile,
                    email: data.email || null,
                    website: data.website,
                    gstNumber: data.gstNumber,
                    panNumber: data.panNumber,
                    msmeNumber: data.msmeNumber,
                    paymentTerms: data.paymentTerms,
                    creditLimit: data.creditLimit,
                    openingBalance: data.openingBalance,
                    outstandingBalance: data.openingBalance, // initialize outstanding with opening
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
                    action: 'CREATE',
                    entity: 'Vendor',
                    entityId: newVendor.id,
                    details: `Vendor ${newVendor.vendorName} (${newVendor.vendorCode}) created.`
                }
            });

            return newVendor;
        });

        return NextResponse.json(vendor, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
