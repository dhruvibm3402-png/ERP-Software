import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const data = searchParams.get('data');
        if (!data) return NextResponse.json({ message: 'Data required' }, { status: 400 });

        const qrDataUrl = await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
        return NextResponse.json({ qrDataUrl });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
