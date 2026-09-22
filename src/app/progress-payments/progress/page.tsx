'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { SubcontractorProgress } from '@/lib/mockData';
import { TrendingUp, Plus, Lock, Unlock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SubcontractorProgressPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [contractId, setContractId] = React.useState('');
  const [noPenagihan, setNoPenagihan] = React.useState('');
  const [uraianPekerjaan, setUraianPekerjaan] = React.useState('');
  const [persentaseProgress, setPersentaseProgress] = React.useState<number>(10);
  const [nilaiProgress, setNilaiProgress] = React.useState<number>(0);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  // Auto calculation of progress value when percentage changes
  const handleSelectContract = (cId: string) => {
    setContractId(cId);
    const sub = state.subcontractors.find((s) => s.id === cId);
    if (sub) {
      setNilaiProgress(Math.round(sub.nilai_kontrak * (persentaseProgress / 100)));
    }
  };

  const handlePercentChange = (pct: number) => {
    setPersentaseProgress(pct);
    const sub = state.subcontractors.find((s) => s.id === contractId);
    if (sub) {
      setNilaiProgress(Math.round(sub.nilai_kontrak * (pct / 100)));
    }
  };

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) return;

    const sub = state.subcontractors.find((s) => s.id === contractId);

    const newProg: SubcontractorProgress = {
      id: `prog-${Date.now()}`,
      contract_id: contractId,
      subkon_name: sub?.nama_subkon || 'Subkon',
      no_penagihan: noPenagihan || `TERM-0${state.subProgress.length + 1}/${sub?.nama_subkon.split(' ')[0]}`,
      tanggal_penagihan: new Date().toISOString().split('T')[0],
      status: 'Draft',
      total_progress: Number(nilaiProgress),
      items: [
        {
          id: `progi-${Date.now()}`,
          progress_id: '',
          uraian_pekerjaan: uraianPekerjaan || 'Progress Penagihan Termin Pekerjaan',
          volume: 1,
          persentase_progress: Number(persentaseProgress),
          subtotal: Number(nilaiProgress),
        },
      ],
    };

    const updated = {
      ...state,
      subProgress: [newProg, ...state.subProgress],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'User / Site Engineer',
          action: 'CREATE',
          entity_name: 'Progress Subkon',
          details: `Draft Pengajuan Progress ${newProg.no_penagihan} - Nilai ${formatRupiah(nilaiProgress)} (${persentaseProgress}%)`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
    setIsModalOpen(false);
  };

  // Lock / Unlock Handler (Mekanisme Approval & Lock)
  const handleToggleLock = (progId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Locked' ? 'Draft' : 'Locked';

    const updatedProgress = state.subProgress.map((p) => {
      if (p.id === progId) {
        return {
          ...p,
          status: nextStatus as any,
          locked_at: nextStatus === 'Locked' ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });

    const targetProg = state.subProgress.find((p) => p.id === progId);

    const updated = {
      ...state,
      subProgress: updatedProgress,
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin / Super Admin',
          action: nextStatus === 'Locked' ? 'LOCK' : 'UNLOCK',
          entity_name: 'Progress Subkon',
          details: `${nextStatus === 'Locked' ? 'Mengkunci (Lock)' : 'Membuka kunci (Unlock)'} Progress Termin ${targetProg?.no_penagihan}`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" /> Progress Termin Subkontraktor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengajuan penagihan progress pekerjaan subkon dengan fitur <span className="text-amber-400 font-semibold">Lock Status Approval</span>.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="emerald" className="gap-2">
          <Plus className="h-4 w-4" /> Pengajuan Progress Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subkontraktor</TableHead>
                <TableHead>No. Termin / Penagihan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total Progress (Rp)</TableHead>
                <TableHead>Status Lock</TableHead>
                <TableHead>Aksi Lock/Unlock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.subProgress.map((prog) => (
                <TableRow key={prog.id}>
                  <TableCell className="font-semibold text-white">{prog.subkon_name}</TableCell>
                  <TableCell className="font-mono text-xs text-amber-400">{prog.no_penagihan}</TableCell>
                  <TableCell className="text-xs text-slate-300">{prog.tanggal_penagihan}</TableCell>
                  <TableCell className="font-bold text-emerald-400">{formatRupiah(prog.total_progress)}</TableCell>
                  <TableCell>
                    <Badge variant={prog.status === 'Locked' ? 'warning' : 'secondary'} className="gap-1">
                      {prog.status === 'Locked' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      {prog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={prog.status === 'Locked' ? 'outline' : 'amber'}
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleToggleLock(prog.id, prog.status)}
                    >
                      {prog.status === 'Locked' ? (
                        <>
                          <Unlock className="h-3.5 w-3.5 text-blue-400" /> Unlock Progress
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" /> Approve & Lock
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Progress */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pengajuan Progress Termin Subkontraktor"
        subtitle="Setelah di-Approve & Lock, data tidak dapat diubah oleh staf biasa"
      >
        <form onSubmit={handleAddProgress} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Kontrak Subkontraktor *</label>
            <Select required value={contractId} onChange={(e) => handleSelectContract(e.target.value)}>
              <option value="">-- Pilih Kontrak Subkon --</option>
              {state.subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_subkon} (Nilai Kontrak {formatRupiah(s.nilai_kontrak)})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Termin Penagihan</label>
              <Input
                placeholder="TERM-01/SUB-APP"
                value={noPenagihan}
                onChange={(e) => setNoPenagihan(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Persentase Progress (%) *</label>
              <Input
                type="number"
                step="1"
                required
                value={persentaseProgress}
                onChange={(e) => handlePercentChange(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Uraian Pekerjaan Progress</label>
            <Input
              placeholder="Contoh: Pekerjaan Struktur Pondasi & Kolom Lt 1"
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Total Nilai Progress Terhitung:</span>
            <span className="text-xl font-bold text-emerald-400">{formatRupiah(nilaiProgress)}</span>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="emerald">
              Simpan Draft Progress
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
