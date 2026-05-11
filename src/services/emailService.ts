/**
 * src/services/emailService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * EmailJS integration — envoi direct depuis le navigateur.
 * Public Key (safe to expose): 9d3bsPq_clwKINxP3
 * Service ID: service_6gsqvxg
 * Template ID: template_activite1
 * ─────────────────────────────────────────────────────────────────────────────
 */

import emailjs from '@emailjs/browser';
import { UserInfo, QuestionData } from '../types';

// Identifiants EmailJS fournis
const EMAILJS_PUBLIC_KEY = '9d3bsPq_clwKINxP3';
const EMAILJS_SERVICE_ID = 'service_6gsqvxg';
const EMAILJS_TEMPLATE_ID = 'template_cwlsfs9';

// Initialise EmailJS une seule fois
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface SendEmailResult {
  ok: true;
  messageId: string;
  recipients: string[];
  sentAt: string;
}

export interface SendEmailError {
  ok: false;
  error: string;
  code?: string;
}

export type SendEmailResponse = SendEmailResult | SendEmailError;

/**
 * Envoie les transcriptions via EmailJS à deux destinataires :
 * 1. raletouletan@gmail.com
 * 2. L'adresse de l'utilisateur
 */
export async function sendTranscriptionEmail(
  userInfo: UserInfo,
  questions: QuestionData[]
): Promise<SendEmailResponse> {
  const recipientAdmin = 'raletouletan@gmail.com';
  const recipientUser = userInfo.email;

  // Prépare les données pour le template EmailJS
  const templateParams = {
    prenom: userInfo.firstName,
    nom: userInfo.lastName,
    email_utilisateur: userInfo.email,
    to_email: '', // sera remplacé pour chaque envoi
    reponse_1: questions[0]?.answer || '',
    reponse_2: questions[1]?.answer || '',
    reponse_3: questions[2]?.answer || '',
    // Pour affichage dans l'email
    question_1: questions[0]?.question || '',
    question_1_label: questions[0]?.label || 'Question 1',
    question_2: questions[1]?.question || '',
    question_2_label: questions[1]?.label || 'Question 2',
    question_3: questions[2]?.question || '',
    question_3_label: questions[2]?.label || 'Question 3',
    date_envoi: new Date().toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }),
    objet: `Transcription activité 1 - ${userInfo.firstName} ${userInfo.lastName}`,
  };

  try {
    // Envoi 1 : à l'administrateur
    const resAdmin = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: recipientAdmin,
        destinataire_nom: 'Équipe SavoirScope',
      },
      EMAILJS_PUBLIC_KEY
    );

    // Envoi 2 : à l'utilisateur (copie)
    const resUser = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        ...templateParams,
        to_email: recipientUser,
        destinataire_nom: `${userInfo.firstName} ${userInfo.lastName}`,
      },
      EMAILJS_PUBLIC_KEY
    );

    return {
      ok: true,
      messageId: `${resAdmin.text}|${resUser.text}`,
      recipients: [recipientAdmin, recipientUser],
      sentAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('EmailJS error:', err);

    // EmailJS renvoie err.text ou err.message
    const message = err?.text || err?.message || 'Erreur inconnue EmailJS';

    // Mapping des erreurs communes
    let code = 'EMAILJS_ERROR';
    let errorMsg = `Échec de l'envoi : ${message}`;

    if (message.toLowerCase().includes('invalid public key')) {
      code = 'INVALID_KEY';
      errorMsg = 'Clé publique EmailJS invalide. Vérifiez la configuration.';
    } else if (message.toLowerCase().includes('service')) {
      code = 'INVALID_SERVICE';
      errorMsg = 'Service EmailJS introuvable (service_savoirscope).';
    } else if (message.toLowerCase().includes('template')) {
      code = 'INVALID_TEMPLATE';
      errorMsg = 'Template EmailJS introuvable (template_activite1).';
    } else if (message.toLowerCase().includes('network') || err?.status === 0) {
      code = 'NETWORK_ERROR';
      errorMsg = 'Pas de connexion internet. Vérifiez votre réseau.';
    }

    return {
      ok: false,
      error: errorMsg,
      code,
    };
  }
}

/**
 * EmailJS n'a pas besoin de health-check serveur —
 * on retourne toujours true (le service est externalisé).
 * Gardé pour compatibilité avec le composant.
 */
export async function checkApiHealth(): Promise<boolean> {
  return true;
}
