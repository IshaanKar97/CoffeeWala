// Netlify function — update an existing brew's fields in the Logbook (edit).
import { NOTION_API, NOTION_VERSION, buildProperties, json } from '../notion-helpers.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  const token = process.env.NOTION_TOKEN
  if (!token) return json(500, { error: 'NOTION_TOKEN is not configured on the server.' })

  let data
  try {
    data = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON body.' })
  }
  if (!data.id) return json(400, { error: 'Missing brew id.' })

  try {
    const res = await fetch(`${NOTION_API}/pages/${data.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: buildProperties(data) }),
    })
    const body = await res.json()
    if (!res.ok) return json(res.status, { error: body.message || 'Notion API error', code: body.code })
    return json(200, { id: body.id, url: body.url })
  } catch (e) {
    return json(502, { error: `Failed to reach Notion: ${e.message}` })
  }
}
