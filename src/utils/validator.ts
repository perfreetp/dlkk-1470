
import { Application, ValidationResult, MissingItem, OrgCategory, PromiseData, DEPARTMENT_OPTIONS } from '@/types';

export const PROMISE_LABELS: Record<keyof PromiseData, string> = {
  hasLegalPerson: '法定代表人符合法定条件，无违法违规记录',
  hasBusinessScope: '业务范围符合相关法律法规规定',
  hasQualifiedPersonnel: '从业人员均具有相应资质证书，且在有效期内',
  hasQualifiedPremises: '执业场所符合医疗机构基本标准',
  hasQualifiedEquipment: '设备配置符合医疗机构基本标准',
  hasAllAttachments: '提交的所有材料真实、完整、有效',
  isTruthful: '所申报信息全部属实，如有虚假愿承担法律责任',
};

const DEPARTMENT_PRACTICE_SCOPE_MAP: Record<string, string[]> = {
  '内科': ['内科专业', '内科学', '内科'],
  '外科': ['外科专业', '外科学', '外科'],
  '妇产科': ['妇产科专业', '妇产科学', '妇产科', '妇科'],
  '儿科': ['儿科专业', '儿科学', '儿科'],
  '眼科': ['眼科专业', '眼科学', '眼科'],
  '耳鼻咽喉科': ['耳鼻咽喉科专业', '耳鼻咽喉科学', '耳鼻喉科'],
  '口腔科': ['口腔专业', '口腔医学', '口腔科'],
  '皮肤科': ['皮肤科专业', '皮肤病与性病学', '皮肤科'],
  '医疗美容科': ['医疗美容专业', '美容外科', '美容皮肤科'],
  '精神科': ['精神科专业', '精神病学', '精神科'],
  '肿瘤科': ['肿瘤专业', '肿瘤学', '肿瘤科'],
  '急诊医学科': ['急诊医学专业', '急诊医学', '急诊科'],
  '康复医学科': ['康复医学专业', '康复医学', '康复科'],
  '医学检验科': ['医学检验专业', '医学检验技术', '检验科'],
  '病理科': ['病理学专业', '病理学', '病理科'],
  '医学影像科': ['医学影像专业', '医学影像学', '影像科', '放射科'],
  '中医科': ['中医专业', '中医学', '中医内科学', '中医外科学', '中医'],
  '中西医结合科': ['中西医结合专业', '中西医结合', '中西医临床医学'],
};

const DEPARTMENT_EQUIPMENT_MAP: Record<string, string[]> = {
  '内科': ['听诊器', '血压计', '心电图机', '血糖仪'],
  '外科': ['手术床', '无影灯', '手术器械', '换药车'],
  '妇产科': ['妇科检查床', 'B超机', '胎心监护仪', '手术床'],
  '儿科': ['小儿听诊器', '体重秤', '身高测量仪', '急救箱'],
  '眼科': ['视力表', '裂隙灯', '眼压计', '眼底镜'],
  '耳鼻咽喉科': ['耳镜', '鼻镜', '喉镜', '听力计'],
  '口腔科': ['牙科综合治疗台', '口腔镜', '牙钻机', '洁牙机'],
  '皮肤科': ['伍德灯', '激光治疗仪', '液氮冷冻设备', '显微镜'],
  '医学检验科': ['生化分析仪', '血常规仪', '尿常规仪', '显微镜'],
  '医学影像科': ['X光机', 'CT机', 'B超机', 'DR机'],
  '中医科': ['针灸针', '艾灸仪', '中药柜', '脉枕'],
};

export const validateIdCard = (idCard: string): boolean => {
  if (!idCard) return false;
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(idCard);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

export const validateOrgName = (name: string): ValidationResult | null => {
  if (!name || name.trim() === '') {
    return { type: 'error', field: 'orgName', message: '机构名称不能为空' };
  }
  if (name.length < 4) {
    return { type: 'warning', field: 'orgName', message: '机构名称建议包含地区、字号、行业和组织形式' };
  }
  return null;
};

export const validatePracticeAddress = (address: string): ValidationResult | null => {
  if (!address || address.trim() === '') {
    return { type: 'error', field: 'practiceAddress', message: '执业地址不能为空' };
  }
  if (address.length < 10) {
    return { type: 'warning', field: 'practiceAddress', message: '执业地址请填写详细地址' };
  }
  return null;
};

export const validateCertificateDate = (dateStr: string): ValidationResult | null => {
  if (!dateStr) {
    return { type: 'error', field: 'certificateValidDate', message: '证书有效期不能为空' };
  }
  const date = new Date(dateStr);
  const now = new Date();
  if (date < now) {
    return { type: 'error', field: 'certificateValidDate', message: '证书已过期' };
  }
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  if (date < oneYearLater) {
    return { type: 'warning', field: 'certificateValidDate', message: '证书有效期不足一年，建议及时更新' };
  }
  return null;
};

export const getUnfinishedPromises = (promise: PromiseData): { key: string; label: string }[] => {
  const unfinished: { key: string; label: string }[] = [];
  (Object.keys(promise) as Array<keyof PromiseData>).forEach(key => {
    if (!promise[key]) {
      unfinished.push({ key, label: PROMISE_LABELS[key] });
    }
  });
  return unfinished;
};

export const checkDepartmentPersonnelMatch = (
  departments: { name: string }[],
  personnel: { name: string; position: string; practiceScope: string }[]
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  departments.forEach((dept, deptIndex) => {
    const scopes = DEPARTMENT_PRACTICE_SCOPE_MAP[dept.name] || [];
    if (scopes.length === 0) return;
    
    const hasMatchingPersonnel = personnel.some(p => {
      if (!p.practiceScope) return false;
      return scopes.some(scope => 
        p.practiceScope.includes(scope) || scope.includes(p.practiceScope)
      );
    });
    
    if (!hasMatchingPersonnel) {
      results.push({
        type: 'error',
        field: `departments[${deptIndex}].personnel`,
        message: `「${dept.name}」缺少对应执业范围的医师，请补充具有${scopes[0]}执业范围的人员`
      });
    }
  });
  
  return results;
};

export const checkDepartmentEquipmentMatch = (
  departments: { name: string }[],
  equipment: { name: string }[]
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  departments.forEach((dept, deptIndex) => {
    const requiredEquipment = DEPARTMENT_EQUIPMENT_MAP[dept.name] || [];
    if (requiredEquipment.length === 0) return;
    
    const missingEquipment = requiredEquipment.filter(eq =>
      !equipment.some(e => e.name.includes(eq) || eq.includes(e.name))
    );
    
    if (missingEquipment.length > 0 && missingEquipment.length >= requiredEquipment.length * 0.5) {
      results.push({
        type: 'warning',
        field: `departments[${deptIndex}].equipment`,
        message: `「${dept.name}」建议配置：${missingEquipment.slice(0, 3).join('、')}等设备`
      });
    }
  });
  
  return results;
};

export interface ApplicationValidationResult {
  valid: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

export const validateApplication = (app: Application): ApplicationValidationResult => {
  const results: ValidationResult[] = [];
  const { basicInfo, departments, personnel, premises, equipment, attachments, promise } = app;
  const orgCategory = basicInfo.orgCategory as OrgCategory;

  const orgNameResult = validateOrgName(basicInfo.orgName);
  if (orgNameResult) results.push(orgNameResult);

  const addressResult = validatePracticeAddress(basicInfo.practiceAddress);
  if (addressResult) results.push(addressResult);

  if (!basicInfo.legalRepresentative) {
    results.push({ type: 'error', field: 'legalRepresentative', message: '法定代表人姓名不能为空' });
  }
  if (basicInfo.legalIdCard && !validateIdCard(basicInfo.legalIdCard)) {
    results.push({ type: 'error', field: 'legalIdCard', message: '法定代表人身份证号格式不正确' });
  }
  if (basicInfo.legalPhone && !validatePhone(basicInfo.legalPhone)) {
    results.push({ type: 'error', field: 'legalPhone', message: '法定代表人联系电话格式不正确' });
  }

  if (!basicInfo.mainDirector) {
    results.push({ type: 'error', field: 'mainDirector', message: '主要负责人姓名不能为空' });
  }
  if (basicInfo.directorIdCard && !validateIdCard(basicInfo.directorIdCard)) {
    results.push({ type: 'error', field: 'directorIdCard', message: '主要负责人身份证号格式不正确' });
  }
  if (basicInfo.directorPhone && !validatePhone(basicInfo.directorPhone)) {
    results.push({ type: 'error', field: 'directorPhone', message: '主要负责人联系电话格式不正确' });
  }

  if (orgCategory !== 'nursing_station' && departments.length === 0) {
    results.push({ type: 'error', field: 'departments', message: '请至少添加一个诊疗科目' });
  }

  if (orgCategory !== 'nursing_station' && departments.length > 0) {
    const deptPersonnelResults = checkDepartmentPersonnelMatch(departments, personnel);
    results.push(...deptPersonnelResults);
    
    const deptEquipmentResults = checkDepartmentEquipmentMatch(departments, equipment);
    results.push(...deptEquipmentResults);
  }

  const minDoctors = orgCategory === 'outpatient' ? 3 : orgCategory === 'clinic' ? 1 : 0;
  const minNurses = orgCategory === 'outpatient' ? 5 : orgCategory === 'clinic' ? 1 : 2;
  
  const doctors = personnel.filter(p => p.position.includes('医师'));
  const nurses = personnel.filter(p => p.position.includes('护士') || p.position.includes('护理'));

  if (minDoctors > 0 && doctors.length < minDoctors) {
    results.push({ type: 'error', field: 'personnel', message: `${orgCategory === 'outpatient' ? '门诊部' : '诊所'}至少需要${minDoctors}名执业医师，当前${doctors.length}名` });
  }
  if (nurses.length < minNurses) {
    results.push({ type: 'error', field: 'personnel', message: `${orgCategory === 'nursing_station' ? '护理站' : '本机构'}至少需要${minNurses}名护士，当前${nurses.length}名` });
  }

  personnel.forEach((p, index) => {
    if (!p.name) {
      results.push({ type: 'error', field: `personnel[${index}].name`, message: `第${index + 1}位人员姓名不能为空` });
    }
    if (p.idCard && !validateIdCard(p.idCard)) {
      results.push({ type: 'error', field: `personnel[${index}].idCard`, message: `「${p.name || '第' + (index + 1) + '位人员'}」身份证号格式不正确` });
    }
    if (!p.certificateNo && p.position && p.position !== '其他') {
      results.push({ type: 'error', field: `personnel[${index}].certificateNo`, message: `「${p.name || '第' + (index + 1) + '位人员'}」执业证书号不能为空` });
    }
    if (p.certificateValidDate) {
      const certResult = validateCertificateDate(p.certificateValidDate);
      if (certResult) {
        results.push({ 
          ...certResult, 
          field: `personnel[${index}].certificateValidDate`,
          message: `「${p.name || '第' + (index + 1) + '位人员'}」${certResult.message}`
        });
      }
    }
  });

  if (!premises.buildingArea) {
    results.push({ type: 'error', field: 'buildingArea', message: '建筑面积不能为空' });
  }
  if (!premises.useArea) {
    results.push({ type: 'error', field: 'useArea', message: '使用面积不能为空' });
  }
  if (!premises.houseNature) {
    results.push({ type: 'error', field: 'houseNature', message: '房屋性质不能为空' });
  }

  if ((orgCategory === 'outpatient' || orgCategory === 'nursing_station') && equipment.length === 0) {
    results.push({ type: 'warning', field: 'equipment', message: '建议配置必要的医疗设备' });
  }

  const requiredCategories = ['身份证明', '资质证明', '产权证明', '平面图'];
  requiredCategories.forEach(cat => {
    const hasAttachment = attachments.some(a => a.category === cat && a.status === 'uploaded');
    if (!hasAttachment) {
      results.push({ type: 'error', field: `attachments.${cat}`, message: `请上传${cat}材料` });
    }
  });

  const unfinishedPromises = getUnfinishedPromises(promise);
  if (unfinishedPromises.length > 0) {
    results.push({ 
      type: 'error', 
      field: 'promise', 
      message: `还有${unfinishedPromises.length}项承诺事项未确认` 
    });
  }

  const errors = results.filter(r => r.type === 'error');
  const warnings = results.filter(r => r.type === 'warning');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export const generateMissingItems = (app: Application): MissingItem[] => {
  const items: MissingItem[] = [];
  const { basicInfo, departments, personnel, premises, equipment, attachments, promise } = app;
  const orgCategory = basicInfo.orgCategory as OrgCategory;
  let itemId = 1;

  if (!basicInfo.orgName) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '机构名称', description: '请填写机构全称', step: 1 });
  }
  if (!basicInfo.legalRepresentative) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '法定代表人', description: '请填写法定代表人姓名', step: 1 });
  }
  if (basicInfo.legalIdCard && !validateIdCard(basicInfo.legalIdCard)) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '法定代表人身份证', description: '身份证号格式不正确，请检查', step: 1 });
  }
  if (basicInfo.legalPhone && !validatePhone(basicInfo.legalPhone)) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '法定代表人电话', description: '手机号格式不正确，请输入11位手机号', step: 1 });
  }
  if (!basicInfo.mainDirector) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '主要负责人', description: '请填写主要负责人姓名', step: 1 });
  }
  if (basicInfo.directorIdCard && !validateIdCard(basicInfo.directorIdCard)) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '主要负责人身份证', description: '身份证号格式不正确，请检查', step: 1 });
  }
  if (basicInfo.directorPhone && !validatePhone(basicInfo.directorPhone)) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '主要负责人电话', description: '手机号格式不正确，请输入11位手机号', step: 1 });
  }
  if (!basicInfo.practiceAddress) {
    items.push({ id: String(itemId++), category: '基本信息', itemName: '执业地址', description: '请填写详细执业地址', step: 1 });
  }

  if (orgCategory !== 'nursing_station' && departments.length === 0) {
    items.push({ id: String(itemId++), category: '诊疗科目', itemName: '诊疗科目设置', description: '请至少添加一个诊疗科目', step: 2 });
  }

  if (orgCategory !== 'nursing_station' && departments.length > 0) {
    const deptPersonnelResults = checkDepartmentPersonnelMatch(departments, personnel);
    deptPersonnelResults.forEach(result => {
      const deptName = result.message.match(/「(.+?)」/)?.[1] || '诊疗科目';
      items.push({ 
        id: String(itemId++), 
        category: '诊疗科目', 
        itemName: `${deptName}人员配置`, 
        description: result.message, 
        step: 3 
      });
    });
  }

  const minDoctors = orgCategory === 'outpatient' ? 3 : orgCategory === 'clinic' ? 1 : 0;
  const minNurses = orgCategory === 'outpatient' ? 5 : orgCategory === 'clinic' ? 1 : 2;
  const doctors = personnel.filter(p => p.position.includes('医师'));
  const nurses = personnel.filter(p => p.position.includes('护士') || p.position.includes('护理'));

  if (minDoctors > 0 && doctors.length < minDoctors) {
    items.push({ id: String(itemId++), category: '人员资质', itemName: '执业医师配置', description: `至少需要${minDoctors}名执业医师，当前${doctors.length}名`, step: 3 });
  }
  if (nurses.length < minNurses) {
    items.push({ id: String(itemId++), category: '人员资质', itemName: '护士配置', description: `至少需要${minNurses}名护士，当前${nurses.length}名`, step: 3 });
  }

  personnel.forEach((p, index) => {
    if (p.idCard && !validateIdCard(p.idCard)) {
      items.push({ 
        id: String(itemId++), 
        category: '人员资质', 
        itemName: `${p.name || '第' + (index + 1) + '位人员'}身份证`, 
        description: '身份证号格式不正确，请检查', 
        step: 3 
      });
    }
    if (p.certificateValidDate) {
      const certResult = validateCertificateDate(p.certificateValidDate);
      if (certResult && certResult.type === 'error') {
        items.push({ 
          id: String(itemId++), 
          category: '人员资质', 
          itemName: `${p.name || '第' + (index + 1) + '位人员'}执业证书`, 
          description: certResult.message, 
          step: 3 
        });
      }
    }
  });

  if (!premises.buildingArea) {
    items.push({ id: String(itemId++), category: '房屋与布局', itemName: '建筑面积', description: '请填写建筑面积（平方米）', step: 4 });
  }
  if (!premises.useArea) {
    items.push({ id: String(itemId++), category: '房屋与布局', itemName: '使用面积', description: '请填写使用面积（平方米）', step: 4 });
  }
  if (!premises.houseNature) {
    items.push({ id: String(itemId++), category: '房屋与布局', itemName: '房屋性质', description: '请选择房屋性质', step: 4 });
  }

  if (orgCategory !== 'nursing_station' && departments.length > 0) {
    const deptEquipmentResults = checkDepartmentEquipmentMatch(departments, equipment);
    deptEquipmentResults.forEach(result => {
      const deptName = result.message.match(/「(.+?)」/)?.[1] || '诊疗科目';
      items.push({ 
        id: String(itemId++), 
        category: '设备配置', 
        itemName: `${deptName}设备配置`, 
        description: result.message, 
        step: 5 
      });
    });
  }

  const requiredCategories = ['身份证明', '资质证明', '产权证明', '平面图'];
  requiredCategories.forEach(cat => {
    const hasAttachment = attachments.some(a => a.category === cat && a.status === 'uploaded');
    if (!hasAttachment) {
      items.push({ id: String(itemId++), category: '附件材料', itemName: `${cat}材料`, description: `请上传${cat}相关材料`, step: 6 });
    }
  });

  const unfinishedPromises = getUnfinishedPromises(promise);
  unfinishedPromises.forEach(up => {
    items.push({ 
      id: String(itemId++), 
      category: '承诺事项', 
      itemName: up.label, 
      description: '请确认并勾选此项承诺', 
      step: 7 
    });
  });

  return items;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
