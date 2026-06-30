const BASE_URL = 'http://localhost:8000/api/research'

export async function listProfiles() {
  const res = await fetch(`${BASE_URL}/profiles`)
  if (!res.ok) throw new Error('Failed to list profiles')
  return res.json()
}

export async function createProfile(payload: {
  label: string
  age?: number
  occupation?: string
  source: string
  is_real_profile: boolean
  prompts: { question: string; answer: string; position: number }[]
}) {
  const res = await fetch(`${BASE_URL}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create profile')
  return res.json()
}

export async function runSufficiencyCheck(profileId: string) {
  const res = await fetch(`${BASE_URL}/sufficiency-check/${profileId}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Sufficiency check failed')
  return res.json()
}

export async function generateGame(payload: {
  profile_a_id: string
  profile_b_id: string
  prompt_version_id?: string
}) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Generation failed')
  return res.json()
}

export async function saveManualScore(
  questionId: string,
  score: number,
  notes?: string
) {
  const res = await fetch(`${BASE_URL}/score/${questionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, notes }),
  })
  if (!res.ok) throw new Error('Failed to save score')
  return res.json()
}

export async function runJudge(questionId: string) {
  const res = await fetch(`${BASE_URL}/judge/${questionId}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Judge pass failed')
  return res.json()
}

export async function getAnalyticsSummary() {
  const res = await fetch(`${BASE_URL}/analytics/summary`)
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}
