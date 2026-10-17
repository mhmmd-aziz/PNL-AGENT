// src/ui.js - Terminal UI styling, colors, and components for PNL Agent

export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  
  // Foreground
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  
  // Background
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[100m"
};

export const c = {
  cyan: (t) => `${colors.cyan}${t}${colors.reset}`,
  brightCyan: (t) => `${colors.brightCyan}${t}${colors.reset}`,
  green: (t) => `${colors.green}${t}${colors.reset}`,
  brightGreen: (t) => `${colors.brightGreen}${t}${colors.reset}`,
  yellow: (t) => `${colors.yellow}${t}${colors.reset}`,
  brightYellow: (t) => `${colors.brightYellow}${t}${colors.reset}`,
  red: (t) => `${colors.red}${t}${colors.reset}`,
  brightRed: (t) => `${colors.brightRed}${t}${colors.reset}`,
  magenta: (t) => `${colors.magenta}${t}${colors.reset}`,
  brightMagenta: (t) => `${colors.brightMagenta}${t}${colors.reset}`,
  blue: (t) => `${colors.blue}${t}${colors.reset}`,
  brightBlue: (t) => `${colors.brightBlue}${t}${colors.reset}`,
  white: (t) => `${colors.white}${t}${colors.reset}`,
  brightWhite: (t) => `${colors.brightWhite}${t}${colors.reset}`,
  black: (t) => `${colors.black}${t}${colors.reset}`,
  gray: (t) => `${colors.gray}${t}${colors.reset}`,
  bold: (t) => `${colors.bold}${t}${colors.reset}`,
  dim: (t) => `${colors.dim}${t}${colors.reset}`,
  badge: (text, bgColor, textColor = colors.black) => `${bgColor}${textColor} ${text} ${colors.reset}`,
  toolBadge: (text = 'TOOL') => `${colors.bgMagenta}${colors.white} ${text} ${colors.reset}`,
  agentBadge: (text = 'PNL AGENT') => `${colors.bgCyan}${colors.black} ${text} ${colors.reset}`
};

export const symbols = {
  check: process.platform === 'win32' ? '√' : '✔',
  cross: process.platform === 'win32' ? '×' : '✖',
  info: 'ℹ',
  warn: '⚠',
  bullet: '●',
  arrow: '❯',
  sparkle: '✦',
  bolt: '⚡',
  gear: '⚙'
};

export function printBanner() {
  const logo = `
 ${c.brightCyan('██████╗ ███╗   ██╗██╗         █████╗  ██████╗ ███████╗███╗   ██╗████████╗')}
 ${c.brightCyan('██╔══██╗████╗  ██║██║        ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝')}
 ${c.cyan('██████╔╝██╔██╗ ██║██║        ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ')}
 ${c.cyan('██╔═══╝ ██║╚██╗██║██║        ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ')}
 ${c.blue('██║     ██║ ╚████║███████╗   ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ')}
 ${c.blue('╚═╝     ╚═╝  ╚═══╝╚══════╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ')}
`;
  console.log(logo);
  console.log(`  ${c.badge('PNL AGENT', colors.bgCyan, colors.black)} ${c.bold('Terminal AI Coding & System Assistant')}`);
  console.log(`  ${c.gray('Powered by')} ${c.brightGreen('Way AI Gateway')} ${c.gray('(Gutech AI)')}`);
  console.log('');
}

export function drawBox(title, lines, type = 'info') {
  let borderColor = colors.cyan;
  let titleColor = colors.brightCyan;
  
  if (type === 'success') {
    borderColor = colors.green;
    titleColor = colors.brightGreen;
  } else if (type === 'error') {
    borderColor = colors.red;
    titleColor = colors.brightRed;
  } else if (type === 'warn') {
    borderColor = colors.yellow;
    titleColor = colors.brightYellow;
  }

  const plainLength = (str) => str.replace(/\x1b\[[0-9;]*m/g, '').length;
  const contentWidth = Math.max(
    title ? plainLength(title) + 4 : 0,
    ...lines.map(l => plainLength(l)),
    45
  );

  const topBorder = `┌─ ${titleColor}${title}${colors.reset} ${borderColor}${'─'.repeat(Math.max(0, contentWidth - plainLength(title) - 3))}┐${colors.reset}`;
  const bottomBorder = `└${borderColor}${'─'.repeat(contentWidth + 2)}┘${colors.reset}`;

  console.log(topBorder);
  for (const line of lines) {
    const pad = ' '.repeat(Math.max(0, contentWidth - plainLength(line)));
    console.log(`│ ${line}${pad} │`);
  }
  console.log(bottomBorder);
}

export function createSpinner(initialText = 'Memproses...') {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIdx = 0;
  let currentText = initialText;
  let timer = null;

  return {
    start(text) {
      if (text) currentText = text;
      process.stdout.write('\x1b[?25l'); // hide cursor
      timer = setInterval(() => {
        const frame = c.cyan(frames[frameIdx]);
        process.stdout.write(`\r  ${frame} ${currentText} `);
        frameIdx = (frameIdx + 1) % frames.length;
      }, 80);
    },
    update(text) {
      currentText = text;
    },
    succeed(text) {
      if (timer) clearInterval(timer);
      process.stdout.write('\x1b[?25h'); // show cursor
      process.stdout.write(`\r  ${c.brightGreen(symbols.check)} ${text || currentText}\n`);
    },
    fail(text) {
      if (timer) clearInterval(timer);
      process.stdout.write('\x1b[?25h'); // show cursor
      process.stdout.write(`\r  ${c.brightRed(symbols.cross)} ${text || currentText}\n`);
    },
    stop() {
      if (timer) clearInterval(timer);
      process.stdout.write('\x1b[?25h');
      process.stdout.write('\r\x1b[K'); // clear line
    }
  };
}

export function formatMarkdown(text) {
  // Simple markdown highlighter for terminal
  return text
    .replace(/```([a-z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const header = c.gray(`─── [${lang || 'code'}] ──────────────────────────────────`);
      const footer = c.gray(`───────────────────────────────────────────────`);
      return `\n${header}\n${c.cyan(code.trimEnd())}\n${footer}\n`;
    })
    .replace(/`([^`]+)`/g, (match, inlineCode) => c.yellow(inlineCode))
    .replace(/\*\*([^*]+)\*\*/g, (match, boldText) => c.bold(boldText))
    .replace(/^#+ (.*$)/gm, (match, heading) => `\n${c.bold(c.brightCyan(heading))}\n`);
}
