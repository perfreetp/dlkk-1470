
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Application, ApplicationType, BasicInfo, Department, Personnel, Premises, Equipment, Attachment, ApplicationStatus, OrgCategory, PromiseData } from '@/types';
import { mockApplications } from '@/utils/mockData';
import { generateId } from '@/utils/mockData';

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
  deleteApplication: (id: string) => void;
  saveCurrentApplication: () => void;
}

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
        
        const allPromised = Object.values(app.promise).every(v => v === true);
        if (!allPromised) return false;
        
        const versionNo = app.versions.length + 1;
        const newVersion = {
          version: `V${versionNo}.0`,
          submitTime: new Date().toISOString(),
          status: 'submitted' as ApplicationStatus,
          remark: versionNo === 1 ? '首次提交' : '补正提交',
        };
        
        const now = new Date().toISOString();
        
        set(state => ({
          applications: state.applications.map(a =>
            a.id === appId
              ? {
                  ...a,
                  status: 'submitted',
                  submittedAt: now,
                  currentStep: 7,
                  versions: [...a.versions, newVersion],
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
                }
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
