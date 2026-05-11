import { useState, useCallback } from 'react';
import { UserInfo, QuestionData, AppStep } from './types';
import StepIndicator from './components/StepIndicator';
import IdentificationForm from './components/IdentificationForm';
import QuestionStep from './components/QuestionStep';
import ReviewStep from './components/ReviewStep';
import ConfirmationStep from './components/ConfirmationStep';
import { Stethoscope } from 'lucide-react';

const QUESTIONS = [
  {
    label: 'Question 1 - Activité 1',
    banner: 'ACTIVITÉ 1 : ACCOMPAGNEMENT ET SOINS DE LA PERSONNE DANS LES ACTIVITÉS DE SA VIE QUOTIDIENNE ET DE SA VIE SOCIALE EN REPÉRANT LES FRAGILITÉS',
    prompt: 'Dans votre expérience, décrivez une situation où vous avez réalisé ces soins.',
  },
  {
    label: 'Question 2 - Activité 2',
    banner: 'ACTIVITÉ 2 : IDENTIFICATION DES RISQUES LORS DE L\'ACCOMPAGNEMENT DE LA PERSONNE ET LA MISE EN ŒUVRE D\'ACTIONS DE PRÉVENTION ADÉQUATES',
    prompt: 'Décrivez une situation où vous avez identifié des risques lors des soins apportés et qui vous a permis la mise en œuvre d\'actions de prévention adaptées.',
  },
  {
    label: 'Question 3 - Activité 2',
    banner: 'ACTIVITÉ 2 : IDENTIFICATION DES RISQUES LORS DE L\'ACCOMPAGNEMENT DE LA PERSONNE ET LA MISE EN ŒUVRE D\'ACTIONS DE PRÉVENTION ADÉQUATES',
    prompt: 'Comment avez-vous repéré ces risques ? et Comment avez-vous adapté les actions de prévention à la situation de la personne ?',
  },
];

const VIDEO_URL = 'https://youtu.be/79W3Sd8Z4jg';
const DOC_URL = 'https://drive.google.com/file/d/1kIaC3JkCUEzYiO5nHrnvF928kIlpDIa-/view?usp=drive_link';
const DOC_LABEL = "Ouvrir le document d'accompagnement dans une nouvelle fenêtre";

const STEP_LABELS = ['Identification', 'Questions', 'Relecture', 'Envoi'];

function App() {
  const [appStep, setAppStep] = useState<AppStep>('identification');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  const getStepNumber = () => {
    switch (appStep) {
      case 'identification': return 1;
      case 'questions': return 2;
      case 'review': return 3;
      case 'confirmation': return 4;
      default: return 1;
    }
  };

  const handleIdentificationSubmit = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setAppStep('questions');
    setCurrentQuestion(0);
  }, []);

  const handleQuestionNext = useCallback(
    (answer: string) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answer;
      setAnswers(newAnswers);
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setAppStep('review');
      }
    },
    [answers, currentQuestion]
  );

  const handleQuestionPrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setAppStep('identification');
    }
  }, [currentQuestion]);

  const handleReviewBack = useCallback(() => {
    setCurrentQuestion(QUESTIONS.length - 1);
    setAppStep('questions');
  }, []);

  const handleConfirm = useCallback((updatedQuestions: QuestionData[]) => {
    setAnswers(updatedQuestions.map((q) => q.answer));
    setAppStep('confirmation');
  }, []);

  const questionsData: QuestionData[] = QUESTIONS.map((q, i) => ({
    question: q.prompt,
    answer: answers[i],
    label: q.label,
    banner: q.banner,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-sky-200">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                QUESTIONS ACTIVITÉ 1
              </h1>
              <p className="text-xs text-sky-500 font-semibold uppercase tracking-wider">
                Aide Soignant
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <StepIndicator
          currentStep={getStepNumber()}
          totalSteps={4}
          labels={STEP_LABELS}
        />

        <div className="mt-6" key={appStep + (appStep === 'questions' ? `-${currentQuestion}` : '')}>
          {appStep === 'identification' && (
            <IdentificationForm onSubmit={handleIdentificationSubmit} />
          )}

          {appStep === 'questions' && (
            <QuestionStep
              key={currentQuestion}
              questionIndex={currentQuestion}
              banner={QUESTIONS[currentQuestion].banner}
              prompt={QUESTIONS[currentQuestion].prompt}
              questionLabel={QUESTIONS[currentQuestion].label}
              initialAnswer={answers[currentQuestion]}
              onNext={handleQuestionNext}
              onPrevious={handleQuestionPrevious}
              isFirst={currentQuestion === 0}
              totalQuestions={QUESTIONS.length}
              videoUrl={VIDEO_URL}
              thumbnailUrl=""
              docUrl={DOC_URL}
              docLabel={DOC_LABEL}
            />
          )}

          {appStep === 'review' && userInfo && (
            <ReviewStep
              userInfo={userInfo}
              questions={questionsData}
              onConfirm={handleConfirm}
              onBack={handleReviewBack}
            />
          )}

          {appStep === 'confirmation' && userInfo && (
            <ConfirmationStep
              userInfo={userInfo}
              questions={questionsData}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        <p>Questions Activité 1 — Aide Soignant • Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default App;
