const { Issuer, generators } = require('openid-client');
const jwt = require('jsonwebtoken');
const { importJWK, SignJWT } = require('jose');

class FaydaOIDCService {
  constructor() {
    this.client = null;
    this.issuer = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (this.initialized) return;

      // Discover the OIDC issuer
      const issuerUrl = process.env.FAYDA_ISSUER_URL || 'https://fayda.gov.et/oidc';
      this.issuer = await Issuer.discover(issuerUrl);

      // Create OIDC client
      this.client = new this.issuer.Client({
        client_id: process.env.FAYDA_CLIENT_ID,
        client_secret: process.env.FAYDA_CLIENT_SECRET,
        redirect_uris: [process.env.FAYDA_REDIRECT_URI],
        response_types: ['code'],
        grant_types: ['authorization_code'],
        token_endpoint_auth_method: 'client_secret_post'
      });

      this.initialized = true;
      console.log('VeriFayda OIDC client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VeriFayda OIDC client:', error);
      throw error;
    }
  }

  // Generate authorization URL for Fayda ID login
  getAuthorizationUrl(state = null, nonce = null) {
    if (!this.initialized) {
      throw new Error('OIDC client not initialized');
    }

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    
    const authUrl = this.client.authorizationUrl({
      scope: 'openid profile email phone',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state || generators.state(),
      nonce: nonce || generators.nonce(),
    });

    return {
      authUrl,
      codeVerifier,
      state: state || generators.state(),
      nonce: nonce || generators.nonce()
    };
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code, codeVerifier, state, nonce) {
    try {
      if (!this.initialized) {
        throw new Error('OIDC client not initialized');
      }

      const tokenSet = await this.client.callback(
        process.env.FAYDA_REDIRECT_URI,
        { code, state },
        { code_verifier: codeVerifier, nonce }
      );

      return tokenSet;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Get user info from Fayda ID
  async getUserInfo(accessToken) {
    try {
      if (!this.initialized) {
        throw new Error('OIDC client not initialized');
      }

      const userinfo = await this.client.userinfo(accessToken);
      return userinfo;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  // Verify and decode ID token
  async verifyIdToken(idToken, nonce) {
    try {
      if (!this.initialized) {
        throw new Error('OIDC client not initialized');
      }

      const claims = await this.client.validateIdToken(idToken, nonce);
      return claims;
    } catch (error) {
      console.error('ID token verification error:', error);
      throw error;
    }
  }

  // Create JWT assertion for client authentication (if using private_key_jwt)
  async createClientAssertion() {
    try {
      const privateKey = process.env.FAYDA_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      // Decode base64 private key
      const keyData = Buffer.from(privateKey, 'base64').toString('utf-8');
      const jwk = JSON.parse(keyData);
      
      const key = await importJWK(jwk);
      
      const jwt = await new SignJWT({
        iss: process.env.FAYDA_CLIENT_ID,
        sub: process.env.FAYDA_CLIENT_ID,
        aud: this.issuer.token_endpoint,
        jti: generators.random(),
      })
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(key);

      return jwt;
    } catch (error) {
      console.error('Client assertion creation error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      if (!this.initialized) {
        throw new Error('OIDC client not initialized');
      }

      const tokenSet = await this.client.refresh(refreshToken);
      return tokenSet;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout URL
  getLogoutUrl(idTokenHint, postLogoutRedirectUri) {
    if (!this.initialized) {
      throw new Error('OIDC client not initialized');
    }

    return this.client.endSessionUrl({
      id_token_hint: idTokenHint,
      post_logout_redirect_uri: postLogoutRedirectUri || process.env.FRONTEND_URL
    });
  }

  // Extract Fayda ID from user claims
  extractFaydaId(claims) {
    // The Fayda ID might be in different claim fields depending on the implementation
    return claims.sub || claims.fayda_id || claims.national_id || claims.preferred_username;
  }

  // Map OIDC claims to user data
  mapClaimsToUserData(claims) {
    return {
      faydaId: this.extractFaydaId(claims),
      email: claims.email,
      phoneNumber: claims.phone_number || claims.phone,
      firstName: claims.given_name || claims.first_name,
      lastName: claims.family_name || claims.last_name,
      middleName: claims.middle_name,
      dateOfBirth: claims.birthdate,
      gender: claims.gender,
      profilePicture: claims.picture
    };
  }
}

// Create singleton instance
const faydaOIDCService = new FaydaOIDCService();

module.exports = faydaOIDCService;
