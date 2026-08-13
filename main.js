import http from "node:http";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import chronologicalData from "./Data/chronologicalData.js";
import moviesData from "./Data/moviesData.js";
import seriesData from "./Data/seriesData.js";

const metadataCache = JSON.parse(
  readFileSync(new URL("./Data/metadataCache.json", import.meta.url), "utf8"),
);

const PAGE_SIZE = 100;
const PORT = Number.parseInt(process.env.PORT || "7000", 10);

const catalogDefinitions = [
  {
    type: "series",
    id: "marvel-series",
    name: "Marvel: Series",
    extra: [{ name: "skip", isRequired: false }],
  },
  {
    type: "movie",
    id: "marvel-movies",
    name: "Marvel: Movies",
    extra: [{ name: "skip", isRequired: false }],
  },
  {
    type: "movie",
    id: "mcu-chronological",
    name: "MCU: Movies in Timeline Order",
    extra: [{ name: "skip", isRequired: false }],
  },
];

// Film-only order derived from Marvel's published MCU timeline. Titles that are
// announced but not yet officially placed on that timeline stay out of this row.
const MCU_CHRONOLOGICAL_IMDB_IDS = [
  "tt0458339", // Captain America: The First Avenger
  "tt4154664", // Captain Marvel
  "tt0371746", // Iron Man
  "tt1228705", // Iron Man 2
  "tt0800080", // The Incredible Hulk
  "tt0800369", // Thor
  "tt0848228", // The Avengers
  "tt1981115", // Thor: The Dark World
  "tt1300854", // Iron Man 3
  "tt1843866", // Captain America: The Winter Soldier
  "tt2015381", // Guardians of the Galaxy
  "tt3896198", // Guardians of the Galaxy Vol. 2
  "tt2395427", // Avengers: Age of Ultron
  "tt0478970", // Ant-Man
  "tt3498820", // Captain America: Civil War
  "tt3480822", // Black Widow
  "tt1825683", // Black Panther
  "tt2250912", // Spider-Man: Homecoming
  "tt1211837", // Doctor Strange
  "tt3501632", // Thor: Ragnarok
  "tt5095030", // Ant-Man and the Wasp
  "tt4154756", // Avengers: Infinity War
  "tt4154796", // Avengers: Endgame
  "tt9376612", // Shang-Chi and the Legend of the Ten Rings
  "tt6320628", // Spider-Man: Far From Home
  "tt9032400", // Eternals
  "tt10872600", // Spider-Man: No Way Home
  "tt9419884", // Doctor Strange in the Multiverse of Madness
  "tt9114286", // Black Panther: Wakanda Forever
  "tt10648342", // Thor: Love and Thunder
  "tt10954600", // Ant-Man and the Wasp: Quantumania
  "tt6791350", // Guardians of the Galaxy Vol. 3
  "tt10676048", // The Marvels
  "tt6263850", // Deadpool & Wolverine
  "tt14513804", // Captain America: Brave New World
  "tt20969586", // Thunderbolts*
  "tt10676052", // The Fantastic Four: First Steps
];

const titleCorrections = new Map([
  ["tt10676052", "The Fantastic Four: First Steps"],
]);

function uniqueByImdbId(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = item.imdbId || item.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function toMeta(item, forcedType) {
  const imdbId = item.imdbId || item.id;
  const cached = metadataCache[imdbId] || {};
  const meta = {
    id: imdbId,
    type: forcedType || item.type,
    name: titleCorrections.get(imdbId) || cached.name || item.title,
    poster: cached.poster || item.poster,
    description:
      cached.description || item.description || "No description available.",
    releaseInfo: String(cached.releaseInfo || item.releaseYear || ""),
    genres: cached.genres || ["Action", "Adventure"],
  };

  if (cached.imdbRating && cached.imdbRating !== "N/A") {
    meta.imdbRating = String(cached.imdbRating);
  }

  return Object.fromEntries(
    Object.entries(meta).filter(([, value]) => value !== undefined && value !== ""),
  );
}

const catalogData = {
  "marvel-series": uniqueByImdbId(seriesData)
    .filter((item) => item.type === "series")
    .map((item) => toMeta(item, "series")),
  "marvel-movies": uniqueByImdbId(moviesData)
    .filter((item) => item.type === "movie")
    .map((item) => toMeta(item, "movie")),
  "mcu-chronological": MCU_CHRONOLOGICAL_IMDB_IDS.map((imdbId) =>
    chronologicalData.find((item) => item.imdbId === imdbId),
  )
    .filter(Boolean)
    .map((item) => toMeta(item, "movie")),
};

function buildManifest(origin) {
  return {
    id: "de.marvel.katalog",
    version: "1.1.0",
    name: "Marvel Catalog",
    description:
      "Marvel series, Marvel movies, and MCU movies in chronological timeline order.",
    logo: `${origin}/assets/icon.png`,
    background: `${origin}/assets/background.jpg`,
    resources: ["catalog"],
    types: ["movie", "series"],
    catalogs: catalogDefinitions,
    idPrefixes: ["tt"],
    behaviorHints: { configurable: false },
  };
}

function parseCatalogPath(pathname, searchParams) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "catalog" || parts.length < 3) return null;

  const type = parts[1];
  const finalPart = parts.at(-1);
  if (!finalPart.endsWith(".json")) return null;

  const id = parts.length === 3 ? finalPart.slice(0, -5) : parts[2];
  const extraPart = parts.length > 3 ? finalPart.slice(0, -5) : "";
  const extras = new URLSearchParams(extraPart ? decodeURIComponent(extraPart) : "");
  const skipValue = extras.get("skip") || searchParams.get("skip") || "0";
  const skip = Math.max(0, Number.parseInt(skipValue, 10) || 0);

  return { type, id, skip };
}

function send(res, status, body, contentType, cacheControl = "public, max-age=3600") {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": cacheControl,
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
}

function sendJson(res, status, value, cacheControl) {
  send(
    res,
    status,
    JSON.stringify(value),
    "application/json; charset=utf-8",
    cacheControl,
  );
}

function serveAsset(pathname, res) {
  const allowedAssets = new Map([
    ["/assets/icon.png", new URL("./public/assets/icon.png", import.meta.url)],
    ["/assets/background.jpg", new URL("./public/assets/background.jpg", import.meta.url)],
  ]);
  const asset = allowedAssets.get(pathname);
  if (!asset) return false;

  const mimeType = extname(fileURLToPath(asset)) === ".png" ? "image/png" : "image/jpeg";
  send(res, 200, readFileSync(asset), mimeType, "public, max-age=604800");
  return true;
}

export function createServer() {
  return http.createServer((req, res) => {
    const host = req.headers.host || `localhost:${PORT}`;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const requestUrl = new URL(req.url || "/", `${protocol}://${host}`);
    const origin = `${protocol}://${host}`;

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      });
      return res.end();
    }

    if (req.method !== "GET") {
      return sendJson(res, 405, { error: "Method not allowed" }, "no-store");
    }

    if (requestUrl.pathname === "/health") {
      return sendJson(
        res,
        200,
        {
          status: "ok",
          catalogs: Object.fromEntries(
            Object.entries(catalogData).map(([id, metas]) => [id, metas.length]),
          ),
        },
        "no-store",
      );
    }

    if (requestUrl.pathname === "/manifest.json") {
      return sendJson(res, 200, buildManifest(origin));
    }

    if (serveAsset(requestUrl.pathname, res)) return;

    if (requestUrl.pathname === "/" || requestUrl.pathname === "/configure") {
      const html = readFileSync(new URL("./public/configure.html", import.meta.url), "utf8");
      return send(res, 200, html, "text/html; charset=utf-8", "no-cache");
    }

    const catalogRequest = parseCatalogPath(requestUrl.pathname, requestUrl.searchParams);
    if (catalogRequest) {
      const definition = catalogDefinitions.find(
        ({ id, type }) => id === catalogRequest.id && type === catalogRequest.type,
      );
      if (!definition) return sendJson(res, 200, { metas: [] });

      const metas = catalogData[catalogRequest.id].slice(
        catalogRequest.skip,
        catalogRequest.skip + PAGE_SIZE,
      );
      return sendJson(res, 200, { metas });
    }

    return sendJson(res, 404, { error: "Not found" }, "no-store");
  });
}

export { buildManifest, catalogData, catalogDefinitions, parseCatalogPath };

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  createServer().listen(PORT, "0.0.0.0", () => {
    console.log(`Marvel Catalog is running at http://localhost:${PORT}`);
  });
}
