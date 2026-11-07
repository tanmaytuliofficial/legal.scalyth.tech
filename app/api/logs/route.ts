import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 200;

    const logs = db.getAccessLogs({ fileId, action, limit });

    // Summary stats
    const totalViews = logs.filter((l) => l.action === 'VIEW').length;
    const totalDownloads = logs.filter((l) => l.action === 'DOWNLOAD').length;
    const totalFailed = logs.filter((l) => l.action === 'FAILED_UNLOCK' || l.status === 'DENIED').length;
    const uniqueDevices = new Set(logs.map((l) => `${l.device.deviceType}-${l.device.os}-${l.device.browser}`)).size;

    return NextResponse.json({
      logs,
      stats: {
        totalEvents: logs.length,
        totalViews,
        totalDownloads,
        totalFailed,
        uniqueDevices,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
