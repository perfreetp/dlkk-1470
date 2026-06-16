import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, ChevronRight, ChevronLeft, AlertCircle, X, ArrowRight, MessageSquare } from 'lucide-react';
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

const STEP_CATEGORY_MAP: Record<string, number> = {
  '基本信息': 1,
  '诊疗科目': 2,
  '人员资质': 3,
  '房屋与布局': 4,
  '设备配置': 5,
  '附件材料': 6,
  '承诺事项': 7,
};

const getStepFromOpinion = (content: string): number => {
  for (const [key, step] of Object.entries(STEP_CATEGORY_MAP)) {
    if (content.includes(key)) return step;
  }
  if (content.includes('人员')) return 3;
  if (content.includes('设备')) return 5;
  if (content.includes('附件') || content.includes('材料')) return 6;
  if (content.includes('承诺')) return 7;
  return 1;
};

export default function ApplicationWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { applications, setCurrentApplication, currentApplication, currentStep, setCurrentStep, saveCurrentApplication } = useApplicationStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showOpinionPanel, setShowOpinionPanel] = useState(true);
  const initializedRef = useState<{ stepSet: boolean }>({ stepSet: false });

  useEffect(() => {
    if (id) {
      const app = applications.find(a => a.id === id);
      if (app) {
        setCurrentApplication(app);
        const stepParam = searchParams.get('step');
        if (stepParam && !initializedRef[0].stepSet) {
          const step = parseInt(stepParam, 10);
          if (step >= 1 && step <= 7) {
            setCurrentStep(step);
            initializedRef[0].stepSet = true;
          }
        }
      } else {
        navigate('/applications');
      }
    }
  }, [id, applications, navigate, setCurrentApplication, searchParams]);

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
    navigate('/applications/' + id + '/preview');
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
  const isReturned = currentApplication.status === 'returned';
  const latestReturnRecords = currentApplication.auditRecords?.filter(r => r.action === 'return') || [];
  const allReturnOpinions = latestReturnRecords.flatMap(r => r.opinions).filter(Boolean) as string[];

  const mainContentClass = (showOpinionPanel && isReturned ? 'flex-1' : 'w-full') + ' bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]';
  const saveIconClass = 'w-4 h-4' + (isSaving ? ' animate-spin' : '');
  const prevBtnBase = 'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ';
  const prevBtnClass = prevBtnBase + (currentStep === 1 
    ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
    : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50');

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
              {isReturned && (
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-medium rounded flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  补正修改中
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {currentApplication.basicInfo.orgName || '未命名申报'} · 申报编号：{currentApplication.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isReturned && (
            <button
              onClick={() => setShowOpinionPanel(!showOpinionPanel)}
              className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {showOpinionPanel ? '隐藏补正意见' : '查看补正意见'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className={saveIconClass} />
            {isSaving ? '保存中...' : '保存草稿'}
          </button>
        </div>
      </div>

      <WizardSteps currentStep={currentStep} onStepClick={handleStepClick} />

      <div className="flex gap-4">
        <div className={mainContentClass}>
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>

        {isReturned && showOpinionPanel && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-rose-50 rounded-xl border border-rose-200 overflow-hidden sticky top-24">
              <div className="px-4 py-3 bg-rose-100 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-medium text-rose-700">补正意见</span>
                  <span className="px-1.5 py-0.5 bg-white text-rose-600 text-xs font-medium rounded">
                    {allReturnOpinions.length} 条
                  </span>
                </div>
                <button
                  onClick={() => setShowOpinionPanel(false)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-200 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                {allReturnOpinions.map((opinion, idx) => {
                  const step = getStepFromOpinion(opinion);
                  const isActive = currentStep === step;
                  const divClasses = ['p-3', 'rounded-lg', 'border', 'transition-all'];
                  if (isActive) {
                    divClasses.push('bg-white', 'border-rose-300', 'shadow-sm');
                  } else {
                    divClasses.push('bg-white', 'bg-opacity-60', 'border-rose-200', 'hover:bg-white', 'hover:border-rose-300');
                  }
                  const btnClasses = ['mt-2', 'text-xs', 'font-medium', 'flex', 'items-center', 'gap-1'];
                  if (isActive) {
                    btnClasses.push('text-rose-600');
                  } else {
                    btnClasses.push('text-blue-600', 'hover:text-blue-700');
                  }
                  const handleGotoStep = () => {
                    setCurrentStep(step);
                    navigate('/applications/' + id + '/edit?step=' + step);
                  };
                  return (
                    <div
                      key={idx}
                      className={divClasses.join(' ')}
                    >
                      <p className="text-sm text-gray-800">{opinion}</p>
                      <button
                        onClick={handleGotoStep}
                        className={btnClasses.join(' ')}
                      >
                        {isActive ? '当前位置' : '去第' + step + '步修改'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={prevBtnClass}
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
