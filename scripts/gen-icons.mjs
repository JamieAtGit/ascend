// One-off: rasterise scripts/icon-source.svg into the PNG icons the PWA needs.
// Run with: node scripts/gen-icons.mjs   (sharp is a devDependency)
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(here, 'icon-source.svg'));
const outDir = join(here, '..', 'public');

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 }, // iOS home-screen icon
];

for (const t of targets) {
  await sharp(svg).resize(t.size, t.size).png().toFile(join(outDir, t.file));
  console.log('wrote public/' + t.file + ' (' + t.size + 'px)');
}
console.log('done');
