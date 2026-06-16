
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, ArrowRight, FilePlus, Edit3 } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import StatusBadge from '@/components/StatusBadge';
import { ORG_CATEGORY_MAP, STATUS_MAP } from '@/types';
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { applications, createApplication } = useApplicationStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState<'setup' | 'change' | ''>('');

  const totalCount = applications.length;
  const draftCount = applications.filter(a => a.status === 'draft').length;
  const reviewingCount = applications.filter(a => a.status === 'reviewing' || a.status === 'submitted').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;

  const recentApps = applications.slice(0, 5);

  const statCards = [
    { label: '申报总数', value: totalCount, icon: FileText, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50' },
    { label: '待提交', value: draftCount, icon: Clock, color: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50' },
    { label: '审核中', value: reviewingCount, icon: AlertTriangle, color: 'from-purple-500 to-indigo-500', bgLight: 'bg-purple-50' },
    { label: '已通过', value: approvedCount, icon: CheckCircle, color: 'from-emerald-500 to-green-600', bgLight: 'bg-emerald-50' },
  ];

  const handleCreateApplication = (orgCategory: 'outpatient' | 'clinic' | 'nursing_station') => {
    const type = newType || 'setup';
    const newApp = createApplication(type, orgCategory);
    setShowNewModal(false);
    setNewType('');
    navigate(`/applications/${newApp.id}/edit`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
          <p className="text-sm text-gray-500 mt-1">欢迎使用医疗机构执业登记申报系统</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          新建申报
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">较上月</span>
                <span className="text-xs text-emerald-600 ml-2">+12%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">最近申报</h2>
            <button
              onClick={() => navigate('/applications')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentApps.map((app) => (
              <div
                key={app.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/applications/${app.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{app.basicInfo.orgName || '未命名申报'}</h3>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                      <span>{ORG_CATEGORY_MAP[app.basicInfo.orgCategory as keyof typeof ORG_CATEGORY_MAP] || '-'}</span>
                      <span>{app.type === 'setup' ? '设立登记' : '变更登记'}</span>
                      <span>{formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">快捷操作</h2>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => {
                setNewType('setup');
                setShowNewModal(true);
              }}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FilePlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">新建设立登记</p>
                  <p className="text-xs text-gray-500">首次申请执业登记</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setNewType('change');
                setShowNewModal(true);
              }}
              className="w-full p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">新建变更登记</p>
                  <p className="text-xs text-gray-500">变更已登记事项</p>
                </div>
              </div>
            </button>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">常见问题</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="hover:text-blue-600 cursor-pointer">• 设立登记需要哪些材料？</li>
                <li className="hover:text-blue-600 cursor-pointer">• 诊疗科目如何设置？</li>
                <li className="hover:text-blue-600 cursor-pointer">• 人员资质有什么要求？</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">选择机构类别</h3>
            <p className="text-sm text-gray-500 mb-6">请选择您要申报的医疗机构类别，系统将根据类别自动列出必填项</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleCreateApplication('outpatient')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">门诊部</p>
                  <p className="text-xs text-gray-500">设有多个诊疗科室的门诊机构</p>
                </div>
              </button>

              <button
                onClick={() => handleCreateApplication('clinic')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">诊所</p>
                  <p className="text-xs text-gray-500">科室较少的小型门诊机构</p>
                </div>
              </button>

              <button
                onClick={() => handleCreateApplication('nursing_station')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">护理站</p>
                  <p className="text-xs text-gray-500">以护理服务为主的医疗机构</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowNewModal(false);
                setNewType('');
              }}
              className="w-full mt-6 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
