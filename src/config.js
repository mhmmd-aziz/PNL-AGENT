// src/config.js - Config management and Gutech API Key verification

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline/promises';
import { c, symbols, drawBox, createSpinner } from './ui.js';

const CONFIG_DIR = path.join(os.homedir(), '.pnl-agent');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_BASE_URL = 'https://api-way.gutech.dev/v1';
const DEFAULT_MODEL = 'gutech/free';

export function getConfigPath() {
  return CONFIG_FILE;
}

export function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      baseUrl: parsed.baseUrl || DEFAULT_BASE_URL,
      model: parsed.model || DEFAULT_MODEL,
      apiKey: parsed.apiKey || '',
      ...parsed
    };
  } catch (err) {
    return null;
  }
}

export function saveConfig(data) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = loadConfig() || {};
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error(c.red(`Gagal menyimpan config ke ${CONFIG_FILE}:`), err.message);
    throw err;
  }
}

/**
 * Validates the Gutech API Key directly against the gateway's /v1/models endpoint
 */
export async function verifyApiKey(apiKey, baseUrl = DEFAULT_BASE_URL) {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const testUrl = `${cleanUrl}/models`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const models = Array.isArray(data?.data) ? data.data.map(m => m.id) : [];
      return {
        valid: true,
        statusCode: response.status,
        models,
        message: 'API Key terverifikasi sukses.'
      };
    } else {
      let errorMsg = `HTTP Error ${response.status} ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {
        // ignore
      }

      if (response.status === 401) {
        errorMsg = 'API Key salah, tidak terdaftar, atau telah dicabut (401 Unauthorized)';
      } else if (response.status === 402) {
        errorMsg = 'Saldo akun tidak mencukupi untuk request berbayar (402 Payment Required)';
      }

      return {
        valid: false,
        statusCode: response.status,
        error: errorMsg
      };
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        valid: false,
        error: 'Koneksi timeout ke server Way Gutech AI (12 detik).'
      };
    }
    return {
      valid: false,
      error: `Gagal menghubungi server: ${err.message}`
    };
  }
}

/**
 * Prompts user to input or paste their API key and verifies it immediately.
 * Gives immediate terminal feedback: "kalo berhasil berhasil kalo ngga ngga di terminalnya".
 */
export async function ensureApiKey(forcePrompt = false) {
  let config = loadConfig();

  // If already configured and not forcing re-prompt, verify cached key or return
  if (config?.apiKey && !forcePrompt) {
    return config;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    console.log('');
    drawBox('SETUP API KEY GUTECH AI', [
      `${c.bold('PNL Agent')} memerlukan API Key dari ${c.cyan('Way AI Gateway (Gutech AI)')}.`,
      `Format key biasanya berawalan: ${c.yellow('gw_live_...')}`,
      `Dapatkan key di: ${c.dim('https://way.gutech.dev/dashboard/keys')}`
    ], 'warn');
    console.log('');

    const inputKey = await rl.question(`  ${c.cyan(symbols.arrow)} ${c.bold('Paste / Masukkan API Key Anda')}: `);
    const trimmedKey = inputKey.trim();

    if (!trimmedKey) {
      console.log(`  ${c.red(symbols.cross)} API Key tidak boleh kosong.\n`);
      continue;
    }

    // Verify key with spinner
    console.log('');
    const spinner = createSpinner('Memverifikasi API Key ke server Way Gutech AI...');
    spinner.start();

    const result = await verifyApiKey(trimmedKey, config?.baseUrl || DEFAULT_BASE_URL);

    if (result.valid) {
      spinner.succeed('Verifikasi Berhasil!');
      console.log('');

      // Display SUCCESS BOX
      drawBox('BERHASIL! KONEKSI AKTIF', [
        `${c.brightGreen(symbols.check)} ${c.bold('API Key Anda VALID dan Aktif!')}`,
        `${c.gray('Model Default :')} ${c.brightCyan(config?.model || DEFAULT_MODEL)}`,
        `${c.gray('Tersimpan di  :')} ${c.white(CONFIG_FILE)}`,
        `${c.gray('Status Gateway:')} ${c.brightGreen('Online & Siap Digunakan')}`
      ], 'success');
      console.log('');

      config = saveConfig({
        apiKey: trimmedKey,
        baseUrl: config?.baseUrl || DEFAULT_BASE_URL,
        model: config?.model || DEFAULT_MODEL
      });

      rl.close();
      return config;
    } else {
      spinner.fail('Verifikasi Gagal!');
      console.log('');

      // Display ERROR BOX
      drawBox('GAGAL! API KEY TIDAK VALID', [
        `${c.brightRed(symbols.cross)} ${c.bold('Gagal memverifikasi API Key Anda.')}`,
        `${c.gray('Penyebab :')} ${c.red(result.error || 'API Key ditolak oleh Gutech Gateway')}`,
        `${c.gray('Kode     :')} ${c.yellow(result.statusCode ? String(result.statusCode) : 'Network/Auth Error')}`,
        '',
        `${c.dim('Pastikan token yang Anda copy diawali dengan "gw_live_" dan masih aktif.')}`
      ], 'error');
      console.log('');

      const retryAnswer = await rl.question(`  ${c.yellow(symbols.arrow)} Mau coba masukkan API Key lagi? (${c.bold('Y/n')}): `);
      if (retryAnswer.trim().toLowerCase() === 'n') {
        console.log(`\n  ${c.gray('Setup dibatalkan. Menutup PNL Agent.')}\n`);
        rl.close();
        process.exit(1);
      }
    }
  }
}
