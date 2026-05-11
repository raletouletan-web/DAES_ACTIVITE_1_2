import React, { useState } from 'react';
import { ArrowLeft, Send, Pencil, Check, X, ClipboardList, AlertCircle } from 'lucide-react';
import { UserInfo, QuestionData } from '../types';

interface Props {
  userInfo: UserInfo;
  questions: QuestionData[];
  onConfirm: (updatedQuestions: QuestionData[]) => void;
  onBack: () => void;
}

const ReviewStep: React.FC<Props> = ({ userInfo, questions, onConfirm, onBack }) => {
  const [editedQuestions, setEditedQuestions] = useState<QuestionData[]>(
    questions.map((q) => ({ ...q }))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditText(editedQuestions[index].answer);
    setShowWarning(false);
  };

  const saveEdit = (index: number) => {
    const updated = [...editedQuestions];
    updated[index] = { ...updated[index], answer: editText };
    setEditedQuestions(updated);
    setEditingIndex(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const handleConfirm = () => {
    // Check that all answers are filled
    const emptyIndexes = editedQuestions
      .map((q, i) => (!q.answer.trim() ? i + 1 : null))
      .filter((i) => i !== null);

    if (emptyIndexes.length > 0) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    onConfirm(editedQuestions);
  };

  const questionEmojis = ['📋', '⚠️', '💪'];
  const allAnswered = editedQuestions.every((q) => q.answer.trim().length > 0);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg shadow-sky-100/50 border border-sky-100 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={32} className="text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Récapitulatif</h2>
          <p className="text-gray-500 text-sm">
            Relisez et corrigez vos réponses avant l'envoi.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-sky-50 text-sky-600 px-4 py-2 rounded-full text-sm font-medium">
            <span>
              {userInfo.firstName} {userInfo.lastName}
            </span>
            <span className="text-sky-300">•</span>
            <span className="text-sky-400">{userInfo.email}</span>
          </div>
        </div>

        {/* Warning alert */}
        {showWarning && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Réponses manquantes</p>
              <p className="text-xs mt-0.5">
                Vous devez répondre aux trois questions avant de pouvoir confirmer l'envoi.
                Les questions sans réponse sont signalées en rouge ci-dessous.
              </p>
            </div>
          </div>
        )}

        {/* Questions review */}
        <div className="space-y-5 mb-8">
          {editedQuestions.map((q, index) => {
            const isEmpty = !q.answer.trim();
            return (
              <div
                key={index}
                className={`border-2 rounded-xl p-5 transition-colors duration-200 ${
                  showWarning && isEmpty
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gray-100 hover:border-sky-100'
                }`}
              >
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">
                    {q.label || `Question ${index + 1}`}
                  </h4>
                  {q.banner && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 mb-2">
                      <p className="text-xs font-bold text-blue-700 uppercase leading-snug tracking-wide">
                        {q.banner}
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-xl shrink-0">{questionEmojis[index]}</span>
                    <p className="flex-1 text-sm text-gray-700 italic leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                      {q.question}
                    </p>
                  </div>
                </div>

                {editingIndex === index ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-sky-300 bg-sky-50/30 focus:border-sky-400 transition-all duration-200 outline-none text-gray-700 resize-none text-sm leading-relaxed"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(index)}
                        disabled={!editText.trim()}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                      >
                        <Check size={14} />
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        <X size={14} />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative">
                    {isEmpty ? (
                      <p className="text-red-400 text-sm italic bg-red-50 rounded-lg p-4 pr-12">
                        Aucune réponse fournie — veuillez modifier cette réponse.
                      </p>
                    ) : (
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-4 pr-12">
                        {q.answer}
                      </p>
                    )}
                    <button
                      onClick={() => startEditing(index)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-400 hover:text-sky-500 hover:border-sky-300 transition-all duration-200 opacity-60 group-hover:opacity-100 cursor-pointer"
                      title="Modifier cette réponse"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Privacy note */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 mb-6">
          <p className="text-xs text-sky-600 text-center">
            🔒 Aucune donnée n'est stockée sur un serveur. Tout reste dans votre navigateur.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Retour</span>
          </button>

          <button
            onClick={handleConfirm}
            disabled={editingIndex !== null}
            className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 cursor-pointer ${
              allAnswered
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-green-200 hover:shadow-lg hover:shadow-green-300'
                : 'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-gray-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Send size={16} />
            <span className="text-sm">Confirmer l'envoi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
