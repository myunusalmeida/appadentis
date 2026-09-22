'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { CashInflow } from '@/lib/mockData';
import { Wallet, Plus, ArrowUpRight } from 'lucide-react';

export default function CashInflowPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [projectId, setProjectId] = React.useState('');
  const [noKontrak, setNoKontrak] = React.useState('');
  const [tglMasuk, setTglMasuk] = React.useState('');
  const [nilai, setNilai] = React.useState<number>(0);
  const [keterangan, setKeterangan] = React.useState('');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const handleAddCashInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !nilai) return;

    const proj = state.projects.find((p) => p.id === projectId);

    const newCash: CashInflow = {
      id: `cash-${Date.now()}`,
      project_id: projectId,
      project_name: proj?.nama_pekerjaan || 'Proyek',
      no_kontrak: noKontrak || proj?.no_kontrak || 'CTR/2026/001',
      tanggal_kas_masuk: tglMasuk || new Date().toISOString().split('T')[0],
      nilai: Number(nilai),
      keterangan: keterangan || 'Pencairan Termin Pemasukan Owner',
    };

    const updated = {
      ...state,
      cashInflows: [newCash, ...state.cashInflows],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin Kasir',
          action: 'CREATE',
          entity_name: 'Kas Pemasukan',
          details: `Pencatatan Pemasukan Kas Owner ${formatRupiah(nilai)} - Proyek ${proj?.nama_pekerjaan}`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" /> Kas Pemasukan Dari Owner / Klien
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan dana masuk pembayaran termin dari Owner per proyek konstruksi.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="emerald" className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Kas Pemasukan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyek Terkait</TableHead>
                <TableHead>No. Kontrak</TableHead>
                <TableHead>Tanggal Kas Masuk</TableHead>
                <TableHead>Nilai Pemasukan (Rp)</TableHead>
                <TableHead>Keterangan & Sumber Dana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.cashInflows.map((cash) => (
                <TableRow key={cash.id}>
                  <TableCell className="font-semibold text-white">{cash.project_name}</TableCell>
                  <TableCell className="font-mono text-xs text-amber-400">{cash.no_kontrak}</TableCell>
                  <TableCell className="text-xs text-slate-300">{cash.tanggal_kas_masuk}</TableCell>
                  <TableCell className="font-bold text-emerald-400 text-base">{formatRupiah(cash.nilai)}</TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-[280px]">{cash.keterangan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Transaksi Kas Pemasukan Owner"
        subtitle="Sisi pendapatan proyek konstruksi"
      >
        <form onSubmit={handleAddCashInflow} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Proyek *</label>
            <Select required value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">-- Pilih Proyek --</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_pekerjaan}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Kontrak / Referensi</label>
              <Input
                placeholder="CTR/2026/APP-001"
                value={noKontrak}
                onChange={(e) => setNoKontrak(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nilai Pemasukan (Rp) *</label>
              <Input
                type="number"
                required
                placeholder="1000000000"
                value={nilai}
                onChange={(e) => setNilai(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Tanggal Kas Masuk</label>
            <Input type="date" value={tglMasuk} onChange={(e) => setTglMasuk(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Keterangan Transaksi</label>
            <Input
              placeholder="Pencairan DP 20% / Termin Progress #2"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="emerald">
              Simpan Kas Masuk
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
