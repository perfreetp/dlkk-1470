
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Clock, 
  FileCheck, 
  MessageSquare, 
  History,
  RefreshCw,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  Send,
  ShieldCheck,
  X,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import StatusBadge from '@/components/StatusBadge';
import { ORG_CATEGORY_MAP, WIZARD_STEPS } from '@/types';

const STEP_CATEGORY_MAP: Record<string, number> = {
  '基本信息': 1,
  '诊疗科目': 2,
  '人员资质': 3,
  '房屋与布局': 4,
  '设备配置': 5,
  '附件材料': 6,
  '承诺事项': 7,
};

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, acceptApplication, approveApplication, returnApplication } = useApplicationStore();
  const [showHistory, setShowHistory] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [returnOpinions, setReturnOpinions] = useState<string[]>(['']);
  const [isProcessing, setIsProcessing] = useState(false);

  const application = applications.find(a => a.id === id);

  if (!application) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const orgCategory = application.basicInfo.orgCategory;
  const typeLabel = application.type === 'setup' ? '设立登记' : '变更登记';

  const canEdit = application.status === 'draft' || application.status === 'returned';
  const canSubmit = application.status === 'draft' || application.status === 'returned';
  const canAccept = application.status === 'submitted';
  const canReview = application.status === 'submitted' || application.status === 'reviewing';
  const canReturn = application.status === 'submitted' || application.status === 'reviewing';
  const canApprove = application.status === 'submitted' || application.status === 'reviewing';

  const handleEdit = () => {
    navigate(`/applications/${application.id}/edit`);
  };

  const handleSubmit = () => {
    navigate(`/applications/${application.id}/preview`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    acceptApplication(application.id);
    await new Promise(r => setTimeout(r, 800));
    setIsProcessing(false);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    approveApplication(application.id);
    await new Promise(r => setTimeout(r, 800));
    setIsProcessing(false);
  };

  const handleOpenReturnDialog = () => {
    setReturnOpinions(['']);
    setShowReturnDialog(true);
  };

  const handleAddOpinion = () => {
    setReturnOpinions([...returnOpinions, '']);
  };

  const handleRemoveOpinion = (index: number) => {
    if (returnOpinions.length === 1) {
      setReturnOpinions(['']);
      return;
    }
    setReturnOpinions(returnOpinions.filter((_, i) => i !== index));
  };

  const handleUpdateOpinion = (index: number, value: string) => {
    const updated = [...returnOpinions];
    updated[index] = value;
    setReturnOpinions(updated);
  };

  const handleConfirmReturn = async () => {
    const validOpinions = returnOpinions.filter(o => o.trim().length > 0);
    if (validOpinions.length === 0) {
      return;
    }
    setIsProcessing(true);
    returnApplication(application.id, validOpinions);
    await new Promise(r => setTimeout(r, 800));
    setShowReturnDialog(false);
    setIsProcessing(false);
  };

  const statusInfo = {
    draft: { icon: Clock, text: '草稿状态，可编辑修改' },
    submitted: { icon: FileCheck, text: '已提交，等待受理' },
    reviewing: { icon: RefreshCw, text: '审核中，请耐心等待' },
    approved: { icon: CheckCircle2, text: '审核通过' },
    returned: { icon: XCircle, text: '已退回，请按补正意见修改' },
  };

  const statusKey = application.status as keyof typeof statusInfo;
  const StatusIcon = statusInfo[statusKey]?.icon || Clock;

  const versions = [...application.versions].reverse();
  const correctionOpinions = application.correctionOpinions;

  const progressSteps = [
    { 
      key: 'draft', 
      label: '草稿编辑', 
      desc: '填写申报材料',
      done: application.status !== 'draft' 
    },
    { 
      key: 'submitted', 
      label: '材料受理', 
      desc: '受理员核对材料完整性',
      done: ['submitted', 'reviewing', 'approved', 'returned'].includes(application.status) 
    },
    { 
      key: 'reviewing', 
      label: '审核办理', 
      desc: '审核人员复核材料',
      done: ['reviewing', 'approved', 'returned'].includes(application.status) 
    },
    { 
      key: 'approved', 
      label: '办结出证', 
      desc: '审核通过，发放证照',
      done: application.status === 'approved' 
    },
  ];

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
              <h1 className="text-xl font-bold text-gray-900">申报详情</h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              申报编号：{application.id} · {typeLabel} · {ORG_CATEGORY_MAP[orgCategory as keyof typeof ORG_CATEGORY_MAP]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            打印
          </button>
          {canEdit && (
            <button
              onClick={handleEdit}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                application.status === 'returned'
                  ? 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100'
                  : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {application.status === 'returned' ? '修改补正' : '编辑'}
            </button>
          )}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-colors font-medium shadow-lg ${
                application.status === 'returned'
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              {application.status === 'returned' ? '重新提交' : '提交申报'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
            application.status === 'returned' ? 'border-rose-200' :
            application.status === 'approved' ? 'border-green-200' :
            'border-gray-100'
          }`}>
            <div className={`px-5 py-4 border-b ${
              application.status === 'returned' ? 'border-rose-100 bg-gradient-to-r from-rose-50 to-red-50' :
              application.status === 'approved' ? 'border-green-100 bg-gradient-to-r from-green-50 to-emerald-50' :
              'border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center`}>
                    <StatusIcon className={`w-6 h-6 ${
                      application.status === 'returned' ? 'text-rose-600' :
                      application.status === 'approved' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {statusInfo[statusKey]?.text}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      提交时间：{application.submittedAt ? application.submittedAt.slice(0, 16).replace('T', ' ') : '未提交'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewPanel(!showReviewPanel)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  模拟审核操作
                </button>
              </div>
            </div>

            {showReviewPanel && (
              <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    此面板用于模拟审核操作流程序列，从受理到审核、通过或退回，方便测试完整的业务闭环。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={!canAccept || isProcessing}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      canAccept && !isProcessing
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    1. 受理材料
                  </button>
                  <button
                    onClick={() => acceptApplication(application.id)}
                    disabled={!canReview || isProcessing}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      canReview && !isProcessing
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm shadow-yellow-500/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${canReview && !isProcessing ? 'animate-spin' : ''}`} style={{ animationDuration: canReview && !isProcessing ? '3s' : '0s' }} />
                    2. 进入审核
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={!canApprove || isProcessing}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      canApprove && !isProcessing
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-600/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    3. 审核通过
                  </button>
                  <button
                    onClick={handleOpenReturnDialog}
                    disabled={!canReturn || isProcessing}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      canReturn && !isProcessing
                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    3. 退回补正
                  </button>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-gray-500">机构名称</p>
                  <p className="font-medium text-gray-900 mt-1">{application.basicInfo.orgName || '未填写'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">法定代表人</p>
                  <p className="font-medium text-gray-900 mt-1">{application.basicInfo.legalRepresentative || '未填写'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">执业地址</p>
                  <p className="font-medium text-gray-900 mt-1">{application.basicInfo.practiceAddress || '未填写'}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 mt-5 pt-5 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">诊疗科目</p>
                  <p className="font-medium text-gray-900 mt-1">{application.departments.length} 项</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">人员配置</p>
                  <p className="font-medium text-gray-900 mt-1">{application.personnel.length} 人</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">设备配置</p>
                  <p className="font-medium text-gray-900 mt-1">{application.equipment.length} 台</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">附件材料</p>
                  <p className="font-medium text-gray-900 mt-1">{application.attachments.length} 份</p>
                </div>
              </div>
            </div>
          </div>

          {correctionOpinions.length > 0 && (
            <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              application.status === 'returned' ? 'border-rose-200' : 'border-green-200'
            }`}>
              <div className={`px-5 py-4 border-b ${
                application.status === 'returned' ? 'border-rose-100 bg-rose-50' : 'border-green-100 bg-green-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    application.status === 'returned' ? 'bg-rose-100' : 'bg-green-100'
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${
                      application.status === 'returned' ? 'text-rose-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      application.status === 'returned' ? 'text-rose-900' : 'text-green-900'
                    }`}>
                      {application.status === 'returned' ? '补正意见' : '审核通知'}
                    </h3>
                    <p className={`text-xs mt-0.5 ${
                      application.status === 'returned' ? 'text-rose-600' : 'text-green-600'
                    }`}>
                      共 {correctionOpinions.length} 条记录
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {correctionOpinions.map(opinion => (
                  <div key={opinion.id} className={`flex items-start gap-3 p-4 rounded-lg ${
                    application.status === 'returned' ? 'bg-rose-50' : 'bg-green-50'
                  }`}>
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      application.status === 'returned' ? 'text-rose-500' : 'text-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm ${
                        application.status === 'returned' ? 'text-rose-900' : 'text-green-900'
                      }`}>{opinion.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs ${
                          application.status === 'returned' ? 'text-rose-600' : 'text-green-600'
                        }`}>{opinion.date ? opinion.date.slice(0, 16).replace('T', ' ') : ''}</span>
                        <span className={`text-xs ${
                          application.status === 'returned' ? 'text-rose-600' : 'text-green-600'
                        }`}>· {opinion.operator}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {application.status === 'returned' && (
                <div className="px-5 py-3 bg-rose-50 border-t border-rose-100 flex justify-end">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    去修改材料
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">版本历史</h3>
                  <p className="text-xs text-gray-500 mt-0.5">共 {versions.length} 个版本</p>
                </div>
              </div>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showHistory && versions.length > 0 && (
              <div className="px-5 pb-5 space-y-0">
                {versions.map((version, index) => (
                  <div key={`${version.version}-${index}`} className="relative pl-6 pb-4">
                    {index < versions.length - 1 && (
                      <div className="absolute left-1.5 top-3 bottom-0 w-px bg-gray-200" />
                    )}
                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ring-4 ${
                      version.status === 'approved' ? 'bg-green-500 ring-green-100' :
                      version.status === 'returned' ? 'bg-rose-500 ring-rose-100' :
                      version.status === 'reviewing' ? 'bg-yellow-500 ring-yellow-100' :
                      'bg-blue-500 ring-blue-100'
                    }`} />
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{version.version}</span>
                        <StatusBadge status={version.status} size="sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {version.submitTime ? version.submitTime.slice(0, 16).replace('T', ' ') : ''} · {version.remark}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showHistory && versions.length === 0 && (
              <div className="px-5 pb-5">
                <p className="text-center text-sm text-gray-400 py-4">暂无提交记录</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">办理进度</h3>
            </div>
            <div className="p-5 space-y-5">
              {progressSteps.map((item, index) => {
                const isCurrent = 
                  (item.key === 'draft' && application.status === 'draft') ||
                  (item.key === 'submitted' && application.status === 'submitted') ||
                  (item.key === 'reviewing' && application.status === 'reviewing') ||
                  (item.key === 'approved' && application.status === 'approved');
                const isReturned = application.status === 'returned' && 
                  ['submitted', 'reviewing'].includes(item.key);
                
                return (
                  <div key={item.key} className="relative">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        item.done && !isReturned ? 'bg-green-500' :
                        isCurrent ? 'bg-blue-600 ring-4 ring-blue-100' :
                        isReturned ? 'bg-rose-500' :
                        'bg-gray-200'
                      }`}>
                        {item.done && !isReturned ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        ) : isReturned ? (
                          <XCircle className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm ${
                          isCurrent ? 'text-blue-700 font-semibold' :
                          isReturned ? 'text-rose-700 font-medium line-through' :
                          item.done ? 'text-gray-900 font-medium' :
                          'text-gray-400'
                        }`}>
                          {item.label}
                          {isReturned && <span className="ml-1.5 text-xs font-normal">(已退回)</span>}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          isCurrent ? 'text-blue-500' :
                          isReturned ? 'text-rose-500' :
                          item.done ? 'text-gray-500' :
                          'text-gray-300'
                        }`}>{item.desc}</p>
                      </div>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className={`absolute left-3.5 top-7 w-px h-8 ${
                        item.done && !isReturned ? 'bg-green-300' :
                        isReturned ? 'bg-rose-200' :
                        'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">申报信息</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">申报编号</span>
                <span className="font-mono text-gray-900">{application.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">申报类型</span>
                <span className="text-gray-900">{typeLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">机构类别</span>
                <span className="text-gray-900">
                  {ORG_CATEGORY_MAP[orgCategory as keyof typeof ORG_CATEGORY_MAP]}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-900 text-xs">
                  {application.createdAt ? application.createdAt.slice(0, 16).replace('T', ' ') : ''}
                </span>
              </div>
              {application.submittedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">提交时间</span>
                  <span className="text-gray-900 text-xs">
                    {application.submittedAt.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReturnDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">退回补正</h3>
                  <p className="text-xs text-gray-500 mt-0.5">请录入具体的补正意见</p>
                </div>
              </div>
              <button
                onClick={() => setShowReturnDialog(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              {returnOpinions.map((opinion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <textarea
                      value={opinion}
                      onChange={(e) => handleUpdateOpinion(index, e.target.value)}
                      placeholder={`请输入第 ${index + 1} 条补正意见，例如：缺少平面布局图，请补充上传`}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveOpinion(index)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddOpinion}
                className="flex items-center gap-1.5 w-full px-3 py-2.5 text-sm text-rose-600 border border-dashed border-rose-300 rounded-lg hover:bg-rose-50 transition-colors justify-center"
              >
                <Plus className="w-4 h-4" />
                增加一条补正意见
              </button>
            </div>
            
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowReturnDialog(false)}
                disabled={isProcessing}
                className="flex-1 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReturn}
                disabled={isProcessing || returnOpinions.filter(o => o.trim()).length === 0}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                  isProcessing || returnOpinions.filter(o => o.trim()).length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20'
                }`}
              >
                {isProcessing ? '处理中...' : '确认退回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
