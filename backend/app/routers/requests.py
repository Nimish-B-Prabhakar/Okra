from fastapi import APIRouter, HTTPException
from app.database import get_db

router = APIRouter()


@router.get("/incoming/{user_id}")
async def get_incoming_requests(user_id: str):
    """
    Returns all pending requests sent to this user.
    Includes sender's partial profile + their comment.
    """
    db = await get_db()

    query = """
        SELECT
            r.id,
            r.comment,
            r.sent_at,
            r.recipient_audio_completed,
            u.id AS sender_id,
            u.name,
            u.age,
            u.occupation,
            u.location_text,
            u.audio_url,
            u.audio_duration,
            json_agg(
                json_build_object(
                    'question', up.prompt_question,
                    'answer', up.prompt_answer,
                    'order', up.display_order
                ) ORDER BY up.display_order
            ) FILTER (WHERE up.display_stage = 'discovery') AS prompts
        FROM requests r
        JOIN users u ON u.id = r.sender_id
        LEFT JOIN user_prompts up ON up.user_id = u.id
        WHERE r.recipient_id = $1::uuid
          AND r.status = 'pending'
        GROUP BY r.id, u.id
        ORDER BY r.sent_at DESC
    """

    try:
        rows = await db.fetch(query, user_id)
        return {"requests": [dict(row) for row in rows], "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
