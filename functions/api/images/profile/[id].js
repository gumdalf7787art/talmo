export async function onRequestGet({ request, env, params }) {
  const { id } = params;
  
  if (!id) {
    return new Response('Missing image ID', { status: 400 });
  }

  const imageKey = `profiles/images/${id}`;

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

    // 만약 object.httpMetadata에 Content-Type이 없다면 기본값 설정
    if (!headers.has('Content-Type')) {
      const extension = id.split('.').pop().toLowerCase();
      let contentType = 'image/jpeg';
      if (extension === 'png') contentType = 'image/png';
      else if (extension === 'gif') contentType = 'image/gif';
      else if (extension === 'webp') contentType = 'image/webp';
      headers.set('Content-Type', contentType);
    }

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error fetching image from R2:", error);
    return new Response('Internal Server Error fetching image', { status: 500 });
  }
}
