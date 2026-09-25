import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import { RESEND_API_KEY, ORDER_EMAIL_TO, ORDER_EMAIL_BCC, ORDER_EMAIL_FROM } from 'astro:env/server';

/** Runs on demand (Vercel Function); the rest of the site stays static. */
export const prerender = false;

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(100),
  email: z.email('Please enter a valid email address'),
  /** The piece they're interested in ("Something custom" by default) */
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(5000),
  honeypot: z.string().max(0), // Anti-spam: must be empty
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const emailList = (s?: string) =>
  (s ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function orderEmail({ name, email, piece, message }: { name: string; email: string; piece: string; message: string }) {
  const text = [
    `New order request from ${name} <${email}>`,
    `Interested in: ${piece}`,
    '',
    message,
    '',
    '— Sent from the Texas Trinkets website. Reply to this email to answer them directly.',
  ].join('\n');

  const html = `<!doctype html>
<html><body style="margin:0;background:#f6efe3;font-family:Arial,Helvetica,sans-serif;color:#221a14">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="background:#3a2518;color:#f6efe3;border-radius:16px 16px 0 0;padding:22px 26px">
      <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#e8c9a0">Texas Trinkets · New order request</div>
      <div style="font-family:Georgia,serif;font-size:26px;margin-top:8px">${escapeHtml(piece)}</div>
    </div>
    <div style="background:#fffaf1;border:1px solid #e0d3c0;border-top:0;border-radius:0 0 16px 16px;padding:24px 26px">
      <p style="margin:0 0 6px;font-size:13px;color:#6e6258">From</p>
      <p style="margin:0 0 18px;font-size:16px"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}" style="color:#a3562b">${escapeHtml(email)}</a>&gt;</p>
      <p style="margin:0 0 6px;font-size:13px;color:#6e6258">Message</p>
      <p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p>
      <p style="margin:24px 0 0;font-size:12px;color:#6e6258">Hit reply to answer ${escapeHtml(name.split(' ')[0])} directly.</p>
    </div>
  </div>
</body></html>`;

  return { text, html };
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ success: false, errors: { form: ['Invalid form submission'] } }, 400);
  }

  const result = contactSchema.safeParse({
    name: formData.get('name')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    subject: formData.get('subject')?.toString() || undefined,
    message: formData.get('message')?.toString() ?? '',
    honeypot: formData.get('honeypot')?.toString() ?? '',
  });

  if (!result.success) {
    // Bots that fill the honeypot get a quiet "success"
    if (result.error.issues.some((i) => i.path[0] === 'honeypot')) return json({ success: true });

    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? 'form');
      (errors[field] ??= []).push(issue.message);
    }
    return json({ success: false, errors }, 400);
  }

  // Email not set up yet → tell the client to use its mailto fallback
  if (!RESEND_API_KEY || !ORDER_EMAIL_TO) {
    return json({ success: false, fallback: true, errors: { form: ['Email delivery is not configured'] } }, 503);
  }

  const { name, email, message } = result.data;
  const piece = result.data.subject || 'Something custom';
  const { text, html } = orderEmail({ name, email, piece, message });

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: ORDER_EMAIL_FROM ?? 'Texas Trinkets <onboarding@resend.dev>',
      to: emailList(ORDER_EMAIL_TO),
      bcc: emailList(ORDER_EMAIL_BCC),
      replyTo: email,
      subject: `Order request: ${piece} — ${name}`,
      text,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return json({ success: false, fallback: true, errors: { form: ['Could not send right now'] } }, 502);
    }

    return json({ success: true });
  } catch (err) {
    console.error('Order email failed:', err);
    return json({ success: false, fallback: true, errors: { form: ['Could not send right now'] } }, 502);
  }
};
