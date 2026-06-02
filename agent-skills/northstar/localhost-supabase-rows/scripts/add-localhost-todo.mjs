#!/usr/bin/env node
import { runInsert } from './localhost-supabase-row.mjs'
import fs from 'node:fs'

const APP_ENV = '/Users/ender/code/north-star-donors/.env.local'
const SECRET_ENV = '/Users/ender/.claude/.env'
const MIRROR_REF = 'pasamzrwwaqhiwkixpbt'

function parseArgs(argv) {
  const args = { yes: false }
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--yes') args.yes = true
    else if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) args[key] = 'true'
      else { args[key] = next; i += 1 }
    }
  }
  return args
}

function loadEnv(file) {
  const out = {}
  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    out[match[1]] = value
  }
  return out
}

async function managementQuery(sql) {
  const env = loadEnv(SECRET_ENV)
  const res = await fetch(`https://api.supabase.com/v1/projects/${MIRROR_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Management SQL failed ${res.status}: ${text}`)
  return text ? JSON.parse(text) : []
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function normalizeStatus(raw) {
  const value = String(raw || 'todo').toLowerCase().replace(/[-\s]+/g, '_')
  if (value === 'in_progress' || value === 'blocking') return 'in_progress'
  if (value === 'done' || value === 'complete' || value === 'completed') return 'done'
  return 'todo'
}

async function resolveInitiative(workstream) {
  if (!workstream) return null
  const term = String(workstream).trim()
  const rows = await managementQuery(`
    select id, title, area
    from public.initiatives
    where coalesce(area, '') ilike ${sqlLiteral(`%${term}%`)}
       or coalesce(title, '') ilike ${sqlLiteral(`%${term}%`)}
    order by
      case
        when coalesce(title, '') ilike '%Sponsorship Plan%' then 0
        when coalesce(area, '') ilike ${sqlLiteral(`%${term}%`)} then 1
        else 2
      end,
      created_at desc
    limit 1
  `)
  return rows[0] || null
}

function buildNotes(args) {
  const parts = []
  if (args.description) parts.push(args.description)
  if (args.blocking) parts.push(`Blocking: ${args.blocking}`)
  if (args.source) parts.push(`Source: ${args.source}`)
  if (args['cross-reference']) parts.push(`Cross-reference: ${args['cross-reference']}`)
  if (args.notes) parts.push(args.notes)
  return parts.join('\n\n') || null
}

async function main() {
  const args = parseArgs(process.argv)
  if (!args.title) throw new Error('Missing --title.')

  const initiative = await resolveInitiative(args.workstream)
  const row = {
    title: args.title,
    status: normalizeStatus(args.status),
    notes: buildNotes(args),
    due_date: args.due || args['due-date'] || null,
    assigned_to: args.assignee || null,
    attachment_url: null,
    archived_at: null,
  }
  if (initiative?.id) row.initiative_id = initiative.id
  if (args.label) row.label = args.label

  await runInsert({
    table: 'tasks',
    row,
    yes: args.yes,
    appEnvPath: APP_ENV,
    secretEnvPath: SECRET_ENV,
  })
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
