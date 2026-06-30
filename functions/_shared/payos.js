// functions/_shared/payos.js

/**
 * Helper to compute HMAC-SHA256 signature using Web Crypto API.
 * Works seamlessly in Cloudflare Workers / Pages Functions runtime.
 */
async function hmacSha256(key, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create signature for PayOS payload or webhook data.
 * It sorts keys alphabetically (except 'signature'), concatenates as key=value&key=value,
 * and signs with checksumKey.
 */
export async function createPayosSignature(data, checksumKey) {
  const sortedKeys = Object.keys(data).sort();
  const queryParts = [];
  for (const key of sortedKeys) {
    if (key === 'signature') continue;
    let val = data[key];
    if (val === null || val === undefined) {
      val = '';
    }
    queryParts.push(`${key}=${val}`);
  }
  const signData = queryParts.join('&');
  return await hmacSha256(checksumKey, signData);
}

/**
 * Call PayOS API to create a payment link.
 * Calculates signature based on the 5 mandatory fields:
 * amount, cancelUrl, description, orderCode, returnUrl.
 */
export async function createPaymentLink(env, payload) {
  const clientId = env.PAYOS_CLIENT_ID;
  const apiKey = env.PAYOS_API_KEY;
  const checksumKey = env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error('PAYOS_CONFIG_MISSING');
  }

  // Pick only 5 mandatory fields for signing
  const signPayload = {
    amount: payload.amount,
    cancelUrl: payload.cancelUrl,
    description: payload.description,
    orderCode: payload.orderCode,
    returnUrl: payload.returnUrl,
  };

  const signature = await createPayosSignature(signPayload, checksumKey);

  const requestBody = {
    ...payload,
    signature,
  };

  const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
    method: 'POST',
    headers: {
      'x-client-id': clientId,
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const resJson = await response.json();
  if (resJson.code !== '00') {
    throw new Error(`PayOS Error: ${resJson.desc} (Code: ${resJson.code})`);
  }

  return resJson.data; // contains checkoutUrl, paymentLinkId, etc.
}

/**
 * Verify webhook signature received from PayOS.
 */
export async function verifyPayosWebhook(env, body) {
  const checksumKey = env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) {
    throw new Error('PAYOS_CHECKSUM_KEY_MISSING');
  }

  const { data, signature } = body;
  if (!data || !signature) {
    return false;
  }

  const computedSignature = await createPayosSignature(data, checksumKey);
  return computedSignature === signature;
}
