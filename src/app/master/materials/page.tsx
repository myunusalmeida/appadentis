'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { MaterialReference } from '@/lib/mockData';
import { Package, Plus, Search } from 'lucide-react';

export default function MaterialsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [search, setSearch] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [namaBarang, setNamaBarang] = React.useState('');
  const [spesifikasi, setSpesifikasi] = React.useState('');
  const [harga, setHarga] = React.useState<number>(0);
  const [unit, setUnit] = React.useState('sak');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const filtered = state.materials.filter(
    (m) =>
      m.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
      m.spesifikasi.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang || !unit) return;

    const newMat: MaterialReference = {
      id: `mat-${Date.now()}`,
      nama_barang: namaBarang,
      spesifikasi: spesifikasi || '-',
      harga: Number(harga),
      unit: unit,
    };

    const updated = {
      ...state,
      materials: [...state.materials, newMat],
    };

    saveDataState(updated);
    setIsModalOpen(false);
    setNamaBarang('');
    setSpesifikasi('');
    setHarga(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-400" /> Katalog Referensi Barang & Material
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data acuan standar harga material untuk penyusunan AHS dan Purchase Order (PO).
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Barang Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama material / spesifikasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total Material: <strong className="text-white">{filtered.length}</strong> item
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Material</TableHead>
                <TableHead>Spesifikasi & Standard</TableHead>
                <TableHead>Harga Satuan Standard</TableHead>
                <TableHead>Satuan / Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-white">{m.nama_barang}</TableCell>
                  <TableCell className="text-xs text-slate-300">{m.spesifikasi}</TableCell>
                  <TableCell className="font-bold text-emerald-400">{formatRupiah(m.harga)}</TableCell>
                  <TableCell className="text-xs uppercase font-mono text-amber-400">{m.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Material Baru"
        subtitle="Katalog barang acuan AHS & PO"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nama Material / Barang *</label>
            <Input
              required
              placeholder="Contoh: Semen Portland PCC 50kg"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Spesifikasi</label>
            <Input
              placeholder="SNI / Merk / Gred"
              value={spesifikasi}
              onChange={(e) => setSpesifikasi(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Harga Satuan (Rp) *</label>
              <Input
                type="number"
                required
                placeholder="75000"
                value={harga}
                onChange={(e) => setHarga(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Satuan (Unit) *</label>
              <Input
                required
                placeholder="sak / m3 / batang / kg / ls"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Simpan Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
