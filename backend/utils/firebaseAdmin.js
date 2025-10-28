// Deprecated: This project no longer uses firebase-admin.
// Firebase ID tokens are verified using Google JWKS via `jose` in utils/firebaseVerify.js.
// This file is kept only to avoid import errors if referenced accidentally.

export function initFirebaseAdmin() {
  console.warn('[firebaseAdmin] Deprecated. Use utils/firebaseVerify.js instead.');
  return null;
}

export function getAdminInitInfo() {
  return { initialized: false, method: 'deprecated', error: 'firebase-admin not used' };
}

export function getAuthAdmin() {
  throw new Error('firebase-admin is deprecated in this project');
}
