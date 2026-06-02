#!/usr/bin/env node
import fs from 'node:fs'

const MIRROR_REF = 'pasamzrwwaqhiwkixpbt'
const LIVE_REF = 'uvzwhhwzelaelfhfkvdb'
const DEFAULT_APP_ENV = '/Users/ender/code/north-star-donors/.env.local'
const DEFAULT_SECRET_ENV = '/Users/ender/.claude/.env'

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

function projectRefFromUrl(url) {
  return (url || '').match(/https:\/\/([a-z0-9]{20})\.supabase\.co/)?.[1] || ''
}

function requireMirror(appEnv, secretEnv) {
  const appRef = projectRefFromUrl(appEnv.NEXT_PUBLIC_SUPABASE_URL)
  const mirrorRef = secretEnv.SUPABASE_NSH_MASTER_PORTAL_MIRROR_PROJECT_REF
  if (appRef === LIVE_REF || mirrorRef === LIVE_REF) {
    throw new Error(`Refusing live project ${LIVE_REF}. This helper is localhost/mirror only.`)
  }
  if (appRef !== MIRROR_REF) {
    throw new Error(`Refusing: app .env.local must target mirror ${MIRROR_REF}; got ${appRef || '<missing>'}.`)
  }
  if (mirrorRef !== MIRROR_REF) {
    throw new Error(`Refusing: secret mirror ref must be ${MIRROR_REF}; got ${mirrorRef || '<missing>'}.`)
  }
  if (!secretEnv.SUPABASE_PAT) throw new Error('Missing SUPABASE_PAT in secret env.')
  if (!appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in app env.')
}

async function managementQuery(secretEnv, sql) {
  const endpoint = `https://api.supabase.com/v1/projects/${MIRROR_REF}/database/query`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretEnv.SUPABASE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Management SQL failed ${res.status}: ${text}`)
  return text ? JSON.parse(text) : []
}

async function getOrCreateAppToken(secretEnv) {
  const existing = await managementQuery(secretEnv, `
    select token
    from public.app_sessions
    where expires_at > now()
    order by expires_at desc
    limit 1
  `)
  if (existing[0]?.token) return existing[0].token

  const created = await managementQuery(secretEnv, `
    insert into public.app_sessions (token, expires_at, user_agent)
    values (encode(extensions.gen_random_bytes(32), 'hex'), now() + interval '30 days', 'localhost-supabase-rows skill')
    returning token
  `)
  if (!created[0]?.token) throw new Error('Could not create app session token.')
  return created[0].token
}

async function getOpenApi(appEnv, secretEnv) {
  const schemaKey = secretEnv.SUPABASE_NSH_MASTER_PORTAL_MIRROR_SERVICE_ROLE_KEY
  if (!schemaKey) throw new Error('Missing mirror service role key for schema inspection.')
  const res = await fetch(`${appEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: schemaKey,
      Authorization: `Bearer ${schemaKey}`,
      Accept: 'application/openapi+json',
    },
  })
  if (!res.ok) throw new Error(`OpenAPI fetch failed ${res.status}: ${await res.text()}`)
  return res.json()
}

function validateRow(openapi, table, row) {
  const definition = openapi.definitions?.[table]
  if (!definition) {
    const names = Object.keys(openapi.definitions || {}).sort().join(', ')
    throw new Error(`Table ${table} not found in mirror Data API. Known tables: ${names}`)
  }
  const columns = new Set(Object.keys(definition.properties || {}))
  const unknown = Object.keys(row).filter((key) => !columns.has(key))
  if (unknown.length) throw new Error(`Unknown columns for ${table}: ${unknown.join(', ')}`)
  return definition
}

async function insertRow(appEnv, token, table, row) {
  const res = await fetch(`${appEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}?select=*`, {
    method: 'POST',
    headers: {
      apikey: appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'x-app-token': token,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Insert failed ${res.status}: ${text}`)
  return text ? JSON.parse(text) : []
}

async function verifyRow(appEnv, token, table, inserted) {
  const first = Array.isArray(inserted) ? inserted[0] : inserted
  if (!first || !first.id) return { verified: false, reason: 'No id returned; skipped id verification.' }
  const res = await fetch(`${appEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}?select=*&id=eq.${encodeURIComponent(first.id)}`, {
    headers: {
      apikey: appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${appEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'x-app-token': token,
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Verification failed ${res.status}: ${text}`)
  const rows = text ? JSON.parse(text) : []
  return { verified: rows.length > 0, rows }
}

export async function runInsert({ table, row, yes = false, appEnvPath = DEFAULT_APP_ENV, secretEnvPath = DEFAULT_SECRET_ENV }) {
  if (!table) throw new Error('Missing table.')
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Missing JSON object row.')

  const appEnv = loadEnv(appEnvPath)
  const secretEnv = loadEnv(secretEnvPath)
  requireMirror(appEnv, secretEnv)
  const token = await getOrCreateAppToken(secretEnv)
  const openapi = await getOpenApi(appEnv, secretEnv)
  validateRow(openapi, table, row)

  const proposed = { action: 'insert', project_ref: MIRROR_REF, table, row }
  if (!yes) {
    console.log(JSON.stringify({ dry_run: true, proposed }, null, 2))
    return { dryRun: true, proposed }
  }

  const inserted = await insertRow(appEnv, token, table, row)
  const verification = await verifyRow(appEnv, token, table, inserted)
  const result = { action: 'inserted', project_ref: MIRROR_REF, table, inserted, verification }
  console.log(JSON.stringify(result, null, 2))
  return result
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv)
  const row = args['row-json'] ? JSON.parse(args['row-json']) : null
  runInsert({
    table: args.table,
    row,
    yes: args.yes,
    appEnvPath: args['app-env'] || DEFAULT_APP_ENV,
    secretEnvPath: args['secret-env'] || DEFAULT_SECRET_ENV,
  }).catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
