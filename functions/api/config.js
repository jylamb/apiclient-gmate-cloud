/**
 * GET /api/config
 *
 * Cloudflare Pages 환경변수 (wrangler.toml [vars] / [env.production].vars + Dashboard secrets) 를
 * 브라우저 JS 가 동적으로 가져갈 수 있게 노출한다.
 *
 * CLIENT_SECRET 은 의도적으로 미포함 (서버 사이드 callback.js 에서만 사용).
 */
export async function onRequest(context) {
    const { env } = context;
    return new Response(
        JSON.stringify({
            api_base_url: env.API_BASE_URL || 'http://localhost:8080',
            client_id: env.CLIENT_ID || '',
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
            },
        }
    );
}
