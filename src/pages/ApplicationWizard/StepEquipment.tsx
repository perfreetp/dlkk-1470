
import { useState } from 'react';
import { Cpu, Plus, Trash2, X, Check, CheckCircle2 } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';

export default function StepEquipment() {
  const { currentApplication, addEquipment, removeEquipment } = useApplicationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    quantity: 1,
    manufacturer: '',
    purchaseDate: '',
  });

  const equipment = currentApplication?.equipment || [];
  const orgCategory = currentApplication?.basicInfo.orgCategory;

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    
    addEquipment({
      ...formData,
    });
    
    setFormData({
      name: '',
      model: '',
      quantity: 1,
      manufacturer: '',
      purchaseDate: '',
    });
    setShowAddForm(false);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isOptional = orgCategory === 'clinic';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Cpu className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">设备配置</h2>
          <p className="text-sm text-gray-500">
            {isOptional ? '诊所设备配置为选填项' : '请填写医疗机构的主要设备配置'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">设备列表（{equipment.length}）</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加设备
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">添加设备</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                设备名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入设备名称"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">型号规格</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入型号"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">生产厂家</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入生产厂家"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">购置日期</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              确认添加
            </button>
          </div>
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">暂未添加设备信息</p>
          <p className="text-sm text-gray-400 mt-1">点击上方按钮添加设备</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">设备名称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">型号规格</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">生产厂家</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">购置日期</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {equipment.map(equip => (
                <tr key={equip.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{equip.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{equip.model || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{equip.quantity} 台</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{equip.manufacturer || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{equip.purchaseDate || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeEquipment(equip.id)}
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
            请列出主要的医疗设备清单。门诊部和护理站需配备基本的诊疗设备，
            诊所可根据实际开展业务配备相应设备。大型设备需提供注册证。
          </p>
        </div>
      </div>
    </div>
  );
}
