# PNL Agent ⚡

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by](https://img.shields.io/badge/Powered%20By-Way%20(Gutech%20AI)-purple.svg)](https://way.gutech.dev/)

**PNL Agent** adalah Autonomous AI Coding & Terminal Assistant (seperti *Claude Code* dan *Codex*) yang berjalan langsung di dalam terminal Anda dan ditenagai oleh **Way AI Gateway (Gutech AI)**.

Agent ini memiliki akses penuh ke tools otonom untuk membaca file, menulis kode, refactoring, berpindah direktori, dan mengeksekusi perintah terminal langsung di proyek Anda.

---

## ⚡ Panduan Instalasi Cepat (Quickstart)

Bagi siapa pun yang meng-clone repository ini, ikuti 3 langkah mudah berikut untuk menjalankannya:

### 1. Clone Repository & Masuk ke Folder
```bash
git clone https://github.com/mhmmd-aziz/PNL-AGENT.git
cd PNL-AGENT
```

### 2. Install Dependencies & Daftarkan Secara Global
```bash
npm install
npm link
```
*(Atau Anda bisa menggunakan `npm install -g .`)*

Setelah menjalankan perintah di atas, command `pnl` dan `pnl agent` sudah **otomatis aktif secara global di komputer Anda** dan bisa dijalankan dari folder mana pun!

### 3. Jalankan PNL Agent
Buka terminal di direktori proyek apa pun yang ingin Anda kerjakan, lalu ketik:
```bash
pnl agent
```
*(atau cukup ketik `pnl`)*

---

## 🔑 Aktivasi API Key Pertama Kali

Saat pertama kali dijalankan, PNL Agent akan meminta Anda memasukkan API Key dari **Way AI Gateway (Gutech AI)**:
1. Masukkan token Anda yang berawalan `gw_live_...` (Dapatkan di [way.gutech.dev/dashboard/keys](https://way.gutech.dev/dashboard/keys)).
2. Token akan langsung diverifikasi otomatis ke server Gutech AI:
   - **Jika Valid**: Muncul notifikasi sukses warna hijau dan Anda langsung masuk ke mode AI Agent.
   - **Jika Tidak Valid**: Muncul detail kesalahan dan Anda diberi opsi untuk mengulang.
3. Token tersimpan aman di direktori lokal pengguna: `~/.pnl-agent/config.json`.

---

## 🛠️ Perintah Terminal (CLI)

Anda dapat menjalankan perintah berikut langsung dari terminal Anda:

| Perintah | Deskripsi |
| :--- | :--- |
| `pnl agent` atau `pnl` | Memulai sesi interaktif AI Agent di folder saat ini |
| `pnl key` | Konfigurasi ulang atau mengganti API Key Gutech AI |
| `pnl model <nama_model>` | Mengubah model default (misal: `pnl model gutech/coder`) |
| `pnl models` | Menampilkan katalog 80+ model AI yang tersedia di Gutech beserta tarifnya |
| `pnl --help` | Menampilkan panduan lengkap penggunaan CLI |

---

## 💬 Perintah di Dalam Sesi Obrolan (Slash Commands)

Saat berada di dalam sesi `pnl ❯`, Anda bisa menggunakan perintah cepat:

- `cd <folder>` — Berpindah direktori kerja aktif (contoh: `cd ../proyek-lain` atau `cd E:\INAFEST`)
- `/help` — Menampilkan menu bantuan dan contoh instruksi
- `/model <nama_model>` — Mengganti model aktif saat itu juga (contoh: `/model gutech/coder`)
- `/models` — Menampilkan katalog model AI live dari Gutech Gateway
- `/dir` — Melihat daftar file di folder aktif
- `/key` — Memperbarui atau memverifikasi ulang API Key
- `/clear` — Membersihkan layar terminal dan mereset memori percakapan
- `/exit` atau `exit` — Keluar dari PNL Agent

---

## 🧰 Kemampuan Otonom (Tools AI)

PNL Agent dilengkapi serangkaian *function calling tools* standar industri:

1. **`read_file`**: Membaca file kode, konfigurasi, atau log proyek.
2. **`write_file`**: Membuat file baru atau menimpa kode secara lengkap dan rapi.
3. **`edit_file`**: Mengganti teks/blok kode tertentu secara presisi.
4. **`list_directory`**: Melihat struktur direktori dan ukuran file.
5. **`run_command`**: Mengeksekusi perintah terminal (misal: `npm run dev`, `python main.py`, `git status`, `pytest`).
6. **`search_files`**: Mencari kata kunci atau fungsi di seluruh file proyek.
7. **`change_directory`**: Berpindah direktori kerja atas permintaan user.

---

## 🤖 Pilihan Model Terbaik di Gutech AI

PNL Agent mendukung semua model yang tersedia di katalog Way Gutech AI:

- **`gutech/free`**: Gratis Rp 0, performa ultra-cepat (default).
- **`gutech/coder`**: Spesialis analisis kode, bug fixing, dan refactoring (Sangat Direkomendasikan).
- **`claude-sonnet-4` / `claude-sonnet-5`**: Flagship intelligence untuk software engineering tingkat lanjut.
- **`claude-haiku-4-5`**: Sangat cepat, cerdas, dan hemat token.
- **`claude-opus-5`**: Model penalaran mendalam paling akurat.
- **`gemini-3.5-flash`** & **`deepseek-v4.1-flash`**: Model penalaran cepat dan efisien.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi MIT.
Dikembangkan untuk komunitas developer dan peserta hackathon dengan integrasi [Way Gutech AI](https://way.gutech.dev/).
