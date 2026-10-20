export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/whatsapp/webhook/route.ts",
        message: __jgnextApiErrorReportErr instanceof Error ? __jgnextApiErrorReportErr.message : String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr instanceof Error ? __jgnextApiErrorReportErr.stack : undefined,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function POST(request: Request) {
  try {
  try {
    const body = await request.json();
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return Response.json({ ok: true, ignored: true });
    }

    const from: string = message.from;
    const text: string = message.text?.body ?? '';

    const reply =
      'Olá! Recebemos sua mensagem: "' +
      text +
      '". Em breve um atendente responderá. Para reservas, acesse nosso site.';

    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (phoneId && accessToken) {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            type: 'text',
            text: { body: reply },
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error('WhatsApp send failed', res.status, errText);
      }
    } else {
      console.warn(
        'WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN)'
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('WhatsApp webhook error', err);
    return Response.json({ ok: false }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/whatsapp/webhook/route.ts",
        message: __jgnextApiErrorReportErr instanceof Error ? __jgnextApiErrorReportErr.message : String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr instanceof Error ? __jgnextApiErrorReportErr.stack : undefined,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
