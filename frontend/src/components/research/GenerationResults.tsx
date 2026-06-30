import { useState } from 'react'
import { saveManualScore, runJudge } from '../../api/researchClient'

interface Question {
  id: string
  question_number: number
  question_text: string
  source_a?: string
  source_b?: string
  why_this_works?: string
}

interface GenerationResultsProps {
  questions: Question[]
  skippedReason: string | null
  latencyMs: number
  costUsd: number | null
}

function QuestionCard({ q }: { q: Question }) {
  const [score, setScore] = useState<number | null>(null)
  const [judgeResult, setJudgeResult] = useState<any>(null)
  const [judging, setJudging] = useState(false)

  const handleScore = async (n: number) => {
    setScore(n)
    try {
      await saveManualScore(q.id, n)
    } catch (e) {
      console.error(e)
    }
  }

  const handleJudge = async () => {
    setJudging(true)
    try {
      const result = await runJudge(q.id)
      setJudgeResult(result)
    } catch (e) {
      console.error(e)
    } finally {
      setJudging(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        marginBottom: '14px',
      }}
    >
      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}
      >
        Question {q.question_number}
      </p>
      <p
        style={{
          fontSize: '17px',
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
          marginBottom: '12px',
          lineHeight: '1.5',
        }}
      >
        {q.question_text}
      </p>

      {(q.source_a || q.source_b) && (
        <div
          style={{
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '10px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          {q.source_a && (
            <p style={{ marginBottom: '4px' }}>
              <strong>A:</strong> {q.source_a}
            </p>
          )}
          {q.source_b && (
            <p>
              <strong>B:</strong> {q.source_b}
            </p>
          )}
        </div>
      )}

      {q.why_this_works && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            marginBottom: '14px',
          }}
        >
          {q.why_this_works}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Score:
        </span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => handleScore(n)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: `1px solid ${score === n ? 'var(--accent)' : 'var(--border)'}`,
              background: score === n ? 'var(--accent)' : 'var(--surface)',
              color: score === n ? 'white' : 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}

        <button
          onClick={handleJudge}
          disabled={judging}
          style={{
            marginLeft: 'auto',
            fontSize: '12px',
            padding: '6px 12px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {judging ? 'Judging...' : 'Run Judge'}
        </button>
      </div>

      {judgeResult && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'var(--accent-light)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
          }}
        >
          <strong>Judge: {judgeResult.total_score}/6</strong>
          <div
            style={{
              marginTop: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {[
              'references_real_content',
              'genuine_forced_binary',
              'both_sides_cost_something',
              'under_word_limit',
              'avoids_clinical_language',
              'comparable_stakes',
            ].map((key) => (
              <span
                key={key}
                style={{
                  color: judgeResult[key]
                    ? 'var(--success)'
                    : 'var(--text-muted)',
                }}
              >
                {judgeResult[key] ? '✓' : '✗'} {key.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function GenerationResults({
  questions,
  skippedReason,
  latencyMs,
  costUsd,
}: GenerationResultsProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <span>{questions.length} questions generated</span>
        <span>{latencyMs}ms</span>
        {costUsd !== null && <span>${costUsd.toFixed(6)}</span>}
      </div>

      {skippedReason && (
        <div
          style={{
            background: 'var(--warning-light)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#92651A',
          }}
        >
          {skippedReason}
        </div>
      )}

      {questions.map((q) => (
        <QuestionCard key={q.id} q={q} />
      ))}
    </div>
  )
}
