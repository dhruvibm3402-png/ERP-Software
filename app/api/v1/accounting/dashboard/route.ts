import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();

export async function GET() {
  try {
    const data = await svc.getDashboard();
    return NextResponse.json({ data });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
