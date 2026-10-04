export function relaxDynamicDims(bytes: Uint8Array): number {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u32 = (p: number) => dv.getUint32(p, true);

  const field = (tab: number, idx: number): number => {
    const vtable = tab - dv.getInt32(tab, true);
    const slot = 4 + 2 * idx;
    if (slot >= dv.getUint16(vtable, true)) return 0;
    const off = dv.getUint16(vtable + slot, true);
    return off ? tab + off : 0;
  };
  const indirect = (pos: number) => pos + u32(pos);

  let changed = 0;
  const root = u32(0);
  const subgraphsField = field(root, 2);
  if (!subgraphsField) return 0;
  const subgraphs = indirect(subgraphsField);

  for (let i = 0; i < u32(subgraphs); i++) {
    const sgTable = indirect(subgraphs + 4 + i * 4);
    const tensorsField = field(sgTable, 0);
    if (!tensorsField) continue;
    const tensors = indirect(tensorsField);

    for (let j = 0; j < u32(tensors); j++) {
      const tTable = indirect(tensors + 4 + j * 4);
      const sigField = field(tTable, 7);
      if (!sigField) continue;
      const sig = indirect(sigField);
      for (let k = 0; k < u32(sig); k++) {
        const p = sig + 4 + k * 4;
        if (dv.getInt32(p, true) === -1) {
          dv.setInt32(p, 1, true);
          changed++;
        }
      }
    }
  }
  return changed;
}

export function isTfliteFile(bytes: Uint8Array): boolean {
  return (
    bytes.length > 8 &&
    bytes[4] === 0x54 && bytes[5] === 0x46 && bytes[6] === 0x4c && bytes[7] === 0x33
  );
}

export async function fetchStaticShapeModel(urls: string[]): Promise<{ bytes: Uint8Array; url: string }> {
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`${url}: HTTP ${res.status}`);
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (!isTfliteFile(bytes)) {
        errors.push(`${url}: not a .tflite file (got ${res.headers.get('content-type') || 'unknown type'})`);
        continue;
      }
      relaxDynamicDims(bytes);
      return { bytes, url };
    } catch (e) {
      errors.push(`${url}: ${(e as Error).message}`);
    }
  }
  throw new Error(`Model file not found. Tried:\n${errors.join('\n')}`);
}