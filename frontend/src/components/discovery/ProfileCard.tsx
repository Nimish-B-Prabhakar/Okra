import { useState } from 'react'
import { AudioPlayer } from './AudioPlayer'
import { CommentBox } from './CommentBox'

interface Prompt {
  question: string
  answer: string
  order: number
}

interface Profile {
  id: string
  name: string
  age: number
  occupation: string
  location_text: string
  audio_duration: number
  dealbreaker_tags: string[]
  prompts: Prompt[]
}

interface ProfileCardProps {
  profile: Profile
  viewerId: string
}

export function ProfileCard({ profile, viewerId }: ProfileCardProps) {
  const [audioCompleted, setAudioCompleted] = useState(false)
  const [commentReady, setCommentReady] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)

  const sortedPrompts = [...profile.prompts].sort((a, b) => a.order - b.order)
  const firstPrompt = sortedPrompts[0]

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 28px 20px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              {profile.name.split(' ')[0]}, {profile.age}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {profile.occupation} · {profile.location_text}
            </p>
          </div>

          {/* Blurred photo placeholder */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            filter: 'blur(3px)',
            opacity: 0.6
          }}>
            👤
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px' }}>

        {/* Prompts */}
        {sortedPrompts.map((prompt, i) => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px'
            }}>
              {prompt.question}
            </p>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              fontStyle: 'italic'
            }}>
              "{prompt.answer}"
            </p>
          </div>
        ))}

        {/* Dealbreaker tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {profile.dealbreaker_tags.map(tag => (
            <span key={tag} style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '4px 12px'
            }}>
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        {/* Audio player */}
        <div style={{ marginBottom: '8px' }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px'
          }}>
            Their intro
          </p>
          <AudioPlayer
            duration={profile.audio_duration}
            onComplete={() => setAudioCompleted(true)}
            onProgress={() => {}}
          />
        </div>

        {/* Comment box — only appears after audio completes */}
        {audioCompleted && !showPhotos && (
          <CommentBox
            viewerId={viewerId}
            profileId={profile.id}
            promptQuestion={firstPrompt?.question ?? ''}
            promptAnswer={firstPrompt?.answer ?? ''}
            onCommentReady={(comment) => {
              setCommentReady(true)
              setTimeout(() => setShowPhotos(true), 800)
            }}
          />
        )}

        {/* Photo reveal */}
        {showPhotos && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '16px'
            }}>
              Here's the rest of their profile
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {[1, 2].map(n => (
                <div key={n} style={{
                  aspectRatio: '3/4',
                  background: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}>
                  Photo {n}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1,
                padding: '14px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                Not for me
              </button>
              <button style={{
                flex: 1,
                padding: '14px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: '500',
                color: 'white',
                cursor: 'pointer'
              }}>
                Send request →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}