// Shared helpers for the Notion-backed Logbook functions (save / list / update).
// Imported by netlify/functions/*.js (esbuild bundles it). NOTION_TOKEN is read
// from the environment by each function; this module only shapes requests/data.

export const NOTION_API = 'https://api.notion.com/v1'
export const NOTION_VERSION = '2022-06-28'
export const LOGBOOK_DB_ID = process.env.NOTION_LOGBOOK_DB_ID || 'e746a40f6a324aff98cabb8d72fbe8ae'

const richText = (s) => (s != null && s !== '' ? { rich_text: [{ text: { content: String(s) } }] } : undefined)
const number = (n) => (n == null || n === '' || Number.isNaN(Number(n)) ? undefined : { number: Number(n) })
const select = (name) => (name ? { select: { name } } : undefined)

/** Map a brew payload → Notion page properties (blanks omitted). Used by save + update. */
export function buildProperties(data) {
  const props = {}
  const set = (key, value) => {
    if (value !== undefined) props[key] = value
  }
  if (data.brewName != null) set('Brew Name', { title: [{ text: { content: String(data.brewName) || 'Brew' } }] })
  set('Brew Method', select(data.brewMethod))
  set('Coffee (g)', number(data.coffee))
  set('Ratio', number(data.ratio))
  set('Total Water', number(data.totalWater))
  set('Bloom Water', number(data.bloomWater))
  set('Brew Water', number(data.brewWater))
  set('Ice (g)', number(data.ice))
  set('Milk (g)', number(data.milk))
  set('Pour 1 Water', number(data.pour1Water))
  set('Pour 2 Water', number(data.pour2Water))
  set('Pour 3 Water', number(data.pour3Water))
  set('Bloom Time', richText(data.bloomTimeStr))
  set('Pour 1 Time', richText(data.pour1Time))
  set('Pour 2 Time', richText(data.pour2Time))
  set('Pour 3 Time', richText(data.pour3Time))
  set('Drawdown Time', richText(data.drawdownTime))
  set('Water Temp', richText(data.waterTemp))
  set('Grind Size', richText(data.grindSize))
  set('Rating /10', number(data.rating))
  set('Tasting Notes', richText(data.notes))
  if (data.date) set('Date', { date: { start: data.date } })
  return props
}

const txt = (p) => p?.rich_text?.[0]?.plain_text || p?.title?.[0]?.plain_text || ''
const numv = (p) => (p?.number ?? null)

/** Normalize a Notion page → a flat brew object for the client. */
export function normalizeBrew(pg) {
  const pr = pg.properties || {}
  return {
    id: pg.id,
    url: pg.url,
    name: txt(pr['Brew Name']),
    method: pr['Brew Method']?.select?.name || '',
    date: pr['Date']?.date?.start || '',
    coffee: numv(pr['Coffee (g)']),
    ratio: numv(pr['Ratio']),
    totalWater: numv(pr['Total Water']),
    bloomWater: numv(pr['Bloom Water']),
    brewWater: numv(pr['Brew Water']),
    ice: numv(pr['Ice (g)']),
    milk: numv(pr['Milk (g)']),
    pour1Water: numv(pr['Pour 1 Water']),
    pour2Water: numv(pr['Pour 2 Water']),
    pour3Water: numv(pr['Pour 3 Water']),
    rating: numv(pr['Rating /10']),
    notes: txt(pr['Tasting Notes']),
    grindSize: txt(pr['Grind Size']),
    waterTemp: txt(pr['Water Temp']),
    bloomTime: txt(pr['Bloom Time']),
    pour1Time: txt(pr['Pour 1 Time']),
    pour2Time: txt(pr['Pour 2 Time']),
    pour3Time: txt(pr['Pour 3 Time']),
    drawdownTime: txt(pr['Drawdown Time']),
  }
}

export function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }
}
