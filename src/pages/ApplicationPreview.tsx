
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
  Users,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Edit3,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { generateMissingItems, validateApplication, getUnfinishedPromises } from '@/utils/validator';
import { ORG_CATEGORY_MAP } from '@/types';

const STEP_CATEGORY_MAP: Record<string, number> = {
  '基本信息': 1,
  '诊疗科目': 2,
  '人员资质': 3,
  '房屋与布局': 4,
  '设备配置': 5,
  '附件材料': 6,
  '承诺事项': 7,
};

const getStepFromOpinion = (content: string): number => {
  for (const [key, step] of Object.entries(STEP_CATEGORY_MAP)) {
    if (content.includes(key)) return step;
  }
  if (content.includes('人员')) return 3;
  if (content.includes('设备')) return 5;
  if (content.includes('附件') || content.includes('材料')) return 6;
  if (content.includes('承诺')) return 7;
  return 1;
};

export default function ApplicationPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, submitApplication } = useApplicationStore();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPromiseWarning, setShowPromiseWarning] = useState(false);

  const application = applications.find(a => a.id === id);

  if (!application) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const validation = validateApplication(application);
  const missingItems = generateMissingItems(application);
  const canSubmit = validation.valid;
  const unfinishedPromises = getUnfinishedPromises(application.promise);

  const orgCategory = application.basicInfo.orgCategory;
  const typeLabel = application.type === 'setup' ? '设立登记' : '变更登记';
  const isReturned = application.status === 'returned';
  
  const allReturnRecords = application.auditRecords?.filter(r => r.action === 'return') || [];
  const sortedReturnRecords = [...allReturnRecords].sort((a, b) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  const latestReturnRecord = sortedReturnRecords[0];
  const latestReturnOpinions = latestReturnRecord?.opinions?.filter(Boolean) as string[] || [];
  
  const resolvedOpinions = latestReturnOpinions.filter(opinion => {
    return !missingItems.some(item => 
      opinion.includes(item.itemName) || opinion.includes(item.description) || opinion.includes(item.category)
    );
  });
  
  const unresolvedOpinions = latestReturnOpinions.filter(opinion => 
    !resolvedOpinions.includes(opinion)
  );

  const handleSubmit = () => {
    const success = submitApplication(application.id);
    if (success) {
      setShowSubmitConfirm(false);
      navigate(`/applications/${application.id}`);
    }
  };

  const handleSubmitClick = () => {
    if (unfinishedPromises.length > 0) {
      setShowPromiseWarning(true);
      return;
    }
    if (canSubmit) {
      setShowSubmitConfirm(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const goToPromiseStep = () => {
    navigate(`/applications/${application.id}/edit?step=7`);
  };

  const goToStep = (step: number) => {
    navigate(`/applications/${application.id}/edit?step=${step}`);
  };

  const groupedMissingItems = missingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof missingItems>);

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
            onClick={handleSubmitClick}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
              canSubmit
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20'
            }`}
          >
            <Send className="w-4 h-4" />
            {canSubmit ? '提交申报' : `检查待补充项 (${missingItems.length})`}
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
              <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs">
                共 {missingItems.length} 项
              </span>
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              请按类别补充完善以下内容，全部通过后方可提交申报
            </p>
          </div>
          <div className="p-5 space-y-5">
            {Object.entries(groupedMissingItems).map(([category, items]) => {
              const firstStep = items[0]?.step || 1;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {category}
                      <span className="text-xs text-gray-500 font-normal">
                        ({items.length}项)
                      </span>
                    </h4>
                    <button
                      onClick={() => goToStep(firstStep)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      去第{firstStep}步修改
                    </button>
                  </div>
                  <div className="space-y-2 ml-3">
                    {items.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg group hover:bg-amber-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-900">{item.itemName}</p>
                          <p className="text-xs text-amber-700 mt-0.5">{item.description}</p>
                        </div>
                        <button
                          onClick={() => goToStep(item.step)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 px-2 py-1 text-xs text-blue-600 bg-white hover:bg-blue-50 rounded transition-all"
                        >
                          跳转
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded flex-shrink-0 group-hover:hidden">
                          第{item.step}步
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isReturned && latestReturnOpinions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-rose-50">
            <h3 className="font-semibold text-rose-900 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              补正进度
              {latestReturnRecord && (
                <span className="px-2 py-0.5 bg-white text-rose-600 rounded-full text-xs font-medium">
                  {latestReturnRecord.version}
                </span>
              )}
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                {resolvedOpinions.length}/{latestReturnOpinions.length} 已解决
              </span>
            </h3>
            <p className="text-xs text-rose-700 mt-1">
              上次退回的补正意见完成情况
            </p>
          </div>
          <div className="p-5 space-y-5">
            {resolvedOpinions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  已解决 ({resolvedOpinions.length} 项)
                </h4>
                <div className="space-y-2 ml-2">
                  {resolvedOpinions.map((opinion, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{opinion}</p>
                        <p className="text-xs text-green-600 mt-0.5">✅ 已解决</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {unresolvedOpinions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-rose-700 flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  待解决 ({unresolvedOpinions.length} 项)
                </h4>
                <div className="space-y-2 ml-2">
                  {unresolvedOpinions.map((opinion, idx) => {
                    const step = getStepFromOpinion(opinion);
                    return (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-rose-800">{opinion}</p>
                        </div>
                        <button
                          onClick={() => goToStep(step)}
                          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-white hover:bg-rose-100 rounded-md transition-colors border border-rose-200"
                        >
                          <Edit3 className="w-3 h-3" />
                          去第{step}步修改
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

      {showPromiseWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">承诺事项未全部确认</h3>
                <p className="text-sm text-gray-500 mt-1">
                  还有 <span className="font-semibold text-rose-600">{unfinishedPromises.length}</span> 项承诺事项未确认，请全部勾选后再提交。
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-rose-50 rounded-lg p-4 space-y-2">
              {unfinishedPromises.map((up) => (
                <div key={up.key} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-rose-800">{up.label}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPromiseWarning(false)}
                className="flex-1 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                我知道了
              </button>
              <button
                onClick={() => {
                  setShowPromiseWarning(false);
                  goToPromiseStep();
                }}
                className="flex-1 py-2.5 text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-medium"
              >
                去确认承诺
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
