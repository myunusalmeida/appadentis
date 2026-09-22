'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, DataState } from '@/lib/dataStore';
import { POReceipt } from '@/lib/mockData';
import { Truck, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ReceivePOPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [poId, setPoId] = React.useState('');
  const [penerima, setPenerima] = React.useState('');
  const [tglTerima, setTglTerima] = React.useState('');
  const [receiveQtyInput, setReceiveQtyInput] = React.useState<number>(0);
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

  const selectedPO = state.purchaseOrders.find((p) => p.id === poId);
  const firstItem = selectedPO?.items?.[0];
  const maxAllowedQty = firstItem ? firstItem.qty - (firstItem.qty_diterima || 0) : 0;

  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poId || !selectedPO || !firstItem) return;

    if (receiveQtyInput > maxAllowedQty) {
      setErrorMsg(`Peringatan! Jumlah qty diterima (${receiveQtyInput}) melebihi sisa PO (${maxAllowedQty}).`);
      return;
    }

    const newReceipt: POReceipt = {
      id: `rec-${Date.now()}`,
      po_id: poId,
      no_po: selectedPO.no_po,
      tanggal_terima: tglTerima || new Date().toISOString().split('T')[0],
      status_pengiriman: receiveQtyInput === maxAllowedQty ? 'Selesai Lengkap' : 'Diterima Sebagian',
      penerima: penerima || 'Staff Gudang Lapangan',
      items: [
        {
          id: `reci-${Date.now()}`,
          receipt_id: '',
          po_item_id: firstItem.id,
          nama_barang: firstItem.nama_barang,
          qty_diterima: Number(receiveQtyInput),
        },
      ],
    };

    // Update PO item qty_diterima and status_po
    const updatedPOs = state.purchaseOrders.map((p) => {
      if (p.id === poId) {
        const updatedItems = p.items?.map((it) => {
          if (it.id === firstItem.id) {
            return { ...it, qty_diterima: (it.qty_diterima || 0) + Number(receiveQtyInput) };
          }
          return it;
        });
        const totalReceived = updatedItems?.reduce((sum, it) => sum + (it.qty_diterima || 0), 0) || 0;
        const totalPOQty = updatedItems?.reduce((sum, it) => sum + it.qty, 0) || 1;
        const newStatus = totalReceived >= totalPOQty ? 'Received' : 'Partial';

        return { ...p, items: updatedItems, status_po: newStatus as any };
      }
      return p;
    });

    const updated = {
      ...state,
      purchaseOrders: updatedPOs,
      poReceipts: [newReceipt, ...state.poReceipts],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: penerima || 'User Gudang',
          action: 'CREATE',
          entity_name: 'Receive PO',
          details: `Konfirmasi Penerimaan PO ${selectedPO.no_po} Qty: ${receiveQtyInput} (${newReceipt.status_pengiriman})`,
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
            <Truck className="h-6 w-6 text-amber-400" /> Penerimaan Barang (Receive PO)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfirmasi barang PO diterima di gudang/lapangan dengan proteksi batas Qty PO.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Input Penerimaan Barang
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. PO Target</TableHead>
                <TableHead>Penerima Barang</TableHead>
                <TableHead>Tanggal Terima</TableHead>
                <TableHead>Rincian Qty Diterima</TableHead>
                <TableHead>Status Pengiriman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.poReceipts.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-mono font-semibold text-amber-400">{rec.no_po}</TableCell>
                  <TableCell className="text-white font-medium">{rec.penerima}</TableCell>
                  <TableCell className="text-xs text-slate-300">{rec.tanggal_terima}</TableCell>
                  <TableCell>
                    {rec.items?.map((it) => (
                      <div key={it.id} className="text-xs">
                        <span className="text-slate-200">{it.nama_barang}: </span>
                        <strong className="text-emerald-400 font-mono">+{it.qty_diterima} Unit</strong>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rec.status_pengiriman === 'Selesai Lengkap' ? 'success' : 'warning'}>
                      {rec.status_pengiriman}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Receive PO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Konfirmasi Penerimaan Barang PO"
        subtitle="Sistem mencegah jumlah penerimaan melebihi sisa Qty PO"
      >
        <form onSubmit={handleSaveReceipt} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Pilih Dokumen PO *</label>
            <Select required value={poId} onChange={(e) => setPoId(e.target.value)}>
              <option value="">-- Pilih PO Berjalan --</option>
              {state.purchaseOrders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.no_po} - {p.tujuan_po} ({p.status_po})
                </option>
              ))}
            </Select>
          </div>

          {selectedPO && firstItem && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-amber-400">Ringkasan Qty Item PO:</p>
              <div className="text-xs flex justify-between text-slate-300">
                <span>Material: <strong>{firstItem.nama_barang}</strong></span>
                <span>Total Qty PO: <strong>{firstItem.qty}</strong></span>
              </div>
              <div className="text-xs flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                <span>Sudah Diterima: {firstItem.qty_diterima || 0}</span>
                <span className="text-emerald-400 font-bold">Maksimal Tambahan: {maxAllowedQty}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Qty Diterima Saat Ini *</label>
              <Input
                type="number"
                required
                max={maxAllowedQty || 999999}
                placeholder={`Maks ${maxAllowedQty}`}
                value={receiveQtyInput}
                onChange={(e) => {
                  setErrorMsg('');
                  setReceiveQtyInput(Number(e.target.value));
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tanggal Terima</label>
              <Input type="date" value={tglTerima} onChange={(e) => setTglTerima(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nama Petugas Penerima (Staf Gudang) *</label>
            <Input
              required
              placeholder="Ahmad Gudang (Staff Logistic)"
              value={penerima}
              onChange={(e) => setPenerima(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Simpan Penerimaan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
