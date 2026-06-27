import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { hashPassword } from '@/lib/crypto';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, nickname } = body;

    if (!email || !password || !nickname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getRequestContext().env.DB;

    // Check if email already exists to prevent race condition
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?').bind(email);
    const { results } = await checkStmt.all();
    if (results && results.length > 0) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 });
    }

    // Hash password with Web Crypto API PBKDF2 (Highest Security)
    const hashedPassword = await hashPassword(password);
    
    // Generate UUID v4 for id
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert into DB
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
      VALUES (?, ?, ?, ?, 'user', ?, ?)
    `).bind(id, email, hashedPassword, nickname, now, now);

    await insertStmt.run();

    return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
