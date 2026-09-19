const API_BASE = 'https://restapidhan.vercel.app/api/am';
const API_KEY = 'freeapikeydhan26';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  if (!email) return json({ status: false, message: 'Email wajib diisi' }, 400);
  return await callApi('send', email, null);
}

async function callApi(action, email, url) {
  const apiUrl = new URL(API_BASE);
  apiUrl.searchParams.set('action', action);
  apiUrl.searchParams.set('apikey', API_KEY);
  apiUrl.searchParams.set('email', email);
  if (url) apiUrl.searchParams.set('url', url);

  try {
    const res = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://amprem-generator-vell.netlify.app',
        'Referer': 'https://amprem-generator-vell.netlify.app/',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty'
      }
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { status: false, message: 'Response bukan JSON' }; }
    return json(data, 200);
  } catch (e) {
    return json({ status: false, message: 'Proxy error: ' + e.message }, 500);
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
