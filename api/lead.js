// Vercel Serverless Function — receives lead-magnet form posts from the
// Solutions pages (example-report downloads and "toughest question" forms)
// and emails them to partnerships@bigpicturebio.com.
//
// Setup (one-time):
//   1. Create a Resend account (https://resend.com) and verify the
//      bigpicturebio.com sending domain.
//   2. In the Vercel project settings, add an env var:  RESEND_API_KEY = <key>
//   3. (Optional) change FROM_ADDRESS below to a verified address.
//
// No npm dependency is required — this calls Resend's REST API with fetch,
// which is available in the Vercel Node.js runtime.

const TO_ADDRESS = "partnerships@bigpicturebio.com";
const FROM_ADDRESS = "Big Picture Bio site <noreply@bigpicturebio.com>";

function clean(v, max) {
  return String(v == null ? "" : v).slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    body = body || {};

    const email = clean(body.email, 200).trim();
    const kind = clean(body.kind, 20) || "question";
    const page = clean(body.page, 200);
    const report = clean(body.report, 120);
    const question = clean(body.question, 4000);

    if (!email || email.indexOf("@") < 1) {
      return res.status(400).json({ error: "Valid email required" });
    }

    const subject = kind === "report"
      ? `Report request: ${report || page}`
      : `Website question from ${email}`;

    const text = [
      `Kind:    ${kind}`,
      `Email:   ${email}`,
      `Page:    ${page}`,
      report ? `Report:  ${report}` : null,
      question ? `\nQuestion:\n${question}` : null
    ].filter(Boolean).join("\n");

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      // Don't 500 the user if email isn't wired up yet — log and accept.
      console.error("[lead] RESEND_API_KEY not set. Submission:\n" + text);
      return res.status(202).json({ ok: true, note: "logged (email not configured)" });
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: email,
        subject,
        text
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.error("[lead] Resend error", r.status, detail);
      return res.status(502).json({ error: "send failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[lead] handler error", err);
    return res.status(500).json({ error: "server error" });
  }
}
