import { useState } from 'react'
import { ProfileInputForm } from './ProfileInputForm'
import { GenerationResults } from './GenerationResults'
import {
  createProfile,
  runSufficiencyCheck,
  generateGame,
} from '../../api/researchClient'

export function ResearchHome() {
  const [profileAId, setProfileAId] = useState<string | null>(null)
  const [profileBId, setProfileBId] = useState<string | null>(null)
  const [savedA, setSavedA] = useState(false)
  const [savedB, setSavedB] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sufficiencyA, setSufficiencyA] = useState<any>(null)
  const [sufficiencyB, setSufficiencyB] = useState<any>(null)

  const handleProfileA = async (data: any) => {
    const res = await createProfile({
      ...data,
      source: 'manual',
      is_real_profile: false,
    })
    setProfileAId(res.id)
    setSavedA(true)
  }

  const handleProfileB = async (data: any) => {
    const res = await createProfile({
      ...data,
      source: 'manual',
      is_real_profile: false,
    })
    setProfileBId(res.id)
    setSavedB(true)
  }

  const handleGenerate = async () => {
    if (!profileAId || !profileBId) return
    setGenerating(true)
    setError(null)
    setResults(null)

    try {
      const sufA = await runSufficiencyCheck(profileAId)
      const sufB = await runSufficiencyCheck(profileBId)
      setSufficiencyA(sufA)
      setSufficiencyB(sufB)

      const gen = await generateGame({
        profile_a_id: profileAId,
        profile_b_id: profileBId,
      })
      setResults(gen)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          Game Generation Lab
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Pipeline 1 — mining profile content for forced-binary questions
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {!savedA ? (
          <ProfileInputForm label="Profile A" onProfileReady={handleProfileA} />
        ) : (
          <div style={cardDoneStyle}>✓ Profile A saved</div>
        )}
        {!savedB ? (
          <ProfileInputForm label="Profile B" onProfileReady={handleProfileB} />
        ) : (
          <div style={cardDoneStyle}>✓ Profile B saved</div>
        )}
      </div>

      {savedA && savedB && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '24px',
          }}
        >
          {generating
            ? 'Generating...'
            : 'Run Sufficiency Check + Generate Game'}
        </button>
      )}

      {(sufficiencyA || sufficiencyB) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {sufficiencyA && (
            <div style={suffCardStyle(sufficiencyA.passes)}>
              <strong>Profile A:</strong>{' '}
              {sufficiencyA.passes ? 'PASS' : 'FAIL'} (
              {(sufficiencyA.confidence * 100).toFixed(0)}%)
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                {sufficiencyA.reason}
              </p>
            </div>
          )}
          {sufficiencyB && (
            <div style={suffCardStyle(sufficiencyB.passes)}>
              <strong>Profile B:</strong>{' '}
              {sufficiencyB.passes ? 'PASS' : 'FAIL'} (
              {(sufficiencyB.confidence * 100).toFixed(0)}%)
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                {sufficiencyB.reason}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            color: 'var(--accent)',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {results && (
        <GenerationResults
          questions={results.questions}
          skippedReason={results.skipped_reason}
          latencyMs={results.latency_ms}
          costUsd={results.estimated_cost_usd}
        />
      )}
    </div>
  )
}

const cardDoneStyle: React.CSSProperties = {
  background: 'var(--success-light)',
  border: '1px solid var(--success)',
  borderRadius: 'var(--radius-md)',
  padding: '20px',
  color: 'var(--success)',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function suffCardStyle(passes: boolean): React.CSSProperties {
  return {
    background: passes ? 'var(--success-light)' : 'var(--warning-light)',
    border: `1px solid ${passes ? 'var(--success)' : 'var(--warning)'}`,
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: '13px',
  }
}
