# Panduan Hubung & Migrasi Custom Domain ke Vercel

Panduan lengkap untuk menautkan dan mengonfigurasi **Custom Domain milik Anda** (contoh: `appadentis.com` atau `app.appadentis.com`) ke aplikasi Next.js di **Vercel**, lengkap dengan penyetelan DNS dan penyesuaian Supabase Auth.

---

## 🌐 Langkah 1: Tambahkan Custom Domain di Vercel Dashboard

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan pilih proyek **Appadentis** Anda.
2. Di menu navigasi atas proyek, buka **Settings** ⚙️ ➔ pilih menu **Domains**.
3. Pada kolom **Add Domain**, ketik nama domain yang ingin Anda gunakan:
   - **Contoh Root Domain**: `namadomainanda.com` *(misal: `appadentis.com`)*
   - **Contoh Subdomain**: `app.namadomainanda.com`
4. Klik tombol **Add**.
5. Vercel akan memberikan pilihan:
   - *Add `namadomainanda.com` and redirect `www.namadomainanda.com` to it* (Rekomendasi untuk Root Domain).
   - Klik **Add**.

---

## 📡 Langkah 2: Konfigurasi DNS di Registrar Domain Anda
*(Seperti Niagahoster, Rumahweb, Cloudflare, Namecheap, GoDaddy, DWA, dll.)*

Buka dashboard manajemen DNS di penyedia domain tempat Anda membeli domain, lalu tambahkan Record DNS sesuai petunjuk Vercel:

### 🔹 Opsi A: Jika Menggunakan Apex / Root Domain (`namadomainanda.com`)

Tambahkan **A Record** dan **CNAME Record**:

| Type / Jenis | Name / Host | Value / Target / Pointer | TTL |
| --- | --- | --- | --- |
| **A** | `@` *(atau dikosongkan)* | `76.76.21.21` | Auto / 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto / 3600 |

---

### 🔹 Opsi B: Jika Menggunakan Subdomain (`app.namadomainanda.com`)

Cukup tambahkan **1 CNAME Record**:

| Type / Jenis | Name / Host | Value / Target / Pointer | TTL |
| --- | --- | --- | --- |
| **CNAME** | `app` | `cname.vercel-dns.com.` | Auto / 3600 |

---

### 🔹 Opsi C: Menggunakan Nameservers Vercel (Alternatif Bebas Repot)

Jika Anda ingin Vercel mengelola seluruh DNS secara otomatis:
1. Di DNS Registrar Anda, ubah **Nameservers** menjadi:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

---

## 🔒 Langkah 3: Verifikasi SSL & HTTPS Otomatis

1. Setelah Rekord DNS disimpan, tunggu propagasi DNS (~5 menit hingga maksimal 24 jam).
2. Di halaman **Settings ➔ Domains** di Vercel, status akan berubah dari 🟡 *Invalid Configuration* menjadi 🟢 **Valid Configuration**.
3. Vercel akan secara **otomatis menerbitkan Sertifikat SSL HTTPS (Let's Encrypt)** secara gratis.

---

## 🔑 Langkah 4: Perbarui Supabase Auth URL (Penting!)

Agar login pengguna dapat mengarahkan kembali (redirect) ke domain baru Anda secara tepat:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard/projects) ➔ Pilih Proyek Anda.
2. Buka **Authentication** ➔ **URL Configuration**.
3. Ubah **Site URL** ke domain baru Anda:
   `https://namadomainanda.com` *(atau `https://app.namadomainanda.com`)*
4. Tambahkan pada **Redirect URLs**:
   `https://namadomainanda.com/**`
5. Klik **Save**.

---

## ✅ Selesai!

Domain kustom Anda sekarang sudah aktif, terenkripsi HTTPS, dan terintegrasi penuh dengan Next.js di Vercel serta Supabase Auth!
