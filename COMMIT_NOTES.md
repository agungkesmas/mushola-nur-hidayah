# Catatan Pembaruan (Update Notes)

Berikut adalah catatan pembaruan yang dapat Anda gunakan untuk pesan commit:

## Ringkasan Fitur
- **Perbaikan Splash Screen:** Memperbarui CSS container Splash Screen menjadi `absolute inset-0 z-50` agar layout menyesuaikan penuh layar browser secara akurat (`100dvh`) meskipun halaman direfresh (pull-to-refresh) di perangkat seluler.
- **Penyempurnaan Navigasi Bottom:** Merapikan `max-w` pada tab navigasi bawah dan header agar serasi dengan lebar konten layar tablet dan desktop.
- **Notifikasi Adzan Nyata:** Mengganti nada notifikasi sintesis dengan pemutaran audio adzan yang sebenarnya (Subuh.mp3 untuk subuh, dan Azan.mp3 untuk waktu lainnya).
- **Service Worker (PWA):** Integrasi Service Worker dan request permission `Notification` untuk memungkinkan notifikasi latar belakang (Push Notifications lokal) tampil pada OS (Android/Windows) saat waktu sholat tiba.
- **Penyempurnaan Fikih:** Melengkapi panduan ibadah (Thaharah, Sholat, Puasa, Zakat, hingga Jenazah) dengan detail rukun dan referensi dari kitab klasik (Safinatun Naja, Fathul Mu'in).
- **Penyeragaman UI Header Detail:** Menyempurnakan setiap halaman layar detail fitur (Tasbih, Arah Kiblat, Kalender Hijriah, Kumpulan Hadits, Fikih, dan Tafsir Al-Qur'an) agar kini memiliki visual yang seragam berupa *sticky Header navbar* berdesain *frosted-glass* di bagian atas, lengkap dengan tombol **Kembali** (*Back*) yang diletakkan searah bagi akses menu terintegrasi.

## Pesan Commit Singkat (Copy-Paste)
```text
feat: PWA background notifications & penyeragaman desain header detail halaman
```

