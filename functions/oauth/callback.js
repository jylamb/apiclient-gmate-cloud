export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Get query parameters
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Handle OAuth error
    if (error) {
        return Response.redirect(
            `${url.origin}/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
            302
        );
    }

    // Validate required parameters
    if (!code) {
        return Response.redirect(
            `${url.origin}/?error=missing_code&error_description=${encodeURIComponent('Authorization code not provided')}`,
            302
        );
    }

    try {
        // Get configuration from environment or use defaults
        const apiBaseUrl = env.API_BASE_URL || 'http://localhost:8080';
        const clientId = env.CLIENT_ID || '';
        const clientSecret = env.CLIENT_SECRET || '';
        const redirectUri = `${url.origin}/oauth/callback`;

        // Exchange authorization code for tokens
        const tokenResponse = await fetch(`${apiBaseUrl}/api/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
            })
        });

        const tokenData = await tokenResponse.json();

        // Gmate API 응답 구조: { success, data: {...}, error: {code, message}, meta: {...} }
        // 표준 OAuth 2.0 RFC 6749 와 다르므로 명시적으로 unwrap.
        if (!tokenResponse.ok || tokenData.success === false) {
            const errorMsg =
                tokenData?.error?.message ||
                tokenData?.error?.code ||
                tokenData?.error_description ||
                (typeof tokenData?.error === 'string' ? tokenData.error : null) ||
                'Token exchange failed';
            return Response.redirect(
                `${url.origin}/?error=token_error&error_description=${encodeURIComponent(errorMsg)}`,
                302
            );
        }

        // data 가 있으면 unwrap, 없으면 그대로 (RFC 표준 응답 fallback)
        const tokens = tokenData.data || tokenData;
        const encodedToken = btoa(JSON.stringify(tokens));
        return Response.redirect(
            `${url.origin}/?token_data=${encodeURIComponent(encodedToken)}`,
            302
        );

    } catch (err) {
        return Response.redirect(
            `${url.origin}/?error=server_error&error_description=${encodeURIComponent(err.message)}`,
            302
        );
    }
}
