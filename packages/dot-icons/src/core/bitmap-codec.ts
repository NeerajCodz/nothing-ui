/**
 * Pure, dependency-free bit-packing codec for monochrome dot-matrix icon bitmaps.
 * Encodes '#' / '.' rows into compact base64 strings (~38 chars for a 15x15 icon)
 * so 1,400+ Lucide dot icons bundle into ~58 KB raw (~20 KB gzipped) with instant decode.
 */

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const B64_LOOKUP = (() => {
  const table = new Int8Array(128).fill(-1);
  for (let i = 0; i < B64_ALPHABET.length; i++) {
    table[B64_ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();

/**
 * Packs a rectangular '#' / '.' dot bitmap into a compact URL-safe-free standard base64 string
 * (without '=' padding, since cols * rows determines the exact bit length).
 */
export function encodeDotBitmap(rows: readonly string[]): string {
  const rowCount = rows.length;
  const cols = rows[0]?.length ?? 0;
  const totalBits = rowCount * cols;
  if (totalBits === 0) return '';

  const byteLen = Math.ceil(totalBits / 8);
  const bytes = new Uint8Array(byteLen);

  let bitIndex = 0;
  for (let y = 0; y < rowCount; y++) {
    const row = rows[y];
    for (let x = 0; x < cols; x++) {
      if (row[x] === '#') {
        bytes[bitIndex >> 3] |= 1 << (7 - (bitIndex & 7));
      }
      bitIndex++;
    }
  }

  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;

    out += B64_ALPHABET[(triplet >> 18) & 63];
    out += B64_ALPHABET[(triplet >> 12) & 63];
    if (i + 1 < bytes.length) out += B64_ALPHABET[(triplet >> 6) & 63];
    if (i + 2 < bytes.length) out += B64_ALPHABET[triplet & 63];
  }

  return out;
}

/**
 * Decodes a base64-packed dot bitmap string back into `rowsCount` strings of length `cols`
 * containing '#' (lit) and '.' (unlit). Works identically in Browser, Node, and React Native.
 */
export function decodeDotBitmap(encoded: string, cols: number, rowsCount: number): readonly string[] {
  const totalBits = cols * rowsCount;
  if (totalBits <= 0) return [];

  const byteLen = Math.ceil(totalBits / 8);
  const bytes = new Uint8Array(byteLen);

  let bytePos = 0;
  let buffer = 0;
  let bitsInBuffer = 0;

  for (let i = 0; i < encoded.length && bytePos < byteLen; i++) {
    const code = encoded.charCodeAt(i);
    if (code >= 128) continue;
    const val = B64_LOOKUP[code];
    if (val < 0) continue;
    buffer = (buffer << 6) | val;
    bitsInBuffer += 6;
    if (bitsInBuffer >= 8) {
      bitsInBuffer -= 8;
      bytes[bytePos++] = (buffer >> bitsInBuffer) & 0xff;
    }
  }

  const rows: string[] = new Array(rowsCount);
  let bitIndex = 0;
  for (let y = 0; y < rowsCount; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const lit = (bytes[bitIndex >> 3] & (1 << (7 - (bitIndex & 7)))) !== 0;
      line += lit ? '#' : '.';
      bitIndex++;
    }
    rows[y] = line;
  }

  return rows;
}
