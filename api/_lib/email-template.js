/**
 * Luxury HTML Email Template for NYOTA Orders
 * Optimized for Gmail, Apple Mail, Outlook and mobile clients.
 * Destination: nyotapedidos@gmail.com
 */

function generateOrderEmailHtml({ orderId, customer, pricing, transaction, orderDate }) {
  const c = customer || {};
  const p = pricing || {};
  const tx = transaction || {};
  const formattedDate = orderDate || new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const mapsUrl = c.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.address, c.district, 'Perú'].filter(Boolean).join(', '))}`;
  const cleanPhone = String(c.phone || '').replace(/\D/g, '');
  const waCustomerLink = cleanPhone ? `https://wa.me/51${cleanPhone.replace(/^51/, '')}?text=${encodeURIComponent(`¡Hola ${c.name || ''}! Te escribimos de NYOTA para confirmar la entrega de tu pedido #${orderId}.`)}` : null;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Pedido NYOTA #${orderId}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FDF5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-btn { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #FDF5F7;">
  <center>
    <!-- Master Container -->
    <table role="presentation" class="container-table" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(71, 25, 43, 0.08); border: 1px solid #F5DCE3;">
      
      <!-- Top Luxury Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #220913 0%, #47192B 60%, #782E4A 100%); padding: 36px 30px 32px 30px; text-align: center;">
          <div style="display: inline-block; padding: 4px 14px; border: 1px solid rgba(247, 198, 214, 0.4); border-radius: 50px; font-size: 10px; font-weight: 700; color: #F6C2D2; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 12px;">
            HAUTE WELLNESS &amp; BEAUTY
          </div>
          <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase;">
            NYOTA
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 1.5px; color: #E5CCD5; text-transform: uppercase; font-weight: 500;">
            Centro de Despacho y Logística
          </p>
        </td>
      </tr>

      <!-- Status Banner -->
      <tr>
        <td style="background-color: #FAF1F3; padding: 18px 30px; border-bottom: 1px solid #F5DCE3;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td>
                <span style="display: inline-block; background-color: #C84B69; color: #FFFFFF; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px;">
                  ✓ PAGO CON TARJETA CONFIRMADO
                </span>
                <div style="font-size: 20px; font-weight: 800; color: #111113; margin-top: 6px;">
                  Pedido #${orderId}
                </div>
                <div style="font-size: 12px; color: #5E5E66; margin-top: 2px;">
                  ${formattedDate}
                </div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 11px; text-transform: uppercase; color: #5E5E66; font-weight: 600;">Total Pagado</div>
                <div style="font-size: 24px; font-weight: 900; color: #C84B69;">
                  S/. ${Number(p.total || 0).toFixed(2)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td class="mobile-padding" style="padding: 30px;">
          
          <!-- SECTION 1: UBICACIÓN Y DESPACHO (PRIORIDAD LOGÍSTICA) -->
          <table role="presentation" style="width: 100%; background: linear-gradient(180deg, #FFF9FA 0%, #FDF5F7 100%); border: 1.5px solid #F5DCE3; border-radius: 16px; margin-bottom: 24px; overflow: hidden;">
            <tr>
              <td style="padding: 20px;">
                <table role="presentation" style="width: 100%; margin-bottom: 14px;">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #C84B69;">
                        📍 Destino de Entrega del Producto
                      </span>
                      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #111113;">
                        ${c.district || 'Lima'}, ${c.destination === 'provincias' ? 'Provincia' : 'Lima Metropolitana'}
                      </h2>
                    </td>
                  </tr>
                </table>

                <table role="presentation" style="width: 100%; font-size: 13px; color: #111113; line-height: 1.6; margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 4px 0; color: #5E5E66; width: 110px; vertical-align: top;"><strong>Dirección:</strong></td>
                    <td style="padding: 4px 0; font-weight: 600;">${c.address || 'Por coordinar'}</td>
                  </tr>
                  ${c.reference ? `
                  <tr>
                    <td style="padding: 4px 0; color: #5E5E66; vertical-align: top;"><strong>Referencia:</strong></td>
                    <td style="padding: 4px 0; color: #111113;">${c.reference}</td>
                  </tr>
                  ` : ''}
                  ${c.deliveryNotes ? `
                  <tr>
                    <td style="padding: 4px 0; color: #5E5E66; vertical-align: top;"><strong>Horario / Notas:</strong></td>
                    <td style="padding: 4px 0; color: #C84B69; font-weight: 600;">${c.deliveryNotes}</td>
                  </tr>
                  ` : ''}
                </table>

                <!-- GOOGLE MAPS CALL TO ACTION BUTTON -->
                <div style="text-align: center; margin-top: 10px;">
                  <a href="${mapsUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #C84B69; color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; padding: 13px 24px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(200, 75, 105, 0.35);">
                    🗺️ ABRIR UBICACIÓN EXACTA EN GOOGLE MAPS
                  </a>
                </div>

                <div style="text-align: center; margin-top: 10px;">
                  <a href="${mapsUrl}" target="_blank" style="font-size: 11px; color: #8A7B80; text-decoration: underline; word-break: break-all;">
                    ${mapsUrl}
                  </a>
                </div>
              </td>
            </tr>
          </table>

          <!-- SECTION 2: DATOS DE LA CLIENTA -->
          <table role="presentation" style="width: 100%; border: 1px solid #F5DCE3; border-radius: 14px; margin-bottom: 24px; background-color: #FFFFFF;">
            <tr>
              <td style="padding: 18px 20px; border-bottom: 1px solid #F5DCE3; background-color: #FAF1F3; border-top-left-radius: 14px; border-top-right-radius: 14px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #C84B69;">
                  👤 Información del Cliente
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 20px; font-size: 13px; color: #111113; line-height: 1.8;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="color: #5E5E66; width: 120px;"><strong>Nombre:</strong></td>
                    <td style="font-weight: 700; color: #111113;">${c.name || 'Cliente NYOTA'}</td>
                  </tr>
                  <tr>
                    <td style="color: #5E5E66;"><strong>Teléfono / WhatsApp:</strong></td>
                    <td style="font-weight: 700;">
                      <a href="tel:${cleanPhone}" style="color: #111113; text-decoration: none;">${c.phone || 'No registrado'}</a>
                      ${waCustomerLink ? `
                        <a href="${waCustomerLink}" target="_blank" style="margin-left: 8px; display: inline-block; background-color: #25D366; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-decoration: none;">
                          Chat WhatsApp
                        </a>
                      ` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #5E5E66;"><strong>DNI / RUC:</strong></td>
                    <td style="font-weight: 600; color: #111113;">${c.dni || 'No proporcionado'}</td>
                  </tr>
                  <tr>
                    <td style="color: #5E5E66;"><strong>Email:</strong></td>
                    <td>
                      <a href="mailto:${c.email || ''}" style="color: #C84B69; font-weight: 600; text-decoration: none;">${c.email || 'No proporcionado'}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- SECTION 3: RESUMEN DE COMPRA & PRODUCTOS -->
          <table role="presentation" style="width: 100%; border: 1px solid #F5DCE3; border-radius: 14px; margin-bottom: 24px; background-color: #FFFFFF;">
            <tr>
              <td style="padding: 18px 20px; border-bottom: 1px solid #F5DCE3; background-color: #FAF1F3; border-top-left-radius: 14px; border-top-right-radius: 14px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #C84B69;">
                  🛍️ Resumen del Pedido
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <!-- Product row -->
                <table role="presentation" style="width: 100%; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dashed #F5DCE3;">
                  <tr>
                    <td>
                      <div style="font-weight: 800; font-size: 14px; color: #111113;">
                        ${p.tierName || (p.tier === 'single' ? '1 Frasco (450 g) — Tratamiento 30 Días' : 'Pack Dúo (2 Frascos · 900 g) — Tratamiento 60 Días')}
                      </div>
                      <div style="font-size: 12px; color: #5E5E66; margin-top: 3px;">
                        Cantidad: <strong>${p.quantity || 1} unidad(es)</strong> · Colágeno Hidrolizado Marino + Ácido Hialurónico
                      </div>
                    </td>
                    <td style="text-align: right; vertical-align: top; font-weight: 800; font-size: 14px; color: #111113; white-space: nowrap;">
                      S/. ${Number(p.subtotal || 0).toFixed(2)}
                    </td>
                  </tr>
                </table>

                <!-- Financial Breakdown -->
                <table role="presentation" style="width: 100%; font-size: 12px; color: #5E5E66; line-height: 1.8;">
                  <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right; color: #111113; font-weight: 600;">S/. ${Number(p.subtotal || 0).toFixed(2)}</td>
                  </tr>
                  ${Number(p.discountAmount || 0) > 0 ? `
                  <tr>
                    <td style="color: #00897B; font-weight: 600;">Descuento 1ª Compra (-10%):</td>
                    <td style="text-align: right; color: #00897B; font-weight: 700;">- S/. ${Number(p.discountAmount).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td>Envío (${c.destination === 'provincias' ? 'Provincia' : 'Lima Metropolitana'}):</td>
                    <td style="text-align: right; color: #111113; font-weight: 600;">${Number(p.shippingCost || 0) === 0 ? 'Gratis' : `S/. ${Number(p.shippingCost).toFixed(2)}`}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 8px;">
                      <table role="presentation" style="width: 100%; border-top: 2px solid #F5DCE3; padding-top: 8px;">
                        <tr>
                          <td style="font-size: 14px; font-weight: 800; color: #111113;">TOTAL COBRADO:</td>
                          <td style="text-align: right; font-size: 18px; font-weight: 900; color: #C84B69;">S/. ${Number(p.total || 0).toFixed(2)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- SECTION 4: DATOS DE LA TRANSACCIÓN IZIPAY -->
          <table role="presentation" style="width: 100%; background-color: #FAF1F3; border-radius: 12px; padding: 14px 18px; font-size: 11px; color: #5E5E66; line-height: 1.6;">
            <tr>
              <td>
                <strong style="color: #111113;">Pasarela:</strong> IZIPAY Online (Visa, MC, Amex)<br>
                <strong style="color: #111113;">ID Transacción:</strong> <span style="font-family: monospace; color: #220913;">${tx.transactionUuid || 'dpl_verified'}</span><br>
                <strong style="color: #111113;">Estado de Pago:</strong> <span style="color: #00897B; font-weight: 800;">${tx.orderStatus || 'PAID'} (Validado)</span>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #220913; padding: 26px 30px; text-align: center; color: #E5CCD5; font-size: 11px; line-height: 1.6;">
          <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #FFFFFF; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
            NYOTA COLLAGEN ENERGY
          </div>
          <div>Este es un correo automático generado al confirmar un pago en línea.</div>
          <div style="margin-top: 4px; color: #F6C2D2; font-weight: 600;">Destinatario oficial: nyotapedidos@gmail.com</div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}

module.exports = { generateOrderEmailHtml };
