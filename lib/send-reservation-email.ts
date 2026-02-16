'use server'

import { Resend } from 'resend'
import QRCode from 'qrcode'

/** Genera el PNG del QR en Base64 (Resend requiere Base64 para adjuntos según la doc). */
async function generateQRBase64(content: string): Promise<string> {
  const buffer = await QRCode.toBuffer(content, { type: 'png', margin: 2, width: 400 })
  return buffer.toString('base64')
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
        <h2>¡Reserva confirmada!</h2>
        <p>Hola <strong>${escapeHtml(ticketHolderName)}</strong>,</p>
        <p>Tu reserva para <strong>${escapeHtml(eventTitle)}</strong> está confirmada.</p>
        <p>Adjunto encontrarás tu código QR. Muestra este código al encargado en el evento para ingresar.</p>
        <p>También puedes ver tu código en la app en cualquier momento.</p>
        <p>— El equipo</p>
      `,
      attachments: [
        {
          filename: 'codigo-qr-reserva.png',
          content: qrBase64,
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
