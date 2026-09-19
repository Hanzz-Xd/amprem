export async function onRequest(context) {
  const { env } = context;
  try {
    if (!env.CHAT_KV) return json({ status: false, message: 'KV belum di-setup.' }, 500);
    const raw = await env.CHAT_KV.get('messages');
    const messages = raw ? JSON.parse(raw) : [];
    const recent = messages.slice(-50);
    return json({ status: true, messages: recent });
  } catch (e) {
    return json({ status: false, message: 'Gagal load chat: ' + e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}
