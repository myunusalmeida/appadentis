import {
  initialProjects,
  initialPreliminaries,
  initialMaterials,
  initialLaborRates,
  initialAHS,
  initialRAP,
  initialSubcontractors,
  initialAddendums,
  initialPurchaseOrders,
  initialPOReceipts,
  initialSubProgress,
  initialSubPayments,
  initialRetentionPayments,
  initialCashInflows,
  initialRoles,
  initialProfiles,
  initialMenus,
  initialRoleAccess,
  initialActivityLogs,
  Project,
  Preliminary,
  MaterialReference,
  LaborRate,
  UnitPriceAnalysis,
  RAP,
  SubcontractorContract,
  ContractAddendum,
  PurchaseOrder,
  POReceipt,
  SubcontractorProgress,
  SubcontractorPayment,
  RetentionPayment,
  CashInflow,
  Role,
  Profile,
  MenuItem,
  RoleMenuAccess,
  ActivityLog,
} from './mockData';

const STORAGE_KEY = 'appadentis_construction_db_v1';

export interface DataState {
  projects: Project[];
  preliminaries: Preliminary[];
  materials: MaterialReference[];
  laborRates: LaborRate[];
  ahs: UnitPriceAnalysis[];
  rap: RAP[];
  subcontractors: SubcontractorContract[];
  addendums: ContractAddendum[];
  purchaseOrders: PurchaseOrder[];
  poReceipts: POReceipt[];
  subProgress: SubcontractorProgress[];
  subPayments: SubcontractorPayment[];
  retentionPayments: RetentionPayment[];
  cashInflows: CashInflow[];
  roles: Role[];
  profiles: Profile[];
  menus: MenuItem[];
  roleAccess: RoleMenuAccess[];
  activityLogs: ActivityLog[];
  currentUserId: string;
}

const defaultState: DataState = {
  projects: initialProjects,
  preliminaries: initialPreliminaries,
  materials: initialMaterials,
  laborRates: initialLaborRates,
  ahs: initialAHS,
  rap: initialRAP,
  subcontractors: initialSubcontractors,
  addendums: initialAddendums,
  purchaseOrders: initialPurchaseOrders,
  poReceipts: initialPOReceipts,
  subProgress: initialSubProgress,
  subPayments: initialSubPayments,
  retentionPayments: initialRetentionPayments,
  cashInflows: initialCashInflows,
  roles: initialRoles,
  profiles: initialProfiles,
  menus: initialMenus,
  roleAccess: initialRoleAccess,
  activityLogs: initialActivityLogs,
  currentUserId: 'usr-1', // Default to Super Admin
};

export function getDataState(): DataState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    return JSON.parse(stored);
  } catch {
    return defaultState;
  }
}

export function saveDataState(state: DataState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('appadentis_state_updated'));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
