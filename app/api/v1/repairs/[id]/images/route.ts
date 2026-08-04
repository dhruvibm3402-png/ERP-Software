import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { handleApiError } from '../../../../../../utils/errorHandler';
import { z } from 'zod';

// ─── Validation ────────────────────────────────────────────────────────────────

const addImagesSchema = z.object({
    images: z
        .array(
            z.object({
                imageUrl: z.string().min(1, 'Image URL or base64 is required'),
                imageType: z.enum(['BEFORE', 'DURING', 'AFTER']),
                caption: z.string().optional(),
            })
        )
        .min(1, 'At least one image is required'),
});

// ─── GET /api/v1/repairs/[id]/images ─────────────────────────────────────────

export async function GET(_request: Request, context: any) {
    try {
        const { id } = await context.params;

        const job = await (prisma as any).repairJob.findUnique({ where: { id }, select: { id: true, jobNumber: true } });
        if (!job) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }

        const images = await (prisma as any).repairImage.findMany({
            where: { repairJobId: id },
            orderBy: [{ imageType: 'asc' }, { uploadedAt: 'asc' }],
        });

        // Group by type for easy consumption
        const grouped = {
            BEFORE: images.filter((i) => i.imageType === 'BEFORE'),
            DURING: images.filter((i) => i.imageType === 'DURING'),
            AFTER: images.filter((i) => i.imageType === 'AFTER'),
            total: images.length,
        };

        return NextResponse.json({ jobNumber: job.jobNumber, images, grouped });
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── POST /api/v1/repairs/[id]/images ────────────────────────────────────────

export async function POST(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const data = addImagesSchema.parse(body);

        const job = await (prisma as any).repairJob.findUnique({
            where: { id },
            select: { id: true, jobNumber: true, status: true },
        });
        if (!job) {
            return NextResponse.json({ message: 'Repair job not found' }, { status: 404 });
        }
        if (job.status === 'DELIVERED') {
            return NextResponse.json({ message: 'Cannot add images to a delivered job' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const created = await (tx as any).repairImage.createMany({
                data: data.images.map((img) => ({
                    repairJobId: id,
                    imageUrl: img.imageUrl,
                    imageType: img.imageType,
                    caption: img.caption ?? null,
                })),
            });

            await (tx as any).repairHistory.create({
                data: {
                    repairJobId: id,
                    fromStatus: job.status,
                    toStatus: job.status,
                    action: 'IMAGES_ADDED',
                    notes: `${data.images.length} image(s) added (${data.images.map((i) => i.imageType).join(', ')})`,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'RepairJob',
                    entityId: id,
                    details: `${data.images.length} image(s) added to repair job ${job.jobNumber}`,
                },
            });

            return created;
        });

        // Return the newly added images
        const images = await (prisma as any).repairImage.findMany({
            where: { repairJobId: id },
            orderBy: [{ imageType: 'asc' }, { uploadedAt: 'asc' }],
        });

        return NextResponse.json({
            added: result.count,
            images,
        }, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}

// ─── DELETE /api/v1/repairs/[id]/images?imageId=xxx ──────────────────────────

export async function DELETE(request: Request, context: any) {
    try {
        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('imageId');

        if (!imageId) {
            return NextResponse.json({ message: 'imageId query param is required' }, { status: 400 });
        }

        const image = await (prisma as any).repairImage.findFirst({
            where: { id: imageId, repairJobId: id },
        });
        if (!image) {
            return NextResponse.json({ message: 'Image not found' }, { status: 404 });
        }

        await (prisma as any).repairImage.delete({ where: { id: imageId } });

        return NextResponse.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        return handleApiError(error);
    }
}
