
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
  ChevronUp
} from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import StatusBadge from '@/components/StatusBadge';
import { ORG_CATEGORY_MAP } from '@/types';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications } = useApplicationStore();
  const [showHistory, setShowHistory] = useState(false);

  const application = applications.find(a => a.id === id);

  if (!application) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const orgCategory = application.basicInfo.orgCategory;
  const typeLabel = application.type === 'setup' ? '设立登记' : '变更登记';

  const canEdit = application.status === 'draft' || application.status === 'returned';
  const canSubmit = application.status === 'draft' || application.status === 'returned';

  const handleEdit = () => {
    navigate(`/applications/${application.id}/edit`);
  };

  const handleSubmit = () => {
    navigate(`/applications/${application.id}/preview`);
  };

  const handlePrint = () => {
    window.print();
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
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          )}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
            >
              <FileCheck className="w-4 h-4" />
              提交申报
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <StatusIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {statusInfo[statusKey]?.text}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    提交时间：{application.submittedAt || '未提交'}
                  </p>
                </div>
              </div>
            </div>
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

          {application.status === 'returned' && correctionOpinions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">补正意见</h3>
                    <p className="text-xs text-red-600 mt-0.5">
                      共 {correctionOpinions.length} 条补正意见，请根据意见修改后重新提交
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {correctionOpinions.map(opinion => (
                  <div key={opinion.id} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-900">{opinion.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-red-600">{opinion.date}</span>
                        <span className="text-xs text-red-600">· {opinion.operator}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div key={version.version} className="relative pl-6 pb-4">
                    {index < versions.length - 1 && (
                      <div className="absolute left-1.5 top-3 bottom-0 w-px bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{version.version}</span>
                        <StatusBadge status={version.status} size="sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {version.submitTime} · {version.remark}
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
            <div className="p-5 space-y-4">
              {[
                { step: '提交申报', done: application.status !== 'draft' },
                { step: '材料受理', done: ['submitted', 'reviewing', 'approved'].includes(application.status) },
                { step: '审核办理', done: ['reviewing', 'approved'].includes(application.status) },
                { step: '办结出证', done: application.status === 'approved' },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    item.done ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}>
                    {item.step}
                  </span>
                </div>
              ))}
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
                <span className="text-gray-900">{application.createdAt}</span>
              </div>
              {application.submittedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">提交时间</span>
                  <span className="text-gray-900">{application.submittedAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
