
import { Shield, CheckCircle2, AlertTriangle, FileCheck, X, ArrowRight, AlertCircle } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateApplication, groupValidationByCategory } from '@/utils/validator';

export default function StepPromise() {
  const { currentApplication, updatePromise } = useApplicationStore();
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const navigate = useNavigate();

  const promise = currentApplication?.promise;

  if (!promise || !currentApplication) return null;

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
    const validation = validateApplication(currentApplication);
    if (!validation.valid || !allChecked) {
      setShowMissingDialog(true);
      return;
    }
    navigate(`/applications/${currentApplication.id}/preview`);
  };

  const validation = validateApplication(currentApplication);
  const groupedItems = validation.valid ? {} : groupValidationByCategory(validation.errors);
  const totalErrors = Object.values(groupedItems).reduce((sum, arr) => sum + arr.length, 0);

  const STEP_MAP: Record<string, number> = {
    '基本信息': 1,
    '诊疗科目': 2,
    '人员资质': 3,
    '房屋布局': 4,
    '设备配置': 5,
    '附件材料': 6,
    '承诺事项': 7,
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
          勾选全部承诺事项后，方可进入预览确认。预览无误后提交申报。
        </p>
      </div>

      {allChecked && (
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FileCheck className="w-5 h-5" />
          预览并确认提交
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      )}

      {showMissingDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">存在待补充内容</h3>
                  <p className="text-sm text-gray-500">请完善以下内容后再提交</p>
                </div>
              </div>
              <button
                onClick={() => setShowMissingDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-96 space-y-4">
              {!allChecked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800">⚠️ 请确认全部承诺事项</p>
                  <p className="text-xs text-amber-700 mt-1">需勾选全部 {promiseItems.length} 项承诺后方可提交</p>
                </div>
              )}
              {!validation.valid && totalErrors > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">材料校验不通过（共 {totalErrors} 项）：</p>
                  {Object.entries(groupedItems).map(([category, items]) => {
                    const step = STEP_MAP[category] || 1;
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{category}（{items.length} 项）</span>
                          <button
                            onClick={() => {
                              setShowMissingDialog(false);
                              navigate(`/applications/${currentApplication.id}/edit?step=${step}`);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            去第{step}步修改 →
                          </button>
                        </div>
                        <ul className="divide-y divide-gray-100">
                          {items.map((item, idx) => (
                            <li key={idx} className="px-4 py-2 text-xs text-gray-600 flex items-start gap-2">
                              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                item.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                              }`} />
                              <span>{item.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowMissingDialog(false)}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                我知道了，去完善
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
