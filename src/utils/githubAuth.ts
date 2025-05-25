// GitHub OAuth configuration
const GITHUB_CONFIG = {
  CLIENT_ID: 'your_github_client_id_here', // Replace with your GitHub OAuth app client ID
  AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
  TOKEN_URL: 'https://github.com/login/oauth/access_token',
  API_URL: 'https://api.github.com',
  REDIRECT_URI: `${window.location.origin}/auth/callback`,
  SCOPES: 'repo read:user'
};

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function initiateGitHubLogin(): Promise<void> {
  try {
    const state = generateState();
    
    // Store state for later verification
    sessionStorage.setItem('github_state', state);

    const params = new URLSearchParams({
      client_id: GITHUB_CONFIG.CLIENT_ID,
      redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
      scope: GITHUB_CONFIG.SCOPES,
      state: state,
      allow_signup: 'true'
    });

    const authUrl = `${GITHUB_CONFIG.AUTHORIZE_URL}?${params.toString()}`;
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating GitHub login:', error);
    throw new Error('Failed to initiate GitHub login');
  }
}

export async function handleGitHubCallback(code: string, state: string): Promise<{ username: string; token: string }> {
  try {
    // Verify state parameter
    const storedState = sessionStorage.getItem('github_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Note: In a production app, this token exchange should happen on your backend
    // to keep the client secret secure. For now, this is a mock implementation.
    console.warn('GitHub token exchange should be handled by your backend in production');
    
    // Mock token exchange - replace with actual backend call
    const tokenResponse = await fetch(GITHUB_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GITHUB_CONFIG.CLIENT_ID,
        // client_secret: 'YOUR_CLIENT_SECRET', // This should be handled by backend
        code: code,
        redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
        state: state
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`GitHub token exchange failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user information
    const userResponse = await fetch(`${GITHUB_CONFIG.API_URL}/user`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'ScholarWrite-App'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user profile');
    }

    const userData = await userResponse.json();
    
    // Clean up temporary storage
    sessionStorage.removeItem('github_state');

    return {
      username: userData.login,
      token: access_token
    };
  } catch (error) {
    console.error('Error handling GitHub callback:', error);
    throw error;
  }
}

export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_CONFIG.API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'ScholarWrite-App'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}
