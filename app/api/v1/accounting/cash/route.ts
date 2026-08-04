import { NextResponse } from 'next/server';
import { AccountingService } from '../../../../../services/AccountingService';

const svc = new AccountingService();
export async function GET() { return NextResponse.json({ data: await svc.getCashBook() }); }
export async function POST(req: Request) { return NextResponse.json({ data: await svc.addCash(await req.json()) }); }
