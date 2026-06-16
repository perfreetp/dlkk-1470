
import { useState } from 'react';
import { Stethoscope, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { DEPARTMENT_OPTIONS } from '@/types';

export default function StepDepartments() {
  const { currentApplication, addDepartment, removeDepartment } = useApplicationStore();
  const [selectedDept, setSelectedDept] = useState('');
  const [remark, setRemark] = useState('');

  const departments = currentApplication?.departments || [];
  const orgCategory = currentApplication?.basicInfo.orgCategory;

  const handleAdd = () => {
    if (!selectedDept) return;
    const dept = DEPARTMENT_OPTIONS.find(d => d.code === selectedDept);
    if (dept && !departments.some(d => d.code === selectedDept)) {
      addDepartment({
        code: dept.code,
        name: dept.name,
        level: '一级科目',
        remark,
      });
      setSelectedDept('');
      setRemark('');
    }
  };

  const availableOptions = DEPARTMENT_OPTIONS.filter(
    d => !departments.some(dep => dep.code === d.code)
  );

  const isNursingStation = orgCategory === 'nursing_station';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">诊疗科目</h2>
          <p className="text-sm text-gray-500">
            {isNursingStation ? '护理站无需设置诊疗科目' : '请添加医疗机构的诊疗科目'}
          </p>
        </div>
      </div>

      {isNursingStation ? (
        <div className="bg-amber-50 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-900 font-medium">护理站无需设置诊疗科目</p>
          <p className="text-sm text-amber-700 mt-1">请直接进入下一步填写人员资质信息</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  选择诊疗科目 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat', paddingRight: '2.5rem' }}
                >
                  <option value="">请选择诊疗科目</option>
                  {availableOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.code} - {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  备注说明
                </label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="选填，如二级科目、专业等"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!selectedDept}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">已添加科目（{departments.length}）</h3>
            </div>

            {departments.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">暂未添加诊疗科目</p>
                <p className="text-sm text-gray-400 mt-1">请从上方选择并添加</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">科目代码</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">科目名称</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">级别</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {departments.map(dept => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{dept.code}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{dept.level}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{dept.remark || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeDepartment(dept.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">填写提示</p>
              <p className="text-xs text-blue-700 mt-1">
                诊疗科目应与机构类别和人员资质相匹配。门诊部可设置多个一级科目，
                诊所一般设置1-2个科目。每个科目至少需要1名相应专业的执业医师。
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
