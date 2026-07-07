export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    const body = await request.json();
    const { botUserId, adminUserId } = body;

    // 1. 필수 파라미터 체크 및 관리자 인증
    if (!botUserId || !adminUserId) {
      return new Response(JSON.stringify({ error: "필수 파라미터(botUserId, adminUserId)가 누락되었습니다." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const adminCheck = await db.prepare("SELECT role FROM users WHERE id = ?").bind(adminUserId).first();
    if (!adminCheck || adminCheck.role !== "admin") {
      return new Response(JSON.stringify({ error: "관리자 권한이 없습니다." }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. 봇 정보 획득
    const bot = await db.prepare(`
      SELECT u.nickname, bp.concept, bp.prompt_instruction 
      FROM users u
      INNER JOIN bot_personas bp ON u.id = bp.user_id
      WHERE u.id = ? AND u.role = 'bot' AND bp.is_active = 1
    `).bind(botUserId).first();

    if (!bot) {
      return new Response(JSON.stringify({ error: "활성화된 봇을 찾을 수 없거나 봇 계정이 아닙니다." }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다." }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // --- 1단계: Google Search Grounding을 사용한 실시간 정보 수집 및 초안 생성 ---
    const searchPrompt = `
      Search Google for the latest news, medical facts, trends, or scientific papers on hair loss (탈모) and scalp care that perfectly match the following concept.
      
      Concept: ${bot.concept}
      Detail instructions on writing style and persona: ${bot.prompt_instruction}
      
      Write a highly informative and detailed article in Korean based on the web search results. Make it sound professional, trustworthy, and engaging.
    `;

    const searchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const searchRes = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: searchPrompt }] }],
        tools: [{ googleSearch: {} }] // 구글 검색 활성화
      })
    });

    if (!searchRes.ok) {
      const err = await searchRes.text();
      throw new Error(`[Gemini Search API Error]: ${err}`);
    }

    const searchData = await searchRes.json();
    const draftText = searchData.candidates[0].content.parts[0].text;

    // --- 2단계: HTML 포맷팅 및 구조화된 JSON 파싱 (Schema Mode) ---
    const formatPrompt = `
      Based on the draft article provided below, organize it into a structured JSON object.
      You must format the body content into clean HTML suitable for a rich text editor.
      Use tags like <h3> for section headings, <p> for paragraphs, <strong> for emphasis, <ul>/<li> for lists, and <blockquote> for quotes. Do NOT include inline CSS styles.
      Also, extract an English image generation prompt (imagePrompt) that visually depicts the core theme of this article (e.g., "A modern medical illustration of hair follicle growth, highly detailed, clean clinic background").

      Draft Article:
      ${draftText}
    `;

    const formatRes = await fetch(searchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: formatPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              category: { type: "string", enum: ["탈모수다", "리얼후기", "탈모정보", "닥터칼럼"] },
              content: { type: "string", description: "HTML formatted body content" },
              imagePrompt: { type: "string", description: "English prompt for image generation model" }
            },
            required: ["title", "category", "content", "imagePrompt"]
          }
        }
      })
    });

    if (!formatRes.ok) {
      const err = await formatRes.text();
      throw new Error(`[Gemini Format API Error]: ${err}`);
    }

    const formatData = await formatRes.json();
    const parsedObj = JSON.parse(formatData.candidates[0].content.parts[0].text);

    let finalContent = parsedObj.content;
    let imageKey = null;
    let imageUrl = null;

    // --- 3단계: Imagen 3.0 API 호출을 통한 이미지 자동 생성 및 R2 업로드 (실패 시 우아한 폴백) ---
    try {
      if (env.STORAGE && parsedObj.imagePrompt) {
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${apiKey}`;
        const imagenRes = await fetch(imagenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: parsedObj.imagePrompt,
            numberOfImages: 1,
            aspectRatio: "16:9",
            outputMimeType: "image/jpeg"
          })
        });

        if (imagenRes.ok) {
          const imagenData = await imagenRes.json();
          const base64ImageBytes = imagenData.generatedImages[0].image.imageBytes;
          
          if (base64ImageBytes) {
            // Base64를 바이너리로 디코딩
            const binaryString = atob(base64ImageBytes);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const imgId = crypto.randomUUID();
            const filename = `${imgId}.jpg`;
            imageKey = `posts/images/${filename}`;

            // R2 스토리지 업로드
            await env.STORAGE.put(imageKey, bytes.buffer, {
              httpMetadata: { contentType: "image/jpeg" }
            });

            imageUrl = `/api/images/post/${filename}`;
            // 본물 상단에 대표 이미지 태그 동적 삽입
            finalContent = `<img src="${imageUrl}" class="w-full rounded-lg mb-6 max-h-[360px] object-cover" alt="${parsedObj.title}" />` + finalContent;
          }
        } else {
          console.warn("[Imagen API Failure] Response status not OK. Skipping image generation.");
        }
      }
    } catch (imageErr) {
      // 이미지 생성 오류 시 글 생성에는 지장이 없도록 기록만 남기고 우아한 복구
      console.error("[Image Generation & R2 Upload Pipeline Failed]:", imageErr);
    }

    // --- 4단계: D1 데이터베이스에 posts 테이블 등록 (status = 'pending') ---
    const postId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO posts (id, user_id, category, title, content, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).bind(postId, botUserId, parsedObj.category, parsedObj.title, finalContent, now).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "AI 글이 정상적으로 자동 생성되어 검수 대기 상태로 등록되었습니다.", 
      postId, 
      title: parsedObj.title, 
      category: parsedObj.category,
      imageUrl 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
