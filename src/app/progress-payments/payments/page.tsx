'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { SubcontractorPayment } from '@/lib/mockData';
import { CreditCard, Plus, Calculator, CheckCircle2 } from 'lucide-react';

export default function SubcontractorPaymentsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [contractId, setContractId] = React.useState('');
  const [progressId, setProgressId] = React.useState('');
  const [noTermin, setNoTermin] = React.useState('');
  const [tglBayar, setTglBayar] = React.useState('');
  const [nilaiProgress, setNilaiProgress] = React.useState<number>(0);
  const [potonganDp, setPotonganDp] = React.useState<number>(0);
  const [nilaiRetensi, setNilaiRetensi] = React.useState<number>(0);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  // Formula: Nilai Dibayar = Progress - Potongan DP - Retensi
  const calculatedNilaiDibayar = Math.max(0, nilaiProgress - potonganDp - nilaiRetensi);

  const handleSelectProgress = (progId: string) => {
    setProgressId(progId);
    if (!progId) return;

    const prog = state.subProgress.find((p) => p.id === progId);
    if (!prog) return;

    setContractId(prog.contract_id);
    setNilaiProgress(prog.total_progress);

    const sub = state.subcontractors.find((s) => s.id === prog.contract_id);
    if (sub) {
      // Auto compute DP deduction (e.g. 10% of progress) and Retention (5% of progress)
      const computedDP = Math.round(prog.total_progress * 0.1);
      const computedRetensi = Math.round(prog.total_progress * (sub.retensi_percent / 100));
      setPotonganDp(computedDP);
      setNilaiRetensi(computedRetensi);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !nilaiProgress) return;

    const sub = state.subcontractors.find((s) => s.id === contractId);

    const newPayment: SubcontractorPayment = {
      id: `pay-${Date.now()}`,
      contract_id: contractId,
      subkon_name: sub?.nama_subkon || 'Subkon',
      progress_id: progressId || undefined,
      no_termin: noTermin || `PAY/SUB-APP/00${state.subPayments.length + 1}`,
      tanggal_pembayaran: tglBayar || new Date().toISOString().split('T')[0],
      nilai_progress: Number(nilaiProgress),
      potongan_dp: Number(potonganDp),
      nilai_retensi: Number(nilaiRetensi),
      nilai_dibayar: calculatedNilaiDibayar,
      sisa_tagihan: 0,
    };

    const updated = {
      ...state,
      subPayments: [newPayment, ...state.subPayments],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin Finance',
          action: 'CREATE',
          entity_name: 'Pembayaran Subkon',
          details: `Penerbitan Pembayaran Termin ${newPayment.no_termin} Nilai Dibayar ${formatRupiah(calculatedNilaiDibayar)} (Potongan DP ${formatRupiah(potonganDp)}, Retensi ${formatRupiah(nilaiRetensi)})`,
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
            <CreditCard className="h-6 w-6 text-emerald-400" /> Pembayaran Subkontraktor (Otomatis)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem kalkulasi otomatis: <code className="text-emerald-300">Nilai Dibayar = Nilai Progress - Potongan DP - Retensi 5%</code>
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="emerald" className="gap-2">
          <Plus className="h-4 w-4" /> Penerbitan Pembayaran Subkon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subkontraktor</TableHead>
                <TableHead>No. Termin</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
                <TableHead>Nilai Progress</TableHead>
                <TableHead>Potongan DP (-)</TableHead>
                <TableHead>Potongan Retensi (-)</TableHead>
                <TableHead>Nilai Dibayar (Bersih)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.subPayments.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell className="font-semibold text-white">{pay.subkon_name}</TableCell>
                  <TableCell className="font-mono text-xs text-amber-400">{pay.no_termin}</TableCell>
                  <TableCell className="text-xs text-slate-300">{pay.tanggal_pembayaran}</TableCell>
                  <TableCell className="text-slate-200">{formatRupiah(pay.nilai_progress)}</TableCell>
                  <TableCell className="text-red-400 font-medium">-{formatRupiah(pay.potongan_dp)}</TableCell>
                  <TableCell className="text-amber-400 font-medium">-{formatRupiah(pay.nilai_retensi)}</TableCell>
                  <TableCell className="font-bold text-emerald-400 text-base">
                    {formatRupiah(pay.nilai_dibayar)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Payment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Penerbitan Pembayaran Subkon"
        subtitle="Potongan DP dan Retensi dikalkulasi otomatis oleh sistem"
        maxWidth="xl"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Dokumen Progress Subkon *</label>
            <Select required value={progressId} onChange={(e) => handleSelectProgress(e.target.value)}>
              <option value="">-- Pilih Progress Penagihan --</option>
              {state.subProgress.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.subkon_name}] {p.no_penagihan} - Nilai {formatRupiah(p.total_progress)} ({p.status})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Voucher Pembayaran</label>
              <Input
                placeholder="PAY/SUB-APP/002"
                value={noTermin}
                onChange={(e) => setNoTermin(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tanggal Pembayaran</label>
              <Input type="date" value={tglBayar} onChange={(e) => setTglBayar(e.target.value)} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-4 w-4" /> Rincian Kalkulasi Pembayaran
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nilai Progress Kotor (Rp)</label>
              <Input
                type="number"
                value={nilaiProgress}
                onChange={(e) => setNilaiProgress(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-red-400 font-semibold block mb-1">Potongan DP (Rp)</label>
                <Input
                  type="number"
                  value={potonganDp}
                  onChange={(e) => setPotonganDp(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[11px] text-amber-400 font-semibold block mb-1">Potongan Retensi (Rp)</label>
                <Input
                  type="number"
                  value={nilaiRetensi}
                  onChange={(e) => setNilaiRetensi(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300 font-semibold">Total Nilai Bersih Dibayar (Net Payment):</p>
              <p className="text-[11px] text-slate-400">Status Sisa Tagihan Terbayar</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatRupiah(calculatedNilaiDibayar)}</p>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="emerald">
              Proses Pembayaran Subkon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
