import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientIp, parseUserAgent } from '@/lib/device-parser';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = db.getFileById(params.id);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const safe = { ...file };
    delete (safe as Partial<typeof file>).password;
    delete (safe as Partial<typeof file>).content;

    return NextResponse.json({
      file: {
        ...safe,
        hasPassword: Boolean(file.isPasswordProtected),
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = db.updateFile(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ file: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = db.getFileById(params.id);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const uaString = req.headers.get('user-agent') || '';
    const ip = extractClientIp(req.headers);
    const device = parseUserAgent(uaString);

    db.deleteFile(params.id);

    db.recordAccess({
      fileId: file.id,
      fileName: file.name,
      folderId: file.folderId,
      userName: 'Scalyth Founder',
      userRole: 'Founder / Administrator',
      action: 'DELETE',
      device,
      ipAddress: ip,
      status: 'SUCCESS',
      notes: `Permanently removed legal file: ${file.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
