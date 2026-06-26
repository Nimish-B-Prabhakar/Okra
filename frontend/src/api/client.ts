const BASE_URL = 'http://localhost:8000/api'

export async function fetchDiscoveryFeed(userId: string) {
  const res = await fetch(`${BASE_URL}/discovery/feed/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch discovery feed')
  return res.json()
}

export async function scoreComment(payload: {
  comment: string
  prompt_question: string
  prompt_answer: string
  viewer_id: string
  profile_id: string
}) {
  const res = await fetch(`${BASE_URL}/discovery/score-comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to score comment')
  return res.json()
}

export async function updateInteraction(
  viewerId: string,
  profileId: string,
  payload: {
    audio_progress?: number
    audio_completed?: boolean
    comment_draft?: string
  }
) {
  const res = await fetch(
    `${BASE_URL}/discovery/interact/${viewerId}/${profileId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  )
  if (!res.ok) throw new Error('Failed to update interaction')
  return res.json()
}