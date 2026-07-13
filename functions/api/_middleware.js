export const onRequest = async ({ request, next }) => {
  const requestedHeaders = request.headers.get("Access-Control-Request-Headers") || "*";

  // CORS Preflight 요청(OPTIONS) 처리
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": requestedHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // 실제 요청 처리 후 응답에 CORS 헤더 추가
  const response = await next();
  
  // Clone the response so we can modify the headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  newResponse.headers.set("Access-Control-Allow-Headers", requestedHeaders);
  
  return newResponse;
};
