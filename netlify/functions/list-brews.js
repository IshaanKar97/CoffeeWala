// Netlify function — read brews from the Coffee Recipe Logbook (read).
import { NOTION_API, NOTION_VERSION, LOGBOOK_DB_ID, normalizeBrew, json } from '../notion-helpers.js'

export const handler = async () => {
  const token = process.env.NOTION_TOKEN
  if (!token) return json(500, { error: 'NOTION_TOKEN is not configured on the server.' })
  try {
    const res = await fetch(`${NOTION_API}/databases/${LOGBOOK_DB_ID}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 50, sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
    })
    const body = await res.json()
    if (!res.ok) return json(res.status, { error: body.message || 'Notion API error', code: body.code })
    return json(200, { brews: (body.results || []).map(normalizeBrew) })
  } catch (e) {
    return json(502, { error: `Failed to reach Notion: ${e.message}` })
  }
}
