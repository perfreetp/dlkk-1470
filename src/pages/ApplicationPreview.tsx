
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Printer,
  Send,
  User,
  Home,
  Cpu,
  Paperclip,
  Shield,
  Stethoscope,
  Users
} from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { generateMissingItems, validateApplication } from '@/utils/validator';
import { ORG_CATEGORY_MAP, STATUS_COLOR_MAP } from '@/types';

export default function ApplicationPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, submitApplication } = useApplicationStore();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const application = applications.find(a => a.id === id);

  if (!application) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const validation = validateApplication(application);
  const missingItems = generateMissingItems(application);
  const canSubmit = validation.valid;

  const orgCategory = application.basicInfo.orgCategory;
  const typeLabel = application.type === 'setup' ? '设立登记' : '变更登记';

  const handleSubmit = () => {
    submitApplication(application.id);
    navigate(`/applications/${application.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/applications/${application.id}/edit`)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">申报预览</h1>
            <p className="text-sm text-gray-500 mt-1">
              {typeLabel} · {ORG_CATEGORY_MAP[orgCategory as keyof typeof ORG_CATEGORY_MAP]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            打印申报表
          </button>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
              canSubmit
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            提交申报
          </button>
        </div>
      </div>

      <div className={`p-5 rounded-xl border-2 print:border-gray-400 ${
        canSubmit ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
      }`}>
        <div className="flex items-start gap-3">
          {canSubmit ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <h3 className={`font-semibold ${canSubmit ? 'text-green-900' : 'text-amber-900'}`}>
              {canSubmit ? '材料校验通过，可以提交申报' : '存在待补充项，请完善后再提交'}
            </h3>
            <p className={`text-sm mt-1 ${canSubmit ? 'text-green-700' : 'text-amber-700'}`}>
              {canSubmit 
                ? '所有必填项均已填写完整，您可以提交申报进入审核流程。'
                : `共发现 ${missingItems.length} 项待补充内容，请检查下方缺件清单。`
              }
            </p>
          </div>
        </div>
      </div>

      {!canSubmit && missingItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-amber-50">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              缺件清单
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {missingItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">{item.category}</p>
                  <p className="text-xs text-amber-700 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6 print:space-y-4">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">一、机构基本信息</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">机构名称</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.orgName || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">机构类别</span>
                <p className="font-medium text-gray-900 mt-0.5">
                  {ORG_CATEGORY_MAP[orgCategory as keyof typeof ORG_CATEGORY_MAP] || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">经营性质</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.businessNature || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">注册资金</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.registeredCapital || '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">执业地址</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.practiceAddress || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">机构电话</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.contactPhone || '-'}</p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">法定代表人</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">姓名</span>
                  <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.legalRepresentative || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">身份证号</span>
                  <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.legalIdCard || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">联系电话</span>
                  <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.legalPhone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">主要负责人</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">姓名</span>
                  <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.mainDirector || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">身份证号</span>
                  <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.directorIdCard || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">联系电话</span>
                  <p className="font-medium text-gray-900 mt-0.5">{application.basicInfo.directorPhone || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">二、诊疗科目</h3>
          </div>
          <div className="p-5">
            {orgCategory === 'nursing_station' ? (
              <p className="text-sm text-gray-500">护理站不设置诊疗科目</p>
            ) : application.departments.length === 0 ? (
              <p className="text-sm text-gray-400">暂未添加诊疗科目</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {application.departments.map(dept => (
                  <span 
                    key={dept.id}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-full"
                  >
                    {dept.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">三、人员资质</h3>
          </div>
          <div className="p-5">
            {application.personnel.length === 0 ? (
              <p className="text-sm text-gray-400">暂未添加人员</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">姓名</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">性别</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">职务</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">职称</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">证书号</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">有效期至</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">执业范围</th>
                  </tr>
                </thead>
                <tbody>
                  {application.personnel.map(person => (
                    <tr key={person.id} className="border-b border-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{person.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{person.gender}</td>
                      <td className="py-2.5 px-3 text-gray-600">{person.position}</td>
                      <td className="py-2.5 px-3 text-gray-600">{person.title || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">{person.certificateNo}</td>
                      <td className="py-2.5 px-3 text-gray-600">{person.certificateValidDate || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-600">{person.practiceScope || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">四、房屋与平面布局</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">建筑面积</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.premises?.buildingArea || '-'} ㎡</p>
              </div>
              <div>
                <span className="text-gray-500">使用面积</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.premises?.useArea || '-'} ㎡</p>
              </div>
              <div>
                <span className="text-gray-500">房屋性质</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.premises?.houseNature || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">楼层</span>
                <p className="font-medium text-gray-900 mt-0.5">{application.premises?.floors || '-'}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 text-sm">平面布局描述</span>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                {application.premises?.layoutDescription || '暂无描述'}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">五、设备配置</h3>
          </div>
          <div className="p-5">
            {application.equipment.length === 0 ? (
              <p className="text-sm text-gray-400">暂未添加设备</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">设备名称</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">型号规格</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">数量</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">生产厂家</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">购置日期</th>
                  </tr>
                </thead>
                <tbody>
                  {application.equipment.map(equip => (
                    <tr key={equip.id} className="border-b border-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{equip.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{equip.model || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-600">{equip.quantity} 台</td>
                      <td className="py-2.5 px-3 text-gray-600">{equip.manufacturer || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-600">{equip.purchaseDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900">六、附件材料</h3>
          </div>
          <div className="p-5">
            {application.attachments.length === 0 ? (
              <p className="text-sm text-gray-400">暂未上传附件</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {application.attachments.map(att => (
                  <div 
                    key={att.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileCheck className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{att.fileName}</p>
                      <p className="text-xs text-gray-500">{att.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-semibold text-gray-900">七、承诺事项</h3>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              {[
                { key: 'hasLegalPerson', label: '法定代表人符合法定条件，无违法违规记录' },
                { key: 'hasBusinessScope', label: '业务范围符合相关法律法规规定' },
                { key: 'hasQualifiedPersonnel', label: '从业人员均具有相应资质证书，且在有效期内' },
                { key: 'hasQualifiedPremises', label: '执业场所符合医疗机构基本标准' },
                { key: 'hasQualifiedEquipment', label: '设备配置符合医疗机构基本标准' },
                { key: 'hasAllAttachments', label: '提交的所有材料真实、完整、有效' },
                { key: 'isTruthful', label: '所申报信息全部属实，如有虚假愿承担法律责任' },
              ].map(item => (
                <div 
                  key={item.key}
                  className="flex items-center gap-2 text-sm"
                >
                  {application.promise[item.key as keyof typeof application.promise] ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={
                    application.promise[item.key as keyof typeof application.promise]
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">确认提交申报？</h3>
              <p className="text-sm text-gray-500 mt-2">
                提交后将进入审核流程，申报信息不可随意修改。
                请确认所有信息填写准确无误。
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
