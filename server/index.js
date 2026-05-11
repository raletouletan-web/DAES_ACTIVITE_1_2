/**
 * server/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight Express API for sending emails via Hostinger SMTP (Nodemailer).
 * The SMTP password lives ONLY in server/.env — it is NEVER sent to the client.
 *
 * Endpoints:
 *   POST /api/send-email   — sends the transcription email
 *   GET  /api/health       — health check
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite dev
      'http://localhost:4173', // Vite preview
      /^http:\/\/localhost:\d+$/, // any local port
    ],
    methods: ['GET', 'POST'],
  })
);

// ─── Nodemailer transporter ───────────────────────────────────────────────────
function createTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port,
    secure, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Force TLS upgrade on port 587 (STARTTLS)
    requireTLS: !secure,
    tls: {
      // Accept self-signed certs in dev — remove in production
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
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

// ─── Send email ───────────────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { userInfo, questions } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!userInfo?.firstName || !userInfo?.lastName || !userInfo?.email) {
    return res.status(400).json({
      ok: false,
      error: 'Données participant manquantes (prénom, nom, email requis).',
    });
  }

  if (!Array.isArray(questions) || questions.length !== 3) {
    return res.status(400).json({
      ok: false,
      error: 'Les trois réponses aux questions sont requises.',
    });
  }

  // ── Check SMTP credentials are configured ─────────────────────────────────
  if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'REMPLACE_PAR_TON_MOT_DE_PASSE_SMTP') {
    console.error('[SMTP] SMTP_PASS non configuré dans server/.env');
    return res.status(503).json({
      ok: false,
      error:
        'Le serveur email n\'est pas encore configuré. Veuillez renseigner SMTP_PASS dans server/.env.',
      code: 'SMTP_NOT_CONFIGURED',
    });
  }

  // ── Build email content ───────────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Transcription activité 1 - ${userInfo.firstName} ${userInfo.lastName}`;

  // Plain text body
  const textBody = [
    `Transcription Activité 1 - Aide Soignant`,
    `═══════════════════════════════════════`,
    ``,
    `Participant : ${userInfo.firstName} ${userInfo.lastName}`,
    `Email       : ${userInfo.email}`,
    `Date        : ${dateStr}`,
    ``,
    `───────────────────────────────────────`,
    ``,
    ...questions.flatMap((q, i) => [
      `Question ${i + 1} : ${q.question}`,
      `Réponse :`,
      q.answer || '(aucune réponse fournie)',
      ``,
      i < questions.length - 1 ? `───────────────────────────────────────` : ``,
      ``,
    ]),
    `═══════════════════════════════════════`,
    `Envoyé depuis l'application Questions Activité 1 — Savoirscope`,
  ].join('\n');

  // HTML body
  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f7ff; margin: 0; padding: 20px; color: #1e293b; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(14,165,233,0.12); }
    .header { background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%); padding: 32px 28px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.02em; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 28px; }
    .meta { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .meta p { margin: 4px 0; font-size: 14px; color: #0369a1; }
    .meta strong { color: #0c4a6e; }
    .question-block { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #38bdf8; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 16px; }
    .question-label { font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .question-text { font-size: 14px; color: #475569; font-style: italic; margin-bottom: 12px; }
    .answer-text { font-size: 15px; color: #1e293b; line-height: 1.65; white-space: pre-wrap; }
    .footer { background: #f0f9ff; border-top: 1px solid #bae6fd; padding: 16px 28px; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #64748b; }
    .footer a { color: #0ea5e9; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>📋 Transcription Activité 1</h1>
      <p>Aide Soignant — Savoirscope</p>
    </div>
    <div class="body">
      <div class="meta">
        <p><strong>👤 Participant :</strong> ${userInfo.firstName} ${userInfo.lastName}</p>
        <p><strong>📧 Email :</strong> ${userInfo.email}</p>
        <p><strong>📅 Date :</strong> ${dateStr}</p>
      </div>

      ${questions
        .map(
          (q, i) => `
      <div class="question-block">
        <div class="question-label">Question ${i + 1}</div>
        <div class="question-text">${q.question}</div>
        <div class="answer-text">${q.answer || '<em style="color:#94a3b8">(aucune réponse fournie)</em>'}</div>
      </div>`
        )
        .join('')}
    </div>
    <div class="footer">
      <p>
        Envoyé automatiquement par <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_FROM_NAME || 'Savoirscope'}</a><br/>
        Aucune donnée stockée côté serveur.
      </p>
    </div>
  </div>
</body>
</html>`;

  // ── Recipients ────────────────────────────────────────────────────────────
  const recipients = [
    { email: 'raletouletan@gmail.com', label: 'formateur' },
    { email: userInfo.email, label: 'participant' },
  ];

  // ── Send ──────────────────────────────────────────────────────────────────
  try {
    const transporter = createTransporter();

    // Verify connection before sending
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Savoirscope – Activité 1'}" <${process.env.SMTP_USER}>`,
      to: recipients.map((r) => r.email).join(', '),
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[SMTP] Email envoyé : ${info.messageId}`);

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
      recipients: recipients.map((r) => r.email),
      subject,
      sentAt: now.toISOString(),
    });
  } catch (err) {
    console.error('[SMTP] Erreur d\'envoi :', err);

    // Map common Nodemailer / SMTP errors to friendly French messages
    let friendlyError = 'Erreur inconnue lors de l\'envoi de l\'email.';
    let code = 'UNKNOWN';

    if (err.code === 'ECONNREFUSED') {
      friendlyError = `Impossible de joindre le serveur SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT}). Vérifiez votre connexion réseau.`;
      code = 'ECONNREFUSED';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET') {
      friendlyError = 'Le serveur SMTP ne répond pas (délai dépassé). Réessayez dans quelques instants.';
      code = 'TIMEOUT';
    } else if (err.responseCode === 535 || (err.response && err.response.includes('535'))) {
      friendlyError = 'Authentification SMTP échouée : nom d\'utilisateur ou mot de passe incorrect.';
      code = 'AUTH_FAILED';
    } else if (err.responseCode === 550) {
      friendlyError = 'Adresse email destinataire rejetée par le serveur.';
      code = 'RECIPIENT_REJECTED';
    } else if (err.responseCode === 421 || err.responseCode === 451) {
      friendlyError = 'Le serveur SMTP est temporairement indisponible. Réessayez dans quelques minutes.';
      code = 'SERVER_UNAVAILABLE';
    } else if (err.message) {
      friendlyError = err.message;
    }

    return res.status(502).json({
      ok: false,
      error: friendlyError,
      code,
    });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`   SMTP : ${process.env.SMTP_USER}@${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`   Endpoint : POST http://localhost:${PORT}/api/send-email\n`);
});
