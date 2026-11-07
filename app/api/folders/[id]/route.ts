import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientIp, parseUserAgent } from '@/lib/device-parser';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;
    const uaString = req.headers.get('user-agent') || '';
    const ip = extractClientIp(req.headers);
    const device = parseUserAgent(uaString);

    const success = db.deleteFolder(folderId);
    if (!success) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    db.recordAccess({
      folderId,
      userName: 'Scalyth Founder',
      userRole: 'Founder / Administrator',
      action: 'DELETE',
      device,
      ipAddress: ip,
      status: 'SUCCESS',
      notes: `Deleted legal folder id: ${folderId}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
