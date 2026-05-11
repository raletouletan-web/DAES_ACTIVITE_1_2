import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import VideoSection from './VideoSection';
import { ArrowRight, ArrowLeft, MessageSquare, Pencil } from 'lucide-react';

interface Props {
  questionIndex: number;
  question: string;
  questionLabel: string;
  initialAnswer: string;
  onNext: (answer: string) => void;
  onPrevious?: () => void;
  isFirst: boolean;
  totalQuestions: number;
  videoUrl: string;
  thumbnailUrl: string;
  docUrl: string;
  docLabel: string;
}

const QuestionStep: React.FC<Props> = ({
  questionIndex,
  question,
  questionLabel,
  initialAnswer,
  onNext,
  onPrevious,
  isFirst,
  totalQuestions,
  videoUrl,
  thumbnailUrl,
  docUrl,
  docLabel,
}) => {
  const [answer, setAnswer] = useState(initialAnswer);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  const handleTranscript = (text: string) => {
    setAnswer((prev) => {
      const newText = prev ? prev + ' ' + text : text;
      return newText;
    });
    setHasBeenEdited(false);
  };

  const handleNext = () => {
    onNext(answer);
  };

  const questionEmojis = ['📋', '⚠️', '💪'];

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg shadow-sky-100/50 border border-sky-100 p-6 sm:p-8">
        {questionIndex === 0 && (
          <VideoSection
            videoUrl={videoUrl}
            thumbnailUrl={thumbnailUrl}
            docUrl={docUrl}
            docLabel={docLabel}
          />
        )}

        {/* Question header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {questionLabel || `Question ${questionIndex + 1}`}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0">{questionEmojis[questionIndex]}</span>
            <div
              className="rich-text-content flex-1 text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: question }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-sky-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Voice recorder */}
        <div className="mb-5">
          <VoiceRecorder onTranscript={handleTranscript} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou saisissez votre réponse</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Text area */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2 mb-2">
            {answer ? (
              <Pencil size={14} className="text-sky-400" />
            ) : (
              <MessageSquare size={14} className="text-gray-400" />
            )}
            <label className="text-sm font-medium text-gray-600">
              {answer ? 'Votre réponse (modifiable)' : 'Votre réponse'}
            </label>
          </div>
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setHasBeenEdited(true);
            }}
            placeholder="Tapez votre réponse ici ou utilisez la saisie vocale ci-dessus…"
            rows={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-sky-400 focus:bg-white transition-all duration-200 outline-none text-gray-700 placeholder-gray-300 resize-none text-sm leading-relaxed"
          />
          {answer && !hasBeenEdited && (
            <p className="text-xs text-amber-500 mt-1 ml-1 flex items-center gap-1">
              <Pencil size={11} />
              Vous pouvez modifier la transcription avant de continuer
            </p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          {!isFirst && onPrevious ? (
            <button
              onClick={onPrevious}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Précédent</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!answer.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md cursor-pointer"
          >
            <span className="text-sm">
              {questionIndex < totalQuestions - 1 ? 'Question suivante' : 'Voir le récapitulatif'}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionStep;
