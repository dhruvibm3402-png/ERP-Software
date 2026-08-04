import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  expectedDate: z.string().optional(),
  branchId: z.string().optional(),
  priority: z.string().default('NORMAL'),
  productId: z.string().optional(),
  designNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        metalType: z.string().optional(),
        purity: z.string().optional(),
        grossWeight: z.number().default(0),
        netWeight: z.number().default(0),
        stoneQuantity: z.number().default(0),
      })
    )
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let where: any = {};
    if (search) {
      where.OR = [
        { jobNumber: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'ALL') where.status = status;

    const data = await prisma.manufacturingJob.findMany({
      where,
      include: {
        Product: true,
        JobMaterial: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    let karigar = await prisma.karigar.findFirst();
    let karigarId = karigar?.id;
    if (!karigarId) {
      // Fallback just in case
      karigar = await prisma.karigar.create({
        data: { name: 'Default Karigar', mobile: '9999999999', karigarId: 'KAR-DEFAULT' },
      });
      karigarId = karigar.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.manufacturingJob.count();
      const jobNumber = `MFG-${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`;

      const mfg = await tx.manufacturingJob.create({
        data: {
          jobNumber,
          karigarId: karigarId,
          expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
          status: 'ASSIGNED',
          productName: data.designNumber || 'Custom Design',
          category: 'Jewellery',
          metal: data.items?.[0]?.metalType || 'GOLD',
          purity: data.items?.[0]?.purity || '22K',
          qcNotes: data.notes,
          JobMaterial: {
            create: (data.items || []).map((item) => ({
              type: 'RAW_MATERIAL',
              materialName: item.metalType || 'Unknown',
              weight: Number(item.grossWeight) || 0,
              quantity: Number(item.stoneQuantity) || 1,
              purity: item.purity,
            })),
          },
        },
      });
      return mfg;
    });

    return NextResponse.json(
      { data: result, message: 'Manufacturing Order generated successfully' },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
