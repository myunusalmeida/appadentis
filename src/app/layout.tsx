import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Monitoring Proyek Konstruksi & Subkontraktor - Appadentis',
  description: 'Sistem terpadu manajemen proyek konstruksi, Rencana Anggaran Proyek (RAP), Analisa Harga Satuan (AHS), Kontrak Subkontraktor, Progress Termin, dan Pembayaran Retensi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
