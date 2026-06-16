
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import WizardSteps from '@/components/WizardSteps';
import StepBasicInfo from './StepBasicInfo';
import StepDepartments from './StepDepartments';
import StepPersonnel from './StepPersonnel';
import StepPremises from './StepPremises';
import StepEquipment from './StepEquipment';
import StepAttachments from './StepAttachments';
import StepPromise from './StepPromise';
import { ORG_CATEGORY_MAP } from '@/types';

export default function ApplicationWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, setCurrentApplication, currentApplication, currentStep, setCurrentStep, saveCurrentApplication } = useApplicationStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const app = applications.find(a => a.id === id);
      if (app) {
        setCurrentApplication(app);
      } else {
        navigate('/applications');
      }
    }
  }, [id, applications, navigate, setCurrentApplication]);

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    saveCurrentApplication();
    setTimeout(() => setIsSaving(false), 800);
  };

  const handlePreview = () => {
    navigate(`/applications/${id}/preview`);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepDepartments />;
      case 3:
        return <StepPersonnel />;
      case 4:
        return <StepPremises />;
      case 5:
        return <StepEquipment />;
      case 6:
        return <StepAttachments />;
      case 7:
        return <StepPromise />;
      default:
        return <StepBasicInfo />;
    }
  };

  if (!currentApplication) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const orgCategory = currentApplication.basicInfo.orgCategory;
  const typeLabel = currentApplication.type === 'setup' ? '设立登记' : '变更登记';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/applications')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {typeLabel}申报
              </h1>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                {ORG_CATEGORY_MAP[orgCategory as keyof typeof ORG_CATEGORY_MAP] || '-'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {currentApplication.basicInfo.orgName || '未命名申报'} · 申报编号：{currentApplication.id}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          {isSaving ? '保存中...' : '保存草稿'}
        </button>
      </div>

      <WizardSteps currentStep={currentStep} onStepClick={handleStepClick} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            currentStep === 1
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
              : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          上一步
        </button>

        <div className="text-sm text-gray-400">
          第 {currentStep} / 7 步
        </div>

        {currentStep < 7 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
          >
            下一步
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-600/20"
          >
            预览并提交
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
