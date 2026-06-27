import { useState } from 'react'
import { AudioPlayer } from './AudioPlayer'
import { CommentBox } from './CommentBox'

interface Prompt {
  question: string
  answer: string
  order: number
  stage: string
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

  const discoveryPrompts = [...(profile.prompts || [])]
    .filter((p) => p.stage === 'discovery' || !p.stage)
    .sort((a, b) => a.order - b.order)

  const prompt1 = discoveryPrompts[0]
  const prompt2 = discoveryPrompts[1]

  const firstName = profile.name.split(' ')[0]

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        marginBottom: '24px',
        position: 'relative',
        borderTop: '3px solid var(--accent)',
      }}
    >
      {/* Blurred photo background — presence signal only, 15% opacity */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '160px',
          background:
            'linear-gradient(135deg, #D4B8A8 0%, #C4A898 50%, #B89888 100%)',
          opacity: 0.15,
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />

      {/* Header — name, age, distance, occupation, request counter */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '24px 24px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            {/* Primary identity — name age distance */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  color: 'var(--text-primary)',
                  fontWeight: '400',
                }}
              >
                {firstName}
              </h2>
              <span
                style={{
                  fontSize: '20px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '400',
                }}
              >
                {profile.age}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginLeft: '4px',
                }}
              >
                · {profile.location_text}
              </span>
            </div>

            {/* Occupation — small chip, not prominent */}
            {profile.occupation && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '2px 10px',
                  display: 'inline-block',
                }}
              >
                {profile.occupation}
              </span>
            )}
          </div>

          {/* Blurred avatar — presence signal only */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4B8A8, #B89888)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'blur(4px)',
              opacity: 0.5,
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
        {/* Prompt 1 — personality/story — full visual weight */}
        {prompt1 && (
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '8px',
                fontStyle: 'italic',
              }}
            >
              {prompt1.question}
            </p>
            <p
              style={{
                fontSize: '17px',
                color: 'var(--text-primary)',
                lineHeight: '1.65',
                fontWeight: '400',
                fontStyle: 'normal',
              }}
            >
              {prompt1.answer}
            </p>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border)',
            margin: '0 0 24px',
          }}
        />

        {/* Prompt 2 — intention/readiness — slightly secondary weight */}
        {prompt2 && (
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '8px',
                fontStyle: 'italic',
              }}
            >
              {prompt2.question}
            </p>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              {prompt2.answer}
            </p>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border)',
            margin: '0 0 24px',
          }}
        />

        {/* Audio player */}
        <div style={{ marginBottom: audioCompleted ? '24px' : '0' }}>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '12px',
            }}
          >
            Their intro
          </p>
          <AudioPlayer
            duration={profile.audio_duration}
            onComplete={() => setAudioCompleted(true)}
            onProgress={() => {}}
          />
          {/* Audio prompt question — shown under player */}
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '8px',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            "What did you actually do last weekend — not the highlight, just the
            whole thing?"
          </p>
        </div>

        {/* Tier 2 content + comment box — slides in after audio completes */}
        {audioCompleted && !commentReady && (
          <div
            style={{
              animation: 'fadeSlideIn 0.3s ease forwards',
            }}
          >
            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'var(--border)',
                margin: '0 0 24px',
              }}
            />

            {/* Tier 2 — emotional availability prompt */}
            <div
              style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '8px',
                  fontStyle: 'italic',
                }}
              >
                Something I'm genuinely working on...
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                {/* Will come from post_match prompts in later iteration */}
                Saying what I actually want instead of what I think sounds
                reasonable.
              </p>
            </div>

            {/* Comment box */}
            <CommentBox
              viewerId={viewerId}
              profileId={profile.id}
              promptQuestion={prompt1?.question ?? ''}
              promptAnswer={prompt1?.answer ?? ''}
              onCommentReady={() => {
                setCommentReady(true)
                setTimeout(() => setShowPhotos(true), 600)
              }}
            />
          </div>
        )}

        {/* Photo reveal */}
        {showPhotos && (
          <div
            style={{
              marginTop: '24px',
              animation: 'fadeSlideIn 0.4s ease forwards',
            }}
          >
            <div
              style={{
                height: '1px',
                background: 'var(--border)',
                marginBottom: '24px',
              }}
            />

            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginBottom: '16px',
                letterSpacing: '0.01em',
              }}
            >
              Here's the rest of their profile
            </p>

            {/* 2-up photo grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  aspectRatio: '3/4',
                  background: 'linear-gradient(160deg, #E8DDD5, #D4C4B8)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                }}
              >
                face photo
              </div>
              <div
                style={{
                  aspectRatio: '3/4',
                  background: 'linear-gradient(160deg, #D4C4B8, #C4B4A8)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                }}
              >
                context photo
              </div>
            </div>

            {/* Confirmation buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowPhotos(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Not for me
              </button>
              <button
                style={{
                  flex: 2,
                  padding: '14px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                Send request →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
