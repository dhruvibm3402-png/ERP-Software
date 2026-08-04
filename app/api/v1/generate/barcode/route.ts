import { NextResponse } from 'next/server';
import bwipjs from 'bwip-js';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const data = searchParams.get('data');
        if (!data) return NextResponse.json({ message: 'Data required' }, { status: 400 });

        const buffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: data,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
        });

        const barcodeUrl = `data:image/png;base64,${buffer.toString('base64')}`;
        return NextResponse.json({ barcodeUrl });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
