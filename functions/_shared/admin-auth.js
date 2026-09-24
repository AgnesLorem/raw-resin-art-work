// functions/_shared/admin-auth.js

const DEFAULT_SECRET = 'raw_admin_secret_su26';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(env) {
  return (env && env.ADMIN_SECRET) ? env.ADMIN_SECRET : DEFAULT_SECRET;
}

async function getCryptoKey(secretStr) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArrayBuffer(hex) {
  if (!hex || typeof hex !== 'string' || hex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('MALFORMED_HEX');
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 64; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Generate a signed session token: <timestamp>.<signature>
 */
export async function generateAdminToken(env) {
  const secret = getSecret(env);
  const key = await getCryptoKey(secret);
  const now = Date.now();
  const payload = `admin_${now}`;
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = arrayBufferToHex(signature);
  const token = `${now}.${sigHex}`;
  return {
    token,
    expiresAt: now + TOKEN_TTL_MS,
  };
}

/**
 * Verify request Authorization header: Bearer <token>
 */
export async function verifyAdminToken(request, env) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'MISSING_OR_INVALID_AUTH_HEADER' };
    }
    const token = authHeader.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'MALFORMED_TOKEN' };
    }
    const [timestampStr, sigHex] = parts;
    if (!/^\d{12,15}$/.test(timestampStr)) {
      return { valid: false, error: 'INVALID_TIMESTAMP' };
    }
    const timestamp = Number(timestampStr);
    if (!Number.isSafeInteger(timestamp)) {
      return { valid: false, error: 'INVALID_TIMESTAMP' };
    }
    // Check expiration (allow up to 60s future skew)
    const now = Date.now();
    if (now - timestamp > TOKEN_TTL_MS || timestamp > now + 60000) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }
    if (!/^[0-9a-fA-F]{64}$/.test(sigHex)) {
      return { valid: false, error: 'MALFORMED_SIGNATURE' };
    }
    const secret = getSecret(env);
    const key = await getCryptoKey(secret);
    const payload = `admin_${timestamp}`;
    const enc = new TextEncoder();
    const sigBuffer = hexToArrayBuffer(sigHex);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBuffer, enc.encode(payload));
    if (!isValid) {
      return { valid: false, error: 'SIGNATURE_MISMATCH' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
