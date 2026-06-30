import { useState } from 'react'

interface PromptEntry {
  question: string
  answer: string
}

interface ProfileInputFormProps {
  label: string
  onProfileReady: (data: {
    label: string
    age?: number
    occupation?: string
    prompts: PromptEntry[]
  }) => void
}

export function ProfileInputForm({
  label,
  onProfileReady,
}: ProfileInputFormProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [occupation, setOccupation] = useState('')
  const [prompts, setPrompts] = useState<PromptEntry[]>([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ])

  const updatePrompt = (
    i: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const next = [...prompts]
    next[i][field] = value
    setPrompts(next)
  }

  const addPrompt = () => setPrompts([...prompts, { question: '', answer: '' }])
  const removePrompt = (i: number) =>
    setPrompts(prompts.filter((_, idx) => idx !== i))

  const wordCount = (text: string) =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).length

  const handleSubmit = () => {
    if (!name.trim()) return
    const validPrompts = prompts
      .filter((p) => p.question.trim() && p.answer.trim())
      .map((p, i) => ({ ...p, position: i + 1 }))
    onProfileReady({
      label: name,
      age: age ? parseInt(age) : undefined,
      occupation: occupation || undefined,
      prompts: validPrompts,
    })
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          color: 'var(--accent)',
          marginBottom: '16px',
        }}
      >
        {label}
      </h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ ...inputStyle, width: '70px' }}
        />
      </div>
      <input
        placeholder="Occupation"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        style={{ ...inputStyle, marginBottom: '16px' }}
      />

      {prompts.map((p, i) => (
        <div key={i} style={{ marginBottom: '14px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <input
              placeholder="Prompt question"
              value={p.question}
              onChange={(e) => updatePrompt(i, 'question', e.target.value)}
              style={{ ...inputStyle, fontSize: '13px' }}
            />
            {prompts.length > 1 && (
              <button onClick={() => removePrompt(i)} style={removeBtnStyle}>
                ×
              </button>
            )}
          </div>
          <textarea
            placeholder="Answer (15+ words for sufficiency)"
            value={p.answer}
            onChange={(e) => updatePrompt(i, 'answer', e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'none' }}
          />
          <p
            style={{
              fontSize: '11px',
              color:
                wordCount(p.answer) >= 15
                  ? 'var(--success)'
                  : 'var(--text-muted)',
              textAlign: 'right',
              marginTop: '2px',
            }}
          >
            {wordCount(p.answer)} words
          </p>
        </div>
      ))}

      <button
        onClick={addPrompt}
        style={{
          fontSize: '12px',
          color: 'var(--accent)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: '16px',
        }}
      >
        + add prompt
      </button>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '10px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Save {label}
      </button>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const removeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '0 4px',
}
