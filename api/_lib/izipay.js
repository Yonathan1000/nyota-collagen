/**
 * Shared server-side helpers for IZIPAY / MiCuentaWeb V4 REST API & IPN verification.
 * Files inside /api/_lib are not exposed as Vercel endpoints.
 */

const crypto = require('node:crypto');

function getIzipayConfig() {
  const shopId = (process.env.IZIPAY_SHOP_ID || '80459490').trim();
  const serverUrl = (process.env.IZIPAY_SERVER || 'https://api.micuentaweb.pe').trim().replace(/\/$/, '');

  // Determine active mode: explicit IZIPAY_MODE, or infer from IZIPAY_PASSWORD prefix
  const rawMode = (process.env.IZIPAY_MODE || '').trim().toUpperCase();
  const genericPassword = (process.env.IZIPAY_PASSWORD || '').trim();

  let mode = 'TEST';
  if (rawMode === 'PRODUCTION' || rawMode === 'PROD') {
    mode = 'PRODUCTION';
  } else if (rawMode === 'TEST') {
    mode = 'TEST';
  } else if (genericPassword.startsWith('prodpassword_')) {
    mode = 'PRODUCTION';
  }

  // Allow separate TEST and PROD env vars for effortless 1-switch transition,
  // while supporting single IZIPAY_PASSWORD / IZIPAY_PUBLIC_KEY / IZIPAY_HMAC_KEY.
  const password = (
    mode === 'PRODUCTION'
      ? (process.env.IZIPAY_PROD_PASSWORD || genericPassword)
      : (process.env.IZIPAY_TEST_PASSWORD || genericPassword)
  ).trim();

  const publicKey = (
    mode === 'PRODUCTION'
      ? (process.env.IZIPAY_PROD_PUBLIC_KEY || process.env.IZIPAY_PUBLIC_KEY || '')
      : (process.env.IZIPAY_TEST_PUBLIC_KEY || process.env.IZIPAY_PUBLIC_KEY || '')
  ).trim();

  const hmacKey = (
    mode === 'PRODUCTION'
      ? (process.env.IZIPAY_PROD_HMAC_KEY || process.env.IZIPAY_HMAC_KEY || '')
      : (process.env.IZIPAY_TEST_HMAC_KEY || process.env.IZIPAY_HMAC_KEY || '')
  ).trim();

  return {
    shopId,
    serverUrl,
    mode,
    password,
    publicKey,
    hmacKey,
    cdnUrl: 'https://static.micuentaweb.pe'
  };
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * Safely parses JSON or x-www-form-urlencoded bodies across Vercel Node runtimes,
 * preserving raw string values (critical for kr-answer HMAC verification).
 */
async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  let raw = '';
  if (typeof req.body === 'string') {
    raw = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    raw = req.body.toString('utf8');
  } else {
    raw = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }

  const trimmed = raw.trim();
  if (!trimmed) return {};

  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/json') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch (_) {
      // Fall through to form-urlencoded parsing
    }
  }

  const params = new URLSearchParams(raw);
  const parsed = {};
  for (const [k, v] of params.entries()) {
    parsed[k] = v;
  }
  return parsed;
}

/**
 * Timing-safe HMAC-SHA-256 verification for IZIPAY kr-answer / kr-hash.
 * Checks both exact payload and normalized forward-slash variant.
 */
function verifyKrHash(krAnswerRaw, receivedHash, secretKey) {
  if (!krAnswerRaw || !receivedHash || !secretKey) return false;

  const rawString = typeof krAnswerRaw === 'string'
    ? krAnswerRaw
    : JSON.stringify(krAnswerRaw);

  const received = String(receivedHash).trim().toLowerCase();
  const candidates = [rawString];
  const unescaped = rawString.replace(/\\\//g, '/');
  if (unescaped !== rawString) candidates.push(unescaped);

  for (const payload of candidates) {
    const calculated = crypto
      .createHmac('sha256', secretKey)
      .update(payload, 'utf8')
      .digest('hex')
      .toLowerCase();

    const calcBuf = Buffer.from(calculated, 'utf8');
    const recvBuf = Buffer.from(received, 'utf8');
    if (calcBuf.length === recvBuf.length && crypto.timingSafeEqual(calcBuf, recvBuf)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  getIzipayConfig,
  setCorsHeaders,
  parseRequestBody,
  verifyKrHash
};
