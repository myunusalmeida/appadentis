export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
  role_name?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  header?: string;
  path: string;
  icon: string;
  sort_order: number;
}

export interface RoleMenuAccess {
  id: string;
  role_id: string;
  menu_id: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface Project {
  id: string;
  nama_pekerjaan: string;
  no_kontrak: string;
  nilai_kontrak: number;
  lokasi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'Perencanaan' | 'Berjalan' | 'Selesai' | 'Tertunda';
  progress_percent: number;
}

export interface Preliminary {
  id: string;
  project_id: string;
  project_name?: string;
  no_kontrak: string;
  yang_mengajukan: string;
  tanggal: string;
  tujuan: string;
  total: number;
}

export interface MaterialReference {
  id: string;
  nama_barang: string;
  spesifikasi: string;
  harga: number;
  unit: string;
}

export interface LaborRate {
  id: string;
  nama_pekerjaan: string;
  spesifikasi: string;
  harga: number;
  unit: string;
}

export interface UnitPriceAnalysis {
  id: string;
  kode_ahs: string;
  nama_ahs: string;
  satuan: string;
  profit_percent: number;
  harga: number; // calculated
  items?: {
    id: string;
    tipe: 'barang' | 'upah';
    nama: string;
    referensi_id: string;
    koefisien: number;
    harga: number;
    subtotal: number;
  }[];
}

export interface RAPItem {
  id: string;
  rap_id: string;
  ahs_id?: string;
  kode_ahs?: string;
  uraian_pekerjaan: string;
  volume: number;
  satuan: string;
  harga_satuan: number;
  subtotal: number;
}

export interface RAP {
  id: string;
  project_id: string;
  project_name?: string;
  no_rap: string;
  tanggal: string;
  status: 'Draft' | 'Approved' | 'Locked';
  total_anggaran: number;
  items?: RAPItem[];
}

export interface SubcontractorContract {
  id: string;
  project_id: string;
  project_name?: string;
  nama_subkon: string;
  no_kontrak: string;
  nilai_kontrak: number;
  dp: number;
  retensi_percent: number;
  tanggal: string;
  bukti_dp_path?: string;
  sisa_retensi?: number;
}

export interface ContractAddendum {
  id: string;
  contract_id: string;
  subkon_name?: string;
  no_kontrak_addendum: string;
  nilai_kontrak: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  barang_id: string;
  nama_barang: string;
  qty: number;
  harga: number;
  subtotal: number;
  qty_diterima?: number;
}

export interface PurchaseOrder {
  id: string;
  project_id: string;
  project_name?: string;
  rap_id?: string;
  no_po: string;
  tanggal: string;
  tujuan_po: string;
  tanggal_pengiriman: string;
  jenis_payment: 'Cash' | 'Kredit' | 'DP';
  tgl_jatuh_tempo: string;
  status_po: 'Pending' | 'Partial' | 'Received' | 'Cancelled';
  total_po: number;
  items?: PurchaseOrderItem[];
}

export interface POReceipt {
  id: string;
  po_id: string;
  no_po?: string;
  tanggal_terima: string;
  status_pengiriman: 'Diterima Sebagian' | 'Selesai Lengkap';
  penerima: string;
  items?: {
    id: string;
    receipt_id: string;
    po_item_id: string;
    nama_barang: string;
    qty_diterima: number;
  }[];
}

export interface SubcontractorProgress {
  id: string;
  contract_id: string;
  subkon_name?: string;
  no_penagihan: string;
  tanggal_penagihan: string;
  status: 'Draft' | 'Locked' | 'Approved';
  total_progress: number;
  locked_at?: string;
  items?: {
    id: string;
    progress_id: string;
    uraian_pekerjaan: string;
    volume: number;
    persentase_progress: number;
    subtotal: number;
  }[];
}

export interface SubcontractorPayment {
  id: string;
  contract_id: string;
  subkon_name?: string;
  progress_id?: string;
  no_termin: string;
  tanggal_pembayaran: string;
  nilai_progress: number;
  potongan_dp: number;
  nilai_retensi: number;
  nilai_dibayar: number;
  sisa_tagihan: number;
}

export interface RetentionPayment {
  id: string;
  contract_id: string;
  subkon_name?: string;
  keterangan: string;
  tanggal_pembayaran: string;
  nilai_retensi: number;
  nilai_dibayar: number;
}

export interface CashInflow {
  id: string;
  project_id: string;
  project_name?: string;
  no_kontrak: string;
  tanggal_kas_masuk: string;
  nilai: number;
  keterangan: string;
}

export interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  entity_name: string;
  details: string;
  created_at: string;
}

// Initial Default Data
export const initialRoles: Role[] = [
  { id: 'role-1', name: 'Super Admin', description: 'Akses penuh ke seluruh sistem dan konfigurasi settings' },
  { id: 'role-2', name: 'Admin', description: 'Akses kelola seluruh proyek, RAP, PO, dan pembayaran' },
  { id: 'role-3', name: 'User', description: 'Staf proyek untuk penginputan progress dan preliminary' },
  { id: 'role-4', name: 'User Gudang', description: 'Khusus kelola Purchase Order dan Penerimaan Barang' },
];

export const initialProfiles: Profile[] = [
  { id: 'usr-1', full_name: 'Super Admin Utama', email: 'admin@appadentis.com', role_id: 'role-1', role_name: 'Super Admin' },
  { id: 'usr-2', full_name: 'Budi Santoso', email: 'budi.admin@appadentis.com', role_id: 'role-2', role_name: 'Admin' },
  { id: 'usr-3', full_name: 'Dewi Lestari', email: 'dewi.site@appadentis.com', role_id: 'role-3', role_name: 'User' },
  { id: 'usr-4', full_name: 'Ahmad Gudang', email: 'ahmad.warehouse@appadentis.com', role_id: 'role-4', role_name: 'User Gudang' },
];

export const initialMenus: MenuItem[] = [
  { id: 'm-1', name: 'Dashboard', header: 'Utama', path: '/', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 'm-2', name: 'Master Proyek', header: 'Proyek', path: '/projects', icon: 'Building2', sort_order: 2 },
  { id: 'm-3', name: 'Preliminary Survey', header: 'Proyek', path: '/preliminaries', icon: 'FileSpreadsheet', sort_order: 3 },
  { id: 'm-4', name: 'Referensi Barang', header: 'Master Data', path: '/master/materials', icon: 'Package', sort_order: 4 },
  { id: 'm-5', name: 'Master Upah', header: 'Master Data', path: '/master/labor', icon: 'Users2', sort_order: 5 },
  { id: 'm-6', name: 'Analisa AHS', header: 'Anggaran & RAP', path: '/rap-ahs/ahs', icon: 'Calculator', sort_order: 6 },
  { id: 'm-7', name: 'Penyusunan RAP', header: 'Anggaran & RAP', path: '/rap-ahs/rap', icon: 'FileCode2', sort_order: 7 },
  { id: 'm-8', name: 'Kontrak Subkon', header: 'Subkontraktor', path: '/contracts/subcontractors', icon: 'FileCheck', sort_order: 8 },
  { id: 'm-9', name: 'Kontrak Addendum', header: 'Subkontraktor', path: '/contracts/addendums', icon: 'FileEdit', sort_order: 9 },
  { id: 'm-10', name: 'Purchase Order', header: 'Procurement', path: '/procurement/po', icon: 'ShoppingBag', sort_order: 10 },
  { id: 'm-11', name: 'Receive PO', header: 'Procurement', path: '/procurement/receive', icon: 'Truck', sort_order: 11 },
  { id: 'm-12', name: 'Progress Subkon', header: 'Pembayaran', path: '/progress-payments/progress', icon: 'TrendingUp', sort_order: 12 },
  { id: 'm-13', name: 'Pembayaran Subkon', header: 'Pembayaran', path: '/progress-payments/payments', icon: 'CreditCard', sort_order: 13 },
  { id: 'm-14', name: 'Pembayaran Retensi', header: 'Pembayaran', path: '/progress-payments/retention', icon: 'ShieldCheck', sort_order: 14 },
  { id: 'm-15', name: 'Kas Pemasukan', header: 'Keuangan', path: '/cash-inflow', icon: 'Wallet', sort_order: 15 },
  { id: 'm-16', name: 'Pengaturan System', header: 'Settings', path: '/settings', icon: 'Settings', sort_order: 16 },
];

export const initialRoleAccess: RoleMenuAccess[] = initialRoles.flatMap((role) =>
  initialMenus.map((menu) => {
    // User Gudang only has access to PO, Receive PO, Material References, Dashboard
    if (role.id === 'role-4') {
      const allowedPaths = ['/', '/procurement/po', '/procurement/receive', '/master/materials'];
      const allowed = allowedPaths.includes(menu.path);
      return {
        id: `access-${role.id}-${menu.id}`,
        role_id: role.id,
        menu_id: menu.id,
        can_view: allowed,
        can_add: allowed,
        can_edit: allowed,
        can_delete: false,
      };
    }

    // User (staf) read-only on finances, full on progress/preliminary
    if (role.id === 'role-3') {
      const isRestricted = ['/settings', '/contracts/addendums', '/progress-payments/retention'].includes(menu.path);
      return {
        id: `access-${role.id}-${menu.id}`,
        role_id: role.id,
        menu_id: menu.id,
        can_view: !isRestricted,
        can_add: ['/preliminaries', '/progress-payments/progress'].includes(menu.path),
        can_edit: ['/preliminaries', '/progress-payments/progress'].includes(menu.path),
        can_delete: false,
      };
    }
    // Super Admin & Admin
    return {
      id: `access-${role.id}-${menu.id}`,
      role_id: role.id,
      menu_id: menu.id,
      can_view: role.id === 'role-1' || menu.path !== '/settings',
      can_add: role.id === 'role-1' || menu.path !== '/settings',
      can_edit: role.id === 'role-1' || menu.path !== '/settings',
      can_delete: role.id === 'role-1',
    };
  })
);

export const initialProjects: Project[] = [
  {
    id: 'prj-1',
    nama_pekerjaan: 'Pembangunan Gedung Kantor Appadentis Tower 12 Lt',
    no_kontrak: 'CTR/2026/APP-001',
    nilai_kontrak: 15500000000,
    lokasi: 'Jl. Jend. Sudirman Kav. 45, Jakarta Selatan',
    tanggal_mulai: '2026-01-15',
    tanggal_selesai: '2026-11-30',
    status: 'Berjalan',
    progress_percent: 42,
  },
  {
    id: 'prj-2',
    nama_pekerjaan: 'Konstruksi Gudang Logistik Central BSD',
    no_kontrak: 'CTR/2026/BSD-088',
    nilai_kontrak: 6800000000,
    lokasi: 'Kawasan Industri BSD Phase 3, Tangerang',
    tanggal_mulai: '2026-03-01',
    tanggal_selesai: '2026-08-15',
    status: 'Berjalan',
    progress_percent: 68,
  },
  {
    id: 'prj-3',
    nama_pekerjaan: 'Renovasi Interior & Struktur Hospital Suite',
    no_kontrak: 'CTR/2026/MED-012',
    nilai_kontrak: 2400000000,
    lokasi: 'Jl. Gatot Subroto No. 12, Bandung',
    tanggal_mulai: '2026-06-01',
    tanggal_selesai: '2026-10-15',
    status: 'Perencanaan',
    progress_percent: 10,
  }
];

export const initialPreliminaries: Preliminary[] = [
  {
    id: 'pre-1',
    project_id: 'prj-1',
    project_name: 'Pembangunan Gedung Kantor Appadentis Tower 12 Lt',
    no_kontrak: 'PRE/2026/APP-01',
    yang_mengajukan: 'Ir. Hendra Wijaya (Site Manager)',
    tanggal: '2026-01-10',
    tujuan: 'Mobilisasi alat berat, penyambungan listrik kerja 33kVA, dan pagar pengaman keliling',
    total: 185000000,
  },
  {
    id: 'pre-2',
    project_id: 'prj-2',
    project_name: 'Konstruksi Gudang Logistik Central BSD',
    no_kontrak: 'PRE/2026/BSD-02',
    yang_mengajukan: 'Bambang Kusuma',
    tanggal: '2026-02-20',
    tujuan: 'Penyelidikan tanah (Sondir & Boring test) serta direksi keet lapangan',
    total: 95000000,
  }
];

export const initialMaterials: MaterialReference[] = [
  { id: 'mat-1', nama_barang: 'Semen Portland Composite (PCC) 50kg', spesifikasi: 'Standard SNI Tiga Roda / Holcim', harga: 72000, unit: 'sak' },
  { id: 'mat-2', nama_barang: 'Besi Beton Ulir D16 mm x 12m', spesifikasi: 'BJTS 420B Sertifikat SNI', harga: 165000, unit: 'batang' },
  { id: 'mat-3', nama_barang: 'Besi Beton Polos TP24 D10 mm x 12m', spesifikasi: 'Standard SNI Kencana', harga: 78000, unit: 'batang' },
  { id: 'mat-4', nama_barang: 'Pasir Beton Cor Ayakan', spesifikasi: 'Pasir Cor Lampung Kadar Lumpur < 3%', harga: 340000, unit: 'm3' },
  { id: 'mat-5', nama_barang: 'Batu Split 2/3 Cor', spesifikasi: 'Batu Pecah Mesin Merak', harga: 290000, unit: 'm3' },
  { id: 'mat-6', nama_barang: 'Ready Mix Concrete K-350 NFA', spesifikasi: 'Slump 12+-2 cm Jayamix', harga: 980000, unit: 'm3' },
];

export const initialLaborRates: LaborRate[] = [
  { id: 'lab-1', nama_pekerjaan: 'Pekerja Lapangan / Helper', spesifikasi: 'Jam Kerja 8 Jam/hari', harga: 150000, unit: 'OH' },
  { id: 'lab-2', nama_pekerjaan: 'Tukang Batu / Cor', spesifikasi: 'Pengalaman min 3 thn', harga: 200000, unit: 'OH' },
  { id: 'lab-3', nama_pekerjaan: 'Tukang Besi Pembesian', spesifikasi: 'Sertifikat Keterampilan Struktur', harga: 210000, unit: 'OH' },
  { id: 'lab-4', nama_pekerjaan: 'Tukang Kayu Bekisting', spesifikasi: 'Spesialis Bekisting Kolom & Plat', harga: 205000, unit: 'OH' },
  { id: 'lab-5', nama_pekerjaan: 'Mandor Struktur', spesifikasi: 'Pengawas Tim 10 Orang', harga: 280000, unit: 'OH' },
];

export const initialAHS: UnitPriceAnalysis[] = [
  {
    id: 'ahs-1',
    kode_ahs: 'AHS-STR-01',
    nama_ahs: '1 m3 Beton Cor Struktur K-350 Ready Mix',
    satuan: 'm3',
    profit_percent: 12.0,
    harga: 1254400,
    items: [
      { id: 'ahs-item-1', tipe: 'barang', nama: 'Ready Mix Concrete K-350 NFA', referensi_id: 'mat-6', koefisien: 1.05, harga: 980000, subtotal: 1029000 },
      { id: 'ahs-item-2', tipe: 'upah', nama: 'Tukang Batu / Cor', referensi_id: 'lab-2', koefisien: 0.25, harga: 200000, subtotal: 50000 },
      { id: 'ahs-item-3', tipe: 'upah', nama: 'Pekerja Lapangan / Helper', referensi_id: 'lab-1', koefisien: 0.27, harga: 150000, subtotal: 41000 },
    ]
  },
  {
    id: 'ahs-2',
    kode_ahs: 'AHS-STR-02',
    nama_ahs: '1 kg Pembesian Beton Tulangan Utama (D16 Ulir)',
    satuan: 'kg',
    profit_percent: 10.0,
    harga: 21450,
    items: [
      { id: 'ahs-item-4', tipe: 'barang', nama: 'Besi Beton Ulir D16 mm x 12m', referensi_id: 'mat-2', koefisien: 0.105, harga: 165000, subtotal: 17325 },
      { id: 'ahs-item-5', tipe: 'upah', nama: 'Tukang Besi Pembesian', referensi_id: 'lab-3', koefisien: 0.01, harga: 210000, subtotal: 2100 },
    ]
  }
];

export const initialRAP: RAP[] = [
  {
    id: 'rap-1',
    project_id: 'prj-1',
    project_name: 'Pembangunan Gedung Kantor Appadentis Tower 12 Lt',
    no_rap: 'RAP/2026/APP-01',
    tanggal: '2026-01-20',
    status: 'Approved',
    total_anggaran: 12450000000,
    items: [
      { id: 'ri-1', rap_id: 'rap-1', ahs_id: 'ahs-1', kode_ahs: 'AHS-STR-01', uraian_pekerjaan: 'Pengecoran Kolom & Plat Lt 1-4', volume: 2400, satuan: 'm3', harga_satuan: 1254400, subtotal: 3010560000 },
      { id: 'ri-2', rap_id: 'rap-1', ahs_id: 'ahs-2', kode_ahs: 'AHS-STR-02', uraian_pekerjaan: 'Pembesian Struktur Utama D16', volume: 185000, satuan: 'kg', harga_satuan: 21450, subtotal: 3968250000 },
      { id: 'ri-3', rap_id: 'rap-1', uraian_pekerjaan: 'Pekerjaan Dinding & Arsitektur Lapangan', volume: 1, satuan: 'ls', harga_satuan: 5471190000, subtotal: 5471190000 }
    ]
  }
];

export const initialSubcontractors: SubcontractorContract[] = [
  {
    id: 'sub-1',
    project_id: 'prj-1',
    project_name: 'Pembangunan Gedung Kantor Appadentis Tower 12 Lt',
    nama_subkon: 'PT Mitra Utama Konstruksi',
    no_kontrak: 'SUB/APP/2026-001',
    nilai_kontrak: 3200000000,
    dp: 320000000, // 10%
    retensi_percent: 5.0,
    tanggal: '2026-02-01',
    bukti_dp_path: '/uploads/bukti_dp_sub1.pdf',
    sisa_retensi: 160000000,
  },
  {
    id: 'sub-2',
    project_id: 'prj-2',
    project_name: 'Konstruksi Gudang Logistik Central BSD',
    nama_subkon: 'CV Baja Persada Indonesia',
    no_kontrak: 'SUB/BSD/2026-004',
    nilai_kontrak: 1800000000,
    dp: 180000000,
    retensi_percent: 5.0,
    tanggal: '2026-03-05',
    bukti_dp_path: '/uploads/bukti_dp_sub2.pdf',
    sisa_retensi: 90000000,
  }
];

export const initialAddendums: ContractAddendum[] = [
  {
    id: 'add-1',
    contract_id: 'sub-1',
    subkon_name: 'PT Mitra Utama Konstruksi',
    no_kontrak_addendum: 'ADD-01/SUB/APP/2026-001',
    nilai_kontrak: 3450000000,
    tanggal_mulai: '2026-02-01',
    tanggal_selesai: '2026-09-15',
    keterangan: 'Penambahan volume pekerjaan bekisting & cor lantai basement tambahan',
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    project_id: 'prj-1',
    project_name: 'Pembangunan Gedung Kantor Appadentis Tower 12 Lt',
    rap_id: 'rap-1',
    no_po: 'PO/APP/2026/012',
    tanggal: '2026-02-15',
    tujuan_po: 'PT SCG Readymix Indonesia',
    tanggal_pengiriman: '2026-02-20',
    jenis_payment: 'Kredit',
    tgl_jatuh_tempo: '2026-03-20',
    status_po: 'Partial',
    total_po: 490000000,
    items: [
      { id: 'poi-1', po_id: 'po-1', barang_id: 'mat-6', nama_barang: 'Ready Mix Concrete K-350 NFA', qty: 500, harga: 980000, subtotal: 490000000, qty_diterima: 320 }
    ]
  },
  {
    id: 'po-2',
    project_id: 'prj-2',
    project_name: 'Konstruksi Gudang Logistik Central BSD',
    no_po: 'PO/BSD/2026/005',
    tanggal: '2026-03-10',
    tujuan_po: 'PT Krakatau Steel Distribution',
    tanggal_pengiriman: '2026-03-15',
    jenis_payment: 'DP',
    tgl_jatuh_tempo: '2026-04-15',
    status_po: 'Received',
    total_po: 330000000,
    items: [
      { id: 'poi-2', po_id: 'po-2', barang_id: 'mat-2', nama_barang: 'Besi Beton Ulir D16 mm x 12m', qty: 2000, harga: 165000, subtotal: 330000000, qty_diterima: 2000 }
    ]
  }
];

export const initialPOReceipts: POReceipt[] = [
  {
    id: 'rec-1',
    po_id: 'po-1',
    no_po: 'PO/APP/2026/012',
    tanggal_terima: '2026-02-22',
    status_pengiriman: 'Diterima Sebagian',
    penerima: 'Ahmad Gudang (Staff Logistic)',
    items: [
      { id: 'reci-1', receipt_id: 'rec-1', po_item_id: 'poi-1', nama_barang: 'Ready Mix Concrete K-350 NFA', qty_diterima: 320 }
    ]
  }
];

export const initialSubProgress: SubcontractorProgress[] = [
  {
    id: 'prog-1',
    contract_id: 'sub-1',
    subkon_name: 'PT Mitra Utama Konstruksi',
    no_penagihan: 'TERM-01/SUB-APP',
    tanggal_penagihan: '2026-03-01',
    status: 'Locked',
    total_progress: 960000000, // 30% progress
    locked_at: '2026-03-02T10:00:00Z',
    items: [
      { id: 'progi-1', progress_id: 'prog-1', uraian_pekerjaan: 'Pekerjaan Struktur Pondasi & Kolom Lt 1', volume: 1, persentase_progress: 30, subtotal: 960000000 }
    ]
  }
];

export const initialSubPayments: SubcontractorPayment[] = [
  {
    id: 'pay-1',
    contract_id: 'sub-1',
    subkon_name: 'PT Mitra Utama Konstruksi',
    progress_id: 'prog-1',
    no_termin: 'PAY/SUB-APP/001',
    tanggal_pembayaran: '2026-03-05',
    nilai_progress: 960000000,
    potongan_dp: 96000000, // 10% DP deduction
    nilai_retensi: 48000000, // 5% Retention
    nilai_dibayar: 816000000, // 960m - 96m - 48m = 816m
    sisa_tagihan: 0,
  }
];

export const initialRetentionPayments: RetentionPayment[] = [
  {
    id: 'ret-1',
    contract_id: 'sub-1',
    subkon_name: 'PT Mitra Utama Konstruksi',
    keterangan: 'Pencairan Retensi 50% setelah Serah Terima Pertama (BAST 1)',
    tanggal_pembayaran: '2026-09-20',
    nilai_retensi: 48000000,
    nilai_dibayar: 24000000,
  }
];

export const initialCashInflows: CashInflow[] = [
  {
    id: 'cash-1',
    project_id: 'prj-1',
    project_name: 'Pembangunan Gedung Kantor Appadentis Tower 12 Lt',
    no_kontrak: 'CTR/2026/APP-001',
    tanggal_kas_masuk: '2026-01-25',
    nilai: 3100000000, // DP Owner 20%
    keterangan: 'Pembayaran DP 20% dari Owner / Klien Appadentis',
  },
  {
    id: 'cash-2',
    project_id: 'prj-2',
    project_name: 'Konstruksi Gudang Logistik Central BSD',
    no_kontrak: 'CTR/2026/BSD-088',
    tanggal_kas_masuk: '2026-03-02',
    nilai: 1360000000,
    keterangan: 'Termin Progress #1 20% Gudang BSD',
  }
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'log-1', user_name: 'Super Admin', action: 'CREATE', entity_name: 'Project', details: 'Membuat Proyek Appadentis Tower 12 Lt', created_at: '2026-01-15T08:30:00Z' },
  { id: 'log-2', user_name: 'Budi Santoso', action: 'APPROVE', entity_name: 'RAP', details: 'Approve RAP/2026/APP-01 Total Rp 12.450.000.000', created_at: '2026-01-20T11:15:00Z' },
  { id: 'log-3', user_name: 'Budi Santoso', action: 'LOCK', entity_name: 'Progress Subkon', details: 'Lock Status Progress TERM-01/SUB-APP Rp 960.000.000', created_at: '2026-03-02T10:00:00Z' },
];
