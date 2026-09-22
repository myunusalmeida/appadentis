'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { SubcontractorContract } from '@/lib/mockData';
import { FileCheck, Plus, Upload, Paperclip, CheckCircle2 } from 'lucide-react';

export default function SubcontractorContractsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form state
  const [projectId, setProjectId] = React.useState('');
  const [namaSubkon, setNamaSubkon] = React.useState('');
  const [noKontrak, setNoKontrak] = React.useState('');
  const [nilaiKontrak, setNilaiKontrak] = React.useState<number>(0);
  const [dp, setDp] = React.useState<number>(0);
  const [retensiPercent, setRetensiPercent] = React.useState<number>(5.0);
  const [tanggal, setTanggal] = React.useState('');
  const [buktiDpName, setBuktiDpName] = React.useState('');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const handleAddContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !namaSubkon || !nilaiKontrak) return;

    const proj = state.projects.find((p) => p.id === projectId);
    const calculatedRetensi = Math.round(nilaiKontrak * (retensiPercent / 100));

    const newSub: SubcontractorContract = {
      id: `sub-${Date.now()}`,
      project_id: projectId,
      project_name: proj?.nama_pekerjaan || 'Proyek',
      nama_subkon: namaSubkon,
      no_kontrak: noKontrak || `SUB/APP/2026-${Math.floor(Math.random() * 900 + 100)}`,
      nilai_kontrak: Number(nilaiKontrak),
      dp: Number(dp),
      retensi_percent: Number(retensiPercent),
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      bukti_dp_path: buktiDpName ? `/uploads/${buktiDpName}` : '/uploads/bukti_dp_default.pdf',
      sisa_retensi: calculatedRetensi,
    };

    const updated = {
      ...state,
      subcontractors: [newSub, ...state.subcontractors],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin',
          action: 'CREATE',
          entity_name: 'Kontrak Subkon',
          details: `Pembuatan Kontrak Subkon ${namaSubkon} - Nilai ${formatRupiah(nilaiKontrak)} (DP ${formatRupiah(dp)})`,
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
            <FileCheck className="h-6 w-6 text-emerald-400" /> Kontrak Subkontraktor & Bukti DP
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan perjanjian kontrak subkon, potongan DP, dan persentase retensi garansi.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="emerald" className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Kontrak Subkon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subkontraktor & Proyek</TableHead>
                <TableHead>No. Kontrak</TableHead>
                <TableHead>Nilai Kontrak (Rp)</TableHead>
                <TableHead>DP Dibayar</TableHead>
                <TableHead>Retensi %</TableHead>
                <TableHead>Bukti DP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.subcontractors.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{sub.nama_subkon}</p>
                      <p className="text-xs text-slate-400">{sub.project_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-amber-400">{sub.no_kontrak}</TableCell>
                  <TableCell className="font-bold text-slate-200">{formatRupiah(sub.nilai_kontrak)}</TableCell>
                  <TableCell className="text-emerald-400 font-semibold">{formatRupiah(sub.dp)}</TableCell>
                  <TableCell className="text-amber-400 font-semibold">{sub.retensi_percent}%</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 text-[11px] cursor-pointer hover:bg-slate-800">
                      <Paperclip className="h-3 w-3 text-blue-400" /> Bukti DP Attached
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Subcontractor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Kontrak Subkontraktor Baru"
        subtitle="Wajib upload bukti DP sebelum status kontrak aktif"
      >
        <form onSubmit={handleAddContract} className="space-y-4">
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
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nama Subkontraktor *</label>
              <Input
                required
                placeholder="PT Mitra Utama / CV Mandiri"
                value={namaSubkon}
                onChange={(e) => setNamaSubkon(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Kontrak</label>
              <Input
                placeholder="SUB/APP/2026-003"
                value={noKontrak}
                onChange={(e) => setNoKontrak(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nilai Kontrak (Rp) *</label>
              <Input
                type="number"
                required
                placeholder="1000000000"
                value={nilaiKontrak}
                onChange={(e) => setNilaiKontrak(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Uang Muka DP (Rp)</label>
              <Input
                type="number"
                placeholder="100000000"
                value={dp}
                onChange={(e) => setDp(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Retensi (%)</label>
              <Input
                type="number"
                step="0.5"
                value={retensiPercent}
                onChange={(e) => setRetensiPercent(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Upload Bukti DP (Lampiran File) *</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-300">Klik / Drag file slip transfer DP (PDF / JPG)</p>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={(e) => setBuktiDpName(e.target.files?.[0]?.name || '')}
              />
              <label htmlFor="file-upload" className="text-[11px] text-blue-400 underline cursor-pointer mt-1 block">
                {buktiDpName ? `File Terpilih: ${buktiDpName}` : 'Pilih File dari komputer'}
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="emerald">
              Simpan Kontrak Subkon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
