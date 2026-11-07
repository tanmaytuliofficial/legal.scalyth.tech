import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserSession } from '@/types/legal';

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('scalyth_legal_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const raw = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session: UserSession = JSON.parse(raw);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
