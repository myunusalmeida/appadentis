'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { LaborRate } from '@/lib/mockData';
import { Users2, Plus, Search } from 'lucide-react';

export default function LaborRatesPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [search, setSearch] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form state
  const [namaPekerjaan, setNamaPekerjaan] = React.useState('');
  const [spesifikasi, setSpesifikasi] = React.useState('');
  const [harga, setHarga] = React.useState<number>(0);
  const [unit, setUnit] = React.useState('OH');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const filtered = state.laborRates.filter(
    (l) =>
      l.nama_pekerjaan.toLowerCase().includes(search.toLowerCase()) ||
      l.spesifikasi.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPekerjaan || !unit) return;

    const newLabor: LaborRate = {
      id: `lab-${Date.now()}`,
      nama_pekerjaan: namaPekerjaan,
      spesifikasi: spesifikasi || 'Pekerja Lapangan',
      harga: Number(harga),
      unit: unit,
    };

    const updated = {
      ...state,
      laborRates: [...state.laborRates, newLabor],
    };

    saveDataState(updated);
    setIsModalOpen(false);
    setNamaPekerjaan('');
    setSpesifikasi('');
    setHarga(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users2 className="h-6 w-6 text-purple-400" /> Katalog Master Upah Tenaga Kerja
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data referensi tarif upah tukang, mandor, dan pekerja lapangan untuk perhitungan AHS.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="default" className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Upah Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari profesi upah / spesifikasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total Tarif Upah: <strong className="text-white">{filtered.length}</strong> jenis
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pekerjaan / Profesi</TableHead>
                <TableHead>Spesifikasi & Kualifikasi</TableHead>
                <TableHead>Tarif Upah Standar</TableHead>
                <TableHead>Satuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-semibold text-white">{l.nama_pekerjaan}</TableCell>
                  <TableCell className="text-xs text-slate-300">{l.spesifikasi}</TableCell>
                  <TableCell className="font-bold text-purple-300">{formatRupiah(l.harga)}</TableCell>
                  <TableCell className="text-xs uppercase font-mono text-slate-400">{l.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Tarif Upah Baru"
        subtitle="Acuan biaya tenaga kerja di AHS"
      >
        <form onSubmit={handleAddLabor} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Profesi / Jenis Upah *</label>
            <Input
              required
              placeholder="Contoh: Tukang Las Struktur / Mandor"
              value={namaPekerjaan}
              onChange={(e) => setNamaPekerjaan(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Spesifikasi Keterampilan</label>
            <Input
              placeholder="Pengalaman min 3 thn / Sertifikat K3"
              value={spesifikasi}
              onChange={(e) => setSpesifikasi(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tarif Upah (Rp) *</label>
              <Input
                type="number"
                required
                placeholder="200000"
                value={harga}
                onChange={(e) => setHarga(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Satuan *</label>
              <Input
                required
                placeholder="OH (Orang Hari) / m2 / m3"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default">
              Simpan Upah
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
