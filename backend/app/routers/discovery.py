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
            u.audio_prompt,
            u.dating_intention,
            u.politics,
            u.sexuality,
            u.has_kids,
            u.drinking,
            u.smoking,
            u.religion,
            u.astrology_sign,
            json_agg(
                json_build_object(
                    'question', up.prompt_question,
                    'answer', up.prompt_answer,
                    'order', up.display_order,
                    'stage', up.display_stage
                ) ORDER BY up.display_order, up.display_order
            ) AS prompts
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


from app.services.scoring import score_comment, get_nudge_message


@router.post("/score-comment")
async def score_user_comment(body: dict):
    """
    Called in real time as user finishes writing a comment.
    Returns a quality score and optional nudge before they submit.
    """
    comment = body.get("comment", "").strip()
    prompt_question = body.get("prompt_question", "")
    prompt_answer = body.get("prompt_answer", "")
    viewer_id = body.get("viewer_id")
    profile_id = body.get("profile_id")

    if not comment or not prompt_question or not prompt_answer:
        raise HTTPException(
            status_code=400,
            detail="comment, prompt_question, and prompt_answer are required",
        )

    word_count = len(comment.split())
    if word_count < 15:
        raise HTTPException(
            status_code=400, detail=f"Comment too short: {word_count} words, minimum 15"
        )

    try:
        result = await score_comment(comment, prompt_question, prompt_answer)
        nudge = get_nudge_message(result)

        # Store the score if we have interaction context
        if viewer_id and profile_id:
            db = await get_db()
            await db.execute(
                """
                UPDATE discovery_interactions
                SET comment_score = $1,
                    comment_score_reasoning = $2,
                    comment_nudge_shown = $3,
                    scored_at = NOW()
                WHERE viewer_id = $4::uuid AND profile_id = $5::uuid
            """,
                result["overall"],
                result["reasoning"],
                nudge is not None,
                viewer_id,
                profile_id,
            )

        return {
            "scores": {
                "specificity": result["specificity"],
                "genuine_engagement": result["genuine_engagement"],
                "overall": result["overall"],
            },
            "reasoning": result["reasoning"],
            "nudge": nudge,
            "show_nudge": nudge is not None,
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse scoring response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
