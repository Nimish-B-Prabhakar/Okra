interface WordCountProps {
  text: string
  minimum: number
}

export function WordCount({ text, minimum }: WordCountProps) {
  const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const met = count >= minimum

  return (
    <p style={{
      fontSize: '12px',
      color: met ? 'var(--success)' : 'var(--text-muted)',
      textAlign: 'right',
      marginTop: '6px',
      transition: 'color 0.2s ease'
    }}>
      {count} / {minimum} words {met ? '✓' : ''}
    </p>
  )
}