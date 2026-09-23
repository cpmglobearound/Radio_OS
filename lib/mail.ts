import nodemailer, { type Transporter } from 'nodemailer'

let transport: Transporter | null = null
function t() {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transport
}

const rahmen = (titel: string, absaetze: string[], knopf?: { text: string; url: string }) => `<!doctype html><html><body style="margin:0;background:#f5f8fc;font-family:Barlow,Segoe UI,Arial,sans-serif;color:#181a32">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-weight:800;font-size:18px;margin-bottom:24px"><span style="background:linear-gradient(90deg,#008fb8,#8b5cf6,#ec4899);-webkit-background-clip:text;color:transparent">Klarframe Radio</span></div>
<div style="background:#fff;border:1px solid #dce4ef;border-radius:20px;padding:28px">
<h1 style="font-size:22px;margin:0 0 16px">${titel}</h1>
${absaetze.map(a => `<p style="line-height:1.55;margin:0 0 12px">${a}</p>`).join('')}
${knopf ? `<p style="margin:24px 0 8px"><a href="${knopf.url}" style="display:inline-block;background:#181a32;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${knopf.text}</a></p><p style="font-size:12px;color:#68728f;word-break:break-all">${knopf.url}</p>` : ''}
</div><p style="font-size:12px;color:#68728f;margin-top:20px">Klarframe Radio · radio.klarframe.com</p></div></body></html>`

/** Interne Konten (Prüf-Mandant, Testkonto) haben kein Postfach — keine Mails, sonst landen Rückläufer bei info@klarframe.com. */
const INTERN = /@radio\.klarframe\.com$/i

export async function sendeMail(an: string, betreff: string, titel: string, absaetze: string[], knopf?: { text: string; url: string }) {
  if (INTERN.test(an.trim())) return
  const text = [titel, '', ...absaetze, ...(knopf ? ['', `${knopf.text}: ${knopf.url}`] : [])].join('\n').replace(/<[^>]+>/g, '')
  await t().sendMail({ from: process.env.SMTP_FROM, to: an, subject: betreff, text, html: rahmen(titel, absaetze, knopf) })
}
