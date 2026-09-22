'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getDataState, saveDataState, formatRupiah, DataState } from '@/lib/dataStore';
import { Project } from '@/lib/mockData';
import { Building2, Plus, Search, Calendar, MapPin, Edit3, Trash2 } from 'lucide-react';

export default function ProjectsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form state
  const [namaPekerjaan, setNamaPekerjaan] = React.useState('');
  const [noKontrak, setNoKontrak] = React.useState('');
  const [nilaiKontrak, setNilaiKontrak] = React.useState<number>(0);
  const [lokasi, setLokasi] = React.useState('');
  const [tanggalMulai, setTanggalMulai] = React.useState('');
  const [tanggalSelesai, setTanggalSelesai] = React.useState('');

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const filteredProjects = state.projects.filter(
    (p) =>
      p.nama_pekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.no_kontrak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPekerjaan || !noKontrak) return;

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      nama_pekerjaan: namaPekerjaan,
      no_kontrak: noKontrak,
      nilai_kontrak: Number(nilaiKontrak),
      lokasi: lokasi || 'Lokasi Proyek',
      tanggal_mulai: tanggalMulai || new Date().toISOString().split('T')[0],
      tanggal_selesai: tanggalSelesai || new Date().toISOString().split('T')[0],
      status: 'Berjalan',
      progress_percent: 0,
    };

    const updatedProjects = [newProject, ...state.projects];
    const updatedState = {
      ...state,
      projects: updatedProjects,
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          user_name: 'Admin',
          action: 'CREATE',
          entity_name: 'Project',
          details: `Membuat Proyek Baru: ${namaPekerjaan}`,
          created_at: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    };

    saveDataState(updatedState);
    setIsModalOpen(false);
    // Reset form
    setNamaPekerjaan('');
    setNoKontrak('');
    setNilaiKontrak(0);
    setLokasi('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-400" /> Master Proyek Konstruksi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data induk seluruh proyek konstruksi, nomor kontrak, lokasi, dan milestone jadwal.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="amber" className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Proyek Baru
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama proyek, no. kontrak, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700"
            />
          </div>
          <div className="text-xs text-slate-400">
            Menampilkan <span className="font-bold text-white">{filteredProjects.length}</span> proyek
          </div>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pekerjaan & Kontrak</TableHead>
                <TableHead>Nilai Kontrak (Rp)</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Jadwal Pelaksanaan</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{p.nama_pekerjaan}</p>
                      <p className="text-xs text-amber-400 font-mono mt-0.5">{p.no_kontrak}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-200">
                    {formatRupiah(p.nilai_kontrak)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{p.lokasi}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{p.tanggal_mulai} s/d {p.tanggal_selesai}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-amber-400">{p.progress_percent}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'Berjalan' ? 'warning' : 'success'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Add Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Proyek Baru"
        subtitle="Masukkan detail induk proyek konstruksi"
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nama Pekerjaan Proyek *</label>
            <Input
              required
              placeholder="Contoh: Pembangunan Gedung Kantor 8 Lt"
              value={namaPekerjaan}
              onChange={(e) => setNamaPekerjaan(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">No. Kontrak *</label>
              <Input
                required
                placeholder="CTR/2026/XYZ-001"
                value={noKontrak}
                onChange={(e) => setNoKontrak(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nilai Kontrak (Rp)</label>
              <Input
                type="number"
                placeholder="1000000000"
                value={nilaiKontrak}
                onChange={(e) => setNilaiKontrak(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Lokasi Pekerjaan</label>
            <Input
              placeholder="Jl. Sudirman Kav 10, Jakarta"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tanggal Mulai</label>
              <Input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Tanggal Selesai</label>
              <Input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="amber">
              Simpan Proyek
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
