'use server'

import { Resend } from 'resend'
import QRCode from 'qrcode'

/** Mismo naranja que la app (tailwind orange-primary). */
const ORANGE_PRIMARY = '#F67010'

/**
 * Genera el PNG del QR con el mismo estilo que en la app: módulos blancos sobre fondo naranja.
 * Devuelve Base64 para adjuntos e inline (Resend usa Base64).
 */
async function generateQRBase64(content: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(content, {
    type: 'png',
    margin: 2,
    width: 400,
    color: { dark: '#FFFFFF', light: ORANGE_PRIMARY },
  })
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  return base64
}

export type SendReservationEmailParams = {
  to: string
  eventTitle: string
  reservationId: string
  ticketHolderName: string
}

/**
 * Envía un correo al usuario con el código QR de su reserva adjunto.
 * Si RESEND_API_KEY no está configurado o falla el envío, no lanza error (para no bloquear la reserva).
 */
export async function sendReservationEmailWithQR(
  params: SendReservationEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  const { to, eventTitle, reservationId, ticketHolderName } = params

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      '[email] RESEND_API_KEY no está en .env — añade RESEND_API_KEY para enviar el QR por correo. Obtén una en https://resend.com',
    )
    return { ok: false, error: 'RESEND_API_KEY no configurado' }
  }

  try {
    const qrBase64 = await generateQRBase64(reservationId)

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const from = fromEmail.includes('<') ? fromEmail : `Allons <${fromEmail}>`
    if (!process.env.RESEND_FROM_EMAIL) {
      console.warn(
        '[email] Usando onboarding@resend.dev. Configura RESEND_FROM_EMAIL (ej. tickets@thefndrs.com) en .env para tu dominio verificado.',
      )
    }

    console.log('[email] Enviando desde:', from, '→', to)

    // Cliente creado en cada envío para usar la API key actual de env (evita caché en serverless).
    const resend = new Resend(process.env.RESEND_API_KEY)

    const response = await resend.emails.send({
      from,
      to: [to],
      subject: `Tu código QR - ${eventTitle}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111; margin-bottom: 8px;">¡Reserva confirmada!</h2>
          <p style="color: #333;">Hola <strong>${escapeHtml(ticketHolderName)}</strong>,</p>
          <p style="color: #333;">Tu reserva para <strong>${escapeHtml(eventTitle)}</strong> está confirmada.</p>
          <p style="color: #333; margin-bottom: 24px;">Muestra este código QR al encargado en el evento para ingresar. También puedes verlo en la app en cualquier momento.</p>
          <div style="width: 280px; height: 280px; margin: 0 auto 24px; border-radius: 50%; overflow: hidden; background: ${ORANGE_PRIMARY};">
            <img src="cid:codigo-qr-reserva" alt="Código QR de acceso" width="280" height="280" style="display: block; width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <p style="color: #666; font-size: 14px;">— El equipo Allons</p>
        </div>
      `,
      attachments: [
        {
          filename: 'codigo-qr-reserva.png',
          content: qrBase64,
          contentType: 'image/png',
          inlineContentId: 'codigo-qr-reserva',
        },
      ],
    })

    const { data, error } = response

    if (error) {
      console.error('[email] Resend rechazó el envío:', error)
      return { ok: false, error: error.message }
    }

    // Resend devuelve { data: { id: "..." } } cuando acepta el envío. Si no hay id, algo raro pasó.
    if (data?.id) {
      console.log('[email] Resend aceptó el envío. Id:', data.id, '— Búscalo en https://resend.com/emails')
    } else {
      console.warn('[email] Resend no devolvió id. Respuesta completa:', JSON.stringify(response))
    }

    return { ok: true }
  } catch (err) {
    console.error('[email] Error generando/enviando correo con QR:', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
