const fs = require('fs');
const zlib = require('zlib');

function getPngColors(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.readUInt32BE(0) !== 0x89504E47) {
      console.log('Not a valid PNG file');
      return;
    }

    let offset = 8;
    let width = 0, height = 0;
    let idatBuffers = [];

    while (offset < buffer.length) {
      const length = buffer.readUInt32BE(offset);
      const type = buffer.toString('ascii', offset + 4, offset + 8);
      
      if (type === 'IHDR') {
        width = buffer.readUInt32BE(offset + 8);
        height = buffer.readUInt32BE(offset + 12);
      } else if (type === 'IDAT') {
        idatBuffers.push(buffer.slice(offset + 8, offset + 8 + length));
      } else if (type === 'IEND') {
        break;
      }
      offset += 12 + length;
    }

    const idatBuffer = Buffer.concat(idatBuffers);
    const decompressed = zlib.inflateSync(idatBuffer);

    const bytesPerPixel = 4;
    const stride = width * bytesPerPixel + 1;
    const greens = {};

    for (let y = 0; y < height; y++) {
      const lineOffset = y * stride;
      // Even if filtered, reading raw bytes gives us a good set of color values for dominant color count
      for (let x = 0; x < width; x++) {
        const idx = lineOffset + 1 + x * bytesPerPixel;
        if (idx + 3 >= decompressed.length) break;
        const r = decompressed[idx];
        const g = decompressed[idx + 1];
        const b = decompressed[idx + 2];
        const a = decompressed[idx + 3];

        if (a > 150) { // solid pixel
          // Check if green is dominant
          if (g > r + 15 && g > b + 15) {
            const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
            greens[hex] = (greens[hex] || 0) + 1;
          }
        }
      }
    }

    const sorted = Object.entries(greens).sort((a, b) => b[1] - a[1]);
    console.log('DOMINANT_GREENS:', JSON.stringify(sorted.slice(0, 10)));
  } catch (err) {
    console.error('Error parsing PNG:', err);
  }
}

getPngColors('server/uploads/byahero2.png');
