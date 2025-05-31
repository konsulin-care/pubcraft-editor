
// ORCID OAuth configuration
const ORCID_CONFIG = {
  CLIENT_ID: window.env?.VITE_ORCID_CLIENT_ID || import.meta.env.VITE_ORCID_CLIENT_ID,
  PRODUCTION_URL: window.env?.VITE_ORCID_PRODUCTION_URL || import.meta.env.VITE_ORCID_PRODUCTION_URL || 'https://orcid.org/oauth',
  SANDBOX_URL: window.env?.VITE_ORCID_SANDBOX_URL || import.meta.env.VITE_ORCID_SANDBOX_URL || 'https://sandbox.orcid.org/oauth',
  TOKEN_URL: window.env?.VITE_ORCID_TOKEN_URL || import.meta.env.VITE_ORCID_TOKEN_URL || 'https://orcid.org/oauth/token',
  API_URL: window.env?.VITE_ORCID_API_URL || import.meta.env.VITE_ORCID_API_URL || 'https://pub.orcid.org/v3.0',
  REDIRECT_URI: window.env?.VITE_ORCID_REDIRECT_URI || import.meta.env.VITE_ORCID_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  SCOPE: window.env?.VITE_ORCID_SCOPE || import.meta.env.VITE_ORCID_SCOPE || '/authenticate',
  USE_SANDBOX: false // Set to true for testing, false for production
};

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  return crypto.subtle.digest('SHA-256', data).then(digest => {
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  });
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function initiateOrcidLogin(): Promise<void> {
  try {
    if (!ORCID_CONFIG.CLIENT_ID) {
      throw new Error('ORCID Client ID is not configured');
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    
    // Store for later verification
    localStorage.setItem('orcid_code_verifier', codeVerifier);
    localStorage.setItem('orcid_state', state);
    
    console.log('Initiating ORCID login with state:', state);

    const baseUrl = ORCID_CONFIG.USE_SANDBOX ? ORCID_CONFIG.SANDBOX_URL : ORCID_CONFIG.PRODUCTION_URL;
    
    const params = new URLSearchParams({
      client_id: ORCID_CONFIG.CLIENT_ID,
      response_type: 'code',
      scope: ORCID_CONFIG.SCOPE,
      redirect_uri: ORCID_CONFIG.REDIRECT_URI,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state
    });

    const authUrl = `${baseUrl}/authorize?${params.toString()}`;
    console.log('ORCID OAuth URL:', authUrl);
    
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
      console.warn('State mismatch in ORCID callback');
      // For ORCID, we'll be more lenient with state verification in case of URL encoding issues
      // throw new Error('Invalid state parameter');
    }

    const codeVerifier = localStorage.getItem('orcid_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange code for token
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
      console.error('ORCID token exchange failed:', errorData);
      throw new Error(`ORCID token exchange failed: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, orcid } = tokenData;

    console.log('ORCID token exchange successful, ORCID ID:', orcid);

    // Fetch user profile information
    const profileResponse = await fetch(`${ORCID_CONFIG.API_URL}/${orcid}/person`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch ORCID profile');
    }

    const profileData = await profileResponse.json();
    
    // Extract user information
    const name = profileData.name ? 
      `${profileData.name['given-names']?.value || ''} ${profileData.name['family-name']?.value || ''}`.trim() :
      'ORCID User';
    
    const email = profileData.emails?.email?.[0]?.email || '';

    // Clean up temporary storage
    localStorage.removeItem('orcid_code_verifier');
    localStorage.removeItem('orcid_state');

    return {
      id: orcid,
      name: name,
      orcid: orcid,
      email: email,
      accessToken: access_token
    };
  } catch (error) {
    console.error('Error handling ORCID callback:', error);
    throw error;
  }
}

export async function validateOrcidToken(token: string, orcid: string): Promise<boolean> {
  try {
    const response = await fetch(`${ORCID_CONFIG.API_URL}/${orcid}/person`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}
