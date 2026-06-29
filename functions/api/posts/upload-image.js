export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: '이미지 파일이 없습니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.STORAGE) {
      return new Response(JSON.stringify({ error: 'R2 Storage is not configured.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 파일명 생성
    const id = crypto.randomUUID();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${id}.${extension}`;
    const imageKey = `posts/images/${filename}`;

    // R2에 업로드
    await env.STORAGE.put(imageKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'image/jpeg',
      }
    });

    const url = `/api/images/post/${filename}`;

    return new Response(JSON.stringify({ success: true, url }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error uploading image to R2:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error uploading image' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
