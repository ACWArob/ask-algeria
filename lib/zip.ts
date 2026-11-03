/**
 * Tiny store-only ZIP writer (no compression, no dependencies) for the "Prepare my file" packet.
 * Layout per APPNOTE 6.3: [local header + name + data]… [central directory entries…] [end of central directory].
 * Filenames are written as UTF-8 (general-purpose flag bit 11). Runs in the browser and in Node.
 */

export interface ZipEntry {
  name: string;
  data: string | Uint8Array;
}

let table: Uint32Array | null = null;

/** CRC-32 (IEEE 802.3, the one ZIP uses). */
export function crc32(bytes: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(d: Date): { time: number; date: number } {
  const year = Math.min(Math.max(d.getFullYear(), 1980), 2107);
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/** Builds the ZIP archive bytes. Names must be unique; keep them short ASCII or UTF-8 paths with "/" separators. */
export function zipBytes(entries: ZipEntry[], when: Date = new Date()): Uint8Array {
  const enc = new TextEncoder();
  const { time, date } = dosDateTime(when);
  const files = entries.map((e) => {
    const name = enc.encode(e.name);
    const data = typeof e.data === "string" ? enc.encode(e.data) : e.data;
    return { name, data, crc: crc32(data) };
  });

  const localSize = files.reduce((n, f) => n + 30 + f.name.length + f.data.length, 0);
  const centralSize = files.reduce((n, f) => n + 46 + f.name.length, 0);
  const out = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(out.buffer);
  let p = 0;
  const u16 = (v: number) => { view.setUint16(p, v, true); p += 2; };
  const u32 = (v: number) => { view.setUint32(p, v >>> 0, true); p += 4; };
  const bytes = (b: Uint8Array) => { out.set(b, p); p += b.length; };
  const FLAGS = 0x0800; // UTF-8 names

  const offsets: number[] = [];
  for (const f of files) {
    offsets.push(p);
    u32(0x04034b50); // local file header signature
    u16(20); // version needed (2.0)
    u16(FLAGS);
    u16(0); // method: stored
    u16(time);
    u16(date);
    u32(f.crc);
    u32(f.data.length); // compressed size
    u32(f.data.length); // uncompressed size
    u16(f.name.length);
    u16(0); // extra length
    bytes(f.name);
    bytes(f.data);
  }

  const cdStart = p;
  files.forEach((f, i) => {
    u32(0x02014b50); // central directory signature
    u16(20); // version made by
    u16(20); // version needed
    u16(FLAGS);
    u16(0);
    u16(time);
    u16(date);
    u32(f.crc);
    u32(f.data.length);
    u32(f.data.length);
    u16(f.name.length);
    u16(0); // extra
    u16(0); // comment
    u16(0); // disk number start
    u16(0); // internal attributes
    u32(0); // external attributes
    u32(offsets[i]);
    bytes(f.name);
  });

  u32(0x06054b50); // end of central directory
  u16(0);
  u16(0);
  u16(files.length);
  u16(files.length);
  u32(centralSize);
  u32(cdStart);
  u16(0); // comment length
  return out;
}

/** The archive as a Blob, ready for a download link. */
export function zipBlob(entries: ZipEntry[], when?: Date): Blob {
  return new Blob([zipBytes(entries, when) as BlobPart], { type: "application/zip" });
}
