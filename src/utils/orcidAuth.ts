
// ORCID OAuth configuration
const ORCID_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_ORCID_CLIENT_ID,
  SANDBOX_URL: import.meta.env.VITE_ORCID_SANDBOX_URL,
  PRODUCTION_URL: import.meta.env.VITE_ORCID_PRODUCTION_URL,
  TOKEN_URL: import.meta.env.VITE_ORCID_TOKEN_URL,
  API_URL: import.meta.env.VITE_ORCID_API_URL,
  REDIRECT_URI: import.meta.env.VITE_ORCID_REDIRECT_URI,
  SCOPE: import.meta.env.VITE_ORCID_SCOPE
};

// Use sandbox for development, production for live app
const isProduction = process.env.NODE_ENV === 'production';
const AUTHORIZE_URL = isProduction ? ORCID_CONFIG.PRODUCTION_URL : ORCID_CONFIG.SANDBOX_URL;

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

    const params = new URLSearchParams({
      client_id: ORCID_CONFIG.CLIENT_ID,
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
    // Verify state parameter
    const storedState = localStorage.getItem('orcid_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    const codeVerifier = localStorage.getItem('orcid_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(ORCID_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: ORCID_CONFIG.CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: ORCID_CONFIG.REDIRECT_URI,
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, orcid, name } = tokenData;

    // Fetch user profile data
    const profileResponse = await fetch(`${ORCID_CONFIG.API_URL}/${orcid}/person`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();
    
    // Extract user information
    const userName = name || 
      profileData.name?.['given-names']?.value + ' ' + profileData.name?.['family-name']?.value ||
      'ORCID User';

    const email = profileData.emails?.email?.[0]?.email;

    // Clean up temporary storage
    localStorage.removeItem('orcid_state');

    return {
      id: orcid,
      name: userName,
      orcid: orcid,
      email: email,
      accessToken: access_token
    };
  } catch (error) {
    console.error('Error handling ORCID callback:', error);
    throw error;
  }
}
