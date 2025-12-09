// src/utils/helpers.js

/** Wait for `ms` milliseconds. */
export const delay = (ms = 0) => new Promise((res) => setTimeout(res, ms));

/** RFC4122 v4-like id (not cryptographically secure). */
export const uid = (prefix = '') =>
  `${prefix}${([1e7]+-1e3+-4e3+-8e3+-1e11)
    .replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )}`;

/** ✅ Alias expected by mockAPI.js */
export const generateId = (prefix = 'id_') => uid(prefix); // <-- add this

/** Clamp a number between min and max. */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/** Create an array [start, start+1, ..., end-1]. */
export const range = (start, end, step = 1) => {
  const out = [];
  for (let i = start; i < end; i += step) out.push(i);
  return out;
};

/** No-op function. */
export const noop = () => {};

/** Merge class names (skips falsy values). */
export const cn = (...args) =>
  args.flatMap((a) => (Array.isArray(a) ? a : [a]))
      .filter(Boolean)
      .join(' ');

/** Copy text to clipboard (best-effort; resolves boolean). */
export const copyToClipboard = async (text) => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};

/** Download a blob/string as a file. */
export const downloadFile = (data, filename = 'download.txt', type = 'text/plain') => {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/** Retry an async fn up to `retries` times with backoff (in ms). */
export const retry = async (fn, { retries = 3, delayMs = 300 } = {}) => {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (e) { lastErr = e; }
    if (i < retries - 1) await delay(delayMs * (i + 1));
  }
  throw lastErr;
};

/** Simulate network request latency and optional error (for mocks). */
export const simulateNetwork = async ({ min = 200, max = 900, errorRate = 0 } = {}) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(ms);
  if (Math.random() < errorRate) throw new Error('Simulated network error');
};
