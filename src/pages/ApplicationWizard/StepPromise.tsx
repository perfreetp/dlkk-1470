
import { Shield, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { useState } from 'react';

export default function StepPromise() {
  const { currentApplication, updatePromise, submitApplication } = useApplicationStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const promise = currentApplication?.promise;

  if (!promise) return null;

  const allChecked = 
    promise.hasLegalPerson &&
    promise.hasBusinessScope &&
    promise.hasQualifiedPersonnel &&
    promise.hasQualifiedPremises &&
    promise.hasQualifiedEquipment &&
    promise.hasAllAttachments &&
    promise.isTruthful;

  const handleChange = (field: string, value: boolean) => {
    updatePromise({ [field]: value });
  };

  const promiseItems = [
    { key: 'hasLegalPerson', label: '法定代表人符合法定条件，无违法违规记录' },
    { key: 'hasBusinessScope', label: '业务范围符合相关法律法规规定' },
    { key: 'hasQualifiedPersonnel', label: '从业人员均具有相应资质证书，且在有效期内' },
    { key: 'hasQualifiedPremises', label: '执业场所符合医疗机构基本标准' },
    { key: 'hasQualifiedEquipment', label: '设备配置符合医疗机构基本标准' },
    { key: 'hasAllAttachments', label: '提交的所有材料真实、完整、有效' },
    { key: 'isTruthful', label: '所申报信息全部属实，如有虚假愿承担法律责任' },
  ];

  const handleSubmit = () => {
    if (submitApplication()) {
      setShowConfirm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">承诺事项</h2>
          <p className="text-sm text-gray-500">请仔细阅读并确认以下承诺事项</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">重要提示</p>
          <p className="text-xs text-amber-700 mt-1">
            提交申报前请确保所有信息填写准确、材料完整。虚假申报将承担相应的法律责任，
            并影响后续申报审批。请逐项核对确认后再提交。
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {promiseItems.map(item => (
          <label
            key={item.key}
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
              promise[item.key as keyof typeof promise]
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={promise[item.key as keyof typeof promise]}
              onChange={(e) => handleChange(item.key, e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      <div className={`p-5 rounded-lg border-2 ${
        allChecked 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          {allChecked ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          )}
          <span className={`text-sm font-medium ${
            allChecked ? 'text-green-900' : 'text-gray-500'
          }`}>
            {allChecked ? '已确认全部承诺事项' : `请确认全部 ${promiseItems.length} 项承诺`}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          勾选全部承诺事项后，方可提交申报。提交后将进入审核流程，不可随意修改。
        </p>
      </div>

      {allChecked && (
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FileCheck className="w-5 h-5" />
          提交申报
        </button>
      )}
    </div>
  );
}
