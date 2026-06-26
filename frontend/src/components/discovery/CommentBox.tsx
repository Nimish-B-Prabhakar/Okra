import { useState, useCallback, useRef } from 'react'
import { WordCount } from '../shared/WordCount'
import { NudgeCard } from '../shared/NudgeCard'
import { scoreComment } from '../../api/client'

interface CommentBoxProps {
  viewerId: string
  profileId: string
  promptQuestion: string
  promptAnswer: string
  onCommentReady: (comment: string) => void
}

export function CommentBox({
  viewerId,
  profileId,
  promptQuestion,
  promptAnswer,
  onCommentReady
}: CommentBoxProps) {
  const [comment, setComment] = useState('')
  const [scoring, setScoring] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const scoreTimeoutRef = useRef<number | null>(null)

  const wordCount = comment.trim() === '' ? 0 : comment.trim().split(/\s+/).length
  const meetsMinimum = wordCount >= 15

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setComment(value)
    setNudge(null)

    // Debounce scoring — only score after user stops typing for 1.5s and has 15+ words
    if (scoreTimeoutRef.current) clearTimeout(scoreTimeoutRef.current)
    const words = value.trim().split(/\s+/).length
    if (words >= 15) {
      scoreTimeoutRef.current = window.setTimeout(async () => {
        setScoring(true)
        try {
          const result = await scoreComment({
            comment: value,
            prompt_question: promptQuestion,
            prompt_answer: promptAnswer,
            viewer_id: viewerId,
            profile_id: profileId
          })
          setScore(result.scores.overall)
          if (result.show_nudge) setNudge(result.nudge)
        } catch (err) {
          console.error('Scoring failed:', err)
        } finally {
          setScoring(false)
        }
      }, 1500)
    }
  }, [promptQuestion, promptAnswer, viewerId, profileId])

  const handleSubmit = () => {
    if (!meetsMinimum || submitted) return
    setSubmitted(true)
    onCommentReady(comment)
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        What caught your attention?
      </label>

      <textarea
        value={comment}
        onChange={handleChange}
        disabled={submitted}
        placeholder="Write something specific — what actually resonated with you? (15 words minimum)"
        rows={4}
        style={{
          width: '100%',
          padding: '14px 16px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          background: submitted ? 'var(--bg)' : 'var(--surface)',
          resize: 'none',
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {scoring ? 'Reviewing...' : ''}
        </span>
        <WordCount text={comment} minimum={15} />
      </div>

      {nudge && score !== null && (
        <NudgeCard nudge={nudge} score={score} />
      )}

      <button
        onClick={handleSubmit}
        disabled={!meetsMinimum || submitted}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '14px',
          background: meetsMinimum && !submitted ? 'var(--accent)' : 'var(--border)',
          color: meetsMinimum && !submitted ? 'white' : 'var(--text-muted)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          fontWeight: '500',
          cursor: meetsMinimum && !submitted ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease'
        }}
      >
        {submitted ? 'Comment saved — see their photos →' : 'Continue'}
      </button>
    </div>
  )
}