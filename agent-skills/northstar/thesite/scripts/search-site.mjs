#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const REPO = "/Users/ender/code/north-star-donors";
const LIMIT_UI = 30;
const LIMIT_DB = 30;
const STOP = new Set(["the", "a", "an", "on", "of", "for", "with", "that", "this", "to", "in", "and", "or"]);

const TABLES = [
  { table: "tasks", surface: "home dashboard tasks", cols: ["title", "notes", "assigned_to", "status"] },
  { table: "initiatives", surface: "home dashboard initiatives", cols: ["title", "description", "owner", "status"] },
  { table: "lists", surface: "Lists page", cols: ["name"] },
  { table: "content_calendar", surface: "Content Calendar page", cols: ["title", "channel", "status", "notes"] },
  { table: "outreach_entries", surface: "Outreach page", cols: ["title", "area", "notes", "status"] },
  { table: "coordination_items", surface: "Coordination page", cols: ["title", "description", "status", "notes"] },
  { table: "data_email", surface: "Data page email feed", cols: ["campaign_name", "platform", "notes"] },
  { table: "data_social", surface: "Data page social feed", cols: ["post_text", "platform", "notes"] },
  { table: "data_events", surface: "Data page events feed", cols: ["event_name", "notes", "status"] },
  { table: "data_feedback", surface: "Data page feedback feed", cols: ["source", "feedback", "notes"] },
  { table: "data_wix_forms", surface: "Data page Wix forms", cols: ["title", "form_name", "status", "internal_notes"] },
  { table: "donors", surface: "Donations / donor list", cols: ["formal_name", "informal_first_name", "address", "notes"] },
  { table: "donations", surface: "Donations records", cols: ["notes", "type"] },
];

function readEnvFile(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    v = v.replace(/^export\s+/, "");
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

function env(name) {
  const fromFiles = {
    ...readEnvFile("/Users/ender/.claude/.env"),
    ...readEnvFile("/Users/ender/.codex/.env"),
  };
  return process.env[name] || fromFiles[name] || "";
}

function run(cmd, args, cwd = REPO) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function branchFooter() {
  const branch = run("git", ["branch", "--show-current"]).trim() || "unknown";
  const dirty = run("git", ["status", "--porcelain"]).trim() ? " with uncommitted changes" : "";
  return `*(Searched on branch \`${branch}\`${dirty})*`;
}

function routeFor(file) {
  const p = file.replace(/^app\//, "");
  if (p === "page.tsx") return "home page";
  if (p.startsWith("(protected)/")) return `${p.split("/")[1]} page, behind login`;
  const first = p.split("/")[0];
  return `${first.replaceAll("-", " ")} page`;
}

function truncate(s, n = 120) {
  const one = String(s ?? "").replace(/\s+/g, " ").trim();
  return one.length > n ? `${one.slice(0, n - 1)}…` : one;
}

function exactUiSearch(q) {
  const out = run("rg", ["-i", "-n", "--glob", "*.tsx", "--glob", "*.ts", q, "app", "components", "lib"]);
  return out.split(/\r?\n/).filter(Boolean).slice(0, LIMIT_UI).map(line => {
    const [file, lineNo, ...rest] = line.split(":");
    return { type: "ui", file, lineNo, route: routeFor(file), text: truncate(rest.join(":")) };
  });
}

async function dbSearch(q) {
  const base = env("SUPABASE_NSH_MASTER_PORTAL_MIRROR_REST_URL") || env("SUPABASE_NSH_MASTER_PORTAL_MIRROR_URL");
  const key = env("SUPABASE_NSH_MASTER_PORTAL_MIRROR_SERVICE_ROLE_KEY") || env("SUPABASE_NSH_MASTER_PORTAL_MIRROR_SECRET_KEY");
  if (!base || !key || typeof fetch !== "function") return { hits: [], error: "couldn't reach mirror DB" };
  const root = base.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
  const hits = [];
  for (const spec of TABLES) {
    if (hits.length >= LIMIT_DB) break;
    const select = ["id", ...spec.cols].join(",");
    const ors = spec.cols.map(c => `${c}.ilike.*${q.replaceAll("*", "")}*`).join(",");
    const url = `${root}/rest/v1/${encodeURIComponent(spec.table)}?select=${encodeURIComponent(select)}&or=(${encodeURIComponent(ors)})&limit=5`;
    try {
      const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
      if (!res.ok) continue;
      const rows = await res.json();
      for (const row of rows) hits.push({ type: "db", surface: spec.surface, table: spec.table, row });
    } catch {
      continue;
    }
  }
  return { hits: hits.slice(0, LIMIT_DB), error: null };
}

function keywords(q) {
  return q.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1 && !STOP.has(w));
}

function uiFuzzy(q) {
  const kws = keywords(q);
  if (kws.length === 0) return [];
  const all = new Map();
  for (const kw of kws) {
    for (const hit of exactUiSearch(kw)) {
      const key = `${hit.file}:${hit.lineNo}`;
      const current = all.get(key) || { ...hit, score: 0 };
      current.score += 1;
      all.set(key, current);
    }
  }
  return [...all.values()].filter(h => h.score >= Math.min(2, kws.length)).slice(0, LIMIT_UI);
}

function describeDb(hit) {
  const row = hit.row || {};
  const title = row.title || row.campaign_name || row.name || row.formal_name || row.event_name || row.source || row.id || "matching row";
  const extra = row.notes || row.description || row.status || row.area || row.platform || "";
  return `A match in **${hit.surface}**: "${truncate(title, 70)}"${extra ? ` — ${truncate(extra, 90)}` : ""}.`;
}

function printResults(q, uiHits, dbHits, fuzzy = false, dbError = null) {
  if (uiHits.length === 0 && dbHits.length === 0) {
    console.log(`Couldn't find "${q}". What page is it on, or what's near it on the screen?`);
    console.log(branchFooter());
    return;
  }
  if (fuzzy) console.log(`Fuzzy match — exact phrase not found for "${q}".`);
  const shownUi = uiHits.slice(0, 3);
  const shownDb = dbHits.slice(0, Math.max(0, 3 - shownUi.length));
  const lines = [];
  for (const hit of shownUi) {
    lines.push(`Looks like UI text on the **${hit.route}**: "${hit.text}".`);
  }
  for (const hit of shownDb) lines.push(describeDb(hit));
  console.log(lines.map((l, i) => `${i + 1}. ${l}`).join("\n"));
  const extraUi = Math.max(0, uiHits.length - shownUi.length);
  const extraDb = Math.max(0, dbHits.length - shownDb.length);
  if (extraUi || extraDb) console.log(`Plus ${extraUi} more UI match(es) and ${extraDb} more data row match(es). Say "show technical details" if needed.`);
  if (dbError) console.log(`Note: ${dbError}; searched source only for some results.`);
  console.log(branchFooter());
}

const q = process.argv.slice(2).join(" ").trim();
if (!q) {
  console.error("Usage: search-site.mjs <text seen on the Master Portal site>");
  process.exit(2);
}

let uiHits = exactUiSearch(q);
let db = await dbSearch(q);
let dbHits = db.hits;
if (uiHits.length === 0 && dbHits.length === 0) {
  uiHits = uiFuzzy(q);
  const fuzzyDbParts = [];
  for (const kw of keywords(q).slice(0, 5)) {
    const result = await dbSearch(kw);
    fuzzyDbParts.push(...result.hits);
  }
  dbHits = fuzzyDbParts.slice(0, LIMIT_DB);
  printResults(q, uiHits, dbHits, true, db.error);
} else {
  printResults(q, uiHits, dbHits, false, db.error);
}
