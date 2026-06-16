
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Eye, Edit2, Trash2, MoreHorizontal, Calendar, ChevronDown } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import StatusBadge from '@/components/StatusBadge';
import { ORG_CATEGORY_MAP, ApplicationStatus } from '@/types';

export default function ApplicationList() {
  const navigate = useNavigate();
  const { applications, deleteApplication } = useApplicationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'setup' | 'change'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.basicInfo.orgName.includes(searchTerm) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条申报记录吗？')) {
      deleteApplication(id);
    }
  };

  const handleEdit = (app: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/applications/${app.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">申报列表</h1>
          <p className="text-sm text-gray-500 mt-1">共 {filteredApps.length} 条申报记录</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          新建申报
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索机构名称或申报编号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 h-9 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {(['all', 'draft', 'submitted', 'reviewing', 'approved', 'returned'] as const).map((status) => {
                const labels: Record<string, string> = {
                  all: '全部',
                  draft: '草稿',
                  submitted: '已提交',
                  reviewing: '审核中',
                  approved: '已通过',
                  returned: '已退回',
                };
                const colors: Record<string, string> = {
                  all: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  draft: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  submitted: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  reviewing: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
                  approved: 'bg-green-50 text-green-600 hover:bg-green-100',
                  returned: 'bg-red-50 text-red-600 hover:bg-red-100',
                };
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? status === 'all'
                          ? 'bg-gray-900 text-white'
                          : status === 'submitted'
                          ? 'bg-blue-600 text-white'
                          : status === 'reviewing'
                          ? 'bg-yellow-500 text-white'
                          : status === 'approved'
                          ? 'bg-green-600 text-white'
                          : status === 'returned'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-900 text-white'
                        : colors[status]
                    }`}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Filter className="w-4 h-4" />
                筛选
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <p className="px-3 py-1.5 text-xs text-gray-500 font-medium">申报类型</p>
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      typeFilter === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    全部类型
                  </button>
                  <button
                    onClick={() => setTypeFilter('setup')}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      typeFilter === 'setup' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    设立登记
                  </button>
                  <button
                    onClick={() => setTypeFilter('change')}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      typeFilter === 'change' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    变更登记
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申报编号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  机构名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  机构类别
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申报类型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">
                    {app.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {app.basicInfo.orgName || '未命名申报'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ORG_CATEGORY_MAP[app.basicInfo.orgCategory as keyof typeof ORG_CATEGORY_MAP] || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {app.type === 'setup' ? '设立登记' : '变更登记'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}`);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="查看"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleEdit(app, e)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(app.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApps.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">没有找到匹配的申报记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
