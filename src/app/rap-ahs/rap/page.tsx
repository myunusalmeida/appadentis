'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { RAP, RAPItem } from '@/lib/mockData';
import { FileCode2, Plus, Trash2, CheckCircle2, Lock } from 'lucide-react';

export default function RAPPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State RAP
  const [projectId, setProjectId] = React.useState('');
  const [noRAP, setNoRAP] = React.useState('');
  const [tanggal, setTanggal] = React.useState('');
  const [rapItems, setRapItems] = React.useState<RAPItem[]>([]);

  // Item builder inside modal
  const [ahsId, setAhsId] = React.useState('');
  const [uraianPekerjaan, setUraianPekerjaan] = React.useState('');
  const [volume, setVolume] = React.useState<number>(1);
  const [hargaSatuan, setHargaSatuan] = React.useState<number>(0);
  const [satuan, setSatuan] = React.useState('m3');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const totalGrandAnggaran = rapItems.reduce((acc, it) => acc + it.subtotal, 0);

  // When user picks an AHS code, auto-fill prices & unit
  const handleSelectAHS = (selectedId: string) => {
    setAhsId(selectedId);
    if (!selectedId) return;

    const ahs = state.ahs.find((a) => a.id === selectedId);
    if (ahs) {
      setUraianPekerjaan(ahs.nama_ahs);
      setHargaSatuan(ahs.harga);
      setSatuan(ahs.satuan);
    }
  };

  const handleAddRAPItem = () => {
    if (!uraianPekerjaan || volume <= 0) return;

    const selectedAhs = state.ahs.find((a) => a.id === ahsId);
    const subtotal = Math.round(volume * hargaSatuan);

    const newItem: RAPItem = {
      id: `ri-${Date.now()}`,
      rap_id: '',
      ahs_id: ahsId || undefined,
      kode_ahs: selectedAhs?.kode_ahs,
      uraian_pekerjaan: uraianPekerjaan,
      volume: Number(volume),
      satuan: satuan,
      harga_satuan: Number(hargaSatuan),
      subtotal: subtotal,
    };

    setRapItems([...rapItems, newItem]);
    setAhsId('');
    setUraianPekerjaan('');
    setVolume(1);
    setHargaSatuan(0);
  };

  const handleRemoveRAPItem = (id: string) => {
    setRapItems(rapItems.filter((it) => it.id !== id));
  };

  const handleSaveRAP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const proj = state.projects.find((p) => p.id === projectId);

    const newRAP: RAP = {
      id: `rap-${Date.now()}`,
      project_id: projectId,
      project_name: proj?.nama_pekerjaan || 'Proyek',
      no_rap: noRAP || `RAP/${new Date().getFullYear()}/007`,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      status: 'Approved',
      total_anggaran: totalGrandAnggaran,
      items: rapItems,
    };

    const updated = {
      ...state,
      rap: [newRAP, ...state.rap],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin',
          action: 'CREATE',
          entity_name: 'RAP',
          details: `Penyusunan RAP Baru ${newRAP.no_rap} - Grand Total ${formatRupiah(totalGrandAnggaran)}`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
    setIsModalOpen(false);
    setRapItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="h-6 w-6 text-amber-400" /> Rencana Anggaran Proyek (RAP)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Penyusunan anggaran biaya proyek terintegrasi dengan kode AHS dan pembuat Purchase Order.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Susun RAP Baru
        </Button>
      </div>

      {/* RAP Cards / Details */}
      <div className="space-y-6">
        {state.rap.map((rapDoc) => (
          <Card key={rapDoc.id} className="glass-panel">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="font-mono">{rapDoc.no_rap}</Badge>
                  <Badge variant={rapDoc.status === 'Approved' ? 'success' : 'secondary'}>
                    {rapDoc.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white mt-1">{rapDoc.project_name}</CardTitle>
                <p className="text-xs text-slate-400">Tanggal Anggaran: {rapDoc.tanggal}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Grand Total Anggaran RAP</span>
                <p className="text-2xl font-bold text-amber-400">{formatRupiah(rapDoc.total_anggaran)}</p>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-slate-300 mb-2">Rincian Baris Item RAP:</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode AHS</TableHead>
                    <TableHead>Uraian Pekerjaan RAP</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Harga Satuan (AHS)</TableHead>
                    <TableHead>Subtotal (Rp)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapDoc.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-amber-400">
                        {item.kode_ahs || 'CUSTOM'}
                      </TableCell>
                      <TableCell className="font-medium text-white">{item.uraian_pekerjaan}</TableCell>
                      <TableCell className="text-slate-300">
                        {item.volume} {item.satuan}
                      </TableCell>
                      <TableCell className="text-slate-300">{formatRupiah(item.harga_satuan)}</TableCell>
                      <TableCell className="font-bold text-emerald-400">{formatRupiah(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Susun RAP */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Penyusunan RAP Proyek"
        subtitle="Pilih AHS dan tentukan volume pekerjaan proyek"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveRAP} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. RAP</label>
              <Input
                placeholder="RAP/2026/APP-09"
                value={noRAP}
                onChange={(e) => setNoRAP(e.target.value)}
              />
            </div>
          </div>

          {/* Item Builder Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Tambah Baris Item Pekerjaan RAP
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Ambil Dari Analisa AHS</label>
                <Select value={ahsId} onChange={(e) => handleSelectAHS(e.target.value)}>
                  <option value="">-- Manual / Input Bebas --</option>
                  {state.ahs.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.kode_ahs}] {a.nama_ahs} ({formatRupiah(a.harga)}/{a.satuan})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Satuan</label>
                <Input value={satuan} onChange={(e) => setSatuan(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Uraian Pekerjaan</label>
                <Input
                  placeholder="Pekerjaan Cor Kolom"
                  value={uraianPekerjaan}
                  onChange={(e) => setUraianPekerjaan(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Volume</label>
                <Input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Harga Satuan (Rp)</label>
                <Input
                  type="number"
                  value={hargaSatuan}
                  onChange={(e) => setHargaSatuan(Number(e.target.value))}
                />
              </div>
            </div>

            <Button type="button" onClick={handleAddRAPItem} variant="secondary" size="sm" className="w-full gap-1">
              <Plus className="h-3.5 w-3.5" /> Tambah Ke Baris RAP
            </Button>

            {/* List Added Item */}
            {rapItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {rapItems.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800">
                    <div>
                      <span className="font-semibold text-white">{it.uraian_pekerjaan}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {it.volume} {it.satuan} × {formatRupiah(it.harga_satuan)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400">{formatRupiah(it.subtotal)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRAPItem(it.id)}
                        className="h-6 w-6 text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Grand Total Anggaran RAP:</span>
            <span className="text-xl font-bold text-amber-400">{formatRupiah(totalGrandAnggaran)}</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Simpan & Approve RAP
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
