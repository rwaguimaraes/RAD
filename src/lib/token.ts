const JWT_SECRET = process.env.JWT_SECRET || 'radiestesia-app-secure-jwt-secret-key-987654321';

// Base64URL encoding/decoding helpers
function base64url(source: ArrayBuffer | string): string {
  let binary = '';
  if (typeof source === 'string') {
    binary = btoa(unescape(encodeURIComponent(source)));
  } else {
    const bytes = new Uint8Array(source);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    binary = btoa(binary);
  }
  return binary
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

export interface JWTPayload {
  userId: string;
  username: string;
  email?: string;
  exp: number;
}

// Helper to get CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Generate JWT token (asynchronous)
export async function signToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
  
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify({ ...payload, exp }));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const enc = new TextEncoder();
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(signatureInput));
  
  const encodedSignature = base64url(signature);
  return `${signatureInput}.${encodedSignature}`;
}

// Verify JWT token (asynchronous)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;
    
    const enc = new TextEncoder();
    const key = await getCryptoKey();
    
    // Decode signature back to Uint8Array
    let base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const sigBinary = atob(base64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(signatureInput));
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(base64urlDecode(payload)) as JWTPayload;
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decodedPayload;
  } catch (err) {
    return null;
  }
}
