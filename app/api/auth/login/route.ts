import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { parseUserAgent, extractClientIp } from '@/lib/device-parser';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, founderName, clientHint } = body;

    const masterPass = process.env.LEGAL_MASTER_PASSWORD || 'SCALYTH2026';
    const uaString = req.headers.get('user-agent') || '';
    const ip = extractClientIp(req.headers);
    const device = parseUserAgent(uaString, clientHint);

    const userName = founderName?.trim() || 'Tanmay (Founder)';

    if (!password || password !== masterPass) {
      // Record failed login attempt
      db.recordAccess({
        userName: userName,
        userRole: 'Guest / Unauthorized',
        action: 'LOGIN',
        device,
        ipAddress: ip,
        status: 'DENIED',
        notes: 'Invalid master password entered',
      });

      return NextResponse.json(
        { error: 'Incorrect master passkey. Access to Scalyth Legal Vault denied.' },
        { status: 401 }
      );
    }

    // Record successful login
    db.recordAccess({
      userName: userName,
      userRole: 'Founder / Executive Partner',
      action: 'LOGIN',
      device,
      ipAddress: ip,
      status: 'SUCCESS',
      notes: `Authenticated with Master Pass on ${device.os} (${device.browser})`,
    });

    const tokenPayload = {
      authenticated: true,
      userName: userName,
      role: 'Founder / Managing Partner',
      loginTime: new Date().toISOString(),
      deviceSummary: `${device.deviceType} • ${device.os} • ${device.browser}`,
    };

    // Set secure cookie
    const cookieStore = cookies();
    cookieStore.set('scalyth_legal_session', Buffer.from(JSON.stringify(tokenPayload)).toString('base64'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: tokenPayload,
      message: 'Access granted to Scalyth Legal Vault',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
