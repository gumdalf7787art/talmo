import { hashPassword } from '../../../../src/lib/crypto.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  // Determine redirect URI dynamically based on current request URL to support both local and prod
  const redirectUri = `${url.origin}/api/auth/kakao/callback`;
  const clientId = env.KAKAO_CLIENT_ID || '43a474ecd76c1a1b758dcdf415c1565a'; // REST API Key
  const clientSecret = env.KAKAO_CLIENT_SECRET || 'D0ImffOQpt4abhpgRep7zwvxZg1huQVI';

  try {
    // 1. Get Access Token from Kakao
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code,
        client_secret: clientSecret,
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Kakao Token Error:', tokenData);
      return new Response('Failed to get token from Kakao', { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Get User Info from Kakao
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      }
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Kakao User Info Error:', userData);
      return new Response('Failed to get user info from Kakao', { status: 400 });
    }

    const kakaoId = userData.id.toString();
    const kakaoAccount = userData.kakao_account;
    const profile = kakaoAccount?.profile;
    
    const nickname = profile?.nickname || `user_${Math.random().toString(36).substring(2, 8)}`;
    const profileImage = profile?.profile_image_url || null;
    
    // Use real email if available, otherwise fallback to dummy email
    const kakaoEmail = kakaoAccount?.email;
    const dummyEmail = `kakao_${kakaoId}@talmotalk.com`;
    const finalEmail = kakaoEmail || dummyEmail;

    const db = env.DB;
    if (!db) {
      return new Response('DB connection missing', { status: 500 });
    }

    // Extract referral code from state or cookie if present
    let referredByCode = state || null;
    const cookieHeader = request.headers.get('Cookie');
    if (!referredByCode && cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)referral_code=([^;]*)/);
      if (match) referredByCode = match[1];
    }

    // 3. Check if user exists by Kakao ID
    const stmt = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').bind('kakao', kakaoId);
    let user = await stmt.first();

    if (!user) {
      // If Kakao gave us an email, check if an account with this email already exists
      if (kakaoEmail) {
        const emailStmt = db.prepare('SELECT * FROM users WHERE email = ?').bind(kakaoEmail);
        user = await emailStmt.first();

        if (user) {
          // Link existing account to Kakao
          const now = new Date().toISOString();
          await db.prepare('UPDATE users SET provider = ?, provider_id = ?, updated_at = ? WHERE id = ?')
            .bind('kakao', kakaoId, now, user.id)
            .run();
          user.provider = 'kakao';
          user.provider_id = kakaoId;
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

        // Generate 6-char referral code
        let referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        let isCodeUnique = false;
        let codeAttempts = 0;
        while (!isCodeUnique && codeAttempts < 5) {
          const codeCheck = await db.prepare('SELECT id FROM users WHERE referral_code = ?').bind(referralCode).all();
          if (codeCheck.results && codeCheck.results.length > 0) {
            referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            codeAttempts++;
          } else {
            isCodeUnique = true;
          }
        }

        let ticketsPremium = 0;
        let referredById = null;

        if (referredByCode) {
          const upperReferredCode = referredByCode.toUpperCase();
          const referrerResult = await db.prepare('SELECT id, tickets_premium FROM users WHERE referral_code = ?').bind(upperReferredCode).first();
          if (referrerResult) {
            referredById = referrerResult.id;
            ticketsPremium = 2;
            await db.prepare('UPDATE users SET tickets_premium = tickets_premium + 2 WHERE id = ?').bind(referredById).run();
          }
        }

        const insertStmt = db.prepare(`
          INSERT INTO users (id, email, password, nickname, profile_image, role, provider, provider_id, referral_code, referred_by, tickets_basic, tickets_premium, last_ticket_reset, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, 'user', 'kakao', ?, ?, ?, 2, ?, ?, ?, ?)
        `).bind(id, finalEmail, hashedPassword, finalNickname, profileImage, kakaoId, referralCode, referredById, ticketsPremium, now, now, now);

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

    const headers = new Headers({
      'Content-Type': 'text/html;charset=utf-8',
    });
    // Clear the referral_code cookie if it existed
    if (referredByCode) {
      headers.set('Set-Cookie', 'referral_code=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    }

    return new Response(htmlResponse, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('Kakao login error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
