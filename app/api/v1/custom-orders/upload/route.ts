import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { handleApiError } from '../../../../../utils/errorHandler';
// In a real implementation you would handle FormData parsing and S3 upload
// Here we mock the URL return for the DB since Next.js route API doesn't handle multipart easily natively without heavy setup

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customOrderId, url, fileType, fileName } = body;

    if (!customOrderId || !url || !fileType) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const image = await prisma.customOrderImage.create({
      data: {
        customOrderId,
        url,
        fileType,
        fileName,
      },
    });

    await prisma.customOrderTimeline.create({
      data: {
        customOrderId,
        action: 'FILE_UPLOADED',
        remarks: `Uploaded ${fileType} file: ${fileName || 'Unnamed'}`,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
