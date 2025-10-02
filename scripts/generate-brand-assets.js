const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const COLORS = {
  blue: '#6A8DFF',
  mint: '#8AD1C2',
  halo: 'rgba(255, 255, 255, 0.55)',
  dotLight: '#F8FAFC',
  dotDark: '#0F172A',
  darkSurface: '#0F172A',
  lightSurface: '#F8FAFC',
};

const ICON_SIZE = 1024;
const ADAPTIVE_SIZE = 1024;
const SPLASH_WIDTH = 2048;
const SPLASH_HEIGHT = 4096;

const createIconSvg = ({ background }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.blue}" />
      <stop offset="100%" stop-color="${COLORS.mint}" />
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
      <stop offset="65%" stop-color="rgba(255,255,255,0.2)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${ICON_SIZE}" height="${ICON_SIZE}" rx="220" fill="url(#grad)" />
  <circle cx="${ICON_SIZE / 2}" cy="${ICON_SIZE / 2}" r="${ICON_SIZE * 0.32}" fill="url(#halo)" />
  <circle cx="${ICON_SIZE / 2}" cy="${ICON_SIZE / 2}" r="${ICON_SIZE * 0.07}" fill="${background}" />
</svg>`;

const createSplashSvg = ({ theme }) => {
  const isDark = theme === 'dark';
  const bg = isDark ? COLORS.darkSurface : COLORS.lightSurface;
  const dot = isDark ? COLORS.mint : COLORS.dotDark;
  const haloColorStart = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)';
  const haloColorEnd = isDark ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0)';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SPLASH_WIDTH}" height="${SPLASH_HEIGHT}" viewBox="0 0 ${SPLASH_WIDTH} ${SPLASH_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad${theme}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.blue}" stop-opacity="${isDark ? 0.9 : 0.7}" />
      <stop offset="100%" stop-color="${COLORS.mint}" stop-opacity="${isDark ? 0.85 : 0.75}" />
    </linearGradient>
    <radialGradient id="halo${theme}" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="${haloColorStart}" />
      <stop offset="100%" stop-color="${haloColorEnd}" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}" />
  <rect x="${SPLASH_WIDTH * 0.15}" y="${SPLASH_HEIGHT * 0.2}" width="${SPLASH_WIDTH * 0.7}" height="${SPLASH_WIDTH * 0.7}" rx="${SPLASH_WIDTH * 0.17}" fill="url(#bgGrad${theme})" />
  <circle cx="${SPLASH_WIDTH / 2}" cy="${SPLASH_HEIGHT / 2}" r="${SPLASH_WIDTH * 0.32}" fill="url(#halo${theme})" />
  <circle cx="${SPLASH_WIDTH / 2}" cy="${SPLASH_HEIGHT / 2}" r="${SPLASH_WIDTH * 0.08}" fill="${dot}" />
</svg>`;
};

async function generate() {
  const tasks = [
    { svg: createIconSvg({ background: COLORS.dotLight }), out: 'icon.png' },
    { svg: createIconSvg({ background: COLORS.lightSurface }), out: 'adaptive-icon.png' },
    { svg: createSplashSvg({ theme: 'light' }), out: 'splash-light.png' },
    { svg: createSplashSvg({ theme: 'dark' }), out: 'splash-dark.png' },
  ];

  for (const task of tasks) {
    const svgBuffer = Buffer.from(task.svg);
    await sharp(svgBuffer).png().toFile(path.join(assetsDir, task.out));
    console.log(`Generated ${task.out}`);
  }
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
