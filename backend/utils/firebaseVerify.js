import { createRemoteJWKSet, jwtVerify } from 'jose';

// Correct JWKS endpoint for Firebase ID tokens (securetoken)
// Docs: https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
// Use the JWK set URL (not the x509 certs URL) so jose can parse it.
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyFirebaseIdToken(idToken, projectId) {
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not configured');
  const issuer = `https://securetoken.google.com/${projectId}`;

  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer,
      audience: projectId,
      algorithms: ['RS256'],
    });

    if (!payload.sub) throw new Error('Invalid token: missing sub');
    return payload;
  } catch (err) {
    // Surface a clearer error for JWKS issues and auth failures
    const msg = err?.message || String(err);
    if (msg.toLowerCase().includes('jwks')) {
      throw new Error('Failed to fetch/parse Google JWKS (check network)');
    }
    throw err;
  }
}
