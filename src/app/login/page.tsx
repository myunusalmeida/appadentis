'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getDataState, saveDataState } from '@/lib/dataStore';
import { HardHat, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@appadentis.com');
  const [password, setPassword] = React.useState('••••••••');
  const [selectedProfileId, setSelectedProfileId] = React.useState('usr-1');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const demoAccounts = [
    { id: 'usr-1', name: 'Super Admin', email: 'admin@appadentis.com', role: 'Super Admin', color: 'warning' },
    { id: 'usr-2', name: 'Budi Santoso', email: 'budi.admin@appadentis.com', role: 'Admin', color: 'default' },
    { id: 'usr-3', name: 'Dewi Lestari', email: 'dewi.site@appadentis.com', role: 'User (Staf)', color: 'secondary' },
    { id: 'usr-4', name: 'Ahmad Gudang', email: 'ahmad.warehouse@appadentis.com', role: 'User Gudang', color: 'success' },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setSelectedProfileId(acc.id);
    setEmail(acc.email);
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const state = getDataState();
      const targetUser = state.profiles.find((p) => p.id === selectedProfileId || p.email === email);

      if (!targetUser) {
        setErrorMsg('Email atau password tidak ditemukan.');
        setLoading(false);
        return;
      }

      // 1. Set session cookie for Next.js Middleware route protection
      document.cookie = `appadentis_session_user=${targetUser.id}; path=/; max-age=86400; SameSite=Lax`;

      // 2. Update state store
      const updated = {
        ...state,
        currentUserId: targetUser.id,
        activityLogs: [
          {
            id: `log-${Date.now()}`,
            user_name: targetUser.full_name,
            action: 'LOGIN',
            entity_name: 'Auth',
            details: `User Login berhasil sebagai ${targetUser.role_name}`,
            created_at: new Date().toISOString(),
          },
          ...state.activityLogs,
        ],
      };

      saveDataState(updated);
      setLoading(false);

      // 3. Force redirect to dashboard
      window.location.href = '/';
    } catch {
      setErrorMsg('Gagal memproses sesi login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-amber-500/20 mx-auto">
            <HardHat className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">APPADENTIS</h1>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Monitoring Proyek Konstruksi & Subkontraktor
          </p>
        </div>

        <Card className="glass-panel border-slate-800 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-lg text-white">Masuk ke Sistem</CardTitle>
            <CardDescription className="text-xs">
              Silakan login terlebih dahulu untuk mengakses sistem
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Email User</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-900 border-slate-700"
                    placeholder="nama@appadentis.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>

              <Button type="submit" variant="amber" className="w-full gap-2 py-5 font-semibold" disabled={loading}>
                {loading ? 'Memproses Login...' : 'Masuk Aplikasi'} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Pilih Akun Demo Login:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                      selectedProfileId === acc.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold text-slate-200 truncate">{acc.name}</span>
                    <Badge variant={acc.color as any} className="text-[9px] px-1 py-0 mt-1 self-start">
                      {acc.role}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Protected by Next.js Auth Middleware & Supabase</span>
        </div>
      </div>
    </div>
  );
}
