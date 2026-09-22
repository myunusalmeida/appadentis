'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { Preliminary } from '@/lib/mockData';
import { FileSpreadsheet, Plus, Search, Calendar, UserCheck } from 'lucide-react';

export default function PreliminariesPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [projectId, setProjectId] = React.useState('');
  const [noKontrak, setNoKontrak] = React.useState('');
  const [yangMengajukan, setYangMengajukan] = React.useState('');
  const [tanggal, setTanggal] = React.useState('');
  const [tujuan, setTujuan] = React.useState('');
  const [total, setTotal] = React.useState<number>(0);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const handleAddPreliminary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !yangMengajukan) return;

    const selectedProj = state.projects.find((p) => p.id === projectId);

    const newPre: Preliminary = {
      id: `pre-${Date.now()}`,
      project_id: projectId,
      project_name: selectedProj?.nama_pekerjaan || 'Proyek Terkait',
      no_kontrak: noKontrak || `PRE/${new Date().getFullYear()}/009`,
      yang_mengajukan: yangMengajukan,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      tujuan: tujuan,
      total: Number(total),
    };

    const updated = {
      ...state,
      preliminaries: [newPre, ...state.preliminaries],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: yangMengajukan,
          action: 'CREATE',
          entity_name: 'Preliminary',
          details: `Pengajuan Preliminary Survey Rp ${formatRupiah(total)}`,
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
            <FileSpreadsheet className="h-6 w-6 text-blue-400" /> Preliminary Survey & Pengajuan Awal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rekap survey awal, direksi keet, dan biaya pengajuan persiapans sebelum proyek dimulai.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="default" className="gap-2">
          <Plus className="h-4 w-4" /> Pengajuan Preliminary Baru
        </Button>
      </div>

      {/* Preliminary Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyek Terkait</TableHead>
                <TableHead>No. Dokumen</TableHead>
                <TableHead>Yang Mengajukan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tujuan & Uraian</TableHead>
                <TableHead>Total Biaya (Rp)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.preliminaries.map((pre) => (
                <TableRow key={pre.id}>
                  <TableCell className="font-semibold text-white">
                    {pre.project_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-400">
                    {pre.no_kontrak}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-200">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{pre.yang_mengajukan}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">{pre.tanggal}</TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-[280px]">
                    {pre.tujuan}
                  </TableCell>
                  <TableCell className="font-bold text-amber-400">
                    {formatRupiah(pre.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Preliminary */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Pengajuan Preliminary"
        subtitle="Isi data survey / persiapan awal proyek"
      >
        <form onSubmit={handleAddPreliminary} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Proyek *</label>
            <Select required value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">-- Pilih Proyek Terdaftar --</option>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_pekerjaan}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Dokumen / Kontrak</label>
              <Input
                placeholder="PRE/2026/XYZ-01"
                value={noKontrak}
                onChange={(e) => setNoKontrak(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Yang Mengajukan *</label>
              <Input
                required
                placeholder="Nama Site Manager / Engineer"
                value={yangMengajukan}
                onChange={(e) => setYangMengajukan(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tanggal</label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Total Biaya Preliminary (Rp)</label>
              <Input
                type="number"
                placeholder="50000000"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Tujuan & Uraian Survey</label>
            <Input
              placeholder="Contoh: Mobilisasi alat berat & Sondir tanah"
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default">
              Simpan Preliminary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
