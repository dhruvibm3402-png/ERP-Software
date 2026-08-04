import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const createCustomerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    mobile: z.string().min(10, 'Valid mobile is required'),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    aadhaar: z.string().optional(),
    pan: z.string().optional(),
    birthday: z.string().optional().nullable(),
    anniversary: z.string().optional().nullable(),
    notes: z.string().optional(),
});

function generateUniqueId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const tier = searchParams.get('tier');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        const where: any = { isDeleted: false };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search, mode: 'insensitive' } },
                { customerId: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (tier) {
            where.tier = tier;
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.customer.count({ where }),
        ]);

        return NextResponse.json({
            data: customers,
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
        const data = createCustomerSchema.parse(body);

        let customerId = `CUS-${generateUniqueId()}`;
        // Ensure unique
        let existing = await prisma.customer.findUnique({ where: { customerId } });
        while (existing) {
            customerId = `CUS-${generateUniqueId()}`;
            existing = await prisma.customer.findUnique({ where: { customerId } });
        }

        const customer = await prisma.$transaction(async (tx) => {
            const newCustomer = await tx.customer.create({
                data: {
                    customerId,
                    name: data.name,
                    mobile: data.mobile,
                    email: data.email || null,
                    address: data.address,
                    gstNumber: data.gstNumber,
                    aadhaar: data.aadhaar,
                    pan: data.pan,
                    birthday: data.birthday ? new Date(data.birthday) : null,
                    anniversary: data.anniversary ? new Date(data.anniversary) : null,
                    notes: data.notes,
                    tier: 'Silver',
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    entity: 'Customer',
                    entityId: newCustomer.id,
                    details: `Customer ${newCustomer.name} (${newCustomer.customerId}) created.`
                }
            });

            return newCustomer;
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
