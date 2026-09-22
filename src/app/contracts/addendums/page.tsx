'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { ContractAddendum } from '@/lib/mockData';
import { FileEdit, Plus, History } from 'lucide-react';

export default function ContractAddendumsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form
  const [contractId, setContractId] = React.useState('');
  const [noAddendum, setNoAddendum] = React.useState('');
  const [nilaiBaru, setNilaiBaru] = React.useState<number>(0);
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

  const handleAddAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !nilaiBaru) return;

    const sub = state.subcontractors.find((s) => s.id === contractId);

    const newAdd: ContractAddendum = {
      id: `add-${Date.now()}`,
      contract_id: contractId,
      subkon_name: sub?.nama_subkon || 'Subkon',
      no_kontrak_addendum: noAddendum || `ADD-0${state.addendums.length + 1}/${sub?.no_kontrak}`,
      nilai_kontrak: Number(nilaiBaru),
      tanggal_mulai: sub?.tanggal || '2026-02-01',
      tanggal_selesai: '2026-10-30',
      keterangan: keterangan || 'Addendum Perubahan Nilai Scope Pekerjaan',
    };

    const updated = {
      ...state,
      addendums: [newAdd, ...state.addendums],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin',
          action: 'CREATE',
          entity_name: 'Addendum',
          details: `Pembuatan Addendum Kontrak ${newAdd.no_kontrak_addendum} Nilai Baru ${formatRupiah(nilaiBaru)}`,
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
            <FileEdit className="h-6 w-6 text-purple-400" /> Riwayat Addendum Kontrak
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan addendum perubahan nilai dan jadwal kontrak tanpa menimpa histori awal.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="default" className="gap-2">
          <Plus className="h-4 w-4" /> Buat Addendum Kontrak
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subkontraktor</TableHead>
                <TableHead>No. Addendum</TableHead>
                <TableHead>Nilai Kontrak Baru (Rp)</TableHead>
                <TableHead>Keterangan & Scope</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.addendums.map((add) => (
                <TableRow key={add.id}>
                  <TableCell className="font-semibold text-white">{add.subkon_name}</TableCell>
                  <TableCell className="font-mono text-xs text-purple-400">{add.no_kontrak_addendum}</TableCell>
                  <TableCell className="font-bold text-amber-400">{formatRupiah(add.nilai_kontrak)}</TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-[300px]">{add.keterangan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Addendum Kontrak Baru"
        subtitle="Riwayat addendum tersimpan rapi tanpa menghapus data asli"
      >
        <form onSubmit={handleAddAddendum} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Kontrak Asal *</label>
            <Select required value={contractId} onChange={(e) => setContractId(e.target.value)}>
              <option value="">-- Pilih Kontrak Subkon --</option>
              {state.subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_subkon} ({s.no_kontrak}) - Nilai Awal {formatRupiah(s.nilai_kontrak)}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Addendum</label>
              <Input
                placeholder="ADD-01/SUB/APP/001"
                value={noAddendum}
                onChange={(e) => setNoAddendum(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nilai Kontrak Baru (Rp) *</label>
              <Input
                type="number"
                required
                placeholder="3500000000"
                value={nilaiBaru}
                onChange={(e) => setNilaiBaru(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Alasan / Scope Perubahan</label>
            <Input
              placeholder="Penambahan volume kolom & bekisting"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default">
              Simpan Addendum
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
