/*
  Лёгкий экранный консольный дебаггер.
  - Включается, если есть ?debug=1 в URL или localStorage.debug_console === 'true'
  - Перехватывает console.log/info/warn/error, window.onerror и unhandledrejection
  - Рисует фиксированную кнопку и полноэкранный overlay с логами
*/

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error';

interface CapturedLogEntry {
  id: number;
  level: ConsoleMethod;
  time: string;
  message: string;
}

let isInitialized = false;
let isOverlayVisible = false;
let nextId = 1;
const capturedLogs: CapturedLogEntry[] = [];

let originalConsole: Record<ConsoleMethod, (...args: any[]) => void> | null = null;

function formatTime(date = new Date()): string {
  return date.toLocaleTimeString(undefined, { hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

function serializeArgs(args: any[]): string {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (_) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

function pushLog(level: ConsoleMethod, args: any[]) {
  capturedLogs.push({
    id: nextId++,
    level,
    time: formatTime(),
    message: serializeArgs(args),
  });
  // Автопрокрутка ленты, если открыта
  const list = document.getElementById('dbg-console-list');
  if (list) {
    const el = document.createElement('div');
    el.className = `dbg-item dbg-item-${level}`;
    el.innerText = `[${level.toUpperCase()}] ${capturedLogs[capturedLogs.length - 1].time} — ${capturedLogs[capturedLogs.length - 1].message}`;
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
  }
}

function createStyles() {
  if (document.getElementById('dbg-console-styles')) return;
  const style = document.createElement('style');
  style.id = 'dbg-console-styles';
  style.textContent = `
    .dbg-btn {
      position: fixed; right: 12px; bottom: 12px; z-index: 999999;
      background: #6b46c1; color: #fff; border: none; border-radius: 22px; padding: 10px 14px;
      font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,.35);
    }
    .dbg-overlay {
      position: fixed; inset: 0; z-index: 999998; background: rgba(0,0,0,.85); color: #eaeaea;
      display: none; flex-direction: column; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    }
    .dbg-overlay.visible { display: flex; }
    .dbg-header {
      display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #1f2937; border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .dbg-title { font-weight: 700; }
    .dbg-actions { margin-left: auto; display: flex; gap: 8px; }
    .dbg-actions button { background: #374151; border: none; color: #fff; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
    .dbg-actions button:hover { background: #4b5563; }
    #dbg-console-list {
      flex: 1; overflow: auto; padding: 10px 12px; line-height: 1.35; font-size: 12px; white-space: pre-wrap;
    }
    .dbg-item { padding: 6px 0; border-bottom: 1px dashed rgba(255,255,255,.06) }
    .dbg-item-log { color: #d1d5db }
    .dbg-item-info { color: #93c5fd }
    .dbg-item-warn { color: #fde68a }
    .dbg-item-error { color: #fca5a5 }
  `;
  document.head.appendChild(style);
}

function createOverlay() {
  if (document.getElementById('dbg-console-overlay')) return;

  // Кнопка
  const btn = document.createElement('button');
  btn.id = 'dbg-console-button';
  btn.className = 'dbg-btn';
  btn.textContent = 'Debug';
  btn.addEventListener('click', () => toggleOverlay());
  document.body.appendChild(btn);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'dbg-console-overlay';
  overlay.className = 'dbg-overlay';
  overlay.innerHTML = `
    <div class="dbg-header">
      <span class="dbg-title">On‑screen Console</span>
      <div class="dbg-actions">
        <button id="dbg-copy">Копировать</button>
        <button id="dbg-clear">Очистить</button>
        <button id="dbg-close">Закрыть</button>
      </div>
    </div>
    <div id="dbg-console-list"></div>
  `;
  document.body.appendChild(overlay);

  const close = overlay.querySelector('#dbg-close') as HTMLButtonElement;
  const clear = overlay.querySelector('#dbg-clear') as HTMLButtonElement;
  const copy = overlay.querySelector('#dbg-copy') as HTMLButtonElement;

  close.addEventListener('click', () => toggleOverlay(false));
  clear.addEventListener('click', () => {
    capturedLogs.length = 0;
    const list = document.getElementById('dbg-console-list');
    if (list) list.innerHTML = '';
  });
  copy.addEventListener('click', async () => {
    const text = capturedLogs
      .map((l) => `[${l.level.toUpperCase()}] ${l.time} — ${l.message}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
  });

  // Инициализируем ленту текущими логами (если были до отрисовки)
  const list = document.getElementById('dbg-console-list');
  if (list) {
    list.innerHTML = '';
    capturedLogs.forEach((l) => {
      const el = document.createElement('div');
      el.className = `dbg-item dbg-item-${l.level}`;
      el.innerText = `[${l.level.toUpperCase()}] ${l.time} — ${l.message}`;
      list.appendChild(el);
    });
    list.scrollTop = list.scrollHeight;
  }
}

function toggleOverlay(force?: boolean) {
  const overlay = document.getElementById('dbg-console-overlay');
  if (!overlay) return;
  isOverlayVisible = typeof force === 'boolean' ? force : !isOverlayVisible;
  overlay.classList.toggle('visible', isOverlayVisible);
}

function overrideConsole() {
  if (originalConsole) return; // уже перехвачено
  originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  (['log', 'info', 'warn', 'error'] as ConsoleMethod[]).forEach((level) => {
    console[level] = ((...args: any[]) => {
      originalConsole![level](...args);
      pushLog(level, args);
    }) as any;
  });

  // Глобальные ошибки
  window.addEventListener('error', (event) => {
    pushLog('error', [event.message || 'Uncaught error', event.error?.stack || '']);
  });
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    pushLog('error', ['Unhandled promise rejection', (event.reason && (event.reason.stack || event.reason)) || '']);
  });
}

function readStartParam(): string | null {
  try {
    // 1) Прямо из Telegram WebApp API
    const sp = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (sp) return String(sp);
  } catch (_) {}

  try {
    // 2) Из sessionStorage tgWebAppData (URLSearchParams)
    const tgWebAppData = sessionStorage.getItem('tgWebAppData');
    if (tgWebAppData) {
      const p = new URLSearchParams(tgWebAppData);
      const sp = p.get('start_param');
      if (sp) return sp;
    }
  } catch (_) {}

  try {
    // 3) Из URL хеша #tgWebAppData=...
    const hash = window.location.hash || '';
    if (hash.includes('tgWebAppData=')) {
      const hp = new URLSearchParams(hash.substring(1));
      const tg = hp.get('tgWebAppData');
      if (tg) {
        const p = new URLSearchParams(tg);
        const sp = p.get('start_param');
        if (sp) return sp;
      }
    }
  } catch (_) {}

  return null;
}

function isTelegramEnv(): boolean {
  try {
    if ((window as any)?.Telegram?.WebApp) return true;
  } catch (_) {}
  try {
    return /Telegram/i.test(navigator.userAgent || '');
  } catch (_) {
    return false;
  }
}

function shouldEnable(): boolean {
  // Явное отключение через флаг
  try {
    if (localStorage.getItem('debug_console') === 'false') return false;
  } catch (_) {}
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('debug') === '1') return true;
  } catch (_) {}
  try {
    if (localStorage.getItem('debug_console') === 'true') return true;
  } catch (_) {}
  return false;
}

export function initDebugConsoleOverlay(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (!shouldEnable()) return; // включение по флагу

  createStyles();
  overrideConsole();
  createOverlay();

  // Горячая клавиша для быстрого показа/скрытия
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      toggleOverlay();
    }
  });
  // Жесты выключены: отключено чтобы не мешать UX
}

// Утилита для принудительного включения в рантайме
export function enableDebugConsoleOverlay(): void {
  try { localStorage.setItem('debug_console', 'true'); } catch (_) {}
  initDebugConsoleOverlay();
}

// Утилита для временного отключения и скрытия UI
export function disableDebugConsoleOverlay(): void {
  try { localStorage.setItem('debug_console', 'false'); } catch (_) {}
  try {
    const btn = document.getElementById('dbg-console-button');
    const overlay = document.getElementById('dbg-console-overlay');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    isOverlayVisible = false;
  } catch (_) {}
}


