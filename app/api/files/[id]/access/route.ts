import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractClientIp, parseUserAgent } from '@/lib/device-parser';

export const runtime = 'edge';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    const body = await req.json().catch(() => ({}));
    const { password, action = 'VIEW', userName = 'Tanmay (Founder)', userRole = 'Founder / Managing Director', clientHint } = body;

    const file = db.getFileById(fileId);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const uaString = req.headers.get('user-agent') || '';
    const ip = extractClientIp(req.headers);
    const device = parseUserAgent(uaString, clientHint);

    // If file is password protected, verify password
    if (file.isPasswordProtected) {
      const { valid } = db.verifyFilePassword(fileId, password || '');

      if (!valid) {
        // Record security violation / failed attempt in audit history
        db.recordAccess({
          fileId: file.id,
          fileName: file.name,
          folderId: file.folderId,
          userName: userName || 'Unverified User',
          userRole: 'Restricted Access',
          action: 'FAILED_UNLOCK',
          device,
          ipAddress: ip,
          status: 'DENIED',
          notes: `Failed unlock attempt on protected file: "${file.name}". Device: ${device.deviceType} (${device.os})`,
        });

        return NextResponse.json(
          {
            error: 'Incorrect file password. Access denied. (Use file password or Master Key)',
            requiresPassword: true,
          },
          { status: 403 }
        );
      }
    }

    // Password is valid or file is public
    const accessAction = action === 'DOWNLOAD' ? 'DOWNLOAD' : 'VIEW';
    db.recordAccess({
      fileId: file.id,
      fileName: file.name,
      folderId: file.folderId,
      userName: userName || 'Scalyth Founder',
      userRole: userRole || 'Founder / Legal Partner',
      action: accessAction,
      device,
      ipAddress: ip,
      status: 'SUCCESS',
      notes: `${accessAction === 'DOWNLOAD' ? 'Downloaded' : 'Viewed'} document contents securely via ${device.browser} on ${device.os}`,
    });

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        name: file.name,
        category: file.category,
        description: file.description,
        mimeType: file.mimeType,
        size: file.size,
        fileType: file.fileType,
        isPasswordProtected: file.isPasswordProtected,
        content: file.content,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        accessCount: (file.accessCount || 0) + 1,
        tags: file.tags,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
