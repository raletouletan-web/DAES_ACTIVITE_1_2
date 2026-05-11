import { useState, useCallback, useMemo } from 'react';
import { UserInfo, QuestionData, AppStep } from './types';
import StepIndicator from './components/StepIndicator';
import IdentificationForm from './components/IdentificationForm';
import QuestionStep from './components/QuestionStep';
import ReviewStep from './components/ReviewStep';
import ConfirmationStep from './components/ConfirmationStep';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { useAdminConfig } from './hooks/useAdminConfig';
import { Stethoscope, Shield, LogOut, Settings } from 'lucide-react';

const STEP_LABELS = ['Identification', 'Questions', 'Relecture', 'Envoi'];

function App() {
  const {
    config,
    questions: dynamicQuestions,
    isAdmin,
    showLogin,
    showPanel,
    login,
    logout,
    updateConfig,
    setShowLogin,
    setShowPanel,
  } = useAdminConfig();

  const [appStep, setAppStep] = useState<AppStep>('identification');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  const getStepNumber = () => {
    switch (appStep) {
      case 'identification':
        return 1;
      case 'questions':
        return 2;
      case 'review':
        return 3;
      case 'confirmation':
        return 4;
      default:
        return 1;
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

      if (currentQuestion < dynamicQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setAppStep('review');
      }
    },
    [answers, currentQuestion, dynamicQuestions.length]
  );

  const handleQuestionPrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setAppStep('identification');
    }
  }, [currentQuestion]);

  const handleReviewBack = useCallback(() => {
    setCurrentQuestion(dynamicQuestions.length - 1);
    setAppStep('questions');
  }, [dynamicQuestions.length]);

  const handleConfirm = useCallback((updatedQuestions: QuestionData[]) => {
    setAnswers(updatedQuestions.map((q) => q.answer));
    setAppStep('confirmation');
  }, []);

  const handleReset = useCallback(() => {
    setUserInfo(null);
    setAnswers(['', '', '']);
    setCurrentQuestion(0);
    setAppStep('identification');
  }, []);

  const questionLabels = useMemo(
    () => [config.question1Label, config.question2Label, config.question3Label],
    [config.question1Label, config.question2Label, config.question3Label]
  );

  const questionsData: QuestionData[] = dynamicQuestions.map((q, i) => ({
    question: q,
    answer: answers[i],
    label: questionLabels[i],
  }));

  const handleAdminReset = useCallback(() => {
    localStorage.removeItem('activite1_admin_config');
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative">
      {/* Admin Button — Top Left */}
      <div className="fixed top-3 left-3 z-50">
        {isAdmin ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPanel(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Settings size={13} />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl shadow-md border border-slate-200 transition-all duration-200 cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl shadow-md border border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            <Shield size={13} />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 pl-12 sm:pl-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-sky-200">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                {config.appTitle || 'QUESTIONS ACTIVITÉ 1'}
              </h1>
              <p className="text-xs text-sky-500 font-semibold uppercase tracking-wider">
                {config.appSubtitle || 'Aide Soignant'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Step Indicator */}
        <StepIndicator
          currentStep={getStepNumber()}
          totalSteps={4}
          labels={STEP_LABELS}
        />

        {/* Step Content */}
        <div className="mt-6" key={appStep + (appStep === 'questions' ? `-${currentQuestion}` : '')}>
          {appStep === 'identification' && (
            <IdentificationForm onSubmit={handleIdentificationSubmit} />
          )}

          {appStep === 'questions' && (
            <QuestionStep
              key={currentQuestion}
              questionIndex={currentQuestion}
              question={dynamicQuestions[currentQuestion]}
              questionLabel={questionLabels[currentQuestion]}
              initialAnswer={answers[currentQuestion]}
              onNext={handleQuestionNext}
              onPrevious={handleQuestionPrevious}
              isFirst={currentQuestion === 0}
              totalQuestions={dynamicQuestions.length}
              videoUrl={config.videoUrl}
              thumbnailUrl={config.thumbnailUrl}
              docUrl={config.docUrl}
              docLabel={config.docLabel}
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
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        <p>Questions Activité 1 — Aide Soignant • Tous droits réservés</p>
      </footer>

      {/* Admin Modals */}
      {showLogin && (
        <AdminLogin
          onLogin={(u, p) => {
            const success = login(u, p);
            if (success) setShowLogin(false);
            return success;
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showPanel && isAdmin && (
        <AdminPanel
          config={config}
          onSave={updateConfig}
          onClose={() => setShowPanel(false)}
          onReset={handleAdminReset}
        />
      )}
    </div>
  );
}

export default App;
