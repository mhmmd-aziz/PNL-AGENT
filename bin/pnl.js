#!/usr/bin/env node
// bin/pnl.js - CLI entrypoint for PNL Agent

import { startAgent } from '../src/agent.js';
import { ensureApiKey, loadConfig, saveConfig } from '../src/config.js';
import { printBanner, drawBox, c, symbols } from '../src/ui.js';

const args = process.argv.slice(2);
const command = (args[0] || '').toLowerCase();

async function main() {
  switch (command) {
    case 'agent':
    case 'start':
    case 'run':
    case '': {
      // Running "pnl agent" or simply "pnl" starts the AI Agent!
      await startAgent();
      break;
    }

    case 'key':
    case 'auth':
    case 'setup': {
      printBanner();
      await ensureApiKey(true);
      break;
    }

    case 'model': {
      const newModel = args[1];
      const cfg = loadConfig() || { model: 'gutech/free' };
      if (newModel) {
        saveConfig({ model: newModel });
        console.log(`\n  ${c.brightGreen(symbols.check)} Model default berhasil diubah ke: ${c.bold(c.brightCyan(newModel))}\n`);
      } else {
        console.log(`\n  ${c.gray('Model aktif saat ini:')} ${c.bold(c.brightCyan(cfg.model || 'gutech/free'))}`);
        console.log(`  Gunakan: ${c.cyan('pnl model <nama_model>')} untuk mengganti.\n`);
      }
      break;
    }

    case 'models': {
      printBanner();
      try {
        const res = await fetch('https://api-way.gutech.dev/api/models');
        const json = await res.json();
        const modelList = Array.isArray(json) ? json : (json.data || json.models || []);
        console.log(`  ${c.bold('MODEL ID'.padEnd(28))} ${c.bold('HARGA'.padEnd(20))} ${c.bold('KETERANGAN')}`);
        console.log(`  ${'─'.repeat(78)}`);
        for (const m of modelList.slice(0, 30)) {
          const isFree = m.pricing?.input === 0 && m.pricing?.output === 0;
          const priceTag = isFree ? c.brightGreen('GRATIS (Rp 0)') : c.yellow(`Rp ${m.pricing?.input?.toLocaleString('id-ID') || 0}/1M`);
          const desc = (m.description || m.name || '').substring(0, 30);
          console.log(`  ${c.cyan(m.id.padEnd(28))} ${priceTag.padEnd(28)} ${c.gray(desc)}`);
        }
        console.log(`\n  ${c.dim(`Total ${modelList.length} model tersedia di Way Gutech AI.`)}`);
        console.log(`  Gunakan: ${c.cyan('pnl model <id_model>')} untuk memilih model.\n`);
      } catch (err) {
        console.error(`Gagal mengambil daftar model: ${err.message}`);
      }
      break;
    }

    case '--help':
    case '-h':
    case 'help': {
      printBanner();
      drawBox('PANDUAN PENGGUNAAN PNL AGENT', [
        `${c.bold('Penggunaan:')}`,
        `  ${c.brightCyan('pnl agent')}           - Menjalankan AI Agent interaktif di direktori saat ini`,
        `  ${c.brightCyan('pnl')}                 - Shortcut untuk langsung menjalankan AI Agent`,
        `  ${c.brightCyan('pnl key')}             - Konfigurasi & verifikasi API Key Way Gutech AI`,
        `  ${c.brightCyan('pnl model <nama>')}    - Mengubah model default (misal: gutech/coder)`,
        `  ${c.brightCyan('pnl models')}          - Melihat daftar model Gutech AI beserta harga`,
        `  ${c.brightCyan('pnl --help')}          - Menampilkan bantuan ini`,
        '',
        `${c.bold('Fitur Utama:')}`,
        `  ${c.white('✔ Kompatibel penuh dengan Way AI Gateway (Gutech AI)')}`,
        `  ${c.white('✔ Tool Calling otonom: Baca/tulis file, edit kode, eksekusi command')}`,
        `  ${c.white('✔ Bisa diakses dari direktori mana pun di terminal Anda')}`
      ], 'info');
      console.log('');
      break;
    }

    default: {
      console.log(`\n  ${c.red(symbols.cross)} Perintah tidak dikenal: "${command}"`);
      console.log(`  Gunakan: ${c.brightCyan('pnl agent')} atau ${c.yellow('pnl --help')}\n`);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error(c.red(`Fatal Error:`), err);
  process.exit(1);
});
