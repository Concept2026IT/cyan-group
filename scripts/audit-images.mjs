#!/usr/bin/env node
/**
 * Image library audit — BRIEF §10.1b.
 *
 * Read-only. Moves nothing, deletes nothing, writes one CSV.
 *
 * "A WordPress library of 600 is typically 100-180 real images plus generated
 * size variants, duplicates and legacy junk." This works out which is which.
 *
 * Zero dependencies on purpose: `sharp` is a transitive of Next and is not
 * resolvable under pnpm's strict node_modules, and hard rule 10 says ask
 * before adding a package. Dimensions are parsed straight from file headers,
 * which is all an audit needs.
 *
 * Usage:
 *   node scripts/audit-images.mjs [sourceDir] [outCsv]
 * Defaults:
 *   sourceDir = ./assets-raw
 *   outCsv    = ./assets-raw-audit.csv
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";

const SRC = process.argv[2] ?? "./assets-raw";
const OUT = process.argv[3] ?? "./assets-raw-audit.csv";

/** Long-edge floor. Below this an image cannot carry a hero or a card (§10.1b). */
const MIN_LONG_EDGE = 800;

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

/* ------------------------------------------------------------------ walking */

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

/* --------------------------------------------------------------- dimensions */

function pngSize(b) {
  // 8-byte signature, then a 13-byte IHDR whose first 8 bytes are w/h.
  if (b.length < 24) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function gifSize(b) {
  if (b.length < 10) return null;
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function jpegSize(b) {
  // Walk the segment chain to a Start-Of-Frame marker; its payload carries
  // height then width. Skipping by segment length rather than scanning for
  // 0xFFC0 avoids matching those bytes inside entropy-coded data.
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    // Standalone markers carry no length.
    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      i += 2;
      continue;
    }
    const len = b.readUInt16BE(i + 2);
    const isSOF =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSOF) {
      return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    }
    if (marker === 0xda) break; // start of scan — no SOF found
    i += 2 + len;
  }
  return null;
}

function webpSize(b) {
  if (b.length < 30) return null;
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return {
      width: b.readUInt16LE(26) & 0x3fff,
      height: b.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    const w = b[24] | (b[25] << 8) | (b[26] << 16);
    const h = b[27] | (b[28] << 8) | (b[29] << 16);
    return { width: w + 1, height: h + 1 };
  }
  return null;
}

function avifSize(b) {
  // ISOBMFF: find the image spatial extents box.
  const idx = b.indexOf("ispe", 0, "ascii");
  if (idx < 0 || idx + 12 > b.length) return null;
  return { width: b.readUInt32BE(idx + 8), height: b.readUInt32BE(idx + 12) };
}

function svgSize(b) {
  const head = b.toString("utf8", 0, Math.min(b.length, 4096));
  const viewBox = head.match(
    /viewBox\s*=\s*["']\s*[\d.-]+[ ,]+[\d.-]+[ ,]+([\d.]+)[ ,]+([\d.]+)/i,
  );
  if (viewBox) {
    return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
  }
  const w = head.match(/\bwidth\s*=\s*["']?([\d.]+)/i);
  const h = head.match(/\bheight\s*=\s*["']?([\d.]+)/i);
  if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
  return null;
}

function dimensions(buf, ext) {
  try {
    if (ext === ".png") return pngSize(buf);
    if (ext === ".gif") return gifSize(buf);
    if (ext === ".jpg" || ext === ".jpeg") return jpegSize(buf);
    if (ext === ".webp") return webpSize(buf);
    if (ext === ".avif") return avifSize(buf);
    if (ext === ".svg") return svgSize(buf);
  } catch {
    return null;
  }
  return null;
}

/* ------------------------------------------------------------------ variants */

/**
 * WordPress writes derivatives as `name-1024x768.jpg` alongside the original.
 * Stripping that suffix gives the family key. Also strips the `-scaled` and
 * `-rotated` suffixes WP adds to large uploads.
 */
const VARIANT_RE = /-(\d{2,5})x(\d{2,5})(?=\.[a-z0-9]+$|$)/i;

function familyKey(file) {
  const ext = extname(file).toLowerCase();
  let name = basename(file, extname(file));
  name = name.replace(VARIANT_RE, "");
  name = name.replace(/-(scaled|rotated)$/i, "");
  // Keep the upload month in the key: two different photos can share a slug
  // across years, and collapsing them would lose one.
  const dir = relative(SRC, file).split(sep).slice(0, -1).join("/");
  return `${dir}/${name}${ext}`;
}

/* ------------------------------------------------------------------- buckets */

const LOGO_RE =
  /(logo|icon|favicon|badge|sprite|brandmark|wordmark|cert|iso|ecovadis|bpma|trustpilot)/i;
const TEAM_RE =
  /(team|staff|portrait|headshot|people|colleague|director|founder|sian)/i;
const PRODUCT_RE =
  /(product|merch|sku|bottle|mug|pen|bag|shirt|hoodie|cap|notebook|lanyard|apparel|clothing|garment|hamper|gift)/i;
const CONTEXT_RE =
  /(press|print|factory|warehouse|production|office|event|exhibition|conference|hero|banner|featured|lifestyle|workspace)/i;

/**
 * Review flags. These are not verdicts — the script does not discard on them,
 * because each needs a human to confirm. They exist because mechanical
 * dedup alone leaves far too much: this export has no generated size variants
 * to strip, so the reduction to a usable set is editorial, and these are the
 * signals worth sorting on.
 *
 * `stock` matters most: §10.1b flags rights as a pre-launch blocker, and
 * stock filenames are the clearest evidence of third-party licensing.
 */
const FLAG_RULES = [
  ["stock", /unsplash|pexels|shutterstock|istock|getty|freepik|adobestock/i],
  ["placeholder", /placeholder|lorem|dummy|test-?image/i],
  ["wallpaper", /wallpaper|abstract|digital-art|texture|background-\d/i],
  ["blog-featured", /-featured\.[a-z0-9]+$/i],
  ["screenshot", /screen ?shot|screencap|capture-\d/i],
  ["unnamed", /^\d+\.[a-z0-9]+$/i],
];

function reviewFlags(name) {
  return FLAG_RULES.filter(([, re]) => re.test(name))
    .map(([label]) => label)
    .join(" ");
}

/**
 * A suggestion, not a decision. §10.1b is explicit that selective-cyan
 * curation is a design task — a human decides what gets isolated. This just
 * sorts the pile so that judgement starts from something ordered.
 */
function suggestBucket({ name, width, height, ext }) {
  if (ext === ".svg") return "logo";
  const ratio = width && height ? width / height : 1;
  if (LOGO_RE.test(name)) return "logo";
  if (TEAM_RE.test(name)) return "team";
  if (PRODUCT_RE.test(name)) return "product";
  if (CONTEXT_RE.test(name)) return "contextual";
  // Wide landscape at size reads as contextual/hero; near-square reads as product.
  if (ratio >= 1.6) return "contextual";
  if (ratio >= 0.8 && ratio <= 1.25) return "product";
  return "contextual";
}

/* ---------------------------------------------------------------------- main */

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function main() {
  let files;
  try {
    files = walk(SRC);
  } catch (error) {
    console.error(`Cannot read ${SRC}: ${error.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No images found under ${SRC}`);
    process.exit(1);
  }

  console.log(`Scanning ${files.length} files under ${SRC}…`);

  const records = files.map((file) => {
    const buf = readFileSync(file);
    const ext = extname(file).toLowerCase();
    const dim = dimensions(buf, ext) ?? { width: 0, height: 0 };
    return {
      file,
      rel: relative(SRC, file).split(sep).join("/"),
      name: basename(file),
      ext,
      bytes: statSync(file).size,
      width: dim.width,
      height: dim.height,
      longEdge: Math.max(dim.width, dim.height),
      hash: createHash("sha256").update(buf).digest("hex"),
      isVariantName: VARIANT_RE.test(basename(file, extname(file))),
      family: familyKey(file),
      verdict: "keep",
      reason: "",
    };
  });

  // 1. Exact duplicates — first by path order wins, rest are dropped.
  const seenHash = new Map();
  for (const r of records) {
    const prior = seenHash.get(r.hash);
    if (prior) {
      r.verdict = "discard";
      r.reason = `duplicate of ${prior.rel}`;
    } else {
      seenHash.set(r.hash, r);
    }
  }

  // 2. Generated size variants — keep only the largest of each family.
  const families = new Map();
  for (const r of records) {
    if (r.verdict === "discard") continue;
    const group = families.get(r.family) ?? [];
    group.push(r);
    families.set(r.family, group);
  }
  for (const [, group] of families) {
    if (group.length < 2) continue;
    const largest = group.reduce((a, b) =>
      b.width * b.height > a.width * a.height ? b : a,
    );
    for (const r of group) {
      if (r !== largest) {
        r.verdict = "discard";
        r.reason = `size variant of ${largest.name}`;
      }
    }
  }

  // 3. Too small to use.
  for (const r of records) {
    if (r.verdict === "discard") continue;
    if (r.ext === ".svg") continue; // vector — resolution independent
    if (r.longEdge === 0) {
      r.verdict = "discard";
      r.reason = "unreadable dimensions";
    } else if (r.longEdge < MIN_LONG_EDGE) {
      r.verdict = "discard";
      r.reason = `long edge ${r.longEdge}px < ${MIN_LONG_EDGE}px`;
    }
  }

  // 4. Bucket the survivors and attach review flags.
  for (const r of records) {
    r.bucket = r.verdict === "discard" ? "discard" : suggestBucket(r);
    r.flags = r.verdict === "keep" ? reviewFlags(r.name) : "";
  }

  const survivors = records.filter((r) => r.verdict === "keep");

  /* ---- CSV ---- */
  const header = [
    "filename",
    "path",
    "width",
    "height",
    "long_edge",
    "aspect_ratio",
    "format",
    "bytes",
    "kb",
    "suggested_bucket",
    "review_flags",
    "verdict",
    "reason",
    "hash",
  ];
  const rows = records
    .slice()
    .sort(
      (a, b) =>
        a.bucket.localeCompare(b.bucket) ||
        b.width * b.height - a.width * a.height,
    )
    .map((r) =>
      [
        r.name,
        r.rel,
        r.width || "",
        r.height || "",
        r.longEdge || "",
        r.width && r.height ? (r.width / r.height).toFixed(2) : "",
        r.ext.replace(".", ""),
        r.bytes,
        Math.round(r.bytes / 1024),
        r.bucket,
        r.flags,
        r.verdict,
        r.reason,
        r.hash.slice(0, 12),
      ]
        .map(csvCell)
        .join(","),
    );
  writeFileSync(OUT, [header.join(","), ...rows].join("\n") + "\n", "utf8");

  /* ---- report ---- */
  const count = (fn) => records.filter(fn).length;
  const sumBytes = (list) => list.reduce((n, r) => n + r.bytes, 0);
  const mb = (n) => (n / 1024 / 1024).toFixed(1);

  const byBucket = {};
  for (const r of survivors) byBucket[r.bucket] = (byBucket[r.bucket] ?? 0) + 1;

  const byFormat = {};
  for (const r of survivors) byFormat[r.ext] = (byFormat[r.ext] ?? 0) + 1;

  const ratioBand = (r) => {
    const v = r.width / r.height;
    if (v >= 2.2) return "ultrawide  (≥2.2)";
    if (v >= 1.6) return "landscape  (1.6–2.2)";
    if (v >= 1.25) return "landscape  (1.25–1.6)";
    if (v >= 0.8) return "square-ish (0.8–1.25)";
    return "portrait   (<0.8)";
  };
  const byRatio = {};
  for (const r of survivors) {
    if (!r.width || !r.height) continue;
    const band = ratioBand(r);
    byRatio[band] = (byRatio[band] ?? 0) + 1;
  }

  const line = "─".repeat(58);
  console.log(`\n${line}`);
  console.log("IMAGE LIBRARY AUDIT — BRIEF §10.1b");
  console.log(line);
  console.log(
    `Scanned                ${records.length} files (${mb(sumBytes(records))} MB)`,
  );
  console.log(
    `  size variants        ${count((r) => r.reason.startsWith("size variant"))}`,
  );
  console.log(
    `  exact duplicates     ${count((r) => r.reason.startsWith("duplicate"))}`,
  );
  console.log(
    `  under ${MIN_LONG_EDGE}px          ${count((r) => r.reason.startsWith("long edge"))}`,
  );
  console.log(
    `  unreadable           ${count((r) => r.reason === "unreadable dimensions")}`,
  );
  console.log(line);
  console.log(
    `SURVIVORS              ${survivors.length} files (${mb(sumBytes(survivors))} MB)`,
  );
  console.log(line);

  console.log(
    "\nSuggested buckets (review these — §10.1b calls curation a design task):",
  );
  for (const [k, v] of Object.entries(byBucket).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(12)} ${String(v).padStart(4)}`);
  }

  console.log("\nBy format:");
  for (const [k, v] of Object.entries(byFormat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(12)} ${String(v).padStart(4)}`);
  }

  console.log("\nBy aspect ratio:");
  for (const [k, v] of Object.entries(byRatio).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(22)} ${String(v).padStart(4)}`);
  }

  const flagged = survivors.filter((r) => r.flags);
  if (flagged.length) {
    console.log("\nReview flags (not discarded — these need a human):");
    const tally = {};
    for (const r of flagged)
      for (const f of r.flags.split(" ")) tally[f] = (tally[f] ?? 0) + 1;
    for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${k.padEnd(14)} ${String(v).padStart(4)}`);
    }
    console.log(
      `  ${"—".padEnd(14)} ${String(flagged.length).padStart(4)} flagged, ` +
        `${survivors.length - flagged.length} unflagged`,
    );
  }

  console.log(`\nCSV written to ${OUT}`);
  console.log("Nothing was moved or deleted.\n");
}

main();
