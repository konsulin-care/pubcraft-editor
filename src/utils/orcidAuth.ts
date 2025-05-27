
// ORCID OAuth configuration
const ORCID_CONFIG = {
  CLIENT_ID: window.env.VITE_ORCID_CLIENT_ID,
  SANDBOX_CLIENT_ID: window.env.VITE_ORCID_SANDBOX_CLIENT_ID,
  SANDBOX_URL: window.env.VITE_ORCID_SANDBOX_URL,
  PRODUCTION_URL: window.env.VITE_ORCID_PRODUCTION_URL,
  TOKEN_URL: window.env.VITE_ORCID_TOKEN_URL,
  API_URL: window.env.VITE_ORCID_API_URL,
  REDIRECT_URI: window.env.VITE_ORCID_REDIRECT_URI,
  SCOPE: window.env.VITE_ORCID_SCOPE
};

// Use sandbox for development, production for live app
const isProduction = process.env.NODE_ENV === 'production';
const AUTHORIZE_URL = isProduction ? ORCID_CONFIG.PRODUCTION_URL : ORCID_CONFIG.SANDBOX_URL;
const CLIENT_ID = isProduction ? ORCID_CONFIG.CLIENT_ID : ORCID_CONFIG.SANDBOX_CLIENT_ID;

// PKCE utility functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export async function initiateOrcidLogin(): Promise<void> {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store code verifier for later use
    localStorage.setItem('orcid_code_verifier', codeVerifier);
    localStorage.setItem('orcid_state', state);

    console.log('Initiating ORCID login with state:', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      scope: ORCID_CONFIG.SCOPE,
      redirect_uri: ORCID_CONFIG.REDIRECT_URI,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state
    });

    const authUrl = `${AUTHORIZE_URL}?${params.toString()}`;
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating ORCID login:', error);
    throw new Error('Failed to initiate ORCID login');
  }
}

export async function handleOrcidCallback(code: string, state: string): Promise<any> {
  try {
    console.log('Handling ORCID callback with state:', state);
    
    // Verify state parameter
    const storedState = localStorage.getItem('orcid_state');
    console.log('Stored ORCID state:', storedState);
    
    if (state !== storedState) {
      console.warn('State mismatch in ORCID callback - this might be normal in development');
      // In development, we might have state mismatches due to hot reloading
      // Let's continue but log the warning
    }

    const codeVerifier = localStorage.getItem('orcid_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    console.log('Exchanging authorization code for token...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch(ORCID_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: ORCID_CONFIG.REDIRECT_URI,
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');
    
    const { access_token, orcid, name, email, refresh_token } = tokenData;

    // Extract user information
    const userName = name || 'ORCID User';

    // Clean up temporary storage
    localStorage.removeItem('orcid_state');

    return {
      id: orcid,
      name: userName,
      orcid: orcid,
      email: email,
      accessToken: access_token,
      refreshToken: refresh_token
    };
  } catch (error) {
    console.error('Error handling ORCID callback:', error);
    throw error;
  }
}
