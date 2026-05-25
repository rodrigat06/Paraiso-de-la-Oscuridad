import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import playwright from "../target/svg-tools/node_modules/playwright-core/index.js";

const root = path.resolve("src/main/webapp");
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon"
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function htmlFiles() {
  return walk(root).filter((file) => {
    const relative = path.relative(root, file).replace(/\\/g, "/");
    return file.toLowerCase().endsWith(".html") && !relative.startsWith("WEB-INF/");
  });
}

function localUrl(file) {
  return path
    .relative(root, file)
    .replace(/\\/g, "/")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

function startServer() {
  const server = http.createServer((request, response) => {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/") pathname = "/index.html";

    let file = path.normalize(path.join(root, pathname));
    if (pathname.startsWith("/significados-canciones/")) {
      file = path.join(root, "WEB-INF/templates/significado.html");
    }
    if (!file.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream"
      });
      response.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(4192, () => resolve(server));
  });
}

async function main() {
  const server = await startServer();
  const browser = await playwright.chromium.launch({ executablePath: edge, headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });

  const failures = [];

  for (const file of htmlFiles()) {
    const page = await context.newPage();
    const pageErrors = [];
    const missingResources = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("response", (response) => {
      const url = response.url();
      if (response.status() >= 400 && !url.includes("/api/") && !url.includes("/auth/")) {
        missingResources.push(`${response.status()} ${url}`);
      }
    });

    const url = `http://127.0.0.1:4192/${localUrl(file)}`;

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(120);

      const overflow = await page.evaluate(
        () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
      );

      if (pageErrors.length || missingResources.length || overflow > 2) {
        failures.push({
          page: path.relative(root, file),
          pageErrors,
          missingResources: missingResources.slice(0, 8),
          overflow
        });
      }
    } catch (error) {
      failures.push({
        page: path.relative(root, file),
        error: error.message.split("\n")[0]
      });
    }

    await page.close();
  }

  const legacyMeaningUrls = [
    "significados-canciones/jazmin-bean-hades-avoidant.html",
    "significados-canciones/significado.html?id=jazmin-bean-hades-avoidant"
  ];

  for (const relativeUrl of legacyMeaningUrls) {
    const page = await context.newPage();
    const pageErrors = [];
    const missingResources = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("response", (response) => {
      const url = response.url();
      if (response.status() >= 400 && !url.includes("/api/") && !url.includes("/auth/")) {
        missingResources.push(`${response.status()} ${url}`);
      }
    });

    await page.goto(`http://127.0.0.1:4192/${relativeUrl}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });
    await page.waitForTimeout(120);

    const title = await page.locator("[data-meaning-title]").textContent();
    const overflow = await page.evaluate(
      () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
    );

    if (title !== "AVOIDANT" || pageErrors.length || missingResources.length || overflow > 2) {
      failures.push({
        page: relativeUrl,
        title,
        pageErrors,
        missingResources: missingResources.slice(0, 8),
        overflow
      });
    }

    await page.close();
  }

  await context.close();
  await browser.close();
  server.close();

  if (failures.length) {
    console.log(JSON.stringify(failures.slice(0, 80), null, 2));
    console.log(`FAILURES ${failures.length}`);
    process.exit(1);
  }

  console.log("OK: todos los HTML cargan en movil sin errores JS, sin 404 y sin desborde.");
}

main();
