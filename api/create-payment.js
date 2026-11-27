/**
 * Vercel Serverless Function: POST /api/create-payment
 * Generates an izipay formToken via V4/Charge/CreatePayment and returns it with the active publicKey.
 */

const { getIzipayConfig, setCorsHeaders, parseRequestBody } = require('./_lib/izipay');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const cfg = getIzipayConfig();

    if (!cfg.password || !cfg.publicKey) {
      return res.status(200).json({
        success: false,
        errorCode: 'MISSING_CONFIG',
        mode: cfg.mode,
        missing: {
          password: !cfg.password,
          publicKey: !cfg.publicKey,
          hmacKey: !cfg.hmacKey
        },
        error: 'Faltan configurar las credenciales de IZIPAY en Vercel Environment Variables.'
      });
    }

    const body = await parseRequestBody(req);
    const { amount, currency = 'PEN', orderId, customer, metadata } = body || {};

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_AMOUNT',
        error: 'El monto del pedido debe ser mayor a 0.'
      });
    }

    const cleanAmount = Math.round(numericAmount * 100); // e.g., S/. 179.00 -> 17900
    const finalOrderId = String(orderId || `NYOTA-${Date.now()}`).slice(0, 64);

    const fullName = (customer?.name || 'Cliente NYOTA').trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'NYOTA';

    const dniRaw = String(customer?.dni || '').trim();
    const identityType = dniRaw.length === 11 ? 'RUC' : (customer?.docType || 'DNI');

    const paymentPayload = {
      amount: cleanAmount,
      currency: currency === 'USD' ? 'USD' : 'PEN',
      orderId: finalOrderId,
      formAction: 'PAYMENT',
      transactionOptions: {
        cardOptions: {
          installmentNumber: 0
        }
      },
      customer: {
        email: (customer?.email || 'ventas@nyota.pe').trim(),
        billingDetails: {
          firstName,
          lastName,
          phoneNumber: String(customer?.phone || '').replace(/\s+/g, ''),
          identityType,
          identityCode: dniRaw,
          address: (customer?.address || 'Lima, Perú').trim(),
          district: (customer?.district || 'Lima').trim(),
          city: (customer?.district || 'Lima').trim(),
          state: customer?.destination === 'provincias' ? (customer?.district || 'Perú').trim() : 'Lima',
          zipCode: '15001',
          country: 'PE'
        }
      },
      metadata: {
        source: 'nyota-collagen-web',
        mapsUrl: customer?.mapsUrl ? String(customer.mapsUrl).slice(0, 255) : '',
        reference: customer?.reference ? String(customer.reference).slice(0, 255) : '',
        deliveryNotes: customer?.deliveryNotes ? String(customer.deliveryNotes).slice(0, 255) : '',
        destination: customer?.destination || 'lima',
        ...(metadata && typeof metadata === 'object' ? metadata : {})
      }
    };

    const auth = Buffer.from(`${cfg.shopId}:${cfg.password}`).toString('base64');

    const response = await fetch(`${cfg.serverUrl}/api-payment/V4/Charge/CreatePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });

    const data = await response.json();

    if (data && data.status === 'SUCCESS' && data.answer?.formToken) {
      return res.status(200).json({
        success: true,
        mode: cfg.mode,
        shopId: cfg.shopId,
        orderId: finalOrderId,
        formToken: data.answer.formToken,
        publicKey: cfg.publicKey
      });
    }

    console.error('[IZIPAY CreatePayment ERROR]', {
      mode: cfg.mode,
      shopId: cfg.shopId,
      errorCode: data?.answer?.errorCode,
      errorMessage: data?.answer?.errorMessage
    });

    return res.status(200).json({
      success: false,
      mode: cfg.mode,
      errorCode: data?.answer?.errorCode || 'IZIPAY_ERROR',
      error: data?.answer?.errorMessage || 'Error en pasarela izipay'
    });
  } catch (err) {
    console.error('[IZIPAY CreatePayment EXCEPTION]', err);
    return res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      error: err.message
    });
  }
};
