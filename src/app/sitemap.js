export default function sitemap() {
  const baseUrl = 'https://talmotalk.com';

  // 주요 정적 페이지 라우트
  const routes = [
    '',
    '/diagnosis',
    '/community',
    '/hospitals',
    '/consult',
    '/search',
    '/login',
    '/signup',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  // 필요한 경우 데이터베이스에서 동적 페이지(예: 커뮤니티 게시글)를 불러와 추가할 수 있습니다.
  
  return routes;
}
