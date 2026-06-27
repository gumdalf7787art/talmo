import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getRequestContext().env.DB;
    
    const stmt = db.prepare('SELECT id FROM users WHERE email = ?').bind(email);
    const { results } = await stmt.all();

    if (results && results.length > 0) {
      // Email already exists
      return NextResponse.json({ available: false });
    }

    // Email is available
    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
