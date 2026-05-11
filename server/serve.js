/**
 * server/serve.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Production server :
 *   - Serves the built React app from ../dist/
 *   - Exposes POST /api/send-email  (Nodemailer → Hostinger SMTP)
 *   - Exposes GET  /api/health
 *
 * Usage :
 *   1. npm run build          (build the React frontend)
 *   2. node server/serve.js   (start this server)
 *   3. Open http://localhost:3001
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// ─── Serve React build ────────────────────────────────────────────────────────
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// ─── Nodemailer transporter ───────────────────────────────────────────────────
function createTransporter() {
  const port   = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    requireTLS: !secure,
    tls: { rejectUnauthorized: true },
  });
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    smtp_host: process.env.SMTP_HOST,
    smtp_user: process.env.SMTP_USER,
    timestamp: new Date().toISOString(),
  });
});

// ─── Send email endpoint ──────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { userInfo, questions } = req.body;

  if (!userInfo?.firstName || !userInfo?.lastName || !userInfo?.email) {
    return res.status(400).json({ ok: false, error: 'Données participant manquantes.' });
  }
  if (!Array.isArray(questions) || questions.length !== 3) {
    return res.status(400).json({ ok: false, error: 'Les trois réponses sont requises.' });
  }
  if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'REMPLACE_PAR_TON_MOT_DE_PASSE_SMTP') {
    return res.status(503).json({
      ok: false,
      error: "Serveur email non configuré. Renseignez SMTP_PASS dans server/.env.",
      code: 'SMTP_NOT_CONFIGURED',
    });
  }

  const now     = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const subject = `Transcription activité 1 - ${userInfo.firstName} ${userInfo.lastName}`;

  const textBody = [
    'Transcription Activité 1 - Aide Soignant',
    '═══════════════════════════════════════',
    '',
    `Participant : ${userInfo.firstName} ${userInfo.lastName}`,
    `Email       : ${userInfo.email}`,
    `Date        : ${dateStr}`,
    '',
    '───────────────────────────────────────',
    '',
    ...questions.flatMap((q, i) => [
      `Question ${i + 1} : ${q.question}`,
      'Réponse :',
      q.answer || '(aucune réponse)',
      '',
      i < 2 ? '───────────────────────────────────────' : '',
      '',
    ]),
    '═══════════════════════════════════════',
    "Envoyé depuis l'application Questions Activité 1 — Savoirscope",
  ].join('\n');

  const htmlBody = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f7ff;margin:0;padding:20px;color:#1e293b}
  .w{max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(14,165,233,.12)}
  .h{background:linear-gradient(135deg,#38bdf8,#3b82f6);padding:32px 28px;text-align:center}
  .h h1{color:#fff;margin:0;font-size:20px;font-weight:700}.h p{color:rgba(255,255,255,.85);margin:6px 0 0;font-size:13px}
  .b{padding:28px}.meta{background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin-bottom:24px}
  .meta p{margin:4px 0;font-size:14px;color:#0369a1}.meta strong{color:#0c4a6e}
  .qb{background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #38bdf8;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:16px}
  .ql{font-size:12px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
  .qt{font-size:14px;color:#475569;font-style:italic;margin-bottom:12px}
  .qa{font-size:15px;color:#1e293b;line-height:1.65;white-space:pre-wrap}
  .f{background:#f0f9ff;border-top:1px solid #bae6fd;padding:16px 28px;text-align:center}
  .f p{margin:0;font-size:12px;color:#64748b}.f a{color:#0ea5e9;text-decoration:none}
</style></head><body>
<div class="w">
  <div class="h"><h1>📋 Transcription Activité 1</h1><p>Aide Soignant — Savoirscope</p></div>
  <div class="b">
    <div class="meta">
      <p><strong>👤 Participant :</strong> ${userInfo.firstName} ${userInfo.lastName}</p>
      <p><strong>📧 Email :</strong> ${userInfo.email}</p>
      <p><strong>📅 Date :</strong> ${dateStr}</p>
    </div>
    ${questions.map((q, i) => `
    <div class="qb">
      <div class="ql">Question ${i + 1}</div>
      <div class="qt">${q.question}</div>
      <div class="qa">${q.answer || '<em style="color:#94a3b8">(aucune réponse)</em>'}</div>
    </div>`).join('')}
  </div>
  <div class="f"><p>Envoyé par <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_FROM_NAME || 'Savoirscope'}</a><br/>Aucune donnée stockée côté serveur.</p></div>
</div></body></html>`;

  try {
    const transporter = createTransporter();
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Savoirscope – Activité 1'}" <${process.env.SMTP_USER}>`,
      to: ['raletouletan@gmail.com', userInfo.email].join(', '),
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`[SMTP] ✅ Email envoyé : ${info.messageId}`);
    return res.json({ ok: true, messageId: info.messageId, recipients: ['raletouletan@gmail.com', userInfo.email], sentAt: now.toISOString() });
  } catch (err) {
    console.error('[SMTP] ❌ Erreur :', err);
    let error = "Erreur inconnue lors de l'envoi.";
    let code  = 'UNKNOWN';
    if (err.code === 'ECONNREFUSED')                                   { error = `Impossible de joindre ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}.`; code = 'ECONNREFUSED'; }
    else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET')       { error = 'Délai dépassé — le serveur SMTP ne répond pas.'; code = 'TIMEOUT'; }
    else if (err.responseCode === 535 || err.response?.includes('535')){ error = 'Authentification échouée : mot de passe SMTP incorrect.'; code = 'AUTH_FAILED'; }
    else if (err.responseCode === 550)                                  { error = 'Adresse email rejetée par le serveur.'; code = 'RECIPIENT_REJECTED'; }
    else if (err.responseCode === 421 || err.responseCode === 451)     { error = 'Serveur SMTP temporairement indisponible. Réessayez.'; code = 'SERVER_UNAVAILABLE'; }
    else if (err.message)                                              { error = err.message; }
    return res.status(502).json({ ok: false, error, code });
  }
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré → http://localhost:${PORT}`);
  console.log(`   SMTP  : ${process.env.SMTP_USER}@${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`   API   : POST http://localhost:${PORT}/api/send-email`);
  console.log(`   Front : http://localhost:${PORT}\n`);
});
