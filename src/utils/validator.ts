
import { Application, ValidationResult, MissingItem, OrgCategory } from '@/types';

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

export interface ApplicationValidationResult {
  valid: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

export const validateApplication = (app: Application): ApplicationValidationResult => {
  const results: ValidationResult[] = [];
  const { basicInfo, departments, personnel, premises, equipment, attachments } = app;
  const orgCategory = basicInfo.orgCategory as OrgCategory;

  const orgNameResult = validateOrgName(basicInfo.orgName);
  if (orgNameResult) results.push(orgNameResult);

  const addressResult = validatePracticeAddress(basicInfo.practiceAddress);
  if (addressResult) results.push(addressResult);

  if (!basicInfo.legalRepresentative) {
    results.push({ type: 'error', field: 'legalRepresentative', message: '法定代表人姓名不能为空' });
  }
  if (!validateIdCard(basicInfo.legalIdCard)) {
    results.push({ type: 'error', field: 'legalIdCard', message: '法定代表人身份证号格式不正确' });
  }
  if (!validatePhone(basicInfo.legalPhone)) {
    results.push({ type: 'error', field: 'legalPhone', message: '法定代表人联系电话格式不正确' });
  }

  if (!basicInfo.mainDirector) {
    results.push({ type: 'error', field: 'mainDirector', message: '主要负责人姓名不能为空' });
  }
  if (!validateIdCard(basicInfo.directorIdCard)) {
    results.push({ type: 'error', field: 'directorIdCard', message: '主要负责人身份证号格式不正确' });
  }
  if (!validatePhone(basicInfo.directorPhone)) {
    results.push({ type: 'error', field: 'directorPhone', message: '主要负责人联系电话格式不正确' });
  }

  if (orgCategory !== 'nursing_station' && departments.length === 0) {
    results.push({ type: 'error', field: 'departments', message: '请至少添加一个诊疗科目' });
  }

  const minDoctors = orgCategory === 'outpatient' ? 3 : orgCategory === 'clinic' ? 1 : 0;
  const minNurses = orgCategory === 'outpatient' ? 5 : orgCategory === 'clinic' ? 1 : 2;
  
  const doctors = personnel.filter(p => p.position.includes('医师'));
  const nurses = personnel.filter(p => p.position.includes('护士') || p.position.includes('护理'));

  if (minDoctors > 0 && doctors.length < minDoctors) {
    results.push({ type: 'error', field: 'personnel', message: `${orgCategory === 'outpatient' ? '门诊部' : '诊所'}至少需要${minDoctors}名执业医师` });
  }
  if (nurses.length < minNurses) {
    results.push({ type: 'error', field: 'personnel', message: `${orgCategory === 'nursing_station' ? '护理站' : '本机构'}至少需要${minNurses}名护士` });
  }

  personnel.forEach((p, index) => {
    if (!p.name) {
      results.push({ type: 'error', field: `personnel[${index}].name`, message: `第${index + 1}位人员姓名不能为空` });
    }
    if (!validateIdCard(p.idCard)) {
      results.push({ type: 'error', field: `personnel[${index}].idCard`, message: `${p.name || '第' + (index + 1) + '位人员'}身份证号格式不正确` });
    }
    if (!p.certificateNo) {
      results.push({ type: 'error', field: `personnel[${index}].certificateNo`, message: `${p.name || '第' + (index + 1) + '位人员'}执业证书号不能为空` });
    }
    const certResult = validateCertificateDate(p.certificateValidDate);
    if (certResult) {
      results.push({ ...certResult, field: `personnel[${index}].certificateValidDate` });
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
  const { basicInfo, departments, personnel, premises, equipment, attachments } = app;
  const orgCategory = basicInfo.orgCategory as OrgCategory;

  if (!basicInfo.orgName) {
    items.push({ id: '1', category: '基本信息', itemName: '机构名称', description: '请填写机构全称', step: 1 });
  }
  if (!basicInfo.legalRepresentative) {
    items.push({ id: '2', category: '基本信息', itemName: '法定代表人', description: '请填写法定代表人姓名', step: 1 });
  }
  if (!basicInfo.legalIdCard) {
    items.push({ id: '3', category: '基本信息', itemName: '法定代表人身份证', description: '请填写法定代表人身份证号', step: 1 });
  }
  if (!basicInfo.mainDirector) {
    items.push({ id: '4', category: '基本信息', itemName: '主要负责人', description: '请填写主要负责人姓名', step: 1 });
  }
  if (!basicInfo.practiceAddress) {
    items.push({ id: '5', category: '基本信息', itemName: '执业地址', description: '请填写详细执业地址', step: 1 });
  }

  if (orgCategory !== 'nursing_station' && departments.length === 0) {
    items.push({ id: '6', category: '诊疗科目', itemName: '诊疗科目设置', description: '请至少添加一个诊疗科目', step: 2 });
  }

  const minDoctors = orgCategory === 'outpatient' ? 3 : orgCategory === 'clinic' ? 1 : 0;
  const minNurses = orgCategory === 'outpatient' ? 5 : orgCategory === 'clinic' ? 1 : 2;
  const doctors = personnel.filter(p => p.position.includes('医师'));
  const nurses = personnel.filter(p => p.position.includes('护士') || p.position.includes('护理'));

  if (minDoctors > 0 && doctors.length < minDoctors) {
    items.push({ id: '7', category: '人员资质', itemName: '执业医师配置', description: `至少需要${minDoctors}名执业医师，当前${doctors.length}名`, step: 3 });
  }
  if (nurses.length < minNurses) {
    items.push({ id: '8', category: '人员资质', itemName: '护士配置', description: `至少需要${minNurses}名护士，当前${nurses.length}名`, step: 3 });
  }

  if (!premises.buildingArea) {
    items.push({ id: '9', category: '房屋与布局', itemName: '建筑面积', description: '请填写建筑面积（平方米）', step: 4 });
  }
  if (!premises.useArea) {
    items.push({ id: '10', category: '房屋与布局', itemName: '使用面积', description: '请填写使用面积（平方米）', step: 4 });
  }
  if (!premises.houseNature) {
    items.push({ id: '11', category: '房屋与布局', itemName: '房屋性质', description: '请选择房屋性质', step: 4 });
  }

  const requiredCategories = ['身份证明', '资质证明', '产权证明', '平面图'];
  let attachIndex = 12;
  requiredCategories.forEach(cat => {
    const hasAttachment = attachments.some(a => a.category === cat && a.status === 'uploaded');
    if (!hasAttachment) {
      items.push({ id: String(attachIndex++), category: '附件材料', itemName: `${cat}材料`, description: `请上传${cat}相关材料`, step: 6 });
    }
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
