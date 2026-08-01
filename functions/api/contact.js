const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value) {
  return String(value || "").trim();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const name = clean(body.name);
  const email = clean(body.email);
  const message = clean(body.message);
  const website = clean(body.website);
  const turnstileToken = clean(body.turnstileToken);

  if (website) {
    return jsonResponse({ ok: true });
  }

  if (!name || !email || !message || !turnstileToken) {
    return jsonResponse({ error: "Missing fields" }, 400);
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return jsonResponse({ error: "Message too long" }, 400);
  }

  if (!validEmail(email)) {
    return jsonResponse({ error: "Invalid email" }, 400);
  }

  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return jsonResponse({ error: "Server not configured" }, 503);
  }

  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: turnstileToken,
    }),
  });

  const verify = await verifyRes.json();
  if (!verify.success) {
    return jsonResponse({ error: "Verification failed" }, 403);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Server not configured" }, 503);
  }

  const to = env.CONTACT_TO || "ping@kenhelms.dev";
  const from = env.CONTACT_FROM || "forms@kenhelms.dev";
  const text = ["Name: " + name, "Email: " + email, "", message].join("\n");

  const mailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      reply_to: email,
      subject: "ping from " + name,
      text: text,
    }),
  });

  if (!mailRes.ok) {
    console.error("Resend error", mailRes.status, await mailRes.text());
    return jsonResponse({ error: "Could not send message" }, 502);
  }

  return jsonResponse({ ok: true });
}
