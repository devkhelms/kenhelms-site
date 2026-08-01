const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value) {
  return String(value || "").trim();
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const password = clean(body.password);
  if (!password) {
    return jsonResponse({ error: "Missing password" }, 400);
  }

  if (password.toLowerCase() !== "password") {
    return jsonResponse({ error: "magic_word" }, 403);
  }

  const kv = env.PASSWORD_EGG_KV;
  if (!kv) {
    return jsonResponse({ ok: true, count: null }, 200);
  }

  try {
    const raw = await kv.get("visits");
    const count = (parseInt(raw || "0", 10) || 0) + 1;
    await kv.put("visits", String(count));
    return jsonResponse({ ok: true, count }, 200);
  } catch (err) {
    console.error("KV error", err);
    return jsonResponse({ ok: true, count: null }, 200);
  }
}
