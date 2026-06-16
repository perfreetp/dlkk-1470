
export type ApplicationType = 'setup' | 'change';

export type OrgCategory = 'outpatient' | 'clinic' | 'nursing_station';

export type ApplicationStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'returned';

export interface BasicInfo {
  orgName: string;
  orgCategory: OrgCategory | '';
  businessNature: string;
  legalRepresentative: string;
  legalIdCard: string;
  legalPhone: string;
  mainDirector: string;
  directorIdCard: string;
  directorPhone: string;
  practiceAddress: string;
  contactPhone: string;
  registeredCapital: string;
  businessScope: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  level: string;
  remark: string;
}

export interface Personnel {
  id: string;
  name: string;
  gender: string;
  idCard: string;
  position: string;
  title: string;
  certificateNo: string;
  certificateValidDate: string;
  practiceScope: string;
}

export interface Premises {
  buildingArea: string;
  useArea: string;
  houseNature: string;
  propertyProof: string;
  layoutDescription: string;
  floors: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  quantity: number;
  manufacturer: string;
  purchaseDate: string;
}

export interface PromiseData {
  hasLegalPerson: boolean;
  hasBusinessScope: boolean;
  hasQualifiedPersonnel: boolean;
  hasQualifiedPremises: boolean;
  hasQualifiedEquipment: boolean;
  hasAllAttachments: boolean;
  isTruthful: boolean;
}

export interface Attachment {
  id: string;
  category: string;
  fileName: string;
  fileSize: number;
  uploadTime: string;
  status: 'uploaded' | 'pending';
}

export interface CorrectionOpinion {
  id: string;
  content: string;
  date: string;
  operator: string;
}

export interface ApplicationVersion {
  version: string;
  submitTime: string;
  status: ApplicationStatus;
  remark: string;
}

export type AuditAction = 'accept' | 'review' | 'approve' | 'return' | 'submit';

export interface AuditRecord {
  id: string;
  version: string;
  action: AuditAction;
  actionLabel: string;
  operator: string;
  time: string;
  opinions: string[];
  status: ApplicationStatus;
}

export interface Application {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  basicInfo: BasicInfo;
  departments: Department[];
  personnel: Personnel[];
  premises: Premises;
  equipment: Equipment[];
  attachments: Attachment[];
  promise: PromiseData;
  versions: ApplicationVersion[];
  correctionOpinions: CorrectionOpinion[];
  auditRecords: AuditRecord[];
  createdAt: string;
  submittedAt: string;
  currentStep: number;
}

export interface ValidationResult {
  type: 'success' | 'warning' | 'error';
  field: string;
  message: string;
}

export interface MissingItem {
  id: string;
  category: string;
  itemName: string;
  description: string;
  step: number;
}

export const ORG_CATEGORY_MAP: Record<OrgCategory, string> = {
  outpatient: '门诊部',
  clinic: '诊所',
  nursing_station: '护理站',
};

export const STATUS_MAP: Record<ApplicationStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  reviewing: '审核中',
  approved: '已通过',
  returned: '已退回',
};

export const STATUS_COLOR_MAP: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  returned: 'bg-red-100 text-red-700',
};

export const WIZARD_STEPS = [
  { id: 1, name: '基本信息', icon: 'Building2' },
  { id: 2, name: '诊疗科目', icon: 'Stethoscope' },
  { id: 3, name: '人员资质', icon: 'Users' },
  { id: 4, name: '房屋与布局', icon: 'Home' },
  { id: 5, name: '设备配置', icon: 'Cpu' },
  { id: 6, name: '附件材料', icon: 'Paperclip' },
  { id: 7, name: '承诺事项', icon: 'ShieldCheck' },
];

export const ATTACHMENT_CATEGORIES = [
  { id: 'identity', name: '身份证明', required: true },
  { id: 'qualification', name: '资质证明', required: true },
  { id: 'property', name: '产权证明', required: true },
  { id: 'layout', name: '平面图', required: true },
  { id: 'equipment', name: '设备清单', required: false },
  { id: 'other', name: '其他材料', required: false },
];

export const DEPARTMENT_OPTIONS = [
  { code: '03', name: '内科' },
  { code: '04', name: '外科' },
  { code: '05', name: '妇产科' },
  { code: '06', name: '儿科' },
  { code: '07', name: '眼科' },
  { code: '08', name: '耳鼻咽喉科' },
  { code: '09', name: '口腔科' },
  { code: '10', name: '皮肤科' },
  { code: '11', name: '医疗美容科' },
  { code: '12', name: '精神科' },
  { code: '13', name: '传染科' },
  { code: '14', name: '结核病科' },
  { code: '15', name: '地方病科' },
  { code: '16', name: '肿瘤科' },
  { code: '17', name: '急诊医学科' },
  { code: '18', name: '康复医学科' },
  { code: '20', name: '医学检验科' },
  { code: '21', name: '病理科' },
  { code: '22', name: '医学影像科' },
  { code: '23', name: '中医科' },
  { code: '24', name: '中西医结合科' },
];
