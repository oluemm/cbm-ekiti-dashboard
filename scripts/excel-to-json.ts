/**
 * Excel → JSON Conversion Script
 *
 * Reads the Excel files from /Users/oluemm/Documents/CBM Data/
 * and outputs structured JSON files into public/data/
 *
 * Usage:
 *   npm run convert-data
 *
 * Prerequisites:
 *   npm install xlsx (already in devDependencies)
 */

import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../');
const OUT_DIR = path.resolve(__dirname, '../public/data');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function readExcel(filename: string): XLSX.WorkBook {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠ File not found: ${filepath}`);
    throw new Error(`File not found: ${filename}`);
  }
  console.log(`📖 Reading: ${filename}`);
  return XLSX.readFile(filepath);
}

function sheetToJson<T = Record<string, unknown>>(
  wb: XLSX.WorkBook,
  sheetName?: string
): T[] {
  const name = sheetName ?? wb.SheetNames[0];
  const sheet = wb.Sheets[name];
  if (!sheet) {
    console.warn(`⚠ Sheet "${name}" not found in workbook`);
    return [];
  }
  return XLSX.utils.sheet_to_json<T>(sheet);
}

function writeJson(filename: string, data: unknown): void {
  const filepath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✅ Written: ${filepath}`);
}

// ─── Main ────────────────────────────────────────────

function main() {
  console.log('🚀 Starting Excel → JSON conversion\n');
  console.log(`📂 Source: ${DATA_DIR}`);
  console.log(`📂 Output: ${OUT_DIR}\n`);

  // List available files
  const files = fs.readdirSync(DATA_DIR).filter((f: string) => f.endsWith('.xls') || f.endsWith('.xlsx'));
  console.log('Available files:');
  files.forEach((f: string) => console.log(`  - ${f}`));
  console.log();

  // ── 1. 2018 Guber Result ──
  try {
    const wb2018 = readExcel('2018 GUBER RESULT.xlsx');
    console.log(`   Sheets: ${wb2018.SheetNames.join(', ')}`);
    const raw2018 = sheetToJson(wb2018);
    console.log(`   Rows: ${raw2018.length}`);
    writeJson('raw-results-2018.json', raw2018);
  } catch (e) {
    console.error('Could not process 2018 GUBER RESULT:', e);
  }

  // ── 2. 2022 Guber Result ──
  try {
    const wb2022 = readExcel('2022 GUBER RESULT.xlsx');
    console.log(`   Sheets: ${wb2022.SheetNames.join(', ')}`);
    const raw2022 = sheetToJson(wb2022);
    console.log(`   Rows: ${raw2022.length}`);
    writeJson('raw-results-2022.json', raw2022);
  } catch (e) {
    console.error('Could not process 2022 GUBER RESULT:', e);
  }

  // ── 3. Election Cycle Comparison ──
  try {
    const wbCycle = readExcel('2018 & 2022 Election Cycle Comparison VS PVC Collected.xls');
    console.log(`   Sheets: ${wbCycle.SheetNames.join(', ')}`);
    wbCycle.SheetNames.forEach((name) => {
      const data = sheetToJson(wbCycle, name);
      console.log(`   Sheet "${name}": ${data.length} rows`);
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      writeJson(`raw-cycle-${safeName}.json`, data);
    });
  } catch (e) {
    console.error('Could not process cycle comparison:', e);
  }

  // ── 4. Logistics Analysis ──
  try {
    const wbLog = readExcel('Ekiti Guber Logistics Analysis (ELECTION DAY SPENDING AND ANALYSIS).xlsx');
    console.log(`   Sheets: ${wbLog.SheetNames.join(', ')}`);
    wbLog.SheetNames.forEach((name) => {
      const data = sheetToJson(wbLog, name);
      console.log(`   Sheet "${name}": ${data.length} rows`);
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      writeJson(`raw-logistics-${safeName}.json`, data);
    });
  } catch (e) {
    console.error('Could not process logistics:', e);
  }

  // ── 5. Polling Units with Voting Points ──
  try {
    const wbPU = readExcel('Ekiti Polling Units with New Created Voting Points.xlsx');
    console.log(`   Sheets: ${wbPU.SheetNames.join(', ')}`);
    const rawPU = sheetToJson(wbPU);
    console.log(`   Rows: ${rawPU.length}`);
    writeJson('raw-polling-units.json', rawPU);
  } catch (e) {
    console.error('Could not process polling units:', e);
  }

  // ── 6. Election Cycle Analysis & Resource Mapping ──
  try {
    const wbRes = readExcel('Election Cycle Analysis and RESOURCE MAPPING.xlsx');
    console.log(`   Sheets: ${wbRes.SheetNames.join(', ')}`);
    wbRes.SheetNames.forEach((name) => {
      const data = sheetToJson(wbRes, name);
      console.log(`   Sheet "${name}": ${data.length} rows`);
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      writeJson(`raw-resource-${safeName}.json`, data);
    });
  } catch (e) {
    console.error('Could not process resource mapping:', e);
  }

  // ── 7. INEC Final Registered Voters ──
  try {
    const wbReg = readExcel('CleanedPVCCollectionSheet.xlsx');
    console.log(`   Sheets: ${wbReg.SheetNames.join(', ')}`);
    const rawRows = sheetToJson<Record<string, unknown>>(wbReg);
    console.log(`   Raw rows: ${rawRows.length}`);

    // Map to a clean structure
    const pollingUnits = rawRows
      .filter((row) => row['LGA'] != null)
      .map((row) => ({
        lga: String(row['LGA'] ?? '').trim(),
        ra: String(row['RA NAME'] ?? '').trim(),
        pu: String(row['PU NAME'] ?? '').trim(),
        puCode: String(row['PU CODE'] ?? '').trim(),
        totalPVCCollected: String(row['TOTA PVC COLLECTED'] ?? '').trim(),
        totalPVCLeft: String(row['PVC BALANCE'] ?? '').trim(),
        delimitation: String(row['DELIMITATION'] ?? '').trim(),
        registeredVoters: Number(row['REGD VOTERS'] ?? row['REGD\nVOTERS'] ?? row['REGD\r\nVOTERS'] ?? 0),
      }));

    console.log(`   Cleaned polling units: ${pollingUnits.length}`);
    writeJson('polling-units.json', pollingUnits);
  } catch (e) {
    console.error('Could not process INEC registered voters:', e);
  }

  console.log('\n✨ Conversion complete!');
  console.log(
    '\nNext step: Review the raw-*.json files, then map them into the structured\n' +
    'JSON format expected by the dashboard (overview.json, results-2018.json, etc.).\n' +
    'You can either update this script to do the mapping automatically, or\n' +
    'manually adjust the public/data/*.json files.'
  );
}

main();
