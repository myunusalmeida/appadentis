'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { getDataState, formatRupiah, DataState } from '@/lib/dataStore';
import {
  Building2,
  FileCode2,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Plus,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function DashboardPage() {
  const [state, setState] = React.useState<DataState | null>(null);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  // Key KPI Calculations
  const totalNilaiKontrakProyek = state.projects.reduce((acc, p) => acc + p.nilai_kontrak, 0);
  const totalAnggaranRAP = state.rap.reduce((acc, r) => acc + r.total_anggaran, 0);
  const totalPembayaranSubkon = state.subPayments.reduce((acc, p) => acc + p.nilai_dibayar, 0);
  const totalPO = state.purchaseOrders.reduce((acc, po) => acc + po.total_po, 0);
  const totalKasMasuk = state.cashInflows.reduce((acc, c) => acc + c.nilai, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Dashboard Executive
            <Badge variant="warning" className="text-xs">MVP Live</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ringkasan siklus proyek konstruksi, anggaran RAP, realisasi subkontraktor, dan aliran kas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="gap-2">
              <Building2 className="h-4 w-4" /> Proyek Baru
            </Button>
          </Link>
          <Link href="/rap-ahs/rap">
            <Button variant="amber" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Susun RAP
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="glass-panel border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Nilai Kontrak</p>
              <h3 className="text-xl font-bold text-white mt-1">{formatRupiah(totalNilaiKontrakProyek)}</h3>
              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {state.projects.length} Proyek Aktif
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anggaran RAP</p>
              <h3 className="text-xl font-bold text-amber-400 mt-1">{formatRupiah(totalAnggaranRAP)}</h3>
              <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
                <FileCode2 className="h-3 w-3" /> {state.rap.length} RAP Ter-Approve
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileCode2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kas Pemasukan Owner</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">{formatRupiah(totalKasMasuk)}</h3>
              <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
                <Wallet className="h-3 w-3" /> {state.cashInflows.length} Transaksi Masuk
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Realisasi Subkon & PO</p>
              <h3 className="text-xl font-bold text-purple-300 mt-1">
                {formatRupiah(totalPembayaranSubkon + totalPO)}
              </h3>
              <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Subkon + Material PO
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section: Proyek Aktif & Subkon Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Status Proyek & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ringkasan Proyek & Progress Fisik</CardTitle>
                <CardDescription>Status terkini proyek konstruksi yang sedang berjalan</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-400">
                  Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyek</TableHead>
                    <TableHead>Nilai Kontrak</TableHead>
                    <TableHead>Progress Fisik</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-white">
                        <div>
                          <p className="truncate max-w-[220px] font-semibold">{p.nama_pekerjaan}</p>
                          <p className="text-xs text-slate-400">{p.no_kontrak}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-200">
                        {formatRupiah(p.nilai_kontrak)}
                      </TableCell>
                      <TableCell>
                        <div className="w-full space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-amber-400">{p.progress_percent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                              style={{ width: `${p.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === 'Berjalan'
                              ? 'warning'
                              : p.status === 'Selesai'
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Subcontractor Payment Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tagihan & Progress Subkontraktor</CardTitle>
                <CardDescription>Perhitungan otomatis Potongan DP & Retensi Subkon</CardDescription>
              </div>
              <Link href="/progress-payments/payments">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-400">
                  Detail Pembayaran <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subkontraktor</TableHead>
                    <TableHead>Nilai Progress</TableHead>
                    <TableHead>Potongan DP</TableHead>
                    <TableHead>Retensi 5%</TableHead>
                    <TableHead>Nilai Dibayar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.subPayments.map((pay) => (
                    <TableRow key={pay.id}>
                      <TableCell className="font-medium text-white">
                        <div>
                          <p className="font-semibold">{pay.subkon_name}</p>
                          <p className="text-xs text-slate-400">{pay.no_termin}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatRupiah(pay.nilai_progress)}</TableCell>
                      <TableCell className="text-red-400">-{formatRupiah(pay.potongan_dp)}</TableCell>
                      <TableCell className="text-amber-400">-{formatRupiah(pay.nilai_retensi)}</TableCell>
                      <TableCell className="font-bold text-emerald-400">
                        {formatRupiah(pay.nilai_dibayar)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Quick Module Navigation & Audit Activity Trail */}
        <div className="space-y-6">
          <Card className="glass-panel border border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" /> Modul & Alur Konstruksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/preliminaries">
                <div className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">1. Preliminary Survey</p>
                      <p className="text-[11px] text-slate-400">Pengajuan awal proyek</p>
                    </div>
                  </div>
                  <Badge variant="outline">2 Data</Badge>
                </div>
              </Link>

              <Link href="/rap-ahs/ahs">
                <div className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-500/10 text-amber-400">
                      <FileCode2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">2. AHS & RAP Anggaran</p>
                      <p className="text-[11px] text-slate-400">Harga Satuan & RAP Item</p>
                    </div>
                  </div>
                  <Badge variant="warning">Auto Calc</Badge>
                </div>
              </Link>

              <Link href="/procurement/po">
                <div className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">3. Procurement (PO)</p>
                      <p className="text-[11px] text-slate-400">Pembelian & Receive PO</p>
                    </div>
                  </div>
                  <Badge variant="default">Material</Badge>
                </div>
              </Link>

              <Link href="/progress-payments/progress">
                <div className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">4. Progress Subkon</p>
                      <p className="text-[11px] text-slate-400">Termin & Lock Status</p>
                    </div>
                  </div>
                  <Badge variant="success">Lock System</Badge>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Audit Log / Activity Trail Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" /> Audit Trail & Perubahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.activityLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-800 pb-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{log.user_name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400">{log.details}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
