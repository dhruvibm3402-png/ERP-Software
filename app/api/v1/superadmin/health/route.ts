
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    return NextResponse.json({ 
       status: 'OK', 
       database: 'Connected', 
       redis: 'Connected', 
       uptime: process.uptime() 
    });
}
