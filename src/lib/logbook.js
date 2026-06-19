// Client helper for the Notion-synced Recipe Logbook. Talks to the Netlify
// serverless function, which holds the Notion token server-side.

const SAVE_ENDPOINT = '/.netlify/functions/save-brew'

/** POST a brew payload to the Logbook. Resolves with { id, url } or throws. */
export async function saveBrew(payload) {
  let res
  try {
    res = await fetch(SAVE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Network error — is the sync function running? (needs `netlify dev` or a deploy)')
  }
  let body = {}
  try {
    body = await res.json()
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new Error(body.error || `Save failed (HTTP ${res.status})`)
  }
  if (!body.id) {
    // e.g. the sync function isn't running (dev server returned the SPA shell).
    throw new Error('Sync function not reachable — run `netlify dev` or test on a deploy.')
  }
  return body
}
