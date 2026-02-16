'use server'

import { Resend } from 'resend'
import QRCode from 'qrcode'

const resend = new Resend(process.env.RESEND_API_KEY)

/** Genera un buffer PNG del código QR con el contenido dado */
async function generateQRBuffer(content: string): Promise<Buffer> {
  return QRCode.toBuffer(content, { type: 'png', margin: 2, width: 400 })
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
    const qrBuffer = await generateQRBuffer(reservationId)

    const from =
      process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    const { error } = await resend.emails.send({
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
          content: qrBuffer,
        },
      ],
    })

    if (error) {
      console.error('[email] Resend rechazó el envío:', error)
      return { ok: false, error: error.message }
    }

    console.log('[email] Correo con QR enviado a', to)
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
