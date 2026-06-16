
import { useState } from 'react';
import { Users, Plus, Trash2, Edit2, X, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { validateIdCard, validateCertificateDate } from '@/utils/validator';

interface FormErrors {
  name?: string;
  idCard?: string;
  certificateNo?: string;
  certificateValidDate?: string;
}

export default function StepPersonnel() {
  const { currentApplication, addPersonnel, removePersonnel } = useApplicationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    idCard: '',
    position: '',
    title: '',
    certificateNo: '',
    certificateValidDate: '',
    practiceScope: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const personnel = currentApplication?.personnel || [];
  const orgCategory = currentApplication?.basicInfo.orgCategory;

  const minDoctors = orgCategory === 'outpatient' ? 3 : orgCategory === 'clinic' ? 1 : 0;
  const minNurses = orgCategory === 'outpatient' ? 5 : orgCategory === 'clinic' ? 1 : 2;

  const doctors = personnel.filter(p => p.position.includes('医师'));
  const nurses = personnel.filter(p => p.position.includes('护士') || p.position.includes('护理'));

  const doctorStatus = doctors.length >= minDoctors ? 'success' : 'warning';
  const nurseStatus = nurses.length >= minNurses ? 'success' : 'warning';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!validateIdCard(formData.idCard)) {
      newErrors.idCard = '身份证号格式不正确';
    }
    if (!formData.certificateNo.trim()) {
      newErrors.certificateNo = '请输入执业证书号';
    }
    if (!formData.certificateValidDate) {
      newErrors.certificateValidDate = '请选择证书有效期';
    } else {
      const result = validateCertificateDate(formData.certificateValidDate);
      if (result?.type === 'error') {
        newErrors.certificateValidDate = result.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    
    addPersonnel({
      ...formData,
    });
    
    setFormData({
      name: '',
      gender: '男',
      idCard: '',
      position: '',
      title: '',
      certificateNo: '',
      certificateValidDate: '',
      practiceScope: '',
    });
    setShowAddForm(false);
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">人员资质</h2>
          <p className="text-sm text-gray-500">请添加医疗机构的医护人员信息</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${doctorStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">执业医师配置</span>
            {doctorStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {doctors.length} <span className="text-sm font-normal text-gray-500">/ 至少 {minDoctors} 人</span>
          </p>
        </div>
        <div className={`p-4 rounded-lg border ${nurseStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">护士配置</span>
            {nurseStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {nurses.length} <span className="text-sm font-normal text-gray-500">/ 至少 {minNurses} 人</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">人员列表（{personnel.length}）</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加人员
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">添加人员</h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setErrors({});
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="请输入姓名"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">性别</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat', paddingRight: '2.5rem' }}
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                身份证号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.idCard}
                onChange={(e) => handleChange('idCard', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.idCard ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="请输入身份证号"
              />
              {errors.idCard && <p className="text-xs text-red-500">{errors.idCard}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                职务 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat', paddingRight: '2.5rem' }}
              >
                <option value="">请选择</option>
                <option value="执业医师">执业医师</option>
                <option value="执业助理医师">执业助理医师</option>
                <option value="护士">护士</option>
                <option value="护师">护师</option>
                <option value="药师">药师</option>
                <option value="技师">技师</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">职称</label>
              <select
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat', paddingRight: '2.5rem' }}
              >
                <option value="">请选择</option>
                <option value="初级">初级</option>
                <option value="主治医师">主治医师</option>
                <option value="副主任医师">副主任医师</option>
                <option value="主任医师">主任医师</option>
                <option value="护士">护士</option>
                <option value="护师">护师</option>
                <option value="主管护师">主管护师</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                执业证书号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.certificateNo}
                onChange={(e) => handleChange('certificateNo', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.certificateNo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="请输入执业证书号"
              />
              {errors.certificateNo && <p className="text-xs text-red-500">{errors.certificateNo}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                证书有效期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.certificateValidDate}
                onChange={(e) => handleChange('certificateValidDate', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.certificateValidDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.certificateValidDate && <p className="text-xs text-red-500">{errors.certificateValidDate}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">执业范围</label>
              <input
                type="text"
                value={formData.practiceScope}
                onChange={(e) => handleChange('practiceScope', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入执业范围，如：内科专业"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => {
                setShowAddForm(false);
                setErrors({});
              }}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Check className="w-4 h-4" />
              确认添加
            </button>
          </div>
        </div>
      )}

      {personnel.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">暂未添加人员信息</p>
          <p className="text-sm text-gray-400 mt-1">点击上方按钮添加医护人员</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">性别</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">职务</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">职称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">执业证书号</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">有效期至</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">执业范围</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {personnel.map(person => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{person.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{person.gender}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{person.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{person.title || '-'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{person.certificateNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{person.certificateValidDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{person.practiceScope || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removePersonnel(person.id)}
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

      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">填写提示</p>
          <p className="text-xs text-blue-700 mt-1">
            {orgCategory === 'outpatient' && '门诊部要求至少3名执业医师和5名护士。'}
            {orgCategory === 'clinic' && '诊所要求至少1名执业医师和1名护士。'}
            {orgCategory === 'nursing_station' && '护理站要求至少2名护士。'}
            请确保所有人员资质证书在有效期内，并与诊疗科目相匹配。
          </p>
        </div>
      </div>
    </div>
  );
}
