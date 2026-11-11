import { validateContact } from "@/lib/validation";

/**
 * Contact form endpoint. Sends mail through Resend's HTTP API.
 * Configure RESEND_API_KEY and CONTACT_TO_EMAIL (see README / .env.example).
 * Without them the endpoint returns 503 so the UI can show an honest error.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields; pretend success and drop it.
  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const input = {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    message: String(body.message ?? ""),
  };
  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "Please fix the highlighted fields.", errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return Response.json(
      { error: "The contact form isn't connected to an email service yet. Please email me directly." },
      { status: 503 },
    );
  }

  const escape = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email.trim(),
        subject: `Portfolio message from ${input.name.trim()}`,
        text: `From: ${input.name.trim()} <${input.email.trim()}>\n\n${input.message.trim()}`,
        html: `<p><strong>From:</strong> ${escape(input.name.trim())} &lt;${escape(input.email.trim())}&gt;</p><p style="white-space:pre-wrap">${escape(input.message.trim())}</p>`,
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return Response.json({ error: "Your message couldn't be sent. Please try again or email me directly." }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed", err);
    return Response.json({ error: "Your message couldn't be sent. Please try again or email me directly." }, { status: 502 });
  }
}
