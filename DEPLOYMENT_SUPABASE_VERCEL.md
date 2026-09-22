# Panduan Deployment Vercel & Setup Database Supabase

Panduan langkah demi langkah untuk melakukan **Setup Database Supabase** dan **Deploy ke Vercel** untuk aplikasi **Monitoring Proyek Konstruksi & Subkontraktor (Appadentis)**.

---

## 🗄️ Bagian 1: Setup Supabase Database

### Langkah 1: Buat Proyek Baru di Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan login ke akun Supabase Anda.
2. Klik **New Project**.
3. Isi informasi proyek:
   - **Name**: `appadentis-construction`
   - **Database Password**: *Buat password yang kuat dan catat*
   - **Region**: Pilih region terdekat (misal: `Singapore`).
4. Klik **Create new project** dan tunggu proses inisialisasi (~1–2 menit).

### Langkah 2: Eksekusi Skema Tabel & RLS (SQL Editor)
1. Di sidebar Supabase Dashboard, buka modul **SQL Editor**.
2. Klik **New Query**.
3. Buka dan salin seluruh isi file SQL yang ada di repositori:
   📄 **[supabase/schema.sql](file:///home/asus/Documents/appadentis/supabase/schema.sql)**
4. Tempel (paste) kode SQL tersebut ke dalam SQL Editor di Supabase.
5. Klik **Run** (tombol hijau).
   > ✅ *Skema tabel (`projects`, `rap`, `unit_price_analyses`, `subcontractor_contracts`, `purchase_orders`, `subcontractor_payments`, `profiles`, `roles`, `role_menu_access`, dll), RLS Policies, dan fungsi `get_my_role()` akan otomatis terbentuk.*

### Langkah 3: Ambil Kunci Akses (API Credentials)
1. Di sidebar Supabase, buka menu **Project Settings** ⚙️ ➔ **API**.
2. Catat 3 nilai berikut:
   - **Project URL** (misal: `https://xyzcompany.supabase.co`)
   - **anon / public key** (`eyJhbGciOi...`)
   - **service_role key** (secret key, untuk server actions)

---

## 🚀 Bagian 2: Deploy ke Vercel

### Langkah 1: Import Repositori GitHub di Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan login.
2. Klik **Add New...** ➔ **Project**.
3. Pada bagian *Import Git Repository*, cari dan pilih repositori Anda:
   👉 **`myunusalmeida/appadentis`**
4. Klik **Import**.

### Langkah 2: Konfigurasi Environment Variables di Vercel
Pada halaman konfigurasi *Configure Project* di Vercel, buka bagian **Environment Variables** dan tambahkan 3 variabel berikut:

| Key / Variable Name | Value | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | *Paste URL dari Supabase* | URL Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Paste Key Anon/Public* | Public Key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | *Paste Service Role Key* | Secret Key Supabase |

### Langkah 3: Deploy Proyek
1. Pastikan **Framework Preset** terdeteksi sebagai **Next.js**.
2. Klik tombol **Deploy**.
3. Tunggu proses build Vercel selesai (~1 menit).
4. Setelah selesai, Anda akan mendapatkan URL domain Vercel live (misal: `https://appadentis.vercel.app`).

---

## 🔒 Bagian 3: Konfigurasi Auth Redirect URL (Supabase)

Agar alur login & callback Supabase Auth berjalan lancar dari domain Vercel:

1. Kembali ke [Supabase Dashboard](https://supabase.com).
2. Buka menu **Authentication** ➔ **URL Configuration**.
3. Di bagian **Site URL**, masukkan URL domain Vercel Anda:
   `https://appadentis.vercel.app` (sesuaikan dengan domain Vercel Anda).
4. Di bagian **Redirect URLs**, tambahkan:
   `https://appadentis.vercel.app/**`
5. Klik **Save**.

---

## 🎉 Selamat! Aplikasi Anda Telah Live!

Aplikasi **Monitoring Proyek Konstruksi (Appadentis)** Anda sekarang sudah berjalan secara live di Vercel dengan database Postgres & Auth dari Supabase!
