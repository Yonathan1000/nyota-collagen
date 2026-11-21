/**
 * Vercel Serverless Function: /api/create-payment
 * Generates an izipay formToken for the Krypton embedded payment form
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'PEN', orderId, customer } = req.body || {};

    const shopId = process.env.IZIPAY_SHOP_ID || '80459490';
    // Priority: environment variable IZIPAY_PASSWORD, fallback to candidate
    const password = process.env.IZIPAY_PASSWORD || 'testpassword_OVF7krOEJ8uaK8sCANDSsHTKelxfABJDn2mxd806UZG9Lu';
    const serverUrl = process.env.IZIPAY_SERVER || 'https://api.micuentaweb.pe';

    const cleanAmount = Math.round(Number(amount) * 100); // S/. 179 -> 17900
    const finalOrderId = orderId || `NYOTA-${Date.now()}`;

    const paymentPayload = {
      amount: cleanAmount,
      currency: currency,
      orderId: finalOrderId,
      customer: {
        email: customer?.email || 'ventas@nyota.pe',
        billingDetails: {
          firstName: customer?.name?.split(' ')[0] || 'Cliente',
          lastName: customer?.name?.split(' ').slice(1).join(' ') || 'NYOTA',
          phoneNumber: customer?.phone || '',
          identityType: customer?.docType || 'DNI',
          identityCode: customer?.dni || '',
          address: customer?.address || '',
          district: customer?.district || 'Lima',
          city: 'Lima',
          country: 'PE'
        }
      }
    };

    const auth = Buffer.from(`${shopId}:${password}`).toString('base64');

    const response = await fetch(`${serverUrl}/api-payment/V4/Charge/CreatePayment`, {
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
        formToken: data.answer.formToken,
        orderId: finalOrderId
      });
    } else {
      // Return details for error reporting / fallback
      return res.status(200).json({
        success: false,
        error: data.answer?.errorMessage || 'Error en pasarela izipay',
        errorCode: data.answer?.errorCode || 'AUTH_ERROR',
        raw: data
      });
    }
  } catch (err) {
    console.error('Server error in /api/create-payment:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
