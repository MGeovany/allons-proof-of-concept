import { NextResponse } from 'next/server'

/**
 * GET /api/test-resend — Prueba el envío a Resend con la API REST directa.
 * Abre en el navegador: http://localhost:3000/api/test-resend
 * Verás la respuesta cruda de Resend (status, body). Si status=200 y body.id existe,
 * la key funciona pero los emails aparecen en la cuenta de esa key (puede ser otra cuenta).
 */
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const from = fromEmail.includes('<') ? fromEmail : `Allons <${fromEmail}>`

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY no está en .env' },
      { status: 500 },
    )
  }

  const body = {
    from,
    to: ['delivered@resend.dev'],
    subject: 'Test Allons - ' + new Date().toISOString(),
    html: '<p>Si ves este correo en Resend, la API key y el dominio funcionan.</p>',
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    json = text
  }

  return NextResponse.json({
    resendStatus: res.status,
    resendStatusText: res.statusText,
    resendBody: json,
    message:
      res.status === 200
        ? 'Resend aceptó el envío. Revisa la pestaña Emails en la MISMA cuenta donde creaste esta API key. Si no ves el email, la key es de otra cuenta.'
        : res.status === 401
          ? 'API key inválida o revocada. Crea una nueva en Resend → API Keys (en la cuenta donde ves "No sent emails yet").'
          : 'Revisa resendBody para el error.',
  })
}
