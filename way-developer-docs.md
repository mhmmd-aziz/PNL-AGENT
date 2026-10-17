# Way developer documentation

You are assisting a developer integrating the Way AI Gateway.

- Example API address: https://api-way.gutech.dev. Replace it with the public API address provided for the user's account; SDK base URLs end in /v1.
- Auth: send the API key as `Authorization: Bearer gw_live_...`.
- The API is OpenAI-compatible at `/v1/chat/completions`.
- Use an available model name from the catalog.
- TokenSaver profiles and exclusive RAG collections are configured per API key and applied automatically.
- Use rag_enabled=false to skip retrieval; top_k is 1–10. Python custom fields belong in extra_body.
- Catalog prices are IDR per million tokens. Check Usage and Billing for recorded charges and payment credit.
- Manage account settings through the signed-in dashboard. Use only documented public endpoints in application code.
- Read SSE error frames and final usage, including empty choices. [DONE] alone does not prove success.
- Use only the models and endpoints documented below. Do not invent endpoints or unsupported request parameters.

## Daftar isi

### Memulai
- [Ringkasan](#doc-overview)
- [Panduan cepat](#doc-quickstart)
- [Akun & isi ulang](#doc-activation)
- [Konsep inti](#doc-core-concepts)

### Panduan dasbor
- [Playground](#doc-playground)
- [Kunci API](#doc-api-keys)
- [Profil TokenSaver](#doc-tokensaver)
- [RAG yang dikelola](#doc-rag-integration)

### Referensi API
- [Otentikasi](#doc-authentication)
- [Katalog model](#doc-models)
- [Selesainya obrolan](#doc-chat-completions)
- [Mengalir](#doc-streaming)
- [Penyematan](#doc-embeddings)
- [Kesalahan](#doc-errors)

### SDK & kompatibilitas
- [Kompatibilitas OpenAI](#doc-openai-compatibility)
- [JavaScript & Skrip Ketik](#doc-javascript)
- [Python & Rantai Lang](#doc-python)

### Memilih model
- [Memilih model](#doc-routing)
- [Penyedia](#doc-providers)

### Penggunaan & penagihan
- [Penetapan harga & penagihan](#doc-pricing)
- [Dasbor penggunaan](#doc-usage)
- [Minta log](#doc-request-logs)
- [Biaya dan token](#doc-costs-and-tokens)

### Keamanan & batasan
- [Batasan tarif](#doc-rate-limits)
- [Keamanan](#doc-security)

### Integrasi tingkat lanjut
- [Keluaran penalaran](#doc-deepseek-reasoning)
- [Panggilan alat](#doc-tool-call-repair)

### Membantu
- [Pemecahan masalah](#doc-troubleshooting)
- [Hubungi dukungan](#doc-contact-support)

---

<a id="doc-overview"></a>

## Ringkasan

Satu gerbang untuk akses model, perilaku per kunci, pengambilan terkelola, dan penagihan Rupiah.

Way menyediakan API yang kompatibel dengan OpenAI untuk menggunakan model dalam katalognya. Gunakan kunci API Way Anda untuk menghasilkan respons, menerapkan persona yang disimpan, dan menyertakan referensi dokumen dari koleksi terikat kunci.

### Pilih alur kerja Anda

| Sasaran | Di mana untuk memulai |
| --- | --- |
| Integrasikan aplikasi | Mulai cepat, lalu panduan JavaScript atau Python SDK. |
| Uji model secara interaktif | Dasbor → Taman Bermain. Telusuri model dan pilih kunci API. |
| Sesuaikan perilaku respons | Dasbor → Penghemat Token. Simpan profil untuk setiap kunci API. |
| Gunakan dokumen Anda | Dasbor → Koleksi RAG. Buat koleksi yang terikat pada kunci. |
| Rekonsiliasi pengeluaran | Dasbor → Penggunaan dan Penagihan. |

### Alamat gerbang

```text
Gateway origin: https://api-way.gutech.dev
OpenAI SDK base URL: https://api-way.gutech.dev/v1
Chat endpoint: https://api-way.gutech.dev/v1/chat/completions
```

Alamat .example di atas adalah pengganti. Ganti dengan alamat API publik yang disediakan untuk akun Anda. Gunakan alamat tersebut ditambah /v1 sebagai URL dasar OpenAI SDK; URL halaman dasbor bukanlah alamat API.

### Membuat permintaan

1. Pilih model yang tersedia dan gunakan API key aktif. Hanya model berbayar yang memerlukan saldo positif.
2. Kirim pesan percakapan Anda ke titik akhir obrolan publik.
3. Profil TokenSaver yang disimpan dan koleksi opsional dari kunci yang dipilih berlaku untuk permintaan tersebut.
4. Baca jawabannya, panggilan alat, atau streaming acara yang dikembalikan oleh API.
5. Tinjau penggunaan dan tagihan permintaan di dasbor.

---

<a id="doc-quickstart"></a>

## Panduan cepat

Buat kunci, pilih model yang tersedia, dan kirimkan permintaan obrolan pertama Anda.

### Sebelum Anda mulai

1. Masuk ke dasbor dan selesaikan orientasi jika diminta.
2. Buka Kunci API, buat kunci, dan simpan rahasia yang ditampilkan satu kali dengan aman.
3. Pilih gutech/free di Models atau Playground untuk mulai dengan biaya Rp 0 tanpa top-up awal.
4. Untuk model berbayar, isi saldo melalui Top Up (minimal Rp 5.000 via QRIS) atau tukarkan voucher yang memenuhi syarat.

> [!TIP] Panduan mulai gratis untuk hackathon
> Peserta hackathon dan pengguna baru dapat menggunakan gutech/free dengan saldo awal nol. Buat API key dan jalankan contoh di bawah; tidak perlu top-up awal. Request gratis tetap mengikuti batas request per menit pada key tersebut.

### Atur lingkungan server Anda

```bash
export WAY_BASE_URL="https://api-way.gutech.dev"
export WAY_API_KEY="gw_live_REPLACE_WITH_YOUR_API_KEY"
```

Ganti placeholder kunci dengan kunci Way Anda yang asli. Simpan di lingkungan server atau manajer rahasia Anda. WAY_BASE_URL adalah gerbang asal dalam contoh ini; Klien SDK menambahkan /v1.

### Kirim permintaan

The SDK examples require npm install openai or pip install openai. The cURL example does not require an SDK. Use an active alias like gutech/free or a direct ID from the current model catalog.

**cURL**
```bash
curl "$WAY_BASE_URL/v1/chat/completions" \
  -H "Authorization: Bearer $WAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gutech/free","messages":[{"role":"user","content":"Explain AI gateways in one sentence."}],"max_tokens":256}'
```

**JavaScript**
```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: (process.env.WAY_BASE_URL || "https://api-way.gutech.dev").replace(/\/+$/, "") + "/v1",
  apiKey: process.env.WAY_API_KEY,
});
const response = await client.chat.completions.create({
  model: "gutech/free",
  messages: [{ role: "user", content: "Explain AI gateways in one sentence." }],
  max_tokens: 256,
});
console.log(response.choices[0]?.message.content);
```

**Python**
```python
import os
from openai import OpenAI

client = OpenAI(
    base_url=(os.environ.get("WAY_BASE_URL") or "https://api-way.gutech.dev").rstrip("/") + "/v1",
    api_key=os.environ.get("WAY_API_KEY"),
)
response = client.chat.completions.create(
    model="gutech/free",
    messages=[{"role": "user", "content": "Explain AI gateways in one sentence."}],
    max_tokens=256,
)
print(response.choices[0].message.content)
```

### Periksa responsnya

Berikut ini adalah contoh tanggapannya. ID, model respons, teks, dan jumlah token bervariasi berdasarkan permintaan. Baca bidang model yang dikembalikan dengan respons daripada berasumsi bahwa bidang tersebut cocok dengan alias yang Anda minta.

```json
{
  "id": "chatcmpl-example",
  "object": "chat.completion",
  "model": "openai/gpt-oss-20b",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "An AI gateway provides a shared interface for multiple models."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 18,
    "total_tokens": 138
  }
}
```

### Langkah selanjutnya

- Gunakan Playground untuk membandingkan model, mengaktifkan RAG terikat, dan memeriksa proses terbaru.
- Simpan profil TokenSaver untuk mengatur persona kunci ini dan pengaturan optimasi.
- Buat koleksi RAG yang terikat kunci jika permintaan memerlukan konteks dokumen.
- Periksa Penggunaan dan Penagihan untuk mengetahui biaya akhir yang tercatat.

---

<a id="doc-activation"></a>

## Akun & isi ulang

Masuk, mulai dengan model gratis, lalu isi saldo saat membutuhkan model berbayar.

### Masuk dan selesaikan orientasi

Portal mendukung OTP email dan login Google. Lengkapi profil yang diminta saat onboarding. Akun aktif dapat membuat API key dan menggunakan model gratis di gateway maupun Playground tanpa mengisi saldo.

### Mulai gratis; top-up untuk model berbayar

Pembuatan API key dan model Free Tier seperti gutech/free tidak memerlukan pembayaran awal. Model berbayar memerlukan saldo positif. Isi saldo melalui QRIS minimal Rp 5.000 atau tukarkan voucher yang memenuhi syarat.

### Tambahkan saldo

1. Buka Dashboard → Top Up dan pilih nominal (minimal Rp 5.000 via QRIS).
2. Review the payment order, payment fee (4.7%), and expected net credit.
3. Scan the dynamic QRIS code with any Indonesian banking or e-wallet application (GoPay, OVO, Dana, BCA, etc.).
4. Tunggu hingga transaksi selesai. Saldo AI Anda akan ditambahkan untuk request berbayar.
5. Periksa buku besar transaksi dan saldo yang telah diselesaikan di Penagihan.

Review the order's fee and expected net credit before paying, then compare the confirmed transaction with your balance in Billing.

### Kredit rujukan

Jika memiliki kode referral yang memenuhi syarat, tukarkan melalui dashboard. Kredit yang berhasil diterapkan muncul pada saldo dan riwayat tagihan serta dapat digunakan untuk model berbayar tanpa pembayaran aktivasi terpisah.

---

<a id="doc-core-concepts"></a>

## Konsep inti

Memahami akun, kunci API, profil, koleksi, nama model, dan penggunaan.

### Blok bangunan

| Konsep | Perilaku |
| --- | --- |
| Account | Memiliki kunci, koleksi, penggunaan, dan saldo IDR bersama. |
| Kunci API | Mengautentikasi permintaan gateway dan memiliki batas RPM sendiri. |
| Profil TokenSaver | Konfigurasi persona dan pengoptimalan lengkap untuk satu kunci. |
| Koleksi RAG | Potongan dokumen, vektor, dan pengaturan pengambilan terikat secara eksklusif pada satu kunci. |
| alias model | Nama model yang nyaman ditawarkan dalam katalog. |
| Catatan penggunaan | Model yang diminta/aktual, identitas kunci, jumlah token, status, latensi, dan biaya. |
| Riwayat penagihan | Transaksi pembayaran dan saldo akun Anda. |

### Ruang lingkup konfigurasi

Konfigurasikan kunci langsung di dasbor. Kunci yang berbeda dapat memiliki persona dan koleksi eksklusif yang berbeda saat menggunakan saldo akun yang sama.

### API Gateway dan manajemen portal

Aplikasi server Anda memanggil titik akhir API publik yang terdokumentasi dengan kunci Way. Masuk ke dasbor untuk mengelola kunci, profil, dokumen, dan penagihan.

---

<a id="doc-playground"></a>

## Playground

Cari model, uji profil kunci dan basis pengetahuan, dan periksa setiap proses.

### Pilih model dan kunci

1. Buka Dasbor → Taman Bermain.
2. Klik input Model dan ketik nama model, ID, penyedia, kategori, atau kemampuan. Kueri seperti alat claude cocok dengan semua kata yang diberikan.
3. Gunakan tombol panah dan Enter untuk memilih hasil. Escape menutup daftar model. Hanya model berkemampuan tinggi yang ditawarkan.
4. Pilih kunci API yang aktif. Preferensi TokenSaver dan koleksi terikatnya muncul di konfigurasi.

### Kontrol pengambilan

Basis pengetahuan tersedia ketika kunci yang dipilih memiliki koleksi terikat. Matikan untuk melewati pengambilan untuk dijalankan. Potongan per kueri dimulai dengan Top-K koleksi dan menerima 1–10. Peralihan kunci API akan menghapus percakapan untuk menghindari membawa konteks dari kunci sebelumnya.

### Jalankan percakapan

Masukkan perintah dan gunakan perintah Kirim atau Ctrl/⌘ + Enter. Enter sendiri menambahkan baris baru. Tanggapan mengalir ke dalam percakapan; penalaran dan referensi dokumen yang diambil dapat diperluas secara terpisah. Berhenti menghentikan proses, dan Obrolan baru menghapus percakapan.

### Periksa dan gunakan kembali permintaan

Proses terakhir menunjukkan waktu token pertama, latensi, throughput, token, dan perkiraan biaya. Penyelesaian akhir dicatat dalam Penggunaan dan Penagihan. Perluas Gunakan permintaan ini di aplikasi Anda untuk menyalin contoh cURL, Python, atau TypeScript, lalu berikan kunci pilihan yang sama melalui lingkungan aplikasi Anda.

> [!NOTE]
> Permintaan Playground dan SDK berbagi batas RPM kunci yang dipilih, saldo akun, profil TokenSaver, dan pengikatan RAG eksklusif.

---

<a id="doc-api-keys"></a>

## Kunci API

Membuat, mengganti nama, membatasi, dan mencabut kunci gateway virtual.

### Buat kunci

Buka Dasbor → Kunci API → Buat kunci API baru. Beri nama kunci dan batas RPM. Rahasia gw_live_ selengkapnya ditampilkan satu kali; daftar berikutnya menunjukkan kunci bertopeng. Simpan rahasia dengan aman saat dibuat.

### Konfigurasikan perilaku kunci

- Ganti nama kunci atau ubah batas RPMnya dari Kunci API. RPM defaultnya adalah 60.
- Konfigurasikan pengaturan persona dan optimasinya di TokenSaver.
- Ikat paling banyak satu koleksi ke kunci di Koleksi RAG.
- Gunakan kunci terpisah untuk aplikasi atau lingkungan yang memerlukan konfigurasi independen.

### Memutar atau mencabut kunci

Buat kunci pengganti, konfigurasikan profil dan koleksi TokenSaver sesuai kebutuhan, perbarui rahasia server, lalu cabut kunci lama. Profil dan ikatan koleksi tidak ditransfer secara otomatis. Kunci yang dicabut tidak dapat mengautentikasi permintaan baru; permintaan yang sudah dalam penerbangan masih dapat menyelesaikan penggunaannya.

Koleksi terikat tidak dapat dipindahkan langsung ke kunci lain. Rencanakan pengumpulan pengganti dan penyerapan dokumen saat memutar kunci yang digunakan untuk RAG.

---

<a id="doc-tokensaver"></a>

## Profil TokenSaver

Konfigurasikan persona kunci, mode prompt, dan preferensi token satu kali untuk setiap permintaan.

### Simpan profil

> [!TIP] Tanpa perubahan kode SDK
> Buka /dashboard/tokensaver, pilih API key aplikasi Anda, aktifkan Ponytail atau Caveman, lalu simpan profil. Request SDK yang memakai key tersebut otomatis menerima optimasi tersimpan; tidak perlu mengubah kode aplikasi atau SDK.

1. Buka Dasbor → TokenSaver dan pilih kunci API yang aktif.
2. Aktifkan tombol persona untuk masuk ke perintah sistem. Batasnya adalah 16.384 UTF-8 byte; editor menunjukkan jumlah byte.
3. Pilih mode prompt aplikasi dan sesuaikan tombol dan intensitas pengoptimalan.
4. Gunakan Simpan profil untuk menerapkan perubahan pada permintaan baru. Buang mengembalikan nilai yang ditampilkan saat Anda mulai mengedit.
5. Draf dipertahankan saat berpindah tombol pada halaman yang sama. Gunakan Open Playground untuk menguji hasilnya.

### Mode cepat dan prioritas

| Mode | Perilaku |
| --- | --- |
| Sandwich | Memperkuat persona seputar instruksi aplikasi. |
| Prepend | Tempatkan persona sebelum instruksi aplikasi. |
| Override | Menggantikan sistem aplikasi/instruksi pengembang dengan persona. |

Mode Prompt mengontrol instruksi aplikasi Anda; itu tidak menghapus referensi dokumen atau mengubah kebijakan penggunaan layanan. Sebelum penyimpanan pertama, pengaturan default yang ditampilkan di TokenSaver berlaku. Menyimpan akan membuat profil independen untuk kunci tersebut.

### Kontrol optimasi

| Kontrol | Perilaku |
| --- | --- |
| Ponytail | Petunjuk pengkodean yang praktis dan ringkas; ringan, penuh, atau ultra. |
| RTK | Instruksi untuk menggunakan konteks yang relevan dan menghindari pengulangan; bukan mesin kompresi keluaran alat. |
| Caveman | Panduan respons langsung dengan lebih sedikit pengisi; ringan, penuh, atau ultra. |
| Kompresor konteks | Menormalkan baris kosong yang berlebihan dalam pesan teks. |

Preferensi ini mengarahkan perilaku model. Penghematan 40–60% bergantung pada model, prompt, dan beban kerja, bukan pengurangan yang dijamin. Bandingkan penggunaan token pada request yang mewakili kebutuhan Anda. Request chat normal otomatis menerima konfigurasi tersimpan pada key yang dipilih; tidak perlu flag request TokenSaver.

---

<a id="doc-rag-integration"></a>

## RAG yang dikelola

Buat koleksi terikat kunci, unggah dokumen, dan lampirkan konteks yang diambil ke obrolan.

### Buat koleksi

Buka Dasbor → Koleksi RAG → Buat koleksi. Masukkan nama, deskripsi opsional, kunci API tidak terikat, ukuran potongan, tumpang tindih, Top-K, dan model penyematan. Satu kunci dapat memiliki paling banyak satu koleksi, dan koleksi tersebut eksklusif untuk kunci tersebut, bahkan dalam akun yang sama.

| Pengaturan | Nilai yang diterima |
| --- | --- |
| Name | Diperlukan, hingga 150 UTF-8 byte. |
| Ukuran potongan | 1–10.000 karakter Unicode. |
| Overlap | 0 hingga kurang dari ukuran potongan, dalam karakter Unicode. |
| Atas-K | 1–10 potongan; digunakan kecuali permintaan menyediakan top_k. |
| Menanamkan model | text-embedding-3-small, text-embedding-3-large, or text-embedding-ada-002. |

### Unggah dan indeks dokumen

Pilih koleksi, unggah PDF, DOCX, TXT, atau MD, atau gunakan Tambahkan teks mentah. Dokumen disiapkan menggunakan pengaturan yang disimpan untuk koleksi itu. Tunggu hingga siap sebelum menguji pengambilan. Jika unggahan sedang berlangsung, tunggu hingga selesai sebelum memulai unggahan berikutnya.

Konteks dokumen yang disertakan dalam respons obrolan berkontribusi pada penggunaan yang cepat. Periksa biaya permintaan yang tercatat di Penggunaan dan Penagihan.

| Membatasi | Nilai |
| --- | --- |
| Ukuran dokumen | 10 MB per unggahan dan penyerapan teks yang diekstraksi. |
| Chunks | 1.000 per dokumen. |

> [!NOTE] Periksa kualitas pengambilan
> Uji pertanyaan representatif dengan alat Pencarian koleksi dan periksa kutipan yang dikembalikan. Hasil bervariasi menurut konten dokumen, pengaturan potongan, dan kueri; referensi bukan jaminan bahwa suatu jawaban benar.

### Gunakan koleksi secara otomatis

```bash
curl "https://api-way.gutech.dev/v1/chat/completions" \
  -H "Authorization: Bearer $WAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gutech/free","messages":[{"role":"user","content":"What is the refund policy?"}],"top_k":3}'
```

Gunakan kunci yang terikat pada koleksi ini. Tidak diperlukan pemilih koleksi. rag_enabled:false menonaktifkan pengambilan untuk satu permintaan. Seorang pemilih hanya dapat mengkonfirmasi koleksi terikat; memilih koleksi kunci lain ditolak. Respons non-streaming dan SSE mengekspos referensi yang diambil melalui rag_sources.

### Titik akhir gerbang RAG

| Titik akhir | Tujuan |
| --- | --- |
| DAPATKAN /v1/rag/collections | Mencantumkan slug koleksi terikat kunci panggilan, jika ada. |
| POST /v1/rag/simpan | Menyerap judul/teks JSON atau file multibagian ke dalam koleksi yang sudah terikat. |
| POST /v1/rag/ask | Menjawab pertanyaan melalui pengambilan, obrolan, dan penyelesaian penggunaan normal. |

**Simpan teks**
```bash
curl "https://api-way.gutech.dev/v1/rag/save" \
  -H "Authorization: Bearer $WAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Refund policy","text":"Refunds are allowed within thirty days."}'
```

**Bertanya**
```bash
curl "https://api-way.gutech.dev/v1/rag/ask" \
  -H "Authorization: Bearer $WAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the refund deadline?","model":"gutech/free"}'
```

Buat koleksi dan pengikatan kunci di dashboard terlebih dahulu. Penyerapan SDK tidak dapat menggantikan pengaturan potongan koleksi. Koleksi tidak terikat yang ada dapat dilampirkan ke kunci yang tersedia. Mengubah strategi penyematan koleksi yang diindeks memerlukan pengindeksan ulang, bukan mengubah label.

---

<a id="doc-authentication"></a>

## Otentikasi

Otentikasi permintaan SDK dengan kunci API virtual Way.

### Bearer authentication

```http
Authorization: Bearer gw_live_REPLACE_WITH_YOUR_API_KEY
```

Use the full secret returned when creating a key, not its masked display value or UUID. The gateway also accepts x-api-key when a Bearer key is not supplied. Use one authentication method consistently.

### Jenis kredensial

| Mandat | Menggunakan |
| --- | --- |
| Kunci Way gw_live_ | Permintaan gateway /v1 server Anda. |
| Masuk dasbor | Mengelola akun Anda dan menggunakan Playground di browser. |

### Kegagalan otentikasi dan keseimbangan

Key yang tidak ada, tidak dikenal, dicabut, atau berasal dari akun nonaktif menghasilkan 401. Request model berbayar dengan saldo nol atau negatif menghasilkan 402. Model gratis seperti gutech/free dan katalog terautentikasi /v1/models tidak memerlukan saldo positif. Pemeriksaan saldo mengikuti model aktual yang dipilih, termasuk target fallback.

Simpan kunci lengkap di lingkungan sisi server aplikasi Anda. Jangan mempublikasikannya dalam bundel browser, repositori sumber, atau pesan dukungan.

---

<a id="doc-models"></a>

## Katalog model

Temukan alias aktif dan ID model langsung alih-alih melakukan hardcoding pada registri ilustratif.

### Temukan model yang tersedia

```bash
curl "https://api-way.gutech.dev/v1/models" \
  -H "Authorization: Bearer $WAY_API_KEY"
```

| Katalog | Perilaku |
| --- | --- |
| DAPATKAN /v1/models | ID model bergaya OpenAI; memerlukan autentikasi gateway dan mengikuti rate limit key, tanpa persyaratan saldo. |
| DAPATKAN /api/models | Katalog publik dengan metadata penyedia dan harga Rp per satu juta token. |
| Halaman Model Publik | Telusuri katalog model penerapan tanpa mengonfigurasi kunci penyedia. |
| Model Dasbor | Mengaktifkan atau menonaktifkan model di katalog pengguna dan Playground Anda. |

### Alias ​​dan ID langsung

Choose a convenient catalog alias such as gutech/free or an available direct ID such as gemini-3.5-flash-lite. The default smart alias gutech/free automatically routes to ultra-fast zero-cost models engineered for sub-second response times. Available models, capabilities, and prices can change; inspect the current catalog and the model reported for your response.

### High-speed free tier

Way menyediakan model Free Tier berbiaya Rp 0 yang dirancang untuk menghasilkan token dalam waktu kurang dari satu detik. Model yang tersedia meliputi openai/gpt-oss-20b, openai/gpt-oss-120b, qwen/qwen3.8-27b, dan allam-2-7b. Model ini tersedia tanpa top-up awal dan tidak memotong saldo.

### Temukan model di Taman Bermain

Search by model name, ID, category, or capability. The picker offers only enabled models and groups results by category. Choose a model supporting the features your request needs.

---

<a id="doc-chat-completions"></a>

## Selesainya obrolan

Kirim pesan yang kompatibel dengan OpenAI, streaming secara opsional, dan gunakan profil dan dokumen kunci.

### Titik akhir

```http
POST /v1/chat/completions
```

### Meminta

```json
{
  "model": "gutech/free",
  "messages": [{
    "role": "user",
    "content": "Summarize the refund policy."
  }],
  "temperature": 0.7,
  "max_tokens": 256,
  "stream": false
}
```

### Parameter

| Parameter | Keterangan |
| --- | --- |
| model | Alias ​​aktif atau ID model langsung; secara eksplisit menyediakan satu. |
| messages | Riwayat percakapan menggunakan peran sistem, pengembang, pengguna, asisten, atau alat sebagaimana didukung oleh adaptor. |
| suhu / top_p | Kontrol pengambilan sampel; dukungan dan kombinasi yang diterima bergantung pada model. |
| max_tokens / max_completion_tokens | Anggaran token keluaran, bergantung pada kemampuan model yang dipilih. |
| stream | berlaku untuk SSE; jika tidak, JSON. |
| alat / alat_pilihan | Alat fungsi dan kontrol pemilihan untuk model yang mumpuni. |
| response_format | Konfigurasi keluaran JSON jika didukung; lihat kompatibilitas OpenAI. |
| rag_enabled | Tidak diisi atau true untuk mengambil konteks dari koleksi terikat secara otomatis; false melewati RAG. |
| top_k | 1–10; menimpa Top-K koleksi terikat untuk permintaan ini. |
| rag_collection_slug / rag_collection_id | Konfirmasi opsional dari koleksi yang sudah terikat, bukan pemilih silang. |

### Bidang respons

Baca choice[0].message.content untuk jawabannya, tool_calls untuk eksekusi alat yang diminta, dan usage.prompt_tokens/completion_tokens/total_tokens untuk penggunaan. Respons RAG juga mencakup rag_sources dan X-RAG-Sources-Count ketika referensi diambil. Opsi yang tidak didukung menghasilkan kesalahan; berkonsultasi dengan kemampuan model yang dipilih.

### Jalur warisan

Jalur kompatibilitas POST /v1/completions mengharapkan permintaan berbasis pesan, bukan payload warisan yang hanya meminta. Lebih suka /v1/chat/completions untuk integrasi baru.

---

<a id="doc-streaming"></a>

## Mengalir

Tangani teks, alasan, argumen alat, referensi, penggunaan akhir, dan kesalahan aliran akhir.

### Minta aliran

```bash
curl -N "https://api-way.gutech.dev/v1/chat/completions" \
  -H "Authorization: Bearer $WAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gutech/free","messages":[{"role":"user","content":"Explain the policy briefly."}],"stream":true}'
```

### Format acara

Frame adalah jalur data SSE yang dipisahkan oleh garis kosong. Berikut ini adalah contoh aliran yang disingkat; referensi opsional, alasan, dan alat bergantung pada permintaan dan penyedia.

```text
data: {"choices":[{"delta":{"role":"assistant","content":""}}],"rag_sources":[{"chunk_id":"example-uuid","document_name":"SOP.txt","content":"Reference excerpt","score":0.9}]}

data: {"choices":[{"delta":{"content":"The policy allows refunds."}}]}

data: {"choices":[],"usage":{"prompt_tokens":120,"completion_tokens":18,"total_tokens":138}}

data: [DONE]
```

### Konsumsi setiap frame

- Tangani potongan kesalahan JSON bahkan setelah HTTP 200 dan setelah menerima teks.
- Periksa pilihan sebelum membaca delta: penggunaan akhir dapat memiliki susunan pilihan kosong.
- rag_sources adalah properti JSON pada potongan data, bukan peristiwa SSE bernama.
- Baca Reasoning_content secara terpisah dari konten, dan susun argumen alat berdasarkan indeks/ID alat.
- Kesalahan mungkin terjadi sebelum [SELESAI]. Periksa semua frame; penanda terakhir saja tidak membuktikan bahwa permintaan tersebut berhasil.

### Contoh kesalahan yang terlambat

```text
data: {"error":{"message":"The request could not be completed","code":"billing_error"}}

data: [DONE]
```

Jika streaming berakhir sebelum [SELESAI], laporkan respons yang tidak lengkap. Permintaan yang dibatalkan atau terputus masih dapat menggunakan token; konsultasikan Penggunaan dan Penagihan untuk biaya yang tercatat.

---

<a id="doc-embeddings"></a>

## Penyematan

Periksa ketersediaan penyematan dan pilih alur kerja dokumen yang tepat untuk aplikasi Anda.

### Permintaan penyematan langsung

```http
POST /v1/embeddings
```

Ketersediaan penyematan langsung bergantung pada model dan penawaran layanan yang dipilih. Nama model yang ditawarkan untuk konfigurasi koleksi tidak menjamin ketersediaan permintaan API langsung. Konfirmasikan model yang dimaksud dengan dukungan sebelum membangun integrasi di sekitar titik akhir ini.

### Penyematan koleksi terkelola

Untuk obrolan yang didukung dokumen, gunakan Koleksi RAG untuk mengunggah dokumen Anda dan menguji pengambilan. Permintaan obrolan Anda kemudian dapat menggunakan koleksi yang terikat pada kunci API yang dipilih, tanpa membuat permintaan penyematan terpisah dari aplikasi Anda.

Evaluasi hasil dengan pertanyaan representatif sebelum mengandalkan pengambilan dokumen. Gunakan referensi yang dikembalikan untuk memeriksa apakah konteks yang diberikan mendukung jawaban.

---

<a id="doc-errors"></a>

## Kesalahan

Identifikasi kegagalan gateway, kesalahan kuota, opsi yang tidak didukung, dan kesalahan streaming.

### Bentuk kesalahan gerbang

Kesalahan obrolan menggunakan objek kesalahan yang kompatibel dengan OpenAI. Berikut contohnya; periksa status HTTP dan kode kesalahan. Jika tidak ada referensi permintaan yang diberikan, sertakan waktu permintaan dan kode kesalahan saat menghubungi dukungan.

```json
{"error":{"message":"Model is not available in the active catalog","type":"invalid_request_error","code":"model_not_found"}}
```

### Kode status

| Status | Penyebab khas | Langkah selanjutnya |
| --- | --- | --- |
| 400 | JSON tidak valid, pilihan koleksi, atau parameter tidak didukung. | Periksa format permintaan dan kemampuan model. |
| 401 | Kunci akun hilang, tidak valid, dicabut, atau tidak aktif. | Gunakan rahasia kunci aktif penuh. |
| 402 | Model berbayar dipilih saat saldo nol atau negatif. | Pilih gutech/free, selesaikan top-up, atau gunakan kredit yang memenuhi syarat. |
| 404 | Model atau sumber daya yang diminta tidak tersedia. | Periksa katalog model dan titik akhir yang didokumentasikan. |
| 409 | Kunci/koleksi sudah terikat atau penyerapan sedang berlangsung. | Gunakan pengikatan yang ada atau tunggu penyerapan aktif. |
| 429 | Batas permintaan telah tercapai. | Kurangi konkurensi dan coba lagi dengan backoff terbatas. |
| 500 | Permintaan tersebut tidak dapat diselesaikan. | Hubungi dukungan jika masalah terus berlanjut. |
| 502 | Layanan tidak dapat menyelesaikan permintaan. | Coba lagi dengan backoff terbatas atau hubungi dukungan. |
| 503 | Layanan ini untuk sementara tidak tersedia. | Coba lagi nanti. |

### Kesalahan portal dan streaming

Respons manajemen portal menggunakan kesuksesan/data atau kesuksesan:false/kesalahan, bukan bentuk kesalahan obrolan. Streaming dapat mengeluarkan objek kesalahan setelah HTTP 200; lihat Streaming. Catat stempel waktu, model yang diminta, identitas kunci bertopeng, status HTTP, dan kode kesalahan saat melakukan debug.

---

<a id="doc-openai-compatibility"></a>

## Kompatibilitas OpenAI

Gunakan OpenAI SDK dengan fitur permintaan yang didukung oleh model pilihan Anda.

### Konfigurasi klien

Tetapkan URL dasar SDK ke alamat API publik Anda ditambah /v1 dan berikan kunci Way. Gunakan chat.completions.create dengan model yang tersedia. Periksa apakah model yang dipilih mendukung alat apa pun, masukan gambar, keluaran terstruktur, atau opsi pengambilan sampel yang Anda berikan.

### Minta fitur dan batasan

| Fitur | Perilaku saat ini |
| --- | --- |
| Alat fungsi | Gunakan definisi fungsi dan kembalikan hasil alat dengan ID panggilan yang cocok. |
| Images | Gunakan data PNG/JPEG/WebP/GIF atau URI gambar yang didukung dengan model berkemampuan vision. |
| Skema JSON | Gunakan respon_format.type=json_schema dengan model yang mendukung keluaran terstruktur. |
| objek JSON | Dukungan bervariasi berdasarkan model. Gunakan Skema JSON di mana json_object tidak didukung. |
| parallel_tool_calls | Tidak semua model mendukung penonaktifan panggilan alat paralel; kontrol yang tidak didukung menghasilkan kesalahan. |
| Detil gambar | Gunakan otomatis atau hilangkan detail kecuali model yang dipilih mendukung rendah/tinggi. |
| n | Gunakan n=1 untuk respons pilihan tunggal. |
| Tanda tangan alat | Pertahankan nilai thought_signature yang dikembalikan tidak berubah saat menyertakan riwayat panggilan alat. |

### Bidang gateway khusus

Gunakan Python extra_body untuk rag_enabled, top_k, dan konfirmasi koleksi terikat opsional. Dalam JavaScript, tambahkan bidang ini melalui penyebaran objek. Gunakan hanya titik akhir yang didokumentasikan dalam panduan ini; Kompatibilitas SDK tidak berarti semua fitur OpenAI API tersedia.

### Kemampuan model

Gunakan Model dan Playground untuk memilih model yang sesuai dan menguji format permintaan yang dibutuhkan aplikasi Anda. Jika opsi menampilkan kesalahan parameter yang tidak didukung, sesuaikan opsi tersebut sesuai dengan kemampuan model yang dipilih.

---

<a id="doc-javascript"></a>

## JavaScript & Skrip Ketik

Gunakan OpenAI Node SDK resmi dari server tepercaya.

### Instal dan konfigurasikan

```bash
npm install openai
```

Setel WAY_BASE_URL ke asal gateway dan WAY_API_KEY ke rahasia kunci lengkap. Jalankan kode ini di server Anda, bukan di paket browser.

### Streaming tanggapan obrolan

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: (process.env.WAY_BASE_URL || "https://api-way.gutech.dev").replace(/\/+$/, "") + "/v1",
  apiKey: process.env.WAY_API_KEY,
});
const stream = await client.chat.completions.create({
  model: "gutech/free",
  messages: [{ role: "user", content: "What is the refund policy?" }],
  stream: true,
  ...{ top_k: 3 },
});
for await (const chunk of stream) {
  const frame = chunk as typeof chunk & {
    rag_sources?: unknown[];
    error?: { message: string; code?: string };
  };
  if (frame.error) throw new Error(frame.error.message);
  if (frame.rag_sources) console.log("References:", frame.rag_sources);
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
  if (chunk.usage) console.log("Usage:", chunk.usage);
}
```

### Nonaktifkan pengambilan permintaan

```ts
const response = await client.chat.completions.create({
  model: "gutech/free",
  messages: [{ role: "user", content: "Explain what an AI gateway does." }],
  ...{ rag_enabled: false },
});
console.log(response.choices[0]?.message.content);
```

Simpan riwayat percakapan lengkap untuk putaran tindak lanjut, termasuk panggilan alat dan hasil alat jika digunakan. Profil TokenSaver yang disimpan pada kunci diterapkan secara otomatis ke setiap permintaan.

---

<a id="doc-python"></a>

## Python & Rantai Lang

Gunakan OpenAI Python SDK atau ChatOpenAI dengan bidang gateway khusus di extra_body.

### Instal dan konfigurasikan

```bash
pip install openai
# Optional LangChain integration:
pip install langchain-openai
```

### Buat penyelesaian

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url=(os.environ.get("WAY_BASE_URL") or "https://api-way.gutech.dev").rstrip("/") + "/v1",
    api_key=os.environ.get("WAY_API_KEY"),
)
response = client.chat.completions.create(
    model="gutech/free",
    messages=[{"role": "user", "content": "What is the refund policy?"}],
    extra_body={"top_k": 3},
)
print(response.choices[0].message.content)
print(response.usage)
```

### Streaming teks dan referensi

```python
stream = client.chat.completions.create(
    model="gutech/free",
    messages=[{"role": "user", "content": "Summarize the policy."}],
    stream=True,
)
for chunk in stream:
    error = getattr(chunk, "error", None)
    if error:
        raise RuntimeError(str(error))
    references = getattr(chunk, "rag_sources", None)
    if references:
        print("References:", references)
    if chunk.choices:
        print(chunk.choices[0].delta.content or "", end="", flush=True)
    if chunk.usage:
        print("Usage:", chunk.usage)
```

### LangChain

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(
    base_url=(os.environ.get("WAY_BASE_URL") or "https://api-way.gutech.dev").rstrip("/") + "/v1",
    api_key=os.environ.get("WAY_API_KEY"),
    model="gutech/free",
    extra_body={"top_k": 3},
)
print(llm.invoke([HumanMessage(content="What is the refund policy?")]).content)
```

Use a langchain-openai version exposing extra_body. Do not put custom gateway fields in model_kwargs, where they may become unsupported SDK keyword arguments. Use extra_body={"rag_enabled": False} when retrieval should be skipped.

---

<a id="doc-routing"></a>

## Memilih model

Pilih nama model yang tersedia dan periksa model yang dilaporkan untuk respons Anda.

### Pemilihan model langsung

Gunakan ID model langsung yang ditawarkan dalam katalog saat aplikasi Anda memerlukan model tertentu. Konfirmasikan bahwa itu mendukung alat, gambar, format keluaran, dan anggaran token dalam permintaan Anda.

### Seleksi alias

An alias such as gutech/free is a convenient catalog name that routes to zero-cost, high-speed models. Check the model field returned with each response and use the current catalog rather than assuming an alias always identifies one fixed model.

### Periksa rute yang digunakan

Penggunaan menunjukkan nama yang diminta dan model respons. Bandingkan penggunaan token dan biaya tercatat saat mengevaluasi pilihan katalog mana yang sesuai dengan aplikasi Anda.

---

<a id="doc-providers"></a>

## Penyedia

Gunakan metadata penyedia untuk membandingkan model yang ditawarkan dalam katalog.

### Akses penyedia

Model menampilkan metadata penyedia dan kemampuan model sehingga Anda dapat membandingkan opsi katalog. Aplikasi Anda menggunakan kunci API Way dan format permintaan terdokumentasi untuk model yang Anda pilih.

### Kemampuan model

Bandingkan dukungan untuk teks, penalaran, alat, gambar, dan keluaran terstruktur. Cari nama atau kemampuan penyedia di Playground, lalu uji permintaan perwakilan sebelum memilih model untuk aplikasi Anda.

### Free-tier models

Way menyediakan model Free Tier berbiaya nol dengan generasi kurang dari satu detik, termasuk openai/gpt-oss-20b, openai/gpt-oss-120b, qwen/qwen3.8-27b, dan allam-2-7b. Model ini berbiaya Rp 0 tanpa top-up awal dan tidak memotong saldo. Alias gutech/free juga tersedia untuk routing otomatis berbiaya nol.

---

<a id="doc-pricing"></a>

## Penetapan harga & penagihan

Baca tarif katalog saat ini, kredit pembayaran, dan biaya IDR yang tercatat.

### Catalog prices and unit scale

To balance human readability with machine precision, Way presents token rates in two formats: the public catalog (/models) displays prices per 1.000 tokens (e.g. Rp 2,7 / 1k tokens), while the dashboard usage history, raw backend API, and internal settlement record prices per 1.000.000 tokens (e.g. Rp 2.700 / 1M tokens). Both reflect the exact same underlying cost.

### Penggunaan Free Tier dan model berbayar

Buat API key dan gunakan model Free Tier seperti gutech/free dan openai/gpt-oss-20b tanpa top-up awal. Request gratis berbiaya Rp 0 dan tidak memotong saldo. Model berbayar memerlukan saldo positif dan memotong saldo sesuai token prompt serta completion aktual. Top-up QRIS mulai Rp 5.000.

### Biaya isi ulang dan kredit bersih

A total fee of 4.7% is deducted from your top-up payment, rounded to two decimal places. For example, a Rp 5.000 initial payment has a Rp 235 fee and adds Rp 4.765 to your balance. A Rp 50.000 payment has a Rp 2.350 fee and adds Rp 47.650 to your AI balance.

Tinjau jumlah, biaya pembayaran, dan kredit bersih yang diharapkan yang ditampilkan untuk pesanan Anda sebelum membayar. Periksa entri Penagihan yang dikonfirmasi untuk jumlah yang dikreditkan ke akun Anda.

### Biaya AI terakhir

```text
Charge = prompt tokens × actual-model input rate
       + completion tokens × actual-model output rate

Use matching units: dashboard ledger and API rates are per 1,000,000 tokens.
```

The cost of a request depends on its reported token usage and applicable model rates. Free tier models have a 0 rate, resulting in zero usage charge. Paid requests deduct proportionally from your Rupiah balance.

### Saldo tersedia

Jaga saldo yang cukup untuk permintaan baru. Permintaan yang terputus atau dibatalkan mungkin masih menggunakan token. Biaya Playground merupakan perkiraan; periksa Penggunaan dan Penagihan untuk jumlah akhir yang tercatat.

---

<a id="doc-usage"></a>

## Dasbor penggunaan

Ikuti pengeluaran akun, volume permintaan, jumlah token, dan penggunaan model.

### Metrik akun

Ikhtisar dan Penggunaan menunjukkan permintaan, token, biaya, latensi, dan saldo untuk akun Anda. Gunakan filter kunci/model yang tersedia dan Refresh untuk memeriksa aktivitas terkini.

### Waktu dan identitas kunci

Grup penggunaan harian menggunakan UTC. Pemeriksa permintaan menampilkan WIB. Permintaan menjelang tengah malam mungkin berasal dari hari UTC yang berbeda dengan tanggal tampilan WIB-nya. Identitas kunci UUID membedakan kunci secara independen dari awalan yang ditampilkan.

### Penyelesaian dan rekonsiliasi

Setelah dijalankan, bandingkan entri Penggunaannya dengan transaksi saldo Anda di Penagihan. Permintaan yang terputus atau gagal masih dapat menggunakan token; memeriksa statusnya dan mencatat penggunaannya.

---

<a id="doc-request-logs"></a>

## Minta log

Periksa model yang diminta, rute sebenarnya, kunci, penggunaan, status, dan latensi untuk suatu permintaan.

### Bidang yang direkam

| Minta detailnya | Arti |
| --- | --- |
| Kunci API | Kunci yang digunakan untuk permintaan tersebut. |
| Model permintaan dan respons | Nama model yang diminta dan model yang dilaporkan untuk responsnya. |
| Token cepat dan selesai | Penggunaan input dan output dicatat. |
| Cost | Biaya permintaan yang tercatat. |
| Latency | Waktu respons yang diukur. |
| Status dan tanggal | Hasil permintaan dan stempel waktu yang ditampilkan. |

### Gunakan log untuk melakukan debug

Periksa model sebenarnya ketika alias berperilaku berbeda, periksa UUID kunci saat membandingkan profil, dan periksa status dan token setelah aliran terputus. Bagikan ID catatan jika tersedia, stempel waktu/zona waktu, model yang diminta, dan kode kesalahan dengan dukungan. Isi kesalahan obrolan tidak menjamin properti request_id.

---

<a id="doc-costs-and-tokens"></a>

## Biaya dan token

Pisahkan penggunaan yang dilaporkan, perkiraan Playground, token penalaran, dan penyelesaian akhir.

### Bidang token

| Bidang | Arti |
| --- | --- |
| usage.prompt_tokens | Penggunaan masukan dilaporkan/dinormalisasi untuk permintaan. |
| usage.completion_tokens | Penggunaan keluaran yang dilaporkan, yang dapat mencakup token penalaran. |
| usage.total_tokens | Token cepat plus penyelesaian. |
| Perkiraan token Playground | Perkiraan UI saat penggunaan penyedia akhir tidak tersedia. |

### Penggunaan alasan

Penalaran dapat menghabiskan anggaran keluaran sebelum teks yang terlihat dihasilkan. Teks jawaban yang kosong tidak berarti tidak ada penggunaan. Periksa jumlah token yang dilaporkan dan gunakan anggaran keluaran yang sesuai untuk model yang dipilih.

### presisi IDR

Biaya permintaan yang kecil dapat mencapai pecahan Rupiah. Menggunakan jumlah Penagihan/Penggunaan akhir untuk rekonsiliasi; tampilan bulat atau perkiraan Playground mungkin berbeda dari jumlah yang tercatat.

---

<a id="doc-rate-limits"></a>

## Batasan tarif

Gunakan batas RPM kunci yang dikonfigurasikan dan tangani pembatasan tanpa percobaan ulang yang berlebihan.

### Batas per kunci

Setiap kunci API memiliki batas RPM, yang defaultnya adalah 60. Permintaan SDK dan Playground yang dibuat dengan kunci yang sama memiliki batas yang sama. Konsultasikan pengaturan kunci dan kurangi frekuensi permintaan ketika Anda menerima 429.

### Tangani pelambatan

- Kurangi permintaan paralel dan hindari mencoba ulang semua pekerja yang gagal sekaligus.
- Untuk 429, gunakan backoff eksponensial terbatas dengan jitter dan jumlah percobaan maksimum.
- Jangan coba lagi 400/401/402 tanpa perubahan; perbaiki permintaan, kunci, atau saldo terlebih dahulu.
- Header Retry-After yang hilang tidak berarti pembatasan tidak ada; tajuk itu tidak dijamin oleh pembatas kunci saat ini.
- Untuk 503, coba lagi nanti dengan penundaan terbatas daripada mengirimkan permintaan berulang kali.

---

<a id="doc-security"></a>

## Keamanan

Pertahankan kredensial aplikasi di sisi server dan pahami batasan kepemilikan.

### Kunci aplikasi sisi server

Simpan kunci Way lengkap di lingkungan server atau manajer rahasia aplikasi Anda. Gunakan server aplikasi Anda sendiri untuk memanggil API. Simpan rahasia yang baru dibuat dengan aman karena hanya ditampilkan sekali.

### Kepemilikan dan isolasi

Kelola kunci dan koleksi Anda sendiri melalui dasbor masuk. Koleksi adalah milik kunci yang dipilihnya; gunakan kunci itu saat mengirim permintaan yang memerlukan dokumennya.

### Putar dan selidiki

Cabut kunci yang bocor, buat dan konfigurasikan penggantinya, dan periksa Penggunaan/Penagihan untuk permintaan yang tidak terduga. Saat mengirimkan permintaan dukungan, sertakan kunci bertopeng atau UUID kunci, bukan rahasia lengkap. Halaman pelaporan kerentanan tersedia di /security/vulnerability.

---

<a id="doc-deepseek-reasoning"></a>

## Keluaran penalaran

Tampilkan alasan opsional secara terpisah dari konten akhir dan pertimbangkan penggunaan alasan.

### Bidang penalaran

Beberapa model penalaran memaparkan penalaran_konten secara terpisah dari jawaban akhir. Ketersediaan bervariasi menurut model/penyedia. Baca message.content untuk jawabannya dan pisahkan alasan opsional; nama model tidak menjamin teks penalaran akan terekspos.

```text
data: {"choices":[{"delta":{"reasoning_content":"Considering the policy..."}}]}

data: {"choices":[{"delta":{"content":"The refund deadline is thirty days."}}]}

data: [DONE]
```

### Rendering dan anggaran token

Playground menampilkan alasan dalam panel yang dapat diperluas. Dalam aplikasi Anda, pisahkan penalaran dari teks asisten akhir. Berikan anggaran keluaran yang memadai karena penalaran dapat menghabiskan token sebelum teks yang terlihat dihasilkan.

---

<a id="doc-tool-call-repair"></a>

## Panggilan alat

Menyediakan alat fungsi dan mengembalikan hasilnya menggunakan ID panggilan yang disimpan.

### Aliran alat fungsi

1. Kirim array alat dengan nama fungsi dan skema parameter ke alat pendukung model.
2. Baca asisten tool_calls dan jalankan fungsi yang diminta di aplikasi Anda.
3. Tambahkan pesan panggilan alat asisten dan hasil peran: alat yang merujuk pada tool_call_id yang dikembalikan.
4. Kirim riwayat yang diperbarui untuk mendapatkan jawaban model atau panggilan alat berikutnya.

```json
{"model":"gutech/free","messages":[{"role":"user","content":"Look up refund order 123."}],"tools":[{"type":"function","function":{"name":"lookup_refund","description":"Look up a refund request","parameters":{"type":"object","properties":{"order_id":{"type":"string"}},"required":["order_id"]}}}],"tool_choice":"auto"}
```

### Kembalikan hasil dengan ID yang cocok

Pertahankan setiap ID panggilan alat yang dikembalikan dan berikan nilai yang sama seperti tool_call_id pada pesan hasilnya. Aplikasi Anda menjalankan alat yang diminta dan mengirimkan hasilnya kembali; pencocokan yang benar membuat riwayat percakapan tidak ambigu.

### Streaming argumen dan tanda tangan

Kumpulkan fragmen argumen yang dialirkan berdasarkan indeks/ID alat sebelum mengurai JSON. Pertahankan nilai thought_signature yang dikembalikan tidak berubah saat membawa riwayat panggilan alat ke permintaan berikutnya. Gunakan model yang mendukung kontrol alat yang Anda perlukan.

---

<a id="doc-troubleshooting"></a>

## Pemecahan masalah

Selesaikan masalah umum penyiapan, permintaan, RAG, streaming, dan penagihan.

### Masalah pengaturan

| Gejala | Memeriksa |
| --- | --- |
| 401 | Gunakan kunci gw_live_ aktif penuh, bukan UUID atau nilai yang disamarkan. |
| 402 | Gunakan gutech/free tanpa saldo atau isi saldo sebelum meminta model berbayar. |
| Tidak ada model di Taman Bermain | Aktifkan model di Dasbor → Model dan coba lagi pemuatan katalog. |
| Model 404 | Gunakan alias aktif/ID langsung dari katalog penerapan. |
| 502 | Coba lagi dengan penundaan terbatas; hubungi dukungan jika masalah terus berlanjut. |

### masalah RAG

- Gunakan kunci API yang terikat pada koleksi yang dimaksud dan tunggu hingga status dokumen siap.
- Pastikan rag_enabled tidak salah dan tombol Basis Pengetahuan Playground aktif.
- Pemilih koleksi tidak dapat memilih data kunci lain; hapus atau konfirmasi koleksi terikat.
- Untuk konflik penyerapan 409, tunggu hingga unggahan saat ini selesai.
- Jika referensi tidak memiliki keterkaitan yang baik, coba kueri yang lebih representatif dan tinjau pengaturan teks dan potongan yang diunggah.
- Konfirmasikan ketersediaan penyematan langsung sebelum membangun integrasi di sekitar /v1/embeddings.

### Masalah permintaan dan penagihan

Untuk respons model penalaran yang kosong, periksa alasan penyelesaian dan tingkatkan anggaran keluaran. Masukkan bidang gateway Python di extra_body dan gunakan parameter yang didukung oleh model. Untuk aliran, tangani pilihan kosong, bingkai kesalahan, dan penghentian tidak lengkap. Verifikasi biaya dalam Penggunaan/Penagihan alih-alih mengandalkan perkiraan Playground.

---

<a id="doc-contact-support"></a>

## Hubungi dukungan

Siapkan detail yang diperlukan untuk menyelidiki masalah integrasi atau penagihan.

### Sertakan detail yang berguna

- Email akun Anda dan lingkungan/asal gateway yang terpengaruh.
- Stempel waktu dan zona waktu, UUID kunci atau awalan bertopeng, dan model yang diminta.
- Status HTTP, kode/pesan kesalahan, dan apakah permintaannya streaming atau menggunakan RAG.
- Contoh permintaan yang dibersihkan dan ID catatan penggunaan yang disimpan jika tersedia.
- Untuk pembayaran: ID pesanan, status transaksi, dan saldo yang diharapkan versus yang dikreditkan.

### Saluran dukungan

Email [support@gutech.dev](mailto:support@gutech.dev) untuk dukungan integrasi dan penagihan. Gunakan /contact/sales untuk pertanyaan penjualan dan /security/vulnerability untuk laporan kerentanan; bagikan contoh yang sudah dibersihkan tanpa memperlihatkan kunci API lengkap atau informasi masuk.

