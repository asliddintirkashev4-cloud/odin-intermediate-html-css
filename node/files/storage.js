import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
const directory = new URL('../uploads/', import.meta.url);
export function inspectFile(buffer, originalName) {
  if (!buffer.length) throw new Error('Empty files are not supported.');
  const name = originalName.split(/[\\/]/).pop().replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180);
  if (!name) throw new Error('A file name is required.');
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { name, mime: 'image/png' };
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { name, mime: 'image/jpeg' };
  if (buffer.subarray(0, 5).toString() === '%PDF-') return { name, mime: 'application/pdf' };
  if (/\.txt$/i.test(name)) {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    if (!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) return { name, mime: 'text/plain' };
  }
  throw new Error('Use a PNG, JPEG, PDF or UTF-8 .txt file.');
}
export async function saveBytes(key, buffer, mode) {
  if (mode === 'local') {
    await mkdir(directory, { recursive: true });
    await writeFile(new URL(key, directory), buffer, { mode: 0o600, flag: 'wx' });
    return null;
  }
  return buffer;
}
export async function loadBytes(file) { return file.data ? Buffer.from(file.data) : readFile(new URL(file.storageKey, directory)); }
export async function removeLocalBytes(key) { try { await unlink(new URL(key, directory)); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
