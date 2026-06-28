import { hashPassword } from '../../../../src/lib/crypto.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  // Determine redirect URI dynamically based on current request URL to support both local and prod
  const redirectUri = `${url.origin}/api/auth/naver/callback`;
  const clientId = 'OWvIAOQuyH9DRnz0L4HZ';
  const clientSecret = 'lD03u8IYkL';

  try {
    // 1. Get Access Token
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state: state || 'talmotalk_state',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Get User Profile
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const userData = await userResponse.json();
    
    if (userData.resultcode !== "00") {
      return new Response(JSON.stringify(userData), { status: 400 });
    }

    const profile = userData.response;
    const naverId = profile.id;
    const nickname = profile.nickname || `user_${Math.random().toString(36).substring(2, 8)}`;
    const profileImage = profile.profile_image || null;
    
    // Use real email if available, otherwise fallback to dummy email
    const naverEmail = profile.email;
    const dummyEmail = `naver_${naverId}@talmotalk.com`;
    const finalEmail = naverEmail || dummyEmail;

    const db = env.DB;
    if (!db) {
      return new Response('DB connection missing', { status: 500 });
    }

    // 3. Check if user exists by Naver ID
    const stmt = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').bind('naver', naverId);
    let user = await stmt.first();

    if (!user) {
      // If Naver gave us an email, check if an account with this email already exists
      if (naverEmail) {
        const emailStmt = db.prepare('SELECT * FROM users WHERE email = ?').bind(naverEmail);
        user = await emailStmt.first();

        if (user) {
          // Link existing account to Naver
          const now = new Date().toISOString();
          await db.prepare('UPDATE users SET provider = ?, provider_id = ?, updated_at = ? WHERE id = ?')
            .bind('naver', naverId, now, user.id)
            .run();
          user.provider = 'naver';
          user.provider_id = naverId;
        }
      }

      // If still no user, create a new one
      if (!user) {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const randomPassword = crypto.randomUUID(); // Dummy password
        
        const hashedPassword = await hashPassword(randomPassword);

        const insertStmt = db.prepare(`
          INSERT INTO users (id, email, password, nickname, profile_image, role, provider, provider_id, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, 'user', 'naver', ?, ?, ?)
        `).bind(id, finalEmail, hashedPassword, nickname, profileImage, naverId, now, now);

        await insertStmt.run();

        // Fetch the newly created user
        user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      }
    }

    // Remove password from user object
    const { password: _, ...safeUser } = user;

    // 5. Return HTML to set localStorage and redirect to Home
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>로그인 중...</title>
        </head>
        <body>
          <script>
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(${JSON.stringify(safeUser)}));
            window.location.href = '/';
          </script>
        </body>
      </html>
    `;

    return new Response(htmlResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
