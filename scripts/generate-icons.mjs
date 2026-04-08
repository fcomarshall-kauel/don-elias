import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public/icon.svg'));

const sizes = [192, 512];

for (const size of sizes) {
  const outPath = path.join(process.cwd(), `public/icon-${size}.png`);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ Generated ${outPath}`);
}

console.log('All icons generated!');
