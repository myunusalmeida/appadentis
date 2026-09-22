'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { UnitPriceAnalysis } from '@/lib/mockData';
import { Calculator, Plus, Trash2, Layers } from 'lucide-react';

interface ComponentItem {
  id: string;
  tipe: 'barang' | 'upah';
  referensi_id: string;
  nama: string;
  koefisien: number;
  harga: number;
  subtotal: number;
}

export default function AHSPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State for AHS
  const [kodeAHS, setKodeAHS] = React.useState('');
  const [namaAHS, setNamaAHS] = React.useState('');
  const [satuan, setSatuan] = React.useState('m3');
  const [profitPercent, setProfitPercent] = React.useState<number>(10);
  const [componentItems, setComponentItems] = React.useState<ComponentItem[]>([]);

  // Temp state for adding a component item inside modal
  const [itemTipe, setItemTipe] = React.useState<'barang' | 'upah'>('barang');
  const [itemRefId, setItemRefId] = React.useState('');
  const [itemKoefisien, setItemKoefisien] = React.useState<number>(1.0);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  // Calculate live total components and total AHS with profit
  const totalRawComponents = componentItems.reduce((acc, it) => acc + it.subtotal, 0);
  const calculatedHargaFinal = Math.round(totalRawComponents * (1 + profitPercent / 100));

  const handleAddComponentItem = () => {
    if (!itemRefId) return;

    let selectedName = '';
    let selectedPrice = 0;

    if (itemTipe === 'barang') {
      const mat = state.materials.find((m) => m.id === itemRefId);
      if (mat) {
        selectedName = mat.nama_barang;
        selectedPrice = mat.harga;
      }
    } else {
      const lab = state.laborRates.find((l) => l.id === itemRefId);
      if (lab) {
        selectedName = lab.nama_pekerjaan;
        selectedPrice = lab.harga;
      }
    }

    const newItem: ComponentItem = {
      id: `it-${Date.now()}`,
      tipe: itemTipe,
      referensi_id: itemRefId,
      nama: selectedName,
      koefisien: Number(itemKoefisien),
      harga: selectedPrice,
      subtotal: Math.round(selectedPrice * Number(itemKoefisien)),
    };

    setComponentItems([...componentItems, newItem]);
    setItemRefId('');
  };

  const handleRemoveComponentItem = (id: string) => {
    setComponentItems(componentItems.filter((i) => i.id !== id));
  };

  const handleSaveAHS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeAHS || !namaAHS) return;

    const newAHS: UnitPriceAnalysis = {
      id: `ahs-${Date.now()}`,
      kode_ahs: kodeAHS,
      nama_ahs: namaAHS,
      satuan: satuan,
      profit_percent: profitPercent,
      harga: calculatedHargaFinal,
      items: componentItems,
    };

    const updated = {
      ...state,
      ahs: [newAHS, ...state.ahs],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin',
          action: 'CREATE',
          entity_name: 'AHS',
          details: `Membuat AHS ${kodeAHS} (${namaAHS}) - Rp ${formatRupiah(calculatedHargaFinal)}`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
    setIsModalOpen(false);
    // Reset
    setKodeAHS('');
    setNamaAHS('');
    setComponentItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="h-6 w-6 text-amber-400" /> Analisa Harga Satuan (AHS)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kalkulator otomatis harga satuan: <code className="text-amber-300">Harga Final = (Material + Upah) × (1 + Profit %)</code>
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Buat AHS Baru
        </Button>
      </div>

      {/* AHS Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.ahs.map((ahsItem) => (
          <Card key={ahsItem.id} className="glass-panel border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="warning" className="font-mono">{ahsItem.kode_ahs}</Badge>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Harga Final AHS</span>
                  <p className="text-lg font-bold text-emerald-400">{formatRupiah(ahsItem.harga)} / {ahsItem.satuan}</p>
                </div>
              </div>
              <CardTitle className="text-base mt-2 text-white">{ahsItem.nama_ahs}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Margin Profit Terhitung:</span>
                <span className="font-semibold text-amber-400">{ahsItem.profit_percent}%</span>
              </div>

              {/* Rincian Komponen */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rincian Komponen AHS:</p>
                {ahsItem.items && ahsItem.items.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {ahsItem.items.map((item) => (
                      <div key={item.id} className="text-xs flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                        <div className="truncate max-w-[200px]">
                          <span className="font-medium text-slate-200">{item.nama}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.koefisien} x {formatRupiah(item.harga)}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-300">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Komponen standard terintegrasi</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Calculator AHS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Kalkulator Analisa Harga Satuan (AHS)"
        subtitle="Rakit komponen material & upah, sistem menghitung harga akhir secara otomatis"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAHS} className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Kode AHS *</label>
              <Input
                required
                placeholder="AHS-STR-05"
                value={kodeAHS}
                onChange={(e) => setKodeAHS(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nama Pekerjaan AHS *</label>
              <Input
                required
                placeholder="1 m2 Pasangan Dinding Bata Ringan t=10cm"
                value={namaAHS}
                onChange={(e) => setNamaAHS(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Satuan (Unit)</label>
              <Input value={satuan} onChange={(e) => setSatuan(e.target.value)} placeholder="m3 / m2 / kg" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Margin Profit (%)</label>
              <Input
                type="number"
                step="0.5"
                value={profitPercent}
                onChange={(e) => setProfitPercent(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Builder Box Komponen */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4" /> Tambah Rincian Komponen (Material & Upah)
            </h4>

            <div className="grid grid-cols-4 gap-2 items-end">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tipe</label>
                <Select value={itemTipe} onChange={(e) => setItemTipe(e.target.value as any)}>
                  <option value="barang">Material Barang</option>
                  <option value="upah">Tenaga Upah</option>
                </Select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Pilih Item Master</label>
                <Select value={itemRefId} onChange={(e) => setItemRefId(e.target.value)}>
                  <option value="">-- Pilih dari Katalog --</option>
                  {itemTipe === 'barang'
                    ? state.materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama_barang} ({formatRupiah(m.harga)}/{m.unit})
                        </option>
                      ))
                    : state.laborRates.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nama_pekerjaan} ({formatRupiah(l.harga)}/{l.unit})
                        </option>
                      ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Koefisien</label>
                <Input
                  type="number"
                  step="0.001"
                  value={itemKoefisien}
                  onChange={(e) => setItemKoefisien(Number(e.target.value))}
                />
              </div>
            </div>

            <Button type="button" onClick={handleAddComponentItem} variant="secondary" size="sm" className="w-full gap-1 mt-2">
              <Plus className="h-3.5 w-3.5" /> Masukkan ke Komponen AHS
            </Button>

            {/* Sub-Table Komponen Added */}
            {componentItems.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                {componentItems.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="truncate max-w-[280px]">
                      <span className="text-amber-400 font-semibold uppercase mr-2">[{ci.tipe}]</span>
                      <span className="text-slate-200">{ci.nama}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">{ci.koefisien} × {formatRupiah(ci.harga)}</span>
                      <span className="font-bold text-emerald-400">{formatRupiah(ci.subtotal)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveComponentItem(ci.id)}
                        className="h-6 w-6 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Calculation Output Footer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-300 font-semibold">Total Komponen: {formatRupiah(totalRawComponents)}</p>
              <p className="text-[11px] text-slate-400">Termasuk Margin Profit {profitPercent}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Harga Final AHS</p>
              <p className="text-xl font-bold text-amber-400">{formatRupiah(calculatedHargaFinal)} / {satuan}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Simpan Analisa AHS
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
