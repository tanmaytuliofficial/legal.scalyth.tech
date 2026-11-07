import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientIp, parseUserAgent } from '@/lib/device-parser';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId') || undefined;
    const files = db.getFiles(folderId);
    return NextResponse.json({ files });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      folderId,
      category,
      description,
      mimeType,
      size,
      fileType,
      isPasswordProtected,
      password,
      content,
      tags,
      userName,
      clientHint,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    if (!folderId) {
      return NextResponse.json({ error: 'Folder selection is required' }, { status: 400 });
    }

    const newFile = db.createFile({
      name: name.trim(),
      folderId,
      category: category?.trim() || 'General Legal',
      description: description?.trim() || '',
      mimeType: mimeType || 'text/plain',
      size: size || (content ? Buffer.byteLength(content, 'utf8') : 1024),
      fileType: fileType || 'document',
      isPasswordProtected: Boolean(isPasswordProtected),
      password: isPasswordProtected ? password?.trim() || 'SCALYTH2026' : undefined,
      content: content || '',
      tags: Array.isArray(tags) ? tags : ['Confidential'],
    });

    const uaString = req.headers.get('user-agent') || '';
    const ip = extractClientIp(req.headers);
    const device = parseUserAgent(uaString, clientHint);

    db.recordAccess({
      fileId: newFile.id,
      fileName: newFile.name,
      folderId: newFile.folderId,
      userName: userName || 'Scalyth Founder',
      userRole: 'Founder / Administrator',
      action: 'CREATE',
      device,
      ipAddress: ip,
      status: 'SUCCESS',
      notes: `Uploaded/Created file: ${newFile.name}${isPasswordProtected ? ' (Encrypted with Custom PIN)' : ''}`,
    });

    return NextResponse.json({ file: newFile });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
