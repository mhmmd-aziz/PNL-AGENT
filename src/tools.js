// src/tools.js - Autonomous tools for PNL Agent (File editing, command execution, inspection)

import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { c, symbols } from './ui.js';

const execAsync = promisify(exec);

// Definitions compatible with OpenAI Function Calling (supported by Way Gutech AI)
export const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Membaca isi file teks dalam direktori kerja proyek.',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path relatif atau absolut ke file yang akan dibaca.'
          },
          start_line: {
            type: 'number',
            description: 'Baris awal yang ingin dibaca (1-indexed, opsional).'
          },
          end_line: {
            type: 'number',
            description: 'Baris akhir yang ingin dibaca (1-indexed, opsional).'
          }
        },
        required: ['file_path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Menulis atau membuat file baru dengan konten yang ditentukan.',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path relatif atau absolut ke file yang akan dibuat/ditulis.'
          },
          content: {
            type: 'string',
            description: 'Konten lengkap yang akan ditulis ke file.'
          }
        },
        required: ['file_path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'edit_file',
      description: 'Mengedit bagian tertentu dari file dengan mengganti teks lama (old_text) dengan teks baru (new_text).',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path file yang akan diedit.'
          },
          old_text: {
            type: 'string',
            description: 'Teks lama yang persis ada di dalam file.'
          },
          new_text: {
            type: 'string',
            description: 'Teks pengganti baru.'
          }
        },
        required: ['file_path', 'old_text', 'new_text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'Melihat daftar file dan folder dalam suatu direktori.',
      parameters: {
        type: 'object',
        properties: {
          dir_path: {
            type: 'string',
            description: 'Path direktori (default "." untuk direktori saat ini).'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Menjalankan perintah terminal/shell (PowerShell/CMD di Windows) di direktori kerja saat ini.',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'Perintah terminal yang ingin dijalankan (misal: "dir", "npm install", "python test.py", "git status").'
          }
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_files',
      description: 'Mencari kata kunci atau regex di dalam file-file di direktori.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Kata atau teks yang dicari.'
          },
          dir_path: {
            type: 'string',
            description: 'Direktori tempat pencarian (default ".").'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'change_directory',
      description: 'Berpindah ke direktori kerja lain di sistem.',
      parameters: {
        type: 'object',
        properties: {
          dir_path: {
            type: 'string',
            description: 'Path direktori baru yang dituju (misal: "E:\\INAFEST" atau "../project").'
          }
        },
        required: ['dir_path']
      }
    }
  }
];

export async function executeTool(name, args, cwd = process.cwd()) {
  try {
    switch (name) {
      case 'read_file': {
        const fullPath = path.isAbsolute(args.file_path) ? args.file_path : path.join(cwd, args.file_path);
        if (!fs.existsSync(fullPath)) {
          return { error: `File tidak ditemukan: ${args.file_path}` };
        }
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          return { error: `Path adalah direktori, bukan file: ${args.file_path}` };
        }
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        let start = (args.start_line && args.start_line > 0) ? args.start_line - 1 : 0;
        let end = (args.end_line && args.end_line <= lines.length) ? args.end_line : lines.length;
        
        const selectedLines = lines.slice(start, end).map((line, idx) => `${start + idx + 1}: ${line}`).join('\n');
        return {
          file: args.file_path,
          total_lines: lines.length,
          displayed_lines: `${start + 1}-${end}`,
          content: selectedLines
        };
      }

      case 'write_file': {
        const fullPath = path.isAbsolute(args.file_path) ? args.file_path : path.join(cwd, args.file_path);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, args.content, 'utf-8');
        return {
          success: true,
          file: args.file_path,
          bytes_written: Buffer.byteLength(args.content, 'utf-8'),
          message: `Berhasil menulis file: ${args.file_path}`
        };
      }

      case 'edit_file': {
        const fullPath = path.isAbsolute(args.file_path) ? args.file_path : path.join(cwd, args.file_path);
        if (!fs.existsSync(fullPath)) {
          return { error: `File tidak ditemukan: ${args.file_path}` };
        }
        let content = fs.readFileSync(fullPath, 'utf-8');
        if (!content.includes(args.old_text)) {
          return { error: `Target 'old_text' tidak ditemukan dalam file. Pastikan whitespace dan karakternya persis sama.` };
        }
        content = content.replace(args.old_text, args.new_text);
        fs.writeFileSync(fullPath, content, 'utf-8');
        return {
          success: true,
          file: args.file_path,
          message: `Berhasil memperbarui file: ${args.file_path}`
        };
      }

      case 'list_directory': {
        const targetDir = args.dir_path ? (path.isAbsolute(args.dir_path) ? args.dir_path : path.join(cwd, args.dir_path)) : cwd;
        if (!fs.existsSync(targetDir)) {
          return { error: `Direktori tidak ditemukan: ${targetDir}` };
        }
        const entries = fs.readdirSync(targetDir, { withFileTypes: true });
        const result = entries.slice(0, 100).map(entry => {
          let size = 0;
          try {
            if (entry.isFile()) size = fs.statSync(path.join(targetDir, entry.name)).size;
          } catch (e) {}
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entry.isFile() ? `${size} bytes` : '-'
          };
        });
        return {
          directory: targetDir,
          total_items: entries.length,
          items: result
        };
      }

      case 'run_command': {
        const cmd = args.command;
        // Run with powershell on windows or standard shell
        const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash';
        try {
          const { stdout, stderr } = await execAsync(cmd, {
            cwd,
            shell,
            timeout: 60000,
            maxBuffer: 1024 * 1024 * 5 // 5MB buffer
          });
          return {
            success: true,
            command: cmd,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          };
        } catch (err) {
          return {
            success: false,
            command: cmd,
            exit_code: err.code,
            stdout: (err.stdout || '').trim(),
            stderr: (err.stderr || err.message).trim()
          };
        }
      }

      case 'search_files': {
        const targetDir = args.dir_path ? (path.isAbsolute(args.dir_path) ? args.dir_path : path.join(cwd, args.dir_path)) : cwd;
        const matches = [];
        
        function searchRec(dir) {
          if (matches.length >= 25) return;
          const list = fs.readdirSync(dir, { withFileTypes: true });
          for (const item of list) {
            if (item.name === 'node_modules' || item.name === '.git') continue;
            const itemPath = path.join(dir, item.name);
            if (item.isDirectory()) {
              searchRec(itemPath);
            } else if (item.isFile()) {
              try {
                const text = fs.readFileSync(itemPath, 'utf-8');
                if (text.includes(args.query)) {
                  matches.push(path.relative(cwd, itemPath));
                }
              } catch (e) {}
            }
          }
        }
        
        searchRec(targetDir);
        return {
          query: args.query,
          matched_files: matches
        };
      }

      case 'change_directory': {
        const targetDir = args.dir_path ? args.dir_path.trim().replace(/^["']|["']$/g, '') : '';
        if (!targetDir) {
          return { error: 'Path direktori tujuan tidak boleh kosong.' };
        }
        const resolvedPath = path.isAbsolute(targetDir) ? targetDir : path.resolve(cwd, targetDir);
        if (!fs.existsSync(resolvedPath)) {
          return { error: `Direktori tidak ditemukan: ${targetDir}` };
        }
        if (!fs.statSync(resolvedPath).isDirectory()) {
          return { error: `Target bukan direktori: ${targetDir}` };
        }
        try {
          process.chdir(resolvedPath);
          return {
            success: true,
            previous_directory: cwd,
            current_directory: process.cwd(),
            message: `Berhasil berpindah direktori ke: ${process.cwd()}`
          };
        } catch (err) {
          return { error: `Gagal berpindah ke direktori: ${err.message}` };
        }
      }

      default:
        return { error: `Tool tidak dikenal: ${name}` };
    }
  } catch (err) {
    return { error: `Kesalahan saat mengeksekusi ${name}: ${err.message}` };
  }
}
