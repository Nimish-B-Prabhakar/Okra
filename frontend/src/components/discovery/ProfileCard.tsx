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
  audio_prompt: string
  dating_intention: string
  politics: string
  sexuality: string
  has_kids: string
  drinking: string
  smoking: string
  religion: string
  astrology_sign: string
  prompts: Prompt[]
}

interface ProfileCardProps {
  profile: Profile
  viewerId: string
}

const ASTROLOGY_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
}

function Chip({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        fontSize: '12px',
        color: accent ? 'var(--accent)' : 'var(--text-secondary)',
        background: accent ? 'var(--accent-light)' : 'var(--bg)',
        border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '20px',
        padding: '4px 12px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function SectionDivider({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: '24px 0',
      }}
    >
      {label && (
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          flex: 1,
          height: '1px',
          background: 'var(--border)',
        }}
      />
    </div>
  )
}

export function ProfileCard({ profile, viewerId }: ProfileCardProps) {
  const [audioCompleted, setAudioCompleted] = useState(false)
  const [commentReady, setCommentReady] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)

  const discoveryPrompts = [...(profile.prompts || [])]
    .filter((p) => p.stage === 'discovery')
    .sort((a, b) => a.order - b.order)

  const postMatchPrompts = [...(profile.prompts || [])]
    .filter((p) => p.stage === 'post_match')
    .sort((a, b) => a.order - b.order)

  const prompt1 = discoveryPrompts[0]
  const prompt2 = discoveryPrompts[1]
  const tier2Prompt1 = postMatchPrompts[0]
  const tier2Prompt2 = postMatchPrompts[1]

  const firstName = profile.name.split(' ')[0]
  const astrologySymbol = ASTROLOGY_SYMBOLS[profile.astrology_sign] || '✦'

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        marginBottom: '24px',
        borderTop: '3px solid var(--accent)',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ padding: '24px 24px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  color: 'var(--text-primary)',
                  fontWeight: '400',
                }}
              >
                {firstName}
              </h2>
              <span
                style={{
                  fontSize: '22px',
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
                }}
              >
                · {profile.location_text}
              </span>
            </div>
            {profile.occupation && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                {profile.occupation}
              </span>
            )}
          </div>

          {/* Astrology sign — replaces blurred avatar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                lineHeight: 1,
                color: 'var(--accent)',
                opacity: 0.7,
              }}
            >
              {astrologySymbol}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              {profile.astrology_sign}
            </span>
          </div>
        </div>

        {/* ── DEALBREAKERS ── dating intention · politics · sexuality */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {profile.dating_intention && (
            <Chip label={profile.dating_intention} accent={true} />
          )}
          {profile.politics && <Chip label={profile.politics} />}
          {profile.sexuality && profile.sexuality !== 'Straight' && (
            <Chip label={profile.sexuality} />
          )}
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div style={{ padding: '0 24px 24px' }}>
        {/* ── PROMPT 1 — personality/story ── */}
        {prompt1 && (
          <div style={{ padding: '24px 0' }}>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '10px',
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
                fontFamily: 'var(--font-display)',
                fontWeight: '400',
              }}
            >
              {prompt1.answer}
            </p>
          </div>
        )}

        <SectionDivider />

        {/* ── PROMPT 2 — intention/readiness ── */}
        {prompt2 && (
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '10px',
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

        <SectionDivider label="Also worth knowing" />

        {/* ── PREFERENCES — kids · drinking/smoking · religion ── */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          {profile.has_kids && <Chip label={profile.has_kids} />}
          {profile.drinking && profile.drinking !== 'Socially' && (
            <Chip label={`Drinks ${profile.drinking.toLowerCase()}`} />
          )}
          {profile.smoking && profile.smoking !== 'Never' && (
            <Chip label={`Smokes ${profile.smoking.toLowerCase()}`} />
          )}
          {profile.religion && <Chip label={profile.religion} />}
        </div>

        <SectionDivider />

        {/* ── AUDIO ── */}
        <div>
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
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '8px',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            "{profile.audio_prompt}"
          </p>
        </div>

        {/* ── TIER 2 + COMMENT — slides in after audio ── */}
        {audioCompleted && !commentReady && (
          <div style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}>
            <SectionDivider />
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

        {/* ── PHOTO REVEAL ── */}
        {showPhotos && (
          <div style={{ animation: 'fadeSlideIn 0.4s ease forwards' }}>
            <SectionDivider />
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              Here's the rest of their profile
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {['face photo', 'context photo'].map((label) => (
                <div
                  key={label}
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
                  {label}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
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
