'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { RetentionPayment } from '@/lib/mockData';
import { ShieldCheck, Plus, AlertCircle } from 'lucide-react';

export default function RetentionPaymentsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [contractId, setContractId] = React.useState('');
  const [keterangan, setKeterangan] = React.useState('');
  const [nilaiRetensiDitahan, setNilaiRetensiDitahan] = React.useState<number>(0);
  const [nilaiDibayar, setNilaiDibayar] = React.useState<number>(0);
  const [errorMsg, setErrorMsg] = React.useState('');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const handleSelectContract = (cId: string) => {
    setContractId(cId);
    if (!cId) return;

    const sub = state.subcontractors.find((s) => s.id === cId);
    if (sub) {
      const retainedTotal = sub.sisa_retensi || Math.round(sub.nilai_kontrak * (sub.retensi_percent / 100));
      setNilaiRetensiDitahan(retainedTotal);
      setNilaiDibayar(retainedTotal); // Default to full payout
    }
  };

  const handleSaveRetention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !nilaiDibayar) return;

    if (nilaiDibayar > nilaiRetensiDitahan) {
      setErrorMsg(`Pencairan retensi (${formatRupiah(nilaiDibayar)}) melebihi batas retensi yang ditahan (${formatRupiah(nilaiRetensiDitahan)}).`);
      return;
    }

    const sub = state.subcontractors.find((s) => s.id === contractId);

    const newRet: RetentionPayment = {
      id: `ret-${Date.now()}`,
      contract_id: contractId,
      subkon_name: sub?.nama_subkon || 'Subkon',
      keterangan: keterangan || 'Pelunasan Retensi Masa Pemeliharaan Selesai (BAST 2)',
      tanggal_pembayaran: new Date().toISOString().split('T')[0],
      nilai_retensi: nilaiRetensiDitahan,
      nilai_dibayar: Number(nilaiDibayar),
    };

    // Update subkon contract remaining retention
    const updatedSubcontractors = state.subcontractors.map((s) => {
      if (s.id === contractId) {
        const remaining = Math.max(0, (s.sisa_retensi || 0) - Number(nilaiDibayar));
        return { ...s, sisa_retensi: remaining };
      }
      return s;
    });

    const updated = {
      ...state,
      subcontractors: updatedSubcontractors,
      retentionPayments: [newRet, ...state.retentionPayments],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin Finance',
          action: 'CREATE',
          entity_name: 'Pembayaran Retensi',
          details: `Pencairan Dana Retensi ${sub?.nama_subkon} Sebesar ${formatRupiah(nilaiDibayar)}`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
    setIsModalOpen(false);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-400" /> Pelunasan Dana Retensi Subkon
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pencairan jaminan retensi setelah masa pemeliharaan selesai dan Serah Terima BAST 2.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Pencairan Retensi Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subkontraktor</TableHead>
                <TableHead>Keterangan & BAST</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
                <TableHead>Total Retensi Ditahan</TableHead>
                <TableHead>Nilai Dicairkan (Rp)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.retentionPayments.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-semibold text-white">{ret.subkon_name}</TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-[280px]">{ret.keterangan}</TableCell>
                  <TableCell className="text-xs text-slate-300">{ret.tanggal_pembayaran}</TableCell>
                  <TableCell className="text-amber-400 font-semibold">{formatRupiah(ret.nilai_retensi)}</TableCell>
                  <TableCell className="font-bold text-emerald-400 text-base">{formatRupiah(ret.nilai_dibayar)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Retention */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pencairan Dana Retensi Subkontraktor"
        subtitle="Validasi proteksi: Pencairan retensi tidak boleh melebihi retensi tersimpan"
      >
        <form onSubmit={handleSaveRetention} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Subkontraktor *</label>
            <Select required value={contractId} onChange={(e) => handleSelectContract(e.target.value)}>
              <option value="">-- Pilih Kontrak Subkon --</option>
              {state.subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_subkon} (Sisa Retensi Ditahan: {formatRupiah(s.sisa_retensi || 0)})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Total Retensi Ditahan (Rp)</label>
              <Input disabled value={formatRupiah(nilaiRetensiDitahan)} className="bg-slate-900 border-slate-800 text-amber-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nilai Retensi Dicairkan (Rp) *</label>
              <Input
                type="number"
                required
                max={nilaiRetensiDitahan}
                value={nilaiDibayar}
                onChange={(e) => {
                  setErrorMsg('');
                  setNilaiDibayar(Number(e.target.value));
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Keterangan / No. BAST 2</label>
            <Input
              placeholder="Pelunasan retensi 100% setelah BAST 2"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Cairkan Retensi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
