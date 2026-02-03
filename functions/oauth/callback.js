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

        if (!tokenResponse.ok) {
            const errorMsg = tokenData.error_description || tokenData.error || 'Token exchange failed';
            return Response.redirect(
                `${url.origin}/?error=token_error&error_description=${encodeURIComponent(errorMsg)}`,
                302
            );
        }

        // Encode token data and redirect to main page
        const encodedToken = btoa(JSON.stringify(tokenData));
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
