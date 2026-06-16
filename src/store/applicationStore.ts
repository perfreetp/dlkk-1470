
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Application, ApplicationType, BasicInfo, Department, Personnel, Premises, Equipment, Attachment, ApplicationStatus, OrgCategory, PromiseData, CorrectionOpinion, ApplicationVersion, AuditRecord } from '@/types';
import { mockApplications } from '@/utils/mockData';
import { generateId } from '@/utils/mockData';
import { validateApplication } from '@/utils/validator';

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  
  fetchApplications: () => void;
  getApplicationById: (id: string) => Application | undefined;
  createApplication: (type: ApplicationType, orgCategory: OrgCategory) => Application;
  setCurrentApplication: (app: Application | null) => void;
  setCurrentStep: (step: number) => void;
  updateBasicInfo: (info: Partial<BasicInfo>) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  addPersonnel: (person: Omit<Personnel, 'id'>) => void;
  removePersonnel: (id: string) => void;
  updatePersonnel: (id: string, person: Partial<Personnel>) => void;
  updatePremises: (premises: Partial<Premises>) => void;
  addEquipment: (equip: Omit<Equipment, 'id'>) => void;
  removeEquipment: (id: string) => void;
  updateEquipment: (id: string, equip: Partial<Equipment>) => void;
  addAttachment: (attachment: Omit<Attachment, 'id'>) => void;
  removeAttachment: (id: string) => void;
  updatePromise: (promise: Partial<PromiseData>) => void;
  submitApplication: (id?: string) => boolean;
  acceptApplication: (id: string, opinions?: string[]) => boolean;
  reviewApplication: (id: string, opinions?: string[]) => boolean;
  approveApplication: (id: string, opinions?: string[]) => boolean;
  returnApplication: (id: string, opinions: string[]) => boolean;
  addCorrectionOpinion: (id: string, opinion: Omit<CorrectionOpinion, 'id' | 'date'>) => boolean;
  addVersion: (id: string, version: Omit<ApplicationVersion, 'submitTime'>) => boolean;
  addAuditRecord: (id: string, record: Omit<AuditRecord, 'id' | 'time'>) => boolean;
  deleteApplication: (id: string) => void;
  saveCurrentApplication: () => void;
}

const getNextVersion = (versions: ApplicationVersion[]): string => {
  if (versions.length === 0) return 'V1.0';
  const latest = versions[versions.length - 1].version;
  const match = latest.match(/V(\d+)\.(\d+)/);
  if (!match) return 'V1.0';
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  return `V${major}.${minor + 1}`;
};

const getCurrentVersion = (versions: ApplicationVersion[]): string => {
  if (versions.length === 0) return 'V1.0';
  return versions[versions.length - 1].version;
};

const createEmptyApplication = (type: ApplicationType, orgCategory: OrgCategory): Application => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    type,
    status: 'draft',
    currentStep: 1,
    basicInfo: {
      orgName: '',
      orgCategory,
      businessNature: '',
      legalRepresentative: '',
      legalIdCard: '',
      legalPhone: '',
      mainDirector: '',
      directorIdCard: '',
      directorPhone: '',
      practiceAddress: '',
      contactPhone: '',
      registeredCapital: '',
      businessScope: '',
    },
    departments: [],
    personnel: [],
    premises: {
      buildingArea: '',
      useArea: '',
      houseNature: '',
      propertyProof: '',
      layoutDescription: '',
      floors: '',
    },
    equipment: [],
    attachments: [],
    promise: {
      hasLegalPerson: false,
      hasBusinessScope: false,
      hasQualifiedPersonnel: false,
      hasQualifiedPremises: false,
      hasQualifiedEquipment: false,
      hasAllAttachments: false,
      isTruthful: false,
    },
    versions: [],
    correctionOpinions: [],
    auditRecords: [],
    createdAt: now,
    submittedAt: '',
  };
};

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: mockApplications,
      currentApplication: null,
      currentStep: 1,
      isLoading: false,
      error: null,

      fetchApplications: () => {
        set({ isLoading: true });
        setTimeout(() => {
          set({ isLoading: false });
        }, 300);
      },

      getApplicationById: (id: string) => {
        return get().applications.find(app => app.id === id);
      },

      createApplication: (type: ApplicationType, orgCategory: OrgCategory) => {
        const newApp = createEmptyApplication(type, orgCategory);
        set(state => ({
          applications: [newApp, ...state.applications],
          currentApplication: newApp,
          currentStep: 1,
        }));
        return newApp;
      },

      setCurrentApplication: (app: Application | null) => {
        set({ 
          currentApplication: app,
          currentStep: app ? app.currentStep : 1,
        });
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
        const currentApp = get().currentApplication;
        if (currentApp) {
          set(state => ({
            applications: state.applications.map(app =>
              app.id === currentApp.id ? { ...app, currentStep: step } : app
            ),
            currentApplication: { ...currentApp, currentStep: step },
          }));
        }
      },

      updateBasicInfo: (info: Partial<BasicInfo>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          basicInfo: { ...currentApp.basicInfo, ...info },
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      addDepartment: (dept: Omit<Department, 'id'>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const newDept: Department = { ...dept, id: generateId() };
        const updatedApp = {
          ...currentApp,
          departments: [...currentApp.departments, newDept],
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      removeDepartment: (id: string) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          departments: currentApp.departments.filter(d => d.id !== id),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      updateDepartment: (id: string, dept: Partial<Department>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          departments: currentApp.departments.map(d =>
            d.id === id ? { ...d, ...dept } : d
          ),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      addPersonnel: (person: Omit<Personnel, 'id'>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const newPerson: Personnel = { ...person, id: generateId() };
        const updatedApp = {
          ...currentApp,
          personnel: [...currentApp.personnel, newPerson],
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      removePersonnel: (id: string) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          personnel: currentApp.personnel.filter(p => p.id !== id),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      updatePersonnel: (id: string, person: Partial<Personnel>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          personnel: currentApp.personnel.map(p =>
            p.id === id ? { ...p, ...person } : p
          ),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      updatePremises: (premises: Partial<Premises>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          premises: { ...currentApp.premises, ...premises },
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      addEquipment: (equip: Omit<Equipment, 'id'>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const newEquip: Equipment = { ...equip, id: generateId() };
        const updatedApp = {
          ...currentApp,
          equipment: [...currentApp.equipment, newEquip],
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      removeEquipment: (id: string) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          equipment: currentApp.equipment.filter(e => e.id !== id),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      updateEquipment: (id: string, equip: Partial<Equipment>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          equipment: currentApp.equipment.map(e =>
            e.id === id ? { ...e, ...equip } : e
          ),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      addAttachment: (attachment: Omit<Attachment, 'id'>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const newAttachment: Attachment = { ...attachment, id: generateId() };
        const updatedApp = {
          ...currentApp,
          attachments: [...currentApp.attachments, newAttachment],
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      removeAttachment: (id: string) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          attachments: currentApp.attachments.filter(a => a.id !== id),
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      updatePromise: (promise: Partial<PromiseData>) => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        const updatedApp = {
          ...currentApp,
          promise: { ...currentApp.promise, ...promise },
        };
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? updatedApp : app
          ),
          currentApplication: updatedApp,
        }));
      },

      submitApplication: (id?: string) => {
        const appId = id || get().currentApplication?.id;
        const app = get().applications.find(a => a.id === appId);
        if (!app) return false;
        
        const validation = validateApplication(app);
        if (!validation.valid) return false;
        
        const allPromised = Object.values(app.promise).every(v => v === true);
        if (!allPromised) return false;
        
        const versionStr = getNextVersion(app.versions);
        const isFirstVersion = app.versions.length === 0;
        const newVersion = {
          version: versionStr,
          submitTime: new Date().toISOString(),
          status: 'submitted' as ApplicationStatus,
          remark: isFirstVersion ? '首次提交' : '补正提交',
        };
        
        const now = new Date().toISOString();
        
        const newAuditRecord: AuditRecord = {
          id: generateId(),
          version: versionStr,
          action: 'submit',
          actionLabel: isFirstVersion ? '提交申报' : '补正提交',
          operator: '办证专员',
          time: now,
          opinions: [isFirstVersion ? '首次提交申报材料' : '根据补正意见完成修改，重新提交'],
          status: 'submitted',
        };
        
        set(state => ({
          applications: state.applications.map(a =>
            a.id === appId
              ? {
                  ...a,
                  status: 'submitted',
                  submittedAt: now,
                  currentStep: 7,
                  versions: [...a.versions, newVersion],
                  auditRecords: [...a.auditRecords, newAuditRecord],
                }
              : a
          ),
          currentApplication:
            state.currentApplication?.id === appId
              ? {
                  ...state.currentApplication,
                  status: 'submitted',
                  submittedAt: now,
                  currentStep: 7,
                  versions: [...app.versions, newVersion],
                  auditRecords: [...app.auditRecords, newAuditRecord],
                }
              : state.currentApplication,
        }));
        
        return true;
    },

    addAuditRecord: (id: string, record: Omit<AuditRecord, 'id' | 'time'>) => {
      const app = get().applications.find(a => a.id === id);
      if (!app) return false;
      
      const now = new Date().toISOString();
      const newRecord: AuditRecord = {
        ...record,
        id: generateId(),
        time: now,
      };
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id
            ? { ...a, auditRecords: [...a.auditRecords, newRecord] }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, auditRecords: [...state.currentApplication.auditRecords, newRecord] }
            : state.currentApplication,
      }));
      
      return true;
    },

    acceptApplication: (id: string, opinions?: string[]) => {
      const app = get().applications.find(a => a.id === id);
      if (!app || app.status !== 'submitted') return false;
      
      const now = new Date().toISOString();
      const versionNo = app.versions.length;
      const updatedVersions = [...app.versions];
      if (updatedVersions.length > 0) {
        updatedVersions[versionNo - 1] = {
          ...updatedVersions[versionNo - 1],
          status: 'reviewing',
        };
      }
      
      const currentVersion = getCurrentVersion(app.versions);
      const acceptOpinions = opinions && opinions.length > 0 ? opinions : ['申报材料齐全，符合法定形式，予以受理'];
      get().addAuditRecord(id, {
        version: currentVersion,
        action: 'accept',
        actionLabel: '受理材料',
        operator: '受理员',
        opinions: acceptOpinions,
        status: 'reviewing',
      });
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id
            ? { ...a, status: 'reviewing' as ApplicationStatus, versions: updatedVersions }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, status: 'reviewing' as ApplicationStatus, versions: updatedVersions }
            : state.currentApplication,
      }));
      return true;
    },

    reviewApplication: (id: string, opinions?: string[]) => {
      const app = get().applications.find(a => a.id === id);
      if (!app || app.status !== 'reviewing') return false;
      
      const currentVersion = getCurrentVersion(app.versions);
      const reviewOpinions = opinions && opinions.length > 0 ? opinions : ['开始实质审查申报材料'];
      get().addAuditRecord(id, {
        version: currentVersion,
        action: 'review',
        actionLabel: '进入审核',
        operator: '审核员',
        opinions: reviewOpinions,
        status: 'reviewing',
      });
      
      return true;
    },

    approveApplication: (id: string, opinions?: string[]) => {
      const app = get().applications.find(a => a.id === id);
      if (!app || (app.status !== 'reviewing' && app.status !== 'submitted')) return false;
      
      const now = new Date().toISOString();
      const versionNo = app.versions.length;
      const updatedVersions = [...app.versions];
      if (updatedVersions.length > 0) {
        updatedVersions[versionNo - 1] = {
          ...updatedVersions[versionNo - 1],
          status: 'approved',
        };
      }
      
      const defaultPassOpinion = '申报材料审核通过，符合医疗机构执业登记要求，准予登记。';
      const passOpinions = opinions && opinions.length > 0 ? opinions : [defaultPassOpinion];
      const passOpinion: CorrectionOpinion = {
        id: generateId(),
        content: passOpinions[0],
        date: now,
        operator: '卫生健康委员会-审核科',
      };
      
      const currentVersion = getCurrentVersion(app.versions);
      get().addAuditRecord(id, {
        version: currentVersion,
        action: 'approve',
        actionLabel: '审核通过',
        operator: '审核员',
        opinions: passOpinions,
        status: 'approved',
      });
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id
            ? {
                ...a,
                status: 'approved' as ApplicationStatus,
                versions: updatedVersions,
                correctionOpinions: [...a.correctionOpinions, passOpinion],
              }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? {
                ...state.currentApplication,
                status: 'approved' as ApplicationStatus,
                versions: updatedVersions,
                correctionOpinions: [...state.currentApplication.correctionOpinions, passOpinion],
              }
            : state.currentApplication,
      }));
      return true;
    },

    returnApplication: (id: string, opinions: string[]) => {
      const app = get().applications.find(a => a.id === id);
      if (!app || (app.status !== 'reviewing' && app.status !== 'submitted')) return false;
      
      const now = new Date().toISOString();
      const versionNo = app.versions.length;
      const updatedVersions = [...app.versions];
      if (updatedVersions.length > 0) {
        updatedVersions[versionNo - 1] = {
          ...updatedVersions[versionNo - 1],
          status: 'returned',
        };
      }
      
      const newOpinions: CorrectionOpinion[] = opinions.map(content => ({
        id: generateId(),
        content,
        date: now,
        operator: '卫生健康委员会-审核科',
      }));
      
      const currentVersion = updatedVersions[versionNo - 1]?.version || 'V1.0';
      get().addAuditRecord(id, {
        version: currentVersion,
        action: 'return',
        actionLabel: '退回补正',
        operator: '审核员',
        opinions,
        status: 'returned',
      });
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id
            ? {
                ...a,
                status: 'returned' as ApplicationStatus,
                versions: updatedVersions,
                correctionOpinions: [...a.correctionOpinions, ...newOpinions],
              }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? {
                ...state.currentApplication,
                status: 'returned' as ApplicationStatus,
                versions: updatedVersions,
                correctionOpinions: [...state.currentApplication.correctionOpinions, ...newOpinions],
              }
            : state.currentApplication,
      }));
      return true;
    },

    addCorrectionOpinion: (id: string, opinion: Omit<CorrectionOpinion, 'id' | 'date'>) => {
      const app = get().applications.find(a => a.id === id);
      if (!app) return false;
      
      const newOpinion: CorrectionOpinion = {
        ...opinion,
        id: generateId(),
        date: new Date().toISOString(),
      };
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id
            ? { ...a, correctionOpinions: [...a.correctionOpinions, newOpinion] }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, correctionOpinions: [...state.currentApplication.correctionOpinions, newOpinion] }
            : state.currentApplication,
      }));
      return true;
    },

    addVersion: (id: string, version: Omit<ApplicationVersion, 'submitTime'>) => {
      const app = get().applications.find(a => a.id === id);
      if (!app) return false;
      
      const newVersion: ApplicationVersion = {
        ...version,
        submitTime: new Date().toISOString(),
      };
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id
            ? { ...a, versions: [...a.versions, newVersion] }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, versions: [...state.currentApplication.versions, newVersion] }
            : state.currentApplication,
      }));
      return true;
    },

    deleteApplication: (id: string) => {
        set(state => ({
          applications: state.applications.filter(app => app.id !== id),
          currentApplication:
            get().currentApplication?.id === id ? null : get().currentApplication,
        }));
      },

      saveCurrentApplication: () => {
        const currentApp = get().currentApplication;
        if (!currentApp) return;
        
        set(state => ({
          applications: state.applications.map(app =>
            app.id === currentApp.id ? currentApp : app
          ),
        }));
      },
    }),
    {
      name: 'application-storage',
    }
  )
);
