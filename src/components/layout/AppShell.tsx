'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { getDataState, saveDataState, DataState } from '@/lib/dataStore';
import { Building2, Shield, Bell, LogOut } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [state, setState] = React.useState<DataState | null>(null);

  const loadState = React.useCallback(() => {
    setState(getDataState());
  }, []);

  React.useEffect(() => {
    loadState();
    window.addEventListener('appadentis_state_updated', loadState);
    return () => window.removeEventListener('appadentis_state_updated', loadState);
  }, [loadState]);

  // Don't wrap login page with AppShell layout
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleSwitchUserRole = (userId: string) => {
    if (!state) return;
    document.cookie = `appadentis_session_user=${userId}; path=/; max-age=86400; SameSite=Lax`;
    const updated = { ...state, currentUserId: userId };
    saveDataState(updated);
  };

  const handleLogout = () => {
    // Clear session cookie and redirect to login
    document.cookie = 'appadentis_session_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  if (!state) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Building2 className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Proyek Aktif:</span>
              <span className="text-white truncate max-w-[250px]">
                {state.projects[0]?.nama_pekerjaan || 'Semua Proyek'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
              <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Role Mode:</span>
              <Select
                value={state.currentUserId}
                onChange={(e) => handleSwitchUserRole(e.target.value)}
                className="h-7 text-xs bg-slate-900 border-slate-700 py-0 px-2"
              >
                {state.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role_name})
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-red-400 hover:text-white hover:bg-red-600/20 border-red-500/30"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
