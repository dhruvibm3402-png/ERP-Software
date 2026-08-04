import { NextResponse } from 'next/server';
import { handleApiError } from '../../../../utils/errorHandler';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  metal: z.string(),
  purity: z.string(),
  grossWeight: z.number().positive(),
  netWeight: z.number().positive(),
  stoneWeight: z.number().min(0),
  wastage: z.number().min(0),
  makingCharges: z.number().min(0),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  barcode: z.string().optional(),
});

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Server-side global search logic
    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
            isDeleted: false,
          }
        : { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createProductSchema.parse(body);

    const sku = `SKU-${generateUniqueId()}`;
    const barcode = data.barcode || `BAR-${generateUniqueId()}`;
    const qrCode = `QR-${generateUniqueId()}`;

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku,
          barcode,
          qrCode,
          name: data.name,
          category: data.category,
          metal: data.metal,
          purity: data.purity,
          grossWeight: data.grossWeight,
          netWeight: data.netWeight,
          stoneWeight: data.stoneWeight,
          wastage: data.wastage,
          makingCharges: data.makingCharges,
          price: data.price,
          gst: 3, // Default Jewellery GST%
          images: '', // SQLite compat
        },
      });

      // Automatically log to inventory
      if (data.stock > 0) {
        await tx.inventory.create({
          data: {
            productId: product.id,
            quantity: data.stock,
            availableStock: data.stock,
            grossWeight: data.grossWeight,
            netWeight: data.netWeight,
          },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: 'IN',
            quantity: data.stock,
            weight: data.grossWeight,
            currentStock: data.stock,
            reason: 'Initial stock entry',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Product',
          entityId: product.id,
          details: `Product ${product.name} created`,
        },
      });

      return product;
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
