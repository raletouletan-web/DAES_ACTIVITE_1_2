import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, labels }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                      : isActive
                      ? 'bg-sky-400 text-white shadow-lg shadow-sky-200 scale-110'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : stepNum}
                </div>
                <span
                  className={`text-xs font-medium text-center hidden sm:block ${
                    isActive ? 'text-sky-600' : isCompleted ? 'text-sky-500' : 'text-gray-400'
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
              {i < totalSteps - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentStep > stepNum ? 'bg-sky-400' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
