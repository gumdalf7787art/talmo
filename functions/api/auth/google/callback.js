import { hashPassword } from '../../../../src/lib/crypto.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  // Determine redirect URI dynamically based on current request URL
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  try {
    // 1. Get Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Get User Profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const userData = await userResponse.json();
    
    if (!userData.id) {
      return new Response(JSON.stringify(userData), { status: 400 });
    }

    const profile = userData;
    const googleId = profile.id;
    const nickname = profile.name || `user_${Math.random().toString(36).substring(2, 8)}`;
    const profileImage = profile.picture || null;
    
    // Use real email if available, otherwise fallback to dummy email
    const googleEmail = profile.email;
    const dummyEmail = `google_${googleId}@talmotalk.com`;
    const finalEmail = googleEmail || dummyEmail;

    const db = env.DB;
    if (!db) {
      return new Response('DB connection missing', { status: 500 });
    }

    // Extract link_toss_id from cookie if present
    let linkTossId = null;
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const tossMatch = cookieHeader.match(/(?:^|;\s*)link_toss_id=([^;]*)/);
      if (tossMatch) linkTossId = tossMatch[1];
    }

    // 3. Check if user exists by Google ID
    const stmt = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').bind('google', googleId);
    let user = await stmt.first();

    if (!user) {
      // If Google gave us an email, check if an account with this email already exists
      if (googleEmail) {
        const emailStmt = db.prepare('SELECT * FROM users WHERE email = ?').bind(googleEmail);
        user = await emailStmt.first();

        if (user) {
          // Link existing account to Google
          const now = new Date().toISOString();
          await db.prepare('UPDATE users SET provider = ?, provider_id = ?, updated_at = ? WHERE id = ?')
            .bind('google', googleId, now, user.id)
            .run();
          user.provider = 'google';
          user.provider_id = googleId;
        }
      }

      // If still no user, create a new one
      if (!user) {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const randomPassword = crypto.randomUUID(); // Dummy password
        const hashedPassword = await hashPassword(randomPassword);

        // Ensure nickname uniqueness
        let finalNickname = nickname;
        let isNickUnique = false;
        let nickAttempts = 0;
        while (!isNickUnique && nickAttempts < 10) {
          const nickCheck = await db.prepare('SELECT id FROM users WHERE nickname = ?').bind(finalNickname).all();
          if (nickCheck.results && nickCheck.results.length > 0) {
            finalNickname = `${nickname}_${Math.random().toString(36).substring(2, 6)}`;
            nickAttempts++;
          } else {
            isNickUnique = true;
          }
        }

        const insertStmt = db.prepare(`
          INSERT INTO users (id, email, password, nickname, profile_image, role, provider, provider_id, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, 'user', 'google', ?, ?, ?)
        `).bind(id, finalEmail, hashedPassword, finalNickname, profileImage, googleId, now, now);

        await insertStmt.run();

        // Fetch the newly created user
        user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      }
    }

    // Remove password from user object
    const { password: _, ...safeUser } = user;

    // 4. Migrate Toss data if linkTossId is present
    if (linkTossId) {
      await db.prepare(`
        UPDATE diagnosis_history 
        SET user_id = ? 
        WHERE user_id = (SELECT id FROM users WHERE provider_id = ? AND provider = 'toss' LIMIT 1)
      `).bind(safeUser.id, linkTossId).run();
    }

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
