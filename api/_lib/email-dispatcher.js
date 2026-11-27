/**
 * Universal Order Email Dispatcher for NYOTA
 * Dispatches to nyotapedidos@gmail.com with multi-provider fallbacks:
 * 1. Resend API
 * 2. Nodemailer / Gmail SMTP
 * 3. Brevo API
 * 4. Safe Simulation & Audit Log
 */

const { generateOrderEmailHtml } = require('./email-template');

const TARGET_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || 'nyotapedidos@gmail.com';

async function dispatchOrderEmail({ orderId, customer, pricing, transaction, orderDate }) {
  if (!orderId) {
    throw new Error('Falta orderId en el payload');
  }

  const emailHtml = generateOrderEmailHtml({ orderId, customer, pricing, transaction, orderDate });
  const emailSubject = `✨ Nuevo Pedido Pagado con Tarjeta #${orderId} - ${(customer?.name || 'Cliente')} (S/. ${Number(pricing?.total || 0).toFixed(2)})`;

  let delivered = false;
  let providerUsed = 'none';
  let deliveryDetails = null;

  // Provider 1: Resend REST API (Zero-dependency, native fetch)
  if (!delivered && process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'NYOTA Pedidos <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [TARGET_EMAIL],
          subject: emailSubject,
          html: emailHtml
        })
      });

      const resendData = await resendRes.json();
      if (resendRes.ok && resendData.id) {
        delivered = true;
        providerUsed = 'resend';
        deliveryDetails = resendData;
        console.log(`[EMAIL DISPATCH] Sent via Resend to ${TARGET_EMAIL}:`, resendData.id);
      } else {
        console.warn('[EMAIL DISPATCH] Resend failed:', resendData);
      }
    } catch (err) {
      console.error('[EMAIL DISPATCH] Resend exception:', err.message);
    }
  }

  // Provider 2: Nodemailer / Gmail SMTP
  if (!delivered && (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS)) {
    try {
      let nodemailer;
      try {
        nodemailer = require('nodemailer');
      } catch (_) {
        // nodemailer optional
      }

      if (nodemailer) {
        const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || TARGET_EMAIL;
        const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = Number(process.env.SMTP_PORT || 465);

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        const info = await transporter.sendMail({
          from: `"NYOTA Ventas" <${smtpUser}>`,
          to: TARGET_EMAIL,
          subject: emailSubject,
          html: emailHtml
        });

        delivered = true;
        providerUsed = 'smtp-gmail';
        deliveryDetails = { messageId: info.messageId };
        console.log(`[EMAIL DISPATCH] Sent via SMTP to ${TARGET_EMAIL}:`, info.messageId);
      }
    } catch (err) {
      console.error('[EMAIL DISPATCH] SMTP exception:', err.message);
    }
  }

  // Provider 3: Brevo API
  if (!delivered && process.env.BREVO_API_KEY) {
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'NYOTA Pedidos', email: process.env.BREVO_SENDER || 'pedidos@nyota.pe' },
          to: [{ email: TARGET_EMAIL, name: 'NYOTA Despacho' }],
          subject: emailSubject,
          htmlContent: emailHtml
        })
      });

      const brevoData = await brevoRes.json();
      if (brevoRes.ok) {
        delivered = true;
        providerUsed = 'brevo';
        deliveryDetails = brevoData;
        console.log(`[EMAIL DISPATCH] Sent via Brevo to ${TARGET_EMAIL}:`, brevoData);
      } else {
        console.warn('[EMAIL DISPATCH] Brevo failed:', brevoData);
      }
    } catch (err) {
      console.error('[EMAIL DISPATCH] Brevo exception:', err.message);
    }
  }

  // Fallback: Safe Audit Log
  if (!delivered) {
    providerUsed = 'simulated-audit-log';
    console.log('====================================================');
    console.log(`[NYOTA ORDER NOTIFICATION TO: ${TARGET_EMAIL}]`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Cliente: ${customer?.name} | Cel: ${customer?.phone} | DNI: ${customer?.dni}`);
    console.log(`Destino: ${customer?.district} | Dirección: ${customer?.address}`);
    console.log(`Google Maps Link: ${customer?.mapsUrl || 'Sin GPS directo'}`);
    console.log(`Total: S/. ${Number(pricing?.total || 0).toFixed(2)}`);
    console.log('====================================================');
  }

  return {
    delivered,
    provider: providerUsed,
    targetEmail: TARGET_EMAIL,
    orderId,
    deliveryDetails,
    note: delivered
      ? 'Correo enviado exitosamente a nyotapedidos@gmail.com'
      : 'Registrado en logs de Vercel. Puedes configurar RESEND_API_KEY o GMAIL_APP_PASSWORD para entrega SMTP directa.'
  };
}

module.exports = { dispatchOrderEmail, TARGET_EMAIL };
