# Puncak Gear — Website Jual Perlengkapan Mendaki

Website statis (HTML, CSS, JS) dengan landing page bertema pegunungan. Pengunjung bisa melihat, memfilter, dan memesan produk lewat WhatsApp. Pemilik bisa menambah produk (gambar, deskripsi, harga) lewat formulir.

## Struktur
- `index.html` — halaman utama
- `style.css` — tampilan
- `script.js` — daftar produk, formulir, filter, dan tombol pesan

## Menjalankan di komputer
Buka `index.html` di browser. Tidak perlu instalasi.

## Mengunggah ke GitHub Pages
1. Buat repository baru di GitHub, lalu unggah keempat file ini.
2. Buka **Settings → Pages**.
3. Pada **Source**, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit. Situs tampil di `https://USERNAME.github.io/NAMA-REPO/`.

## Pengaturan
- **Nomor WhatsApp:** ubah `WA_NUMBER` di bagian atas `script.js` (format `62812...`).
- **Kategori:** ubah daftar `CATS` di `script.js`.
- **Produk bawaan permanen:** edit array `DEFAULTS` di `script.js`. Isi `img` dengan path gambar di repo (mis. `images/tenda.jpg`) atau URL gambar.

## Login dan daftar
Tombol **Masuk / Daftar** di pojok kanan atas membuka kotak login. Ada dua jenis akun:

- **Pembeli:** mendaftar sendiri lewat form **Daftar** (nama, username, password minimal 8 karakter). Setelah masuk, namanya tampil di menu dan ikut tercantum di pesan WhatsApp saat memesan.
- **Admin:** hanya akun di `script.js`. Setelah masuk, formulir **Tambah produk** dan tombol **Hapus** muncul. Username `admin` tidak bisa didaftarkan oleh pembeli.

Akun admin awal: username `admin`, password `puncak2026`. **Ganti sebelum dipublikasikan.** Buka situs, tekan F12, tab Console, jalankan:
`crypto.subtle.digest("SHA-256", new TextEncoder().encode("PASSWORD_BARU")).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join("")))`
lalu salin hasilnya ke `ADMIN_HASH` di `script.js`. Username diubah di `ADMIN_USER`.

Login berlaku selama tab browser terbuka. Password disimpan dalam bentuk hash, tidak pernah sebagai teks biasa.

**Keterbatasan:** GitHub Pages hanya menyajikan file statis, jadi semuanya dicek di browser:
- Akun yang didaftarkan tersimpan di **localStorage** perangkat itu saja. Pembeli yang mendaftar di HP tidak bisa masuk dari laptop, dan Anda tidak bisa melihat daftar pembeli.
- Login admin bisa dilewati oleh orang yang paham teknis karena `script.js` bisa dibaca. Jangan dipakai untuk data sensitif.

Untuk akun yang tersimpan di server dan login yang aman, gunakan Firebase Authentication atau Supabase.

## Catatan penting
Produk yang ditambah lewat formulir tersimpan di **localStorage browser** pemilik, jadi tidak terlihat oleh pengunjung lain. Agar produk tampil untuk semua orang, tambahkan ke `DEFAULTS` lalu commit ke GitHub. Untuk admin dengan database sungguhan, Anda perlu backend (mis. Firebase atau Supabase).
