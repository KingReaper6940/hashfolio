# Hashfolio

[Open hashfolio](https://hashfolio.vercel.app)

Keep a receipt for your files.

Hashfolio creates SHA-256 snapshots of local file batches and compares later batches against a previous snapshot. Contents are processed in your browser without uploads, accounts or analytics.

## Features

- SHA-256 using the browser's native Web Crypto API.
- Snapshot comparison: MATCH, CHANGED, MISSING and NEW.
- Inspectable JSON snapshot and full comparison report.
- Download Hashfolio JSON or standard text-mode SHA256SUMS.
- Sequential file processing, progress counts and cancellation.
- Demo files generated locally so you can explore without selecting personal files.

## Workflow

Select local files and leave the previous snapshot blank to generate hashes. Save the snapshot JSON. Later, select the corresponding files, paste that JSON, and hash again. The table compares exact filenames, byte sizes and hashes.

Missing means absent from the current selection, not proven absent from disk. Renames appear as missing plus new. Size or digest differences mark a file changed.

The demo generates three tiny files and uses an independent baseline. It shows one match, one change, one missing file and one new file.

## Run locally

Node.js 20 or newer; no dependency installation.

~~~sh
npm test
npm run build
npm run dev
~~~

Open http://127.0.0.1:4179. The browser requires Web Crypto on HTTPS or localhost. Static output is in dist/; Vercel configuration is included.

## Boundaries

Choose 1–100 files, at most 64 MiB each and 128 MiB total. Each file is read fully into memory because SubtleCrypto.digest does not stream. Files are processed sequentially. Use a desktop checksum utility for large archives. Cancellation discards pending results but cannot interrupt a digest already running inside the browser.

One flat set of unique, exact filenames is supported. No folders or paths. Names with separators, control characters or more than 255 UTF-16 units are rejected; Unicode spelling and case are preserved. Duplicate names are ambiguous and rejected.

Hashfolio accepts only its own hashfolio-v1 JSON baseline, up to 64 KiB and 100 entries. It exports SHA256SUMS but does not import that format. Snapshots record names, sizes and hashes; metadata, permissions and modification times are not hashed. JSON exports include current files only; comparison details can be inspected separately.

## Trust and privacy

Checksums are not signatures. A match is relative to the baseline you supply; anyone who can alter both files and manifest can replace both. Use a trusted baseline. Hashfolio does not verify authorship, signatures or malware safety.

The app does not persist selections or manifests. Browser memory and downloaded reports may contain private filenames, so review them before sharing. There are no external fonts, analytics scripts, paid services or network calls for file processing.

## Implementation

src/hash.mjs validates limits and hashes bytes. src/manifest.mjs validates snapshots and compares entries. Tests include published SHA256 vectors, independent Node crypto comparison, binary input, cancellation, size errors, ambiguous names and all comparison states. scripts/make-example.mjs reproduces the demo baseline.
