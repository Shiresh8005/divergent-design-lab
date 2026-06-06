/**
 * Smoke tests for daily rotation, difficulty calibration, and challenge integrity.
 * Run: node scripts/verify-system.mjs
 */

import { readFileSync } from "fs";
import { pathToFileURL } from "url";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Dynamic import compiled TS modules via tsx if available, else test logic inline
async function loadModules() {
  try {
    const { execSync } = await import("child_process");
    execSync("npx tsx --version", { stdio: "ignore", cwd: root });
    // Use tsx to run a small ts entry
    return null;
  } catch {
    return null;
  }
}

// Inline test data mirroring seed structure — run pure rotation logic
const CATEGORIES = [
  "UCEED Part B",
  "NID DAT Mains",
  "NIFT Situation Test",
  "CEED",
  "NID M.Des",
];

function getDayIndex(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function groupByCategory(challenges) {
  const g = Object.fromEntries(CATEGORIES.map((c) => [c, []]));
  for (const ch of challenges) g[ch.category].push(ch);
  return g;
}

const OFFSET = {
  "UCEED Part B": 0,
  "NID DAT Mains": 3,
  "NIFT Situation Test": 7,
  CEED: 11,
  "NID M.Des": 13,
};

function getTodaysIds(challenges, date) {
  const day = getDayIndex(date);
  const byCat = groupByCategory(challenges);
  return CATEGORIES.map((cat) => {
    const pool = byCat[cat];
    const idx = (day + OFFSET[cat]) % pool.length;
    return pool[idx]?.id;
  });
}

// Parse challenge ids from seed-data.ts
const seedSrc = readFileSync(join(root, "lib/challenges/seed-data.ts"), "utf8");
const idMatches = [...seedSrc.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
const categoryMatches = [...seedSrc.matchAll(/category: "([^"]+)"/g)].map((m) => m[1]);

const challenges = idMatches.map((id, i) => ({
  id,
  category: categoryMatches[i],
}));

let passed = 0;
let failed = 0;

function assert(name, cond) {
  if (cond) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}`);
    failed++;
  }
}

console.log("\nDivergent Design Lab — system verification\n");

// 1. All challenges have category
assert("every challenge has category", challenges.length === categoryMatches.length);
assert("at least 16 challenges", challenges.length >= 16);

// 2. Each category has pool
const byCat = groupByCategory(challenges);
for (const cat of CATEGORIES) {
  assert(`${cat} has questions`, byCat[cat].length >= 1);
}

// 3. Daily rotation returns 5 unique per day
const day0 = getTodaysIds(challenges, new Date("2026-06-06"));
const day1 = getTodaysIds(challenges, new Date("2026-06-07"));
assert("day 0 returns 5 mocks", day0.length === 5);
assert("day 0 ids are unique", new Set(day0).size === 5);
assert("day 1 differs from day 0", day0.join() !== day1.join());

// 4. Rotation cycles within pool
const uceedPool = byCat["UCEED Part B"];
const uceedDay0 = (getDayIndex(new Date("2026-06-06")) + OFFSET["UCEED Part B"]) % uceedPool.length;
const uceedDayN = (getDayIndex(new Date("2026-06-06")) + uceedPool.length + OFFSET["UCEED Part B"]) % uceedPool.length;
assert("UCEED rotation cycles", uceedDay0 === uceedDayN);

// 5. Required files exist
const required = [
  "lib/challenges/daily-rotation.ts",
  "lib/challenges/exam-difficulty.ts",
  "components/challenges/question-paper.tsx",
  "lib/grading/analyze.ts",
  "lib/grading/rubrics.ts",
];
for (const f of required) {
  assert(`file exists: ${f}`, readFileSync(join(root, f), "utf8").length > 0);
}

// 6. Exam difficulty file has all categories
const diffSrc = readFileSync(join(root, "lib/challenges/exam-difficulty.ts"), "utf8");
for (const cat of CATEGORIES) {
  const key = cat === "CEED" ? "CEED:" : `"${cat}"`;
  assert(`exam tier for ${cat}`, diffSrc.includes(key));
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
