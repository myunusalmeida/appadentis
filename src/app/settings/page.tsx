'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { getDataState, saveDataState, DataState } from '@/lib/dataStore';
import { Settings, Shield, Users, Check, X, Save } from 'lucide-react';

export default function SettingsPage() {
  const [state, setState] = React.useState<DataState | null>(null);
  const [selectedRoleId, setSelectedRoleId] = React.useState('role-1');
  const [isSavedNotice, setIsSavedNotice] = React.useState(false);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  if (!state) return null;

  const currentRole = state.roles.find((r) => r.id === selectedRoleId) || state.roles[0];

  const handleToggleAccess = (menuId: string, field: 'can_view' | 'can_add' | 'can_edit' | 'can_delete') => {
    const updatedAccess = state.roleAccess.map((access) => {
      if (access.role_id === selectedRoleId && access.menu_id === menuId) {
        return {
          ...access,
          [field]: !access[field],
        };
      }
      return access;
    });

    const updatedState = { ...state, roleAccess: updatedAccess };
    saveDataState(updatedState);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-400" /> Pengaturan System & Dynamic RBAC
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Matriks Hak Akses Granular (View / Add / Edit / Delete) per role dinamis dari database <code className="text-amber-300">role_menu_access</code>.
          </p>
        </div>

        {isSavedNotice && (
          <Badge variant="success" className="gap-1 px-3 py-1 text-xs animate-in fade-in">
            <Check className="h-4 w-4" /> Matriks Akses Diperbarui
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Role Selector & Users List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" /> Pilih Role Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    selectedRoleId === role.id
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{role.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{role.description}</p>
                  </div>
                  {selectedRoleId === role.id && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" /> Daftar Pengguna Terdaftar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.profiles.map((p) => (
                <div key={p.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                  <p className="font-semibold text-white">{p.full_name}</p>
                  <p className="text-[10px] text-slate-400">{p.email}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{p.role_name}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Permission Matrix Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Matriks Akses Menu - Role: <span className="text-amber-400">{currentRole.name}</span>
                </CardTitle>
                <CardDescription>
                  Pengaturan centang izin akses granular ini langsung mengubah visibilitas Sidebar dan proteksi Route.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Header Modul / Menu</TableHead>
                    <TableHead className="text-center">Can View (Sidebar)</TableHead>
                    <TableHead className="text-center">Can Add (Buat)</TableHead>
                    <TableHead className="text-center">Can Edit (Ubah)</TableHead>
                    <TableHead className="text-center">Can Delete (Hapus)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.menus.map((menu) => {
                    const access = state.roleAccess.find(
                      (a) => a.role_id === selectedRoleId && a.menu_id === menu.id
                    );

                    const canView = access ? access.can_view : true;
                    const canAdd = access ? access.can_add : false;
                    const canEdit = access ? access.can_edit : false;
                    const canDelete = access ? access.can_delete : false;

                    return (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              {menu.header}
                            </span>
                            <span className="font-semibold text-white text-sm">{menu.name}</span>
                            <span className="text-xs text-slate-500 font-mono block">{menu.path}</span>
                          </div>
                        </TableCell>

                        {/* View Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={canView}
                            onChange={() => handleToggleAccess(menu.id, 'can_view')}
                            className="h-4 w-4 rounded accent-blue-600 bg-slate-800 border-slate-700 cursor-pointer"
                          />
                        </TableCell>

                        {/* Add Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={canAdd}
                            onChange={() => handleToggleAccess(menu.id, 'can_add')}
                            className="h-4 w-4 rounded accent-emerald-600 bg-slate-800 border-slate-700 cursor-pointer"
                          />
                        </TableCell>

                        {/* Edit Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={canEdit}
                            onChange={() => handleToggleAccess(menu.id, 'can_edit')}
                            className="h-4 w-4 rounded accent-amber-600 bg-slate-800 border-slate-700 cursor-pointer"
                          />
                        </TableCell>

                        {/* Delete Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={canDelete}
                            onChange={() => handleToggleAccess(menu.id, 'can_delete')}
                            className="h-4 w-4 rounded accent-red-600 bg-slate-800 border-slate-700 cursor-pointer"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
