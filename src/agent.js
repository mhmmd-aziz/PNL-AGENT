// src/agent.js - Main interactive AI Agent REPL loop for PNL Agent

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { OpenAI } from 'openai';
import { colors, c, symbols, printBanner, drawBox, formatMarkdown, createSpinner } from './ui.js';
import { loadConfig, saveConfig, ensureApiKey, verifyApiKey } from './config.js';
import { toolDefinitions, executeTool } from './tools.js';

function getSystemPrompt(workingDir) {
  return `Kamu adalah PNL Agent, sebuah AI Coding & System Assistant otonom berkelas dunia (seperti Claude Code dan OpenAI Codex) yang berjalan langsung di terminal pengguna.
Lingkungan kerja kamu saat ini:
- Direktori Proyek: "${workingDir}"
- Platform OS: "${process.platform}" (Windows menggunakan PowerShell)
- Kamu memiliki akses penuh ke tools: read_file, write_file, edit_file, list_directory, run_command, search_files, change_directory.

Prinsip Kerja:
1. Bersikap proaktif, presisi, dan solutif. Jika pengguna meminta membuat fitur, aplikasi, atau memperbaiki bug, gunakan tools yang tersedia untuk membaca file, menulis kode langsung, atau menjalankan terminal command yang diperlukan.
2. Saat membuat file atau menulis kode, hasilkan kode yang lengkap, fungsional, dan rapi tanpa placeholder.
3. Gunakan bahasa Indonesia yang ramah, santun, dan profesional (atau sesuaikan dengan bahasa pertanyaan pengguna).
4. Jelaskan apa yang telah kamu kerjakan secara ringkas dan jelas setelah mengeksekusi aksi.`;
}

export async function startAgent(options = {}) {
  // 1. Ensure API Key is configured and verified
  const config = await ensureApiKey();

  // 2. Initialize OpenAI client pointing to Way AI Gateway
  const client = new OpenAI({
    baseURL: config.baseUrl.replace(/\/+$/, ''),
    apiKey: config.apiKey
  });

  let cwd = process.cwd();
  console.clear();
  printBanner();

  drawBox('PNL AGENT AKTIF', [
    `${c.gray('Direktori Kerja :')} ${c.brightCyan(cwd)}`,
    `${c.gray('Model Aktif     :')} ${c.brightGreen(config.model)}`,
    `${c.gray('Gateway Server  :')} ${c.white(config.baseUrl)}`,
    `${c.gray('Bantuan         :')} Ketik ${c.yellow('/help')} untuk melihat perintah, ${c.yellow('/exit')} untuk keluar`,
    `${c.gray('Status          :')} ${c.brightGreen(symbols.check + ' Siap mengeksekusi coding & terminal command')}`
  ], 'info');
  console.log('');

  // 3. Conversation memory with System Prompt tailored for autonomous coding
  let messages = [
    { role: 'system', content: getSystemPrompt(cwd) }
  ];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    console.log(`\n\n  ${c.yellow(symbols.warn)} Sesi PNL Agent dihentikan. Sampai jumpa!\n`);
    process.exit(0);
  });

  // 4. Interactive REPL Loop
  while (true) {
    let input = '';
    try {
      input = await rl.question(`${c.brightCyan('pnl')} ${c.yellow(symbols.arrow)} `);
    } catch (e) {
      break;
    }

    const trimmed = input.trim();
    if (!trimmed) continue;

    // Handle direct directory change (e.g., "cd E:\INAFEST", "cd cd E:\INAFEST", or "/cd E:\INAFEST")
    const cdMatch = trimmed.match(/^(?:\/cd|cd(?:\s+cd)?)\s*(.*)$/i);
    if (cdMatch) {
      const target = cdMatch[1].trim().replace(/^["']|["']$/g, '');
      if (!target) {
        console.log(`\n  ${c.gray('Direktori saat ini:')} ${c.bold(c.brightCyan(cwd))}\n`);
        continue;
      }
      const resolved = path.isAbsolute(target) ? target : path.resolve(cwd, target);
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        try {
          process.chdir(resolved);
          cwd = process.cwd();
          console.log(`\n  ${c.brightGreen(symbols.check)} Berpindah ke direktori: ${c.bold(c.brightCyan(cwd))}\n`);
          messages[0] = { role: 'system', content: getSystemPrompt(cwd) };
        } catch (err) {
          console.log(`\n  ${c.brightRed(symbols.cross)} Gagal berpindah direktori: ${err.message}\n`);
        }
      } else {
        console.log(`\n  ${c.brightRed(symbols.cross)} Direktori tidak ditemukan: ${c.yellow(target)}\n`);
      }
      continue;
    }

    // Handle slash commands
    if (trimmed.startsWith('/')) {
      const [cmd, ...args] = trimmed.split(' ');
      const command = cmd.toLowerCase();

      if (command === '/exit' || command === '/quit') {
        console.log(`\n  ${c.cyan(symbols.sparkle)} Terima kasih telah menggunakan ${c.bold('PNL Agent')}. Sampai jumpa!\n`);
        break;
      }

      if (command === '/clear') {
        console.clear();
        printBanner();
        messages = [{ role: 'system', content: getSystemPrompt(cwd) }];
        console.log(`  ${c.brightGreen(symbols.check)} Layar dan riwayat percakapan telah dibersihkan.\n`);
        continue;
      }

      if (command === '/help') {
        console.log('');
        drawBox('PERINTAH PNL AGENT', [
          `${c.bold(c.yellow('/help'))}           - Tampilkan panduan ini`,
          `${c.bold(c.yellow('cd <folder>'))}     - Berpindah direktori kerja (misal: cd E:\\INAFEST)`,
          `${c.bold(c.yellow('/models'))}         - Lihat daftar model Gutech yang tersedia`,
          `${c.bold(c.yellow('/model <nama>'))}   - Ganti model aktif (misal: /model gutech/coder)`,
          `${c.bold(c.yellow('/key'))}            - Masukkan atau ganti API Key Way Gutech`,
          `${c.bold(c.yellow('/dir'))}            - Cek file di direktori kerja saat ini`,
          `${c.bold(c.yellow('/clear'))}          - Reset riwayat obrolan dan bersihkan layar`,
          `${c.bold(c.yellow('/exit'))}           - Keluar dari PNL Agent`,
          '',
          `${c.bold('Contoh Instruksi ke PNL Agent:')}`,
          `  ${c.cyan('• "buatkan file server.js menggunakan express port 3000"')}`,
          `  ${c.cyan('• "baca file package.json dan jelaskan isinya"')}`,
          `  ${c.cyan('• "jalankan npm test dan perbaiki jika ada error"')}`,
          `  ${c.cyan('• "buatkan script python untuk fetch data harga bitcoin"')}`
        ], 'info');
        console.log('');
        continue;
      }

      if (command === '/key') {
        await ensureApiKey(true);
        console.log(`  ${c.brightGreen(symbols.check)} API Key berhasil diperbarui!\n`);
        continue;
      }

      if (command === '/model') {
        const newModel = args[0];
        if (!newModel) {
          console.log(`  ${c.yellow(symbols.info)} Model saat ini: ${c.bold(config.model)}`);
          console.log(`  Gunakan: ${c.cyan('/model <nama_model>')} (contoh: ${c.dim('/model gutech/coder')})\n`);
        } else {
          config.model = newModel;
          saveConfig({ model: newModel });
          console.log(`  ${c.brightGreen(symbols.check)} Model berhasil diubah ke: ${c.bold(c.brightCyan(newModel))}\n`);
        }
        continue;
      }

      if (command === '/models') {
        const spinner = createSpinner('Mengambil katalog model dari Gutech AI...');
        spinner.start();
        try {
          const res = await fetch('https://api-way.gutech.dev/api/models');
          const json = await res.json();
          spinner.succeed('Daftar Model Gutech AI:');
          console.log('');
          const modelList = Array.isArray(json) ? json : (json.data || json.models || []);
          console.log(`  ${c.bold('MODEL ID'.padEnd(28))} ${c.bold('HARGA'.padEnd(20))} ${c.bold('KETERANGAN')}`);
          console.log(`  ${'─'.repeat(78)}`);
          for (const m of modelList.slice(0, 30)) {
            const isFree = m.pricing?.input === 0 && m.pricing?.output === 0;
            const priceTag = isFree ? c.brightGreen('GRATIS (Rp 0)') : c.yellow(`Rp ${m.pricing?.input?.toLocaleString('id-ID') || 0}/1M`);
            const desc = (m.description || m.name || '').substring(0, 30);
            console.log(`  ${c.cyan(m.id.padEnd(28))} ${priceTag.padEnd(28)} ${c.gray(desc)}`);
          }
          console.log(`\n  ${c.dim(`Total ${modelList.length} model tersedia.`)} Gunakan ${c.cyan('/model <id>')} untuk memilih.\n`);
        } catch (err) {
          spinner.fail(`Gagal memuat katalog: ${err.message}`);
        }
        continue;
      }

      if (command === '/dir') {
        const res = await executeTool('list_directory', { dir_path: '.' }, cwd);
        console.log(`\n  ${c.bold('Isi Direktori:')} ${c.cyan(cwd)}`);
        if (Array.isArray(res.items)) {
          for (const item of res.items.slice(0, 30)) {
            const icon = item.type === 'directory' ? c.blue('📁') : c.gray('📄');
            console.log(`    ${icon} ${item.name.padEnd(30)} ${c.dim(item.size)}`);
          }
        }
        console.log('');
        continue;
      }

      console.log(`  ${c.red(symbols.cross)} Perintah tidak dikenal: ${trimmed}. Ketik ${c.yellow('/help')} untuk bantuan.\n`);
      continue;
    }

    // Normal User Query -> Add to conversation
    messages.push({ role: 'user', content: trimmed });

    let activeSpinner = createSpinner(`${c.brightCyan('PNL Agent')} sedang berpikir...`);
    activeSpinner.start();

    // ReAct Loop (Autonomous reasoning + tool calling)
    let loopCount = 0;
    const maxLoops = 15;

    while (loopCount < maxLoops) {
      loopCount++;

      try {
        const response = await client.chat.completions.create({
          model: config.model,
          messages: messages,
          tools: toolDefinitions,
          tool_choice: 'auto'
        });

        const choice = response.choices?.[0];
        const message = choice?.message;

        if (!message) {
          activeSpinner.fail('Tidak menerima respons dari Gutech AI Gateway.');
          break;
        }

        // Check if the AI decided to call one or more tools
        if (message.tool_calls && message.tool_calls.length > 0) {
          activeSpinner.stop();
          messages.push(message);

          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            let toolArgs = {};
            try {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } catch (e) {
              toolArgs = {};
            }

            // Display action badge in terminal
            let paramSummary = '';
            if (toolArgs.file_path) paramSummary = toolArgs.file_path;
            else if (toolArgs.command) paramSummary = `"${toolArgs.command}"`;
            else if (toolArgs.query) paramSummary = `"${toolArgs.query}"`;
            else if (toolArgs.dir_path) paramSummary = toolArgs.dir_path;

            console.log(`\n  ${c.toolBadge('TOOL')} ${c.bold(c.brightMagenta(toolName))} ${c.yellow(paramSummary)}`);

            // Execute the tool
            const toolSpinner = createSpinner(`Mengeksekusi ${toolName}...`);
            toolSpinner.start();

            const result = await executeTool(toolName, toolArgs, cwd);

            if (result.error || result.success === false) {
              toolSpinner.fail(`Tool error: ${result.error || result.stderr || 'Gagal'}`);
            } else {
              toolSpinner.succeed(`Selesai.`);
              if (toolName === 'change_directory' && result.success) {
                cwd = process.cwd();
                messages[0] = { role: 'system', content: getSystemPrompt(cwd) };
                console.log(`    ${c.cyan('Direktori sekarang:')} ${c.bold(c.brightCyan(cwd))}`);
              }
            }

            // Print stdout/output preview if relevant
            if (result.stdout) {
              const preview = result.stdout.length > 300 ? result.stdout.slice(0, 300) + '...' : result.stdout;
              console.log(c.dim(`    ${preview.replace(/\n/g, '\n    ')}`));
            }

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            });
          }

          // Restart spinner for next thinking step
          activeSpinner = createSpinner(`${c.brightCyan('PNL Agent')} menganalisis hasil tool...`);
          activeSpinner.start();
          continue; // Loop again to let AI process tool output
        }

        // Final answer from AI
        activeSpinner.stop();
        messages.push(message);

        console.log('');
        console.log(formatMarkdown(message.content || ''));
        console.log('');
        break;

      } catch (err) {
        activeSpinner.fail('Terjadi kesalahan saat memproses permintaan.');
        console.log('');
        if (err.status === 401) {
          console.log(`  ${c.red(symbols.cross)} ${c.bold('Error 401: Unauthorized / Invalid API Key')}`);
          console.log(`  Gunakan perintah ${c.yellow('/key')} untuk mengganti API Key Anda.\n`);
        } else if (err.status === 402) {
          console.log(`  ${c.red(symbols.cross)} ${c.bold('Error 402: Payment Required / Saldo Tidak Cukup')}`);
          console.log(`  Gunakan model gratis dengan perintah: ${c.cyan('/model gutech/free')}\n`);
        } else {
          console.log(`  ${c.red(symbols.cross)} ${c.bold('Detail Error:')} ${err.message}\n`);
        }
        break;
      }
    }

    if (loopCount >= maxLoops) {
      console.log(`  ${c.yellow(symbols.warn)} Batas iterasi tool otonom tercapai untuk mencegah infinite loop.\n`);
    }
  }

  rl.close();
}
