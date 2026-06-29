export async function onRequestGet({ request, env, params }) {
  const { id } = params;
  
  if (!id) {
    return new Response('Missing image ID', { status: 400 });
  }

  // 확장자를 제거하고 순수 ID만 추출
  const imageId = id.split('.')[0];
  const imageKey = `diagnostics/images/${imageId}.jpg`;

  if (!env.STORAGE) {
    return new Response('R2 Storage is not configured.', { status: 500 });
  }

  try {
    const object = await env.STORAGE.get(imageKey);

    if (object === null) {
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // 캐시 설정: 한 달 동안 브라우저 캐시 유지
    headers.set('Cache-Control', 'public, max-age=2592000');
    headers.set('Content-Type', 'image/jpeg');

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return new Response('Internal Server Error fetching image', { status: 500 });
  }
}
