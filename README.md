# Marvel Catalog for Stremio

A lightweight Stremio catalog add-on with exactly three rows:

- **Marvel: Series** – live-action Marvel series
- **Marvel: Movies** – Marvel movies in release order
- **MCU: Movies in Timeline Order** – MCU theatrical movies following Marvel's official Disney+ timeline; upcoming films without an official placement and TV specials are excluded

This add-on provides **no streams**. All entries use IMDb IDs so installed metadata and streaming add-ons can resolve them.

## Install

Open [marvelstremio.onrender.com](https://marvelstremio.onrender.com) and select **Install in Stremio**. Alternatively, add this manifest URL directly in Stremio:

```text
https://marvelstremio.onrender.com/manifest.json
```

The free Render instance may take up to a minute to wake up after a period of inactivity.

## Run locally

Requirement: Node.js 20 or newer.

```bash
npm start
```

Then open `http://localhost:7000` in your browser and select **Install in Stremio**. Alternatively, add this manifest URL to Stremio:

```text
http://localhost:7000/manifest.json
```

A locally running add-on is only available while the computer and process are running. For permanent use, deploy the folder to a Node.js host with HTTPS. The start command is `npm start`; the host must be allowed to set the `PORT` environment variable.

## Test

```bash
npm test
```

## Endpoints

- `/manifest.json` – Stremio manifest
- `/catalog/series/marvel-series.json` – series
- `/catalog/movie/marvel-movies.json` – movies
- `/catalog/movie/mcu-chronological.json` – MCU movies in timeline order
- `/health` – service status and item counts

## Catalog data

The curated title lists, metadata, and artwork are based on [joaogonp/addon-marvel](https://github.com/joaogonp/addon-marvel), Copyright © 2025 joaogonp. The original license terms are included in `LICENSE`. The server, routing, media-type mapping, installation page, and tests were rebuilt for this version.

Marvel, its character names, and related trademarks belong to their respective owners. This fan project is not affiliated with Marvel Entertainment or Disney.

## Basis for the timeline order

The movie list is derived from Marvel's official **MCU Complete Timeline**, with series, seasons, One-Shots, and TV specials filtered out. `Spider-Man: No Way Home` is missing from some Disney+ lists for distribution reasons, so it is placed between `Eternals` and `Doctor Strange in the Multiverse of Madness`. Marvel explicitly confirms that `No Way Home` takes place before `Multiverse of Madness`.

`The Fantastic Four: First Steps` takes place in an alternate retrofuturistic universe. It nevertheless appears at the end of the catalog because Marvel and Disney+ place it there in the overall MCU viewing order. This catalog is therefore a **chronological viewing order**, not a single shared calendar across every parallel universe.

Sources:

- [Marvel: See the Complete MCU Timeline on Disney+](https://www.marvel.com/articles/movies/mcu-timeline-order-disney-plus)
- [Marvel: Kevin Feige Connects Multiverse of Madness to Loki & No Way Home](https://www.marvel.com/articles/movies/doctor-strange-in-the-multiverse-of-madness-loki-spider-man-no-way-home-kevin-feige-connects)
