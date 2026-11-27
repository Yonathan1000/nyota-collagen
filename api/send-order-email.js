/**
 * Vercel Serverless Function: POST /api/send-order-email (and GET preview)
 * Dispatches a luxury NYOTA order email to nyotapedidos@gmail.com.
 */

const { setCorsHeaders, parseRequestBody } = require('./_lib/izipay');
const { generateOrderEmailHtml } = require('./_lib/email-template');
const { dispatchOrderEmail, TARGET_EMAIL } = require('./_lib/email-dispatcher');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Healthcheck and visual email preview for testing
  if (req.method === 'GET') {
    const isPreview = req.query?.preview === 'html';
    const sampleData = {
      orderId: 'NY-DEMO99',
      customer: {
        name: 'Camila Morales',
        phone: '999888777',
        dni: '74839201',
        email: 'camila.morales@ejemplo.pe',
        destination: 'lima',
        district: 'Miraflores',
        address: 'Av. Larco 743, Dpto 802',
        reference: 'Frente a Larcomar, edificio blanco',
        deliveryNotes: 'Por favor entregar por la tarde a partir de las 3pm',
        mapsUrl: 'https://www.google.com/maps?q=-12.1287,-77.0305'
      },
      pricing: {
        tier: 'duo',
        tierName: 'Pack Dúo (2 Frascos · 900 g) — Tratamiento 60 Días',
        quantity: 1,
        subtotal: 319.00,
        discountAmount: 31.90,
        shippingCost: 0,
        total: 287.10
      },
      transaction: {
        transactionUuid: 'tx_demo_izipay_98231',
        orderStatus: 'PAID',
        paymentMethod: 'CARD'
      }
    };

    if (isPreview) {
      const html = generateOrderEmailHtml(sampleData);
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.status(200).send(html);
    }

    return res.status(200).json({
      status: 'ok',
      service: 'nyota-send-order-email',
      targetEmail: TARGET_EMAIL,
      hasResend: Boolean(process.env.RESEND_API_KEY),
      hasGmailSmtp: true,
      hasBrevo: Boolean(process.env.BREVO_API_KEY)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const result = await dispatchOrderEmail(body || {});
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[EMAIL DISPATCH CRITICAL ERROR]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
