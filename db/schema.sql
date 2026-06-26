CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    age                 INT NOT NULL,
    occupation          TEXT,
    looking_for         TEXT,
    location_text       TEXT,
    audio_url           TEXT,
    audio_duration      INT,
    photo_face_url      TEXT,
    photo_context_url   TEXT,
    dealbreaker_tags    TEXT[],
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_prompts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_question  TEXT NOT NULL,
    prompt_answer    TEXT NOT NULL CHECK (char_length(prompt_answer) <= 150),
    display_stage    TEXT NOT NULL,
    display_order    INT NOT NULL,
    UNIQUE(user_id, display_stage, display_order)
);

CREATE TABLE discovery_interactions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id            UUID NOT NULL REFERENCES users(id),
    profile_id           UUID NOT NULL REFERENCES users(id),
    audio_progress       FLOAT DEFAULT 0.0,
    audio_completed      BOOLEAN DEFAULT FALSE,
    comment_draft        TEXT,
    comment_submitted    TEXT,
    comment_score        FLOAT,
    comment_score_reasoning TEXT,
    comment_nudge_shown  BOOLEAN DEFAULT FALSE,
    comment_nudge_accepted BOOLEAN,
    photo_revealed       BOOLEAN DEFAULT FALSE,
    photo_confirmed      BOOLEAN,
    scored_at            TIMESTAMPTZ,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(viewer_id, profile_id)
);

CREATE TABLE comment_score_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interaction_id      UUID NOT NULL REFERENCES discovery_interactions(id),
    score_before_nudge  FLOAT,
    score_after_nudge   FLOAT,
    nudge_text_shown    TEXT,
    revised             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE requests (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id                 UUID NOT NULL REFERENCES users(id),
    recipient_id              UUID NOT NULL REFERENCES users(id),
    comment                   TEXT NOT NULL,
    status                    TEXT NOT NULL DEFAULT 'pending',
    recipient_audio_completed BOOLEAN DEFAULT FALSE,
    sent_at                   TIMESTAMPTZ DEFAULT NOW(),
    responded_at              TIMESTAMPTZ,
    UNIQUE(sender_id, recipient_id)
);

CREATE TABLE daily_request_counts (
    user_id  UUID NOT NULL REFERENCES users(id),
    date     DATE NOT NULL DEFAULT CURRENT_DATE,
    count    INT DEFAULT 0 CHECK (count <= 7),
    PRIMARY KEY(user_id, date)
);

CREATE TABLE matches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id           UUID NOT NULL REFERENCES users(id),
    user_b_id           UUID NOT NULL REFERENCES users(id),
    user_a_confirmed    BOOLEAN,
    user_b_confirmed    BOOLEAN,
    status              TEXT NOT NULL DEFAULT 'pending_confirmation',
    matched_at          TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ,
    UNIQUE(user_a_id, user_b_id)
);

CREATE TABLE conversations (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id              UUID NOT NULL UNIQUE REFERENCES matches(id),
    pinned_comment        TEXT NOT NULL,
    audio_prompt_question TEXT NOT NULL,
    user_a_audio_response TEXT,
    user_b_audio_response TEXT,
    text_phase_opens_at   TIMESTAMPTZ,
    text_phase_expires_at TIMESTAMPTZ,
    status                TEXT NOT NULL DEFAULT 'audio_exchange',
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discovery_viewer ON discovery_interactions(viewer_id);
CREATE INDEX idx_requests_recipient ON requests(recipient_id);
CREATE INDEX idx_requests_sender ON requests(sender_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_matches_user_a ON matches(user_a_id);
CREATE INDEX idx_matches_user_b ON matches(user_b_id);
CREATE INDEX idx_conversations_match ON conversations(match_id);