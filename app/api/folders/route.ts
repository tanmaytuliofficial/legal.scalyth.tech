import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientIp, parseUserAgent } from '@/lib/device-parser';

export async function GET() {
  try {
    const folders = db.getFolders();
    const files = db.getFiles();

    // Attach file count to each folder
    const withCounts = folders.map((f) => ({
      ...f,
      fileCount: files.filter((file) => file.folderId === f.id).length,
    }));

    return NextResponse.json({ folders: withCounts });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, color, icon, userName, clientHint } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const folder = db.createFolder({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || 'blue',
      icon: icon || 'Folder',
    });

    const uaString = req.headers.get('user-agent') || '';
    const ip = extractClientIp(req.headers);
    const device = parseUserAgent(uaString, clientHint);

    db.recordAccess({
      folderId: folder.id,
      userName: userName || 'Scalyth Founder',
      userRole: 'Founder / Administrator',
      action: 'CREATE',
      device,
      ipAddress: ip,
      status: 'SUCCESS',
      notes: `Created new legal folder: "${folder.name}"`,
    });

    return NextResponse.json({ folder });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
