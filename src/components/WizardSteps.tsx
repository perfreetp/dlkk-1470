
import { WIZARD_STEPS } from '@/types';
import { Building2, Stethoscope, Users, Home, Cpu, Paperclip, ShieldCheck, Check } from 'lucide-react';

const iconMap: Record<string, typeof Building2> = {
  Building2,
  Stethoscope,
  Users,
  Home,
  Cpu,
  Paperclip,
  ShieldCheck,
};

interface WizardStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function WizardSteps({ currentStep, onStepClick }: WizardStepsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200 -z-0"></div>
        <div
          className="absolute top-5 left-12 h-0.5 bg-blue-500 transition-all duration-500 -z-0"
          style={{ width: `calc(${(currentStep - 1) / (WIZARD_STEPS.length - 1) * 100}% - 0px)` }}
        ></div>

        {WIZARD_STEPS.map((step) => {
          const Icon = iconMap[step.icon];
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id <= currentStep;

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center relative z-10 ${
                isClickable ? 'cursor-pointer' : ''
              }`}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : isCurrent
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
