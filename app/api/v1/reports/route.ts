import { NextResponse } from 'next/server';
import { ReportService } from '../../../../services/ReportService';

const svc = new ReportService();

export async function GET() {
  try {
    const data = await svc.getDashboard();
    return NextResponse.json({ data });
  } catch(error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
