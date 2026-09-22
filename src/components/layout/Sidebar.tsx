'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  Package,
  Users2,
  Calculator,
  FileCode2,
  FileCheck,
  FileEdit,
  ShoppingBag,
  Truck,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Wallet,
  Settings,
  HardHat,
  ChevronRight,
  ShieldAlert,
  LogOut,
  User,
} from 'lucide-react';
import { getDataState, DataState } from '@/lib/dataStore';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  Package,
  Users2,
  Calculator,
  FileCode2,
  FileCheck,
  FileEdit,
  ShoppingBag,
  Truck,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Wallet,
  Settings,
};

export function Sidebar() {
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

  if (!state) return null;

  const currentProfile = state.profiles.find((p) => p.id === state.currentUserId) || state.profiles[0];
  const userRoleId = currentProfile.role_id;

  // Filter allowed menus based on dynamic roleAccess matrix
  const allowedMenuIds = new Set(
    state.roleAccess
      .filter((access) => access.role_id === userRoleId && access.can_view)
      .map((access) => access.menu_id)
  );

  const visibleMenus = state.menus
    .filter((menu) => allowedMenuIds.has(menu.id))
    .sort((a, b) => a.sort_order - b.sort_order);

  // Group menus by header
  const groupedMenus: Record<string, typeof visibleMenus> = {};
  visibleMenus.forEach((menu) => {
    const header = menu.header || 'Lainnya';
    if (!groupedMenus[header]) groupedMenus[header] = [];
    groupedMenus[header].push(menu);
  });

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
          <HardHat className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide leading-tight">APPADENTIS</h1>
          <p className="text-[11px] font-medium text-amber-400/90 tracking-wider uppercase">Monitoring Konstruksi</p>
        </div>
      </div>

      {/* Role Switcher Quick Pill (for demo/testing dynamic RBAC) */}
      <div className="p-3 mx-3 mt-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <User className="h-4 w-4 text-blue-400 shrink-0" />
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">{currentProfile.full_name}</p>
            <p className="text-[10px] text-slate-400">{currentProfile.role_name}</p>
          </div>
        </div>
        <Badge variant={currentProfile.role_name === 'Super Admin' ? 'warning' : 'default'} className="text-[10px] px-1.5 py-0">
          {currentProfile.role_name}
        </Badge>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {Object.entries(groupedMenus).map(([header, items]) => (
          <div key={header} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {header}
            </h2>
            {items.map((item) => {
              const IconComponent = iconMap[item.icon] || ChevronRight;
              const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-slate-400 text-xs">
        <span className="text-[11px]">v1.0.0 MVP • RLS Ready</span>
        <ShieldAlert className="h-4 w-4 text-emerald-400" />
      </div>
    </aside>
  );
}
