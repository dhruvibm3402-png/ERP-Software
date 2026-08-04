import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
// import { redis } from '../../../lib/redis'; // Assume redis is implemented in future steps but provide placeholder

export async function GET() {
  const healthStatus: any = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'UNKNOWN',
      memory: 'OK',
    },
  };

  try {
    // Check DB ping
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = 'UP';
  } catch (dbError) {
    healthStatus.status = 'DEGRADED';
    healthStatus.services.database = 'DOWN';
  }

  // Measure memory usage
  const used = process.memoryUsage();
  healthStatus.memoryUsage = {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
  };

  return NextResponse.json(healthStatus, {
    status: healthStatus.status === 'OK' ? 200 : 503,
  });
}
