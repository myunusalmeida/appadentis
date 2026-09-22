'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { PurchaseOrder, PurchaseOrderItem } from '@/lib/mockData';
import { ShoppingBag, Plus, Trash2, Truck } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form
  const [projectId, setProjectId] = React.useState('');
  const [tujuanPO, setTujuanPO] = React.useState('');
  const [noPO, setNoPO] = React.useState('');
  const [jenisPayment, setJenisPayment] = React.useState<'Cash' | 'Kredit' | 'DP'>('Kredit');
  const [tglDelivery, setTglDelivery] = React.useState('');
  const [poItems, setPoItems] = React.useState<PurchaseOrderItem[]>([]);

  // Item builder
  const [barangId, setBarangId] = React.useState('');
  const [itemQty, setItemQty] = React.useState<number>(100);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const grandTotalPO = poItems.reduce((acc, i) => acc + i.subtotal, 0);

  const handleAddPOItem = () => {
    if (!barangId || itemQty <= 0) return;
    const mat = state.materials.find((m) => m.id === barangId);
    if (!mat) return;

    const newItem: PurchaseOrderItem = {
      id: `poi-${Date.now()}`,
      po_id: '',
      barang_id: barangId,
      nama_barang: mat.nama_barang,
      qty: Number(itemQty),
      harga: mat.harga,
      subtotal: Math.round(mat.harga * Number(itemQty)),
      qty_diterima: 0,
    };

    setPoItems([...poItems, newItem]);
    setBarangId('');
    setItemQty(100);
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !tujuanPO) return;

    const proj = state.projects.find((p) => p.id === projectId);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      project_id: projectId,
      project_name: proj?.nama_pekerjaan || 'Proyek',
      no_po: noPO || `PO/APP/2026/${Math.floor(Math.random() * 900 + 100)}`,
      tanggal: new Date().toISOString().split('T')[0],
      tujuan_po: tujuanPO,
      tanggal_pengiriman: tglDelivery || '2026-03-30',
      jenis_payment: jenisPayment,
      tgl_jatuh_tempo: '2026-04-30',
      status_po: 'Pending',
      total_po: grandTotalPO,
      items: poItems,
    };

    const updated = {
      ...state,
      purchaseOrders: [newPO, ...state.purchaseOrders],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'User Gudang / Admin',
          action: 'CREATE',
          entity_name: 'Purchase Order',
          details: `Membuat Purchase Order ${newPO.no_po} ke Supplier ${tujuanPO} (Total ${formatRupiah(grandTotalPO)})`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updated);
    setIsModalOpen(false);
    setPoItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-purple-400" /> Procurement - Purchase Order (PO)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pembelian material & peralatan konstruksi terhubung langsung dengan penyusunan RAP.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Buat PO Material Baru
        </Button>
      </div>

      <div className="space-y-6">
        {state.purchaseOrders.map((po) => (
          <Card key={po.id} className="glass-panel">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="font-mono">{po.no_po}</Badge>
                  <Badge
                    variant={
                      po.status_po === 'Received'
                        ? 'success'
                        : po.status_po === 'Partial'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {po.status_po}
                  </Badge>
                </div>
                <CardTitle className="text-base text-white mt-1">Supplier: {po.tujuan_po}</CardTitle>
                <p className="text-xs text-slate-400">Proyek: {po.project_name} | Payment: {po.jenis_payment}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Purchase Order</span>
                <p className="text-xl font-bold text-purple-300">{formatRupiah(po.total_po)}</p>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Barang</TableHead>
                    <TableHead>Qty PO</TableHead>
                    <TableHead>Harga Satuan</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Qty Diterima (Receive PO)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-white">{item.nama_barang}</TableCell>
                      <TableCell className="font-bold text-slate-200">{item.qty}</TableCell>
                      <TableCell>{formatRupiah(item.harga)}</TableCell>
                      <TableCell className="font-bold text-amber-400">{formatRupiah(item.subtotal)}</TableCell>
                      <TableCell>
                        <Badge variant="success" className="font-mono">
                          {item.qty_diterima || 0} / {item.qty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Add PO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Purchase Order (PO) Material"
        subtitle="Item diambil dari katalog Referensi Barang"
        maxWidth="2xl"
      >
        <form onSubmit={handleSavePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tujuan Supplier / Toko *</label>
              <Input
                required
                placeholder="PT Jayamix / Toko Besi Jaya"
                value={tujuanPO}
                onChange={(e) => setTujuanPO(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. PO</label>
              <Input placeholder="PO/APP/2026/022" value={noPO} onChange={(e) => setNoPO(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Jenis Pembayaran</label>
              <Select value={jenisPayment} onChange={(e) => setJenisPayment(e.target.value as any)}>
                <option value="Kredit">Kredit / Jatuh Tempo</option>
                <option value="Cash">Cash Tunai</option>
                <option value="DP">DP Awal</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Target Tanggal Kirim</label>
              <Input type="date" value={tglDelivery} onChange={(e) => setTglDelivery(e.target.value)} />
            </div>
          </div>

          {/* Item Builder Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tambah Item Barang PO</h4>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Pilih Material Katalog</label>
                <Select value={barangId} onChange={(e) => setBarangId(e.target.value)}>
                  <option value="">-- Pilih Material --</option>
                  {state.materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama_barang} ({formatRupiah(m.harga)}/{m.unit})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Jumlah Qty</label>
                <Input
                  type="number"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                />
              </div>
            </div>

            <Button type="button" onClick={handleAddPOItem} variant="secondary" size="sm" className="w-full gap-1">
              <Plus className="h-3.5 w-3.5" /> Masukkan ke Item PO
            </Button>

            {/* List Added PO Items */}
            {poItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {poItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800">
                    <div>
                      <span className="font-semibold text-white">{item.nama_barang}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Qty: {item.qty} × {formatRupiah(item.harga)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-purple-300">{formatRupiah(item.subtotal)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPoItems(poItems.filter((i) => i.id !== item.id))}
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

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Total PO Nilai Material:</span>
            <span className="text-xl font-bold text-purple-300">{formatRupiah(grandTotalPO)}</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Simpan & Terbitkan PO
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
