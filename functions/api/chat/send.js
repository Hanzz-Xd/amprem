export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const user = url.searchParams.get('user');
  const text = url.searchParams.get('text');
  if (!user || !text) return json({ status: false, message: 'user & text wajib diisi' }, 400);

  try {
    if (!env.CHAT_KV) return json({ status: false, message: 'KV belum di-setup.' }, 500);

    const cleanUser = String(user).trim().substring(0, 30).replace(/[\x00-\x1F\x7F]/g, '');
    const cleanText = String(text).trim().substring(0, 200).replace(/[\x00-\x1F\x7F]/g, '');
    if (!cleanUser || !cleanText) return json({ status: false, message: 'Pesan kosong' }, 400);

    const raw = await env.CHAT_KV.get('messages');
    let messages = raw ? JSON.parse(raw) : [];

    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.user === cleanUser && Date.now() - last.time < 3000) {
        return json({ status: false, message: 'Terlalu cepat, tunggu 3 detik.' }, 429);
      }
    }

    messages.push({
      id: Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      user: cleanUser,
      text: cleanText,
      time: Date.now()
    });

    if (messages.length > 100) messages = messages.slice(-100);
    await env.CHAT_KV.put('messages', JSON.stringify(messages));
    return json({ status: true });
  } catch (e) {
    return json({ status: false, message: 'Gagal kirim: ' + e.message }, 500);
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
