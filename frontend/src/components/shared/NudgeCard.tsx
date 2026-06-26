interface NudgeCardProps {
  nudge: string
  score: number
}

export function NudgeCard({ nudge, score }: NudgeCardProps) {
  const isLow = score < 0.4

  return (
    <div style={{
      background: isLow ? 'var(--warning-light)' : 'var(--accent-light)',
      border: `1px solid ${isLow ? 'var(--warning)' : 'var(--accent)'}`,
      borderRadius: 'var(--radius-sm)',
      padding: '12px 16px',
      marginTop: '8px'
    }}>
      <p style={{
        fontSize: '13px',
        color: isLow ? '#92651A' : 'var(--accent)',
        lineHeight: '1.5'
      }}>
        💡 {nudge}
      </p>
    </div>
  )
}