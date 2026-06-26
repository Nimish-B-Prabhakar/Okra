from fastapi import APIRouter, HTTPException
from app.database import get_db
import json

router = APIRouter()


@router.get("/feed/{user_id}")
async def get_discovery_feed(user_id: str, limit: int = 10):
    """
    Returns profiles the user hasn't interacted with yet.
    Excludes: themselves, anyone they've already sent a request to,
    anyone they've already seen and dismissed.
    """
    db = await get_db()

    query = """
        SELECT
            u.id,
            u.name,
            u.age,
            u.occupation,
            u.location_text,
            u.audio_url,
            u.audio_duration,
            u.dealbreaker_tags,
            -- discovery prompts only, not post_match prompts
            json_agg(
                json_build_object(
                    'question', up.prompt_question,
                    'answer', up.prompt_answer,
                    'order', up.display_order
                ) ORDER BY up.display_order
            ) FILTER (WHERE up.display_stage = 'discovery') AS prompts
        FROM users u
        LEFT JOIN user_prompts up ON up.user_id = u.id
        WHERE
            -- not themselves
            u.id != $1::uuid
            -- not already interacted with
            AND u.id NOT IN (
                SELECT profile_id FROM discovery_interactions
                WHERE viewer_id = $1::uuid
            )
            -- not already sent a request to
            AND u.id NOT IN (
                SELECT recipient_id FROM requests
                WHERE sender_id = $1::uuid
            )
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $2
    """

    try:
        rows = await db.fetch(query, user_id, limit)
        profiles = []
        for row in rows:
            profile = dict(row)
            if isinstance(profile.get("prompts"), str):
                profile["prompts"] = json.loads(profile["prompts"])
            profiles.append(profile)
        return {"profiles": profiles, "count": len(profiles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interact/{viewer_id}/{profile_id}")
async def update_interaction(viewer_id: str, profile_id: str, body: dict):
    """
    Updates the interaction state for a viewer/profile pair.
    Called whenever: audio progress updates, comment is drafted,
    comment is submitted, photo is confirmed.
    """
    db = await get_db()

    # Upsert — create the interaction row if it doesn't exist, update if it does
    query = """
        INSERT INTO discovery_interactions (viewer_id, profile_id, audio_progress,
            audio_completed, comment_draft, updated_at)
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, NOW())
        ON CONFLICT (viewer_id, profile_id) DO UPDATE SET
            audio_progress   = COALESCE(EXCLUDED.audio_progress, discovery_interactions.audio_progress),
            audio_completed  = COALESCE(EXCLUDED.audio_completed, discovery_interactions.audio_completed),
            comment_draft    = COALESCE(EXCLUDED.comment_draft, discovery_interactions.comment_draft),
            updated_at       = NOW()
        RETURNING *
    """

    try:
        row = await db.fetchrow(
            query,
            viewer_id,
            profile_id,
            body.get("audio_progress"),
            body.get("audio_completed"),
            body.get("comment_draft"),
        )
        return dict(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
