/**
 * Vercel Serverless Function: POST /api/verify-payment
 * Validates Krypton clientAnswer + kr-hash returned from KR.onSubmit in the browser.
 */

const { getIzipayConfig, setCorsHeaders, parseRequestBody, verifyKrHash } = require('./_lib/izipay');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method Not Allowed' });
  }

  try {
    const cfg = getIzipayConfig();
    const body = await parseRequestBody(req);

    const krAnswerRaw = body['kr-answer'] ?? body.rawClientAnswer;
    const krHash = body['kr-hash'] ?? body.hash;
    const krHashKey = body['kr-hash-key'] ?? body.hashKey ?? 'sha256_hmac';

    if (!krAnswerRaw || !krHash) {
      return res.status(400).json({
        valid: false,
        error: 'Faltan parámetros kr-answer o kr-hash'
      });
    }

    // Client return/onSubmit uses HMAC-SHA-256 key; fallback cleanly if kr-hash-key specifies password
    const secretKey = krHashKey === 'password' ? cfg.password : (cfg.hmacKey || cfg.password);
    if (!secretKey) {
      return res.status(500).json({
        valid: false,
        error: 'Clave HMAC-SHA-256 o contraseña REST no configurada en Vercel.'
      });
    }

    const valid = verifyKrHash(krAnswerRaw, krHash, secretKey);
    if (!valid) {
      console.warn('[IZIPAY VERIFY] Invalid signature detected', { mode: cfg.mode, krHashKey });
      return res.status(400).json({
        valid: false,
        error: 'Firma criptográfica inválida (kr-hash mismatch)'
      });
    }

    const answer = typeof krAnswerRaw === 'string' ? JSON.parse(krAnswerRaw) : krAnswerRaw;
    const tx = Array.isArray(answer.transactions) ? answer.transactions[0] : null;

    return res.status(200).json({
      valid: true,
      mode: cfg.mode,
      orderStatus: answer.orderStatus || 'UNKNOWN',
      orderId: answer.orderDetails?.orderId || '',
      amount: answer.orderDetails?.orderTotalAmount ? answer.orderDetails.orderTotalAmount / 100 : 0,
      currency: answer.orderDetails?.orderCurrency || 'PEN',
      transactionUuid: tx?.uuid || '',
      paymentMethod: tx?.paymentMethodType || 'CARD'
    });
  } catch (err) {
    console.error('[IZIPAY VERIFY] Error:', err);
    return res.status(500).json({ valid: false, error: err.message });
  }
};
