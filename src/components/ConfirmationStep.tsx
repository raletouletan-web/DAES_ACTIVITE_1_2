import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  CheckCircle,
  Mail,
  Loader2,
  RefreshCw,
  FileText,
  FileJson,
  Copy,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Send,
  Info,
  ExternalLink,
} from 'lucide-react';
import { UserInfo, QuestionData } from '../types';
import { sendTranscriptionEmail } from '../services/emailService';

interface Props {
  userInfo: UserInfo;
  questions: QuestionData[];
  onReset: () => void;
}

type SendStatus = 'sending' | 'success' | 'error';

const ConfirmationStep: React.FC<Props> = ({ userInfo, questions, onReset }) => {
  const [status, setStatus] = useState<SendStatus>('sending');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [messageId, setMessageId] = useState('');
  const [sentAt, setSentAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hasSent = useRef(false);

  const now = useRef(new Date());
  const dateStr = now.current.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const subject = `Transcription activité 1 - ${userInfo.firstName} ${userInfo.lastName}`;

  // ── Build plain-text email body ───────────
  const buildTextBody = useCallback(() => {
    let b = `Transcription Activité 1 - Aide Soignant\n`;
    b    += `═══════════════════════════════════════\n\n`;
    b    += `Participant : ${userInfo.firstName} ${userInfo.lastName}\n`;
    b    += `Email       : ${userInfo.email}\n`;
    b    += `Date        : ${dateStr}\n\n`;

    questions.forEach((q, idx) => {
      b += `─── ${q.label || `Question ${idx + 1}`} ───\n${q.question}\n\n`;
      b += `Réponse :\n${q.answer || '(aucune réponse)'}\n\n`;
    });

    b += `─────────────────────────────────────\n`;
    b += `Envoyé via EmailJS (service_savoirscope)\n`;
    return b;
  }, [userInfo, questions, dateStr]);

  // ── Build JSON payload ───────────
  const buildJSON = useCallback(() => {
    return JSON.stringify({
      metadata: {
        service: 'QUESTIONS ACTIVITÉ 1 - AIDE SOIGNANT',
        version: '1.0',
        sentAt: now.current.toISOString(),
        sentAtLocale: dateStr,
        emailService: 'EmailJS',
        serviceId: 'service_savoirscope',
        templateId: 'template_activite1',
      },
      participant: {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
      },
      questions: questions.map((q, i) => ({
        order: i + 1,
        label: q.label,
        question: q.question,
        answer: q.answer,
        length: q.answer.length,
      })),
    }, null, 2);
  }, [userInfo, questions, dateStr]);

  // ── Core sending logic ───────────
  const doSend = useCallback(async () => {
    setStatus('sending');
    setErrorMsg('');
    setErrorCode('');

    const result = await sendTranscriptionEmail(userInfo, questions);

    if (result.ok) {
      setRecipients(result.recipients);
      setMessageId(result.messageId);
      setSentAt(new Date(result.sentAt).toLocaleTimeString('fr-FR'));
      setStatus('success');
    } else {
      setErrorMsg(result.error);
      setErrorCode(result.code || '');
      setStatus('error');
    }
  }, [userInfo, questions]);

  // ── Auto-send once on mount ───────────
  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;
    doSend();
  }, [doSend]);

  // ── Actions ───────────
  const handleRetry = () => {
    setRetryCount(c => c + 1);
    hasSent.current = false;
    doSend();
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([buildTextBody()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${userInfo.lastName}-${userInfo.firstName}-${now.current.toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([buildJSON()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${userInfo.lastName}-${userInfo.firstName}-${now.current.toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildTextBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Render ───────────
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-8 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Envoi de la transcription</h2>
              <p className="text-sky-100 text-sm mt-0.5">EmailJS • service_6gsqvxg</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {/* ── SENDING ── */}
          {status === 'sending' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sky-100 mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Envoi en cours…
              </h3>
              <p className="text-slate-600 mb-6">
                Transmission sécurisée via EmailJS
              </p>

              {/* Progress bar */}
              <div className="max-w-md mx-auto mb-8">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-progress-bar" />
                </div>
              </div>

              <div className="inline-flex items-center gap-6 text-sm text-slate-500 bg-slate-50 px-6 py-3 rounded-2xl">
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  raletouletan@gmail.com
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {userInfo.email}
                </span>
              </div>

              {retryCount > 0 && (
                <p className="text-xs text-amber-600 mt-4">
                  Tentative {retryCount + 1}…
                </p>
              )}
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5 animate-bounce-once">
                  <CheckCircle className="w-11 h-11 text-emerald-600" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Email envoyé avec succès !
                </h3>
                <p className="text-slate-600">
                  Email envoyé avec succès à <strong>raletouletan@gmail.com</strong> et à <strong>votre adresse ({userInfo.email})</strong>
                </p>
                {sentAt && (
                  <p className="text-xs text-slate-500 mt-2">
                    Envoyé à {sentAt} • ID: {messageId.slice(0, 12)}…
                  </p>
                )}
              </div>

              {/* Recipients cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {recipients.map((r) => (
                  <div key={r} className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <CheckCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Destinataire</p>
                      <p className="text-sm font-semibold text-emerald-900 truncate">{r}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Aperçu de l'email</h4>
                  <span className="text-xs px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full font-medium">EmailJS</span>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div><span className="text-slate-500">Objet :</span> <span className="text-slate-900 font-medium ml-1">{subject}</span></div>
                  <div className="pt-2.5 border-t border-slate-200">
                    <p className="text-slate-500 mb-1.5">Contenu :</p>
                    <div className="bg-white rounded-xl p-3.5 font-mono text-xs text-slate-700 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                      {buildTextBody().slice(0, 450)}…
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Télécharger .TXT
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium transition-colors"
                >
                  <FileJson className="w-4 h-4" />
                  Télécharger .JSON
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-medium transition-colors"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-sky-50 border border-sky-100 rounded-xl p-3 mb-8">
                <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>Envoi réalisé via EmailJS. Aucune donnée n'est stockée sur nos serveurs.</span>
              </div>

              <button
                onClick={onReset}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-sky-600/20 transition-all"
              >
                Nouvelle session
              </button>
            </>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-5">
                  <XCircle className="w-11 h-11 text-red-600" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Échec de l'envoi
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  L'email n'a pas pu être envoyé via EmailJS.
                </p>
              </div>

              {/* Error details */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-red-900 mb-1.5">Détail de l'erreur</h4>
                    <p className="text-sm text-red-800 leading-relaxed break-words">{errorMsg}</p>
                    {errorCode && (
                      <p className="text-xs font-mono text-red-700 mt-2 bg-red-100 inline-block px-2 py-1 rounded">
                        Code: {errorCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <h4 className="font-semibold text-amber-900 mb-2.5 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Vérifications
                </h4>
                <ul className="space-y-1.5 text-sm text-amber-900">
                  <li className="flex gap-2"><span>•</span><span>Vérifiez votre connexion internet</span></li>
                  <li className="flex gap-2"><span>•</span><span>Service ID : <code className="bg-amber-100 px-1 rounded">service_6gsqvxg</code></span></li>
                  <li className="flex gap-2"><span>•</span><span>Template ID : <code className="bg-amber-100 px-1 rounded">template_cwlsfs9</code></span></li>
                  <li className="flex gap-2"><span>•</span><span>Public Key : <code className="bg-amber-100 px-1 rounded">9d3bsPq…</code></span></li>
                </ul>
              </div>

              {/* Fallback downloads */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Conserver vos réponses localement :</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <button onClick={handleDownloadTxt} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
                    <FileText className="w-4 h-4" /> .TXT
                  </button>
                  <button onClick={handleDownloadJSON} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
                    <FileJson className="w-4 h-4" /> .JSON
                  </button>
                  <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
                    {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-sky-600/20 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer l'envoi
                </button>
                <a
                  href="https://dashboard.emailjs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300 rounded-2xl transition-colors"
                >
                  Dashboard EmailJS
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-500 mt-6">
        Service : service_6gsqvxg • Template : template_cwlsfs9 • Public Key : 9d3bsPq_clwKINxP3
      </p>
    </div>
  );
};

export default ConfirmationStep;