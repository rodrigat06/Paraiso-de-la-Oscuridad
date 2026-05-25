import playwright from "../target/svg-tools/node_modules/playwright-core/index.js";
import fs from "node:fs/promises";
import path from "node:path";

const { chromium } = playwright;
const root = process.cwd();
const webapp = path.join(root, "src", "main", "webapp");
const outDir = path.join(root, "entregables", "bocetos-svg");
const baseUrl = "https://paraiso-de-la-oscuridad-production.up.railway.app/";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const viewports = [
  { name: "PC", width: 1366, height: 768, scale: 0.23 },
  { name: "Tablet", width: 768, height: 1024, scale: 0.23 },
  { name: "Movil", width: 390, height: 844, scale: 0.32 },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

async function listHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listHtml(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function pageUrl(file) {
  const rel = path.relative(webapp, file).replaceAll(path.sep, "/");
  return new URL(encodeURI(rel), baseUrl).toString();
}

function pageTitle(file) {
  return path.relative(webapp, file).replaceAll(path.sep, "/");
}

async function capture(page, url, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(900);
  const image = await page.screenshot({
    type: "jpeg",
    quality: 72,
    fullPage: false,
  });
  return `data:image/jpeg;base64,${image.toString("base64")}`;
}

function renderSheet(sheetPages, sheetIndex) {
  const margin = 36;
  const gap = 28;
  const titleH = 74;
  const rowH = 365;
  const width = 1140;
  const height = titleH + margin + rowH * sheetPages.length;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#13020a"/>`,
    `<text x="${margin}" y="44" fill="#ff6ca8" font-family="Arial, sans-serif" font-size="24" font-weight="700">Paraíso de la Oscuridad - Bocetos SVG responsive ${sheetIndex}</text>`,
    `<text x="${margin}" y="66" fill="#67d9ff" font-family="Arial, sans-serif" font-size="13">Capturas fieles para importar como referencia en Figma: PC, tablet y móvil.</text>`,
  ];

  sheetPages.forEach((item, row) => {
    const y = titleH + row * rowH + 12;
    parts.push(`<g transform="translate(${margin}, ${y})">`);
    parts.push(`<text x="0" y="0" fill="#ffffff" font-family="Arial, sans-serif" font-size="15" font-weight="700">${escapeXml(item.title)}</text>`);
    let x = 0;
    item.shots.forEach((shot, index) => {
      const vp = viewports[index];
      const w = Math.round(vp.width * vp.scale);
      const h = Math.round(vp.height * vp.scale);
      parts.push(`<g transform="translate(${x}, 18)">`);
      parts.push(`<rect x="-4" y="-4" width="${w + 8}" height="${h + 34}" rx="6" fill="#210614" stroke="#ff4f93" stroke-width="2"/>`);
      parts.push(`<text x="0" y="14" fill="#67d9ff" font-family="Arial, sans-serif" font-size="12">${vp.name} ${vp.width}x${vp.height}</text>`);
      parts.push(`<image x="0" y="24" width="${w}" height="${h}" href="${shot}"/>`);
      parts.push(`</g>`);
      x += w + gap;
    });
    parts.push(`</g>`);
  });

  parts.push("</svg>");
  return parts.join("\n");
}

function renderIndex(sheets) {
  const width = 900;
  const rowH = 34;
  const height = 90 + sheets.length * rowH;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#13020a"/>`,
    `<text x="32" y="42" fill="#ff6ca8" font-family="Arial, sans-serif" font-size="26" font-weight="700">Índice de bocetos SVG</text>`,
    `<text x="32" y="66" fill="#67d9ff" font-family="Arial, sans-serif" font-size="14">Abre cada lámina SVG para ver PC, tablet y móvil.</text>`,
  ];
  sheets.forEach((sheet, i) => {
    const y = 104 + i * rowH;
    parts.push(`<a href="${escapeXml(sheet)}"><text x="32" y="${y}" fill="#ffffff" font-family="Arial, sans-serif" font-size="16">${escapeXml(sheet)}</text></a>`);
  });
  parts.push("</svg>");
  return parts.join("\n");
}

await fs.mkdir(outDir, { recursive: true });
const files = (await listHtml(webapp)).sort((a, b) => pageTitle(a).localeCompare(pageTitle(b), "es"));

const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const page = await browser.newPage();
const pages = [];

for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  const title = pageTitle(file);
  const url = pageUrl(file);
  console.log(`[${i + 1}/${files.length}] ${title}`);
  const shots = [];
  for (const viewport of viewports) {
    try {
      shots.push(await capture(page, url, viewport));
    } catch (error) {
      const message = escapeXml(error.message || String(error));
      const fallback = `<svg xmlns='http://www.w3.org/2000/svg' width='${viewport.width}' height='${viewport.height}'><rect width='100%' height='100%' fill='#17020a'/><text x='24' y='48' fill='#ff6ca8' font-family='Arial' font-size='24'>No se pudo capturar</text><text x='24' y='86' fill='#ffffff' font-family='Arial' font-size='16'>${message}</text></svg>`;
      shots.push(`data:image/svg+xml;base64,${Buffer.from(fallback).toString("base64")}`);
    }
  }
  pages.push({ title, shots });
}

await browser.close();

const sheets = [];
const perSheet = 8;
for (let i = 0; i < pages.length; i += perSheet) {
  const sheetIndex = String(Math.floor(i / perSheet) + 1).padStart(2, "0");
  const name = `boceto-responsive-${sheetIndex}.svg`;
  await fs.writeFile(path.join(outDir, name), renderSheet(pages.slice(i, i + perSheet), sheetIndex), "utf8");
  sheets.push(name);
}

await fs.writeFile(path.join(outDir, "index.svg"), renderIndex(sheets), "utf8");
await fs.writeFile(path.join(outDir, "paginas.txt"), pages.map((p) => p.title).join("\n"), "utf8");

console.log(`Listo: ${sheets.length} laminas en ${outDir}`);
