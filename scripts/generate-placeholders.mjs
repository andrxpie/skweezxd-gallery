// Створює демо-роботи у public/works, якщо там ще немає жодного зображення.
// Потрібно, щоб свіжий деплой не був порожнім. Щойно ти додаси свої роботи,
// скрипт нічого не робить. Не потрібен зовсім — прибери "prebuild" з package.json.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "works");
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

async function hasRealWorks() {
  try {
    const files = await readdir(OUT);
    return files.some((name) =>
      IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()),
    );
  } catch {
    return false;
  }
}

const grain = `
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
  </filter>`;

function frame(w, h, bg, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${grain}</defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  ${body}
  <rect width="${w}" height="${h}" filter="url(#grain)"/>
</svg>`;
}

const tiles = [
  {
    name: "01-brand-identity.png",
    w: 1200,
    h: 1500,
    bg: "#0e0e12",
    accent: "#ff5227",
    body: (w, h, a) => `
      <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.3}" fill="${a}"/>
      <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.3}" fill="none" stroke="#f3f1ec" stroke-width="2" opacity="0.4" transform="translate(${w * 0.08} ${h * 0.05})"/>
      <rect x="${w * 0.12}" y="${h * 0.78}" width="${w * 0.76}" height="3" fill="#f3f1ec" opacity="0.5"/>`,
  },
  {
    name: "02-poster-series.png",
    w: 1200,
    h: 1200,
    bg: "#0b1210",
    accent: "#7cf5c4",
    body: (w, h, a) =>
      Array.from({ length: 9 }, (_, i) => {
        const x = w * 0.12 + i * (w * 0.085);
        const bh = h * (0.12 + ((i * 7) % 5) * 0.11);
        return `<rect x="${x}" y="${h * 0.78 - bh}" width="${w * 0.045}" height="${bh}" fill="${i % 3 === 0 ? a : "#f3f1ec"}" opacity="${i % 3 === 0 ? 1 : 0.28}"/>`;
      }).join(""),
  },
  {
    name: "03-editorial-layout.png",
    w: 1200,
    h: 1600,
    bg: "#12101a",
    accent: "#a78bfa",
    body: (w, h, a) => `
      <rect x="${w * 0.1}" y="${h * 0.1}" width="${w * 0.36}" height="${h * 0.34}" fill="${a}" opacity="0.9"/>
      <rect x="${w * 0.52}" y="${h * 0.1}" width="${w * 0.38}" height="${h * 0.16}" fill="#f3f1ec" opacity="0.14"/>
      <rect x="${w * 0.52}" y="${h * 0.3}" width="${w * 0.38}" height="${h * 0.14}" fill="#f3f1ec" opacity="0.08"/>
      <rect x="${w * 0.1}" y="${h * 0.52}" width="${w * 0.8}" height="${h * 0.02}" fill="#f3f1ec" opacity="0.3"/>
      <circle cx="${w * 0.7}" cy="${h * 0.74}" r="${w * 0.2}" fill="none" stroke="${a}" stroke-width="3"/>`,
  },
  {
    name: "04-packaging.png",
    w: 1600,
    h: 1200,
    bg: "#14100c",
    accent: "#f5c26b",
    body: (w, h, a) =>
      Array.from(
        { length: 7 },
        (_, i) =>
          `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${h * (0.08 + i * 0.06)}" fill="none" stroke="${i % 2 ? a : "#f3f1ec"}" stroke-width="2" opacity="${1 - i * 0.1}"/>`,
      ).join(""),
  },
  {
    name: "05-motion-frames.png",
    w: 1600,
    h: 900,
    bg: "#0c1016",
    accent: "#6aa9ff",
    body: (w, h, a) => {
      const cols = Array.from({ length: 24 }, (_, i) => {
        const x = (w / 24) * i;
        const o = Math.abs(Math.sin(i * 0.5));
        return `<rect x="${x}" y="0" width="${w / 24 - 4}" height="${h}" fill="${a}" opacity="${(o * 0.5).toFixed(2)}"/>`;
      }).join("");
      return `${cols}<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${h * 0.22}" fill="#08080a"/>`;
    },
  },
  {
    name: "06-social-kit.png",
    w: 1200,
    h: 1500,
    bg: "#130d10",
    accent: "#ff6b9d",
    body: (w, h, a) => {
      const dots = [];
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 8; c++) {
          const cx = w * 0.14 + c * (w * 0.1);
          const cy = h * 0.16 + r * (h * 0.075);
          const rad = 6 + ((r + c) % 4) * 7;
          dots.push(
            `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${(r + c) % 5 === 0 ? a : "#f3f1ec"}" opacity="${(r + c) % 5 === 0 ? 1 : 0.22}"/>`,
          );
        }
      }
      return dots.join("");
    },
  },
  {
    name: "07-typography-study.png",
    w: 1200,
    h: 1400,
    bg: "#0f1310",
    accent: "#b6f36a",
    body: (w, h, a) => `
      <path d="M ${w * 0.15} ${h * 0.8} L ${w * 0.5} ${h * 0.15} L ${w * 0.85} ${h * 0.8} Z" fill="none" stroke="${a}" stroke-width="4"/>
      <path d="M ${w * 0.28} ${h * 0.62} L ${w * 0.72} ${h * 0.62}" stroke="#f3f1ec" stroke-width="4" opacity="0.6"/>
      <circle cx="${w * 0.5}" cy="${h * 0.45}" r="${w * 0.06}" fill="${a}"/>`,
  },
  {
    name: "08-art-direction.png",
    w: 1400,
    h: 1050,
    bg: "#101014",
    accent: "#f3f1ec",
    body: (w, h, a) => `
      <rect x="0" y="${h * 0.45}" width="${w}" height="${h * 0.55}" fill="${a}" opacity="0.12"/>
      <circle cx="${w * 0.32}" cy="${h * 0.45}" r="${h * 0.26}" fill="${a}"/>
      <rect x="${w * 0.58}" y="${h * 0.2}" width="${w * 0.28}" height="${h * 0.5}" fill="#f3f1ec" opacity="0.9"/>
      <rect x="${w * 0.58}" y="${h * 0.2}" width="${w * 0.28}" height="${h * 0.5}" fill="${a}" opacity="0.35"/>`,
  },
];

if (await hasRealWorks()) {
  console.log("[works] у public/works вже є зображення — демо не створюю");
} else {
  await mkdir(OUT, { recursive: true });

  for (const tile of tiles) {
    const svg = frame(
      tile.w,
      tile.h,
      tile.bg,
      tile.body(tile.w, tile.h, tile.accent),
    );
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(path.join(OUT, tile.name), png);
  }

  console.log(`[works] створено ${tiles.length} демо-робіт у public/works`);
}
