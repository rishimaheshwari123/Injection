const fs = require('fs');
const path = require('path');

function getJpegSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  let i = 4;
  while (i < buffer.length) {
    const marker = buffer.readUInt16BE(i);
    i += 2;
    if (marker === 0xFFC0 || marker === 0xFFC2) {
      // SOF0 or SOF2
      i += 3; // skip length & precision
      const height = buffer.readUInt16BE(i);
      i += 2;
      const width = buffer.readUInt16BE(i);
      return { width, height };
    } else {
      const length = buffer.readUInt16BE(i);
      i += length;
    }
  }
  return null;
}

const dir = 'public';
const files = fs.readdirSync(dir).filter(f => f.startsWith('herobanner') && f.endsWith('.jpeg'));
for (const file of files) {
  const filePath = path.join(dir, file);
  try {
    const size = getJpegSize(filePath);
    console.log(`${file}: ${size.width}x${size.height} (Aspect ratio: ${(size.width/size.height).toFixed(3)})`);
  } catch (e) {
    console.error(`Failed to read ${file}:`, e.message);
  }
}
