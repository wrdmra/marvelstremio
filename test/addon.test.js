import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import {
  buildManifest,
  catalogData,
  createServer,
  parseCatalogPath,
} from "../main.js";

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("Manifest definiert genau die drei gewünschten Kataloge", () => {
  const manifest = buildManifest("https://example.test");
  assert.deepEqual(
    manifest.catalogs.map(({ type, id }) => ({ type, id })),
    [
      { type: "series", id: "marvel-series" },
      { type: "movie", id: "marvel-movies" },
      { type: "movie", id: "mcu-chronological" },
    ],
  );
  assert.deepEqual(manifest.resources, ["catalog"]);
});

test("Alle Katalogeinträge haben passende Typen und IMDb-IDs", () => {
  for (const meta of catalogData["marvel-series"]) {
    assert.equal(meta.type, "series");
    assert.match(meta.id, /^tt\d+$/);
  }
  for (const catalogId of ["marvel-movies", "mcu-chronological"]) {
    for (const meta of catalogData[catalogId]) {
      assert.equal(meta.type, "movie");
      assert.match(meta.id, /^tt\d+$/);
    }
  }
});

test("Die chronologische MCU-Reihe beginnt in Handlungsreihenfolge", () => {
  assert.deepEqual(
    catalogData["mcu-chronological"].slice(0, 3).map(({ name }) => name),
    ["Captain America: The First Avenger", "Captain Marvel", "Iron Man"],
  );
  assert.deepEqual(
    catalogData["mcu-chronological"].slice(-3).map(({ name }) => name),
    [
      "Captain America: Brave New World",
      "Thunderbolts*",
      "The Fantastic Four: First Steps",
    ],
  );
  assert.ok(
    !catalogData["mcu-chronological"].some(({ name }) =>
      ["Werewolf by Night", "The Guardians of the Galaxy Holiday Special"].includes(name),
    ),
  );
  const phaseFourNames = catalogData["mcu-chronological"]
    .slice(23, 28)
    .map(({ name }) => name);
  assert.deepEqual(phaseFourNames, [
    "Shang-Chi and the Legend of the Ten Rings",
    "Spider-Man: Far From Home",
    "Eternals",
    "Spider-Man: No Way Home",
    "Doctor Strange in the Multiverse of Madness",
  ]);
});

test("Stremio-Skip-Parameter wird aus dem Pfad gelesen", () => {
  const parsed = parseCatalogPath(
    "/catalog/movie/marvel-movies/skip%3D100.json",
    new URLSearchParams(),
  );
  assert.deepEqual(parsed, { type: "movie", id: "marvel-movies", skip: 100 });
});

test("HTTP-Endpunkte liefern Manifest, Katalog und CORS", async () => {
  const manifestResponse = await fetch(`${baseUrl}/manifest.json`);
  assert.equal(manifestResponse.status, 200);
  assert.equal(manifestResponse.headers.get("access-control-allow-origin"), "*");
  assert.equal((await manifestResponse.json()).catalogs.length, 3);

  const catalogResponse = await fetch(
    `${baseUrl}/catalog/movie/mcu-chronological.json`,
  );
  assert.equal(catalogResponse.status, 200);
  const catalog = await catalogResponse.json();
  assert.ok(catalog.metas.length > 20);
  assert.ok(catalog.metas.every((meta) => meta.type === "movie"));

  const secondPageResponse = await fetch(
    `${baseUrl}/catalog/movie/marvel-movies/skip%3D100.json`,
  );
  const secondPage = await secondPageResponse.json();
  assert.equal(secondPage.metas.length, catalogData["marvel-movies"].length - 100);
  assert.equal(secondPage.metas[0].id, catalogData["marvel-movies"][100].id);
});
