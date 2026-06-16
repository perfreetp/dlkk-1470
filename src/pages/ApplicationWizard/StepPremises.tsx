
import { Home, CheckCircle2, Maximize2, MapPin, Building } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import FormInput from '@/components/Form/FormInput';
import FormSelect from '@/components/Form/FormSelect';

export default function StepPremises() {
  const { currentApplication, updatePremises } = useApplicationStore();
  
  const premises = currentApplication?.premises;

  const handleChange = (field: string, value: string) => {
    updatePremises({ [field]: value });
  };

  if (!premises) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <Home className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">房屋与平面布局</h2>
          <p className="text-sm text-gray-500">请填写医疗机构的房屋信息和布局情况</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <FormInput
          label="建筑面积（㎡）"
          required
          type="number"
          value={premises.buildingArea}
          onChange={(e) => handleChange('buildingArea', e.target.value)}
          placeholder="请输入建筑面积"
        />
        <FormInput
          label="使用面积（㎡）"
          required
          type="number"
          value={premises.useArea}
          onChange={(e) => handleChange('useArea', e.target.value)}
          placeholder="请输入使用面积"
        />
        <FormSelect
          label="房屋性质"
          required
          value={premises.houseNature}
          onChange={(e) => handleChange('houseNature', e.target.value)}
          options={[
            { value: '商业用房', label: '商业用房' },
            { value: '住宅用房', label: '住宅用房' },
            { value: '办公用房', label: '办公用房' },
            { value: '工业用房', label: '工业用房' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FormSelect
          label="产权证明"
          required
          value={premises.propertyProof}
          onChange={(e) => handleChange('propertyProof', e.target.value)}
          options={[
            { value: '房屋所有权证', label: '房屋所有权证' },
            { value: '不动产权证', label: '不动产权证' },
            { value: '租赁合同', label: '租赁合同' },
            { value: '无偿使用证明', label: '无偿使用证明' },
          ]}
        />
        <FormInput
          label="楼层"
          value={premises.floors}
          onChange={(e) => handleChange('floors', e.target.value)}
          placeholder="如：1层、1-3层"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          平面布局描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={premises.layoutDescription}
          onChange={(e) => handleChange('layoutDescription', e.target.value)}
          rows={4}
          placeholder="请详细描述各楼层科室分布、功能分区等布局情况"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          建议说明各楼层/区域的功能分布，如诊室、治疗室、药房、检验科等位置
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">填写提示</p>
          <p className="text-xs text-blue-700 mt-1">
            建筑面积和使用面积以房产证或实际测量为准。门诊部建筑面积一般不少于
            400㎡，诊所不少于100㎡，护理站不少于100㎡。平面布局图需在附件材料中上传。
          </p>
        </div>
      </div>
    </div>
  );
}
