const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Icons = require('../js/icons.js');

const BASE_OUT = path.join(__dirname, '../assets/icons');

const SCHEMES = {
  brand: (id, meta) => meta.color,
  'brand-dark': (id, meta) => {
    // For dark backgrounds, convert near-black brand logos to white
    if (['#000000', '#24292F'].includes(meta.color)) {
      return '#FFFFFF';
    }
    return meta.color;
  },
  mono: () => '#4A5568',
  white: () => '#FFFFFF',
  accent: () => '#00DC82'
};

const RSVG = '/opt/homebrew/bin/rsvg-convert';

console.log('Generating icon schemes using rsvg-convert...');

for (const [scheme, colorFn] of Object.entries(SCHEMES)) {
  const dir = path.join(BASE_OUT, scheme);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const [id, meta] of Object.entries(Icons.social)) {
    const color = colorFn(id, meta);
    let svg = meta.svg
      .replace(/width="24"/, 'width="64"')
      .replace(/height="24"/, 'height="64"');

    if (svg.includes('fill="currentColor"')) {
      svg = svg.replace(/fill="currentColor"/g, `fill="${color}"`);
    } else {
      svg = svg.replace(/<svg/, `<svg fill="${color}"`);
    }

    const tempSvgPath = path.join(__dirname, `_temp_${id}.svg`);
    const outPngPath = path.join(dir, `${id}.png`);

    fs.writeFileSync(tempSvgPath, svg, 'utf8');

    // 64x64 Retina resolution (crisp @2x for 18-24px display)
    execSync(`${RSVG} -w 64 -h 64 -f png "${tempSvgPath}" -o "${outPngPath}"`);
    fs.unlinkSync(tempSvgPath);

    // Also populate root assets/icons/ with brand colors for backwards compatibility
    if (scheme === 'brand') {
      const rootPngPath = path.join(BASE_OUT, `${id}.png`);
      fs.copyFileSync(outPngPath, rootPngPath);
    }
  }
  console.log(`✔ Scheme '${scheme}' generated (21 icons)`);
}

console.log('Done! All schemes generated successfully.');
