/**
 * Vercel Serverless Function: GET /api/config
 * Exposes safe public gateway metadata (shopId, mode, publicKey) without leaking secret keys.
 */

const { getIzipayConfig, setCorsHeaders } = require('./_lib/izipay');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cfg = getIzipayConfig();

  return res.status(200).json({
    configured: Boolean(cfg.password && cfg.publicKey),
    mode: cfg.mode,
    shopId: cfg.shopId,
    publicKey: cfg.publicKey || null,
    cdnUrl: cfg.cdnUrl,
    hasPassword: Boolean(cfg.password),
    hasHmacKey: Boolean(cfg.hmacKey)
  });
};
