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

async function resendFailureMessage(response) {
  const raw = await response.text();
  console.error("Resend error", response.status, raw);

  try {
    const data = JSON.parse(raw);
    const msg = String(data.message || data.error || "");

    if (msg.includes("only send testing emails")) {
      return "Sandbox mode: set CONTACT_TO to your Proton address, or verify kenhelms.dev in Resend.";
    }

    if (msg.includes("verify a domain") || msg.includes("not verified")) {
      return "Verify kenhelms.dev in Resend before using forms@kenhelms.dev.";
    }

    if (response.status === 401 || msg.toLowerCase().includes("api key")) {
      return "Invalid Resend API key. Update RESEND_API_KEY in Cloudflare.";
    }

    if (msg.includes("Invalid `from`")) {
      return "Invalid sender address. Check CONTACT_FROM in Cloudflare.";
    }
  } catch {
    /* ignore parse errors */
  }

  return "Could not send message.";
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

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    console.error(
      "Missing env:",
      !env.TURNSTILE_SECRET_KEY ? "TURNSTILE_SECRET_KEY" : "",
      !env.RESEND_API_KEY ? "RESEND_API_KEY" : ""
    );
    return jsonResponse({ error: "Server not configured" }, 503);
  }

  const secret = env.TURNSTILE_SECRET_KEY;

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
  const to = env.CONTACT_TO || "ping@kenhelms.dev";
  const from = env.CONTACT_FROM || "forms@kenhelms.dev";
  const text = ["Name: " + name, "Email: " + email, "", message].join("\n");

  const fromHeader = from.endsWith("@kenhelms.dev") ? "kenhelms.dev <" + from + ">" : from;

  const mailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      from: fromHeader,
      to: [to],
      reply_to: email,
      subject: "ping from " + name,
      text: text,
    }),
  });

  if (!mailRes.ok) {
    return jsonResponse({ error: await resendFailureMessage(mailRes) }, 502);
  }

  return jsonResponse({ ok: true });
}
