/**
 * Vercel Serverless Function: POST /api/ipn (and GET healthcheck)
 * Instant Payment Notification (Webhook) endpoint for IZIPAY / MiCuentaWeb V4.
 * Configure in Back Office -> Configuracion -> Reglas de notificaciones -> URL de notificacion al final del pago:
 * https://nyota-collagen.vercel.app/api/ipn
 */

const { getIzipayConfig, parseRequestBody, verifyKrHash } = require('./_lib/izipay');
const { dispatchOrderEmail } = require('./_lib/email-dispatcher');

module.exports = async (req, res) => {
  const cfg = getIzipayConfig();

  // Healthcheck for manual browser verification or monitoring
  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.status(200).json({
      status: 'ok',
      service: 'nyota-izipay-ipn',
      mode: cfg.mode,
      shopId: cfg.shopId,
      configured: Boolean(cfg.password)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = await parseRequestBody(req);
    const krAnswerRaw = body['kr-answer'];
    const krHash = body['kr-hash'];
    const krHashKey = body['kr-hash-key'] || 'password';

    if (!krAnswerRaw || !krHash) {
      console.warn('[IZIPAY IPN] Missing kr-answer or kr-hash');
      return res.status(400).send('Missing kr-answer or kr-hash');
    }

    // Per official izipay-pe / Lyra spec:
    // IPN uses API REST password when kr-hash-key == 'password', or HMAC-SHA-256 key when 'sha256_hmac'.
    const secretKey = krHashKey === 'sha256_hmac' ? cfg.hmacKey : cfg.password;

    if (!secretKey) {
      console.error('[IZIPAY IPN] Secret key missing for kr-hash-key:', krHashKey, 'mode:', cfg.mode);
      return res.status(500).send('Server configuration incomplete');
    }

    const isValid = verifyKrHash(krAnswerRaw, krHash, secretKey);
    if (!isValid) {
      console.warn('[IZIPAY IPN] Invalid signature', { mode: cfg.mode, krHashKey });
      return res.status(400).send('Invalid signature');
    }

    const answer = typeof krAnswerRaw === 'string' ? JSON.parse(krAnswerRaw) : krAnswerRaw;
    const orderStatus = answer.orderStatus || 'UNKNOWN';
    const orderId = answer.orderDetails?.orderId || 'unknown';
    const orderAmount = answer.orderDetails?.orderTotalAmount
      ? (answer.orderDetails.orderTotalAmount / 100).toFixed(2)
      : '0.00';
    const currency = answer.orderDetails?.orderCurrency || 'PEN';
    const tx = Array.isArray(answer.transactions) ? answer.transactions[0] : null;
    const transactionUuid = tx?.uuid || 'none';
    const paymentMethod = tx?.paymentMethodType || 'unknown';

    console.log(
      `[IZIPAY IPN VERIFIED] mode=${cfg.mode} shopId=${cfg.shopId} orderId=${orderId} status=${orderStatus} amount=${currency} ${orderAmount} tx=${transactionUuid} method=${paymentMethod}`
    );

    if (orderStatus === 'PAID') {
      const c = answer.customer || {};
      const meta = answer.metadata || {};
      const billing = c.billingDetails || {};
      const fullName = [billing.firstName, billing.lastName].filter(Boolean).join(' ') || c.name || 'Cliente';
      
      dispatchOrderEmail({
        orderId,
        customer: {
          name: fullName,
          phone: billing.phoneNumber || c.phone || '',
          dni: billing.identityCode || c.dni || '',
          email: c.email || '',
          destination: meta.destination || 'lima',
          district: billing.district || billing.city || 'Lima',
          address: billing.address || '',
          reference: meta.reference || '',
          deliveryNotes: meta.deliveryNotes || '',
          mapsUrl: meta.mapsUrl || ''
        },
        pricing: {
          total: Number(orderAmount),
          subtotal: Number(orderAmount),
          discountAmount: 0,
          shippingCost: 0
        },
        transaction: {
          transactionUuid,
          orderStatus,
          paymentMethod,
          currency
        }
      }).catch(e => console.warn('[IPN EMAIL DISPATCH SILENT ERR]', e));
    }

    // Exact 200 OK acknowledgement string expected by IZIPAY IPN validator
    return res.status(200).send(`OK! OrderStatus is ${orderStatus}`);
  } catch (err) {
    console.error('[IZIPAY IPN] Exception:', err);
    return res.status(500).send('Internal Server Error');
  }
};
