import json
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.services.gemini_client import call_gemini
from app.services.research_prompts import (
    SUFFICIENCY_CHECK_PROMPT,
    PIPELINE_1_V3_PROMPT,
    JUDGE_PROMPT
)

router = APIRouter()


def format_profile_text(prompts: list[dict]) -> str:
    lines = []
    for p in prompts:
        lines.append(f"Q: {p['question']}\nA: {p['answer']}")
    return "\n\n".join(lines)


@router.get("/profiles")
async def list_profiles():
    db = await get_db()
    rows = await db.fetch("""
        SELECT id, label, age, occupation, source, is_real_profile, created_at
        FROM research_profiles
        ORDER BY created_at DESC
    """)
    return {"profiles": [dict(r) for r in rows]}


@router.get("/profiles/{profile_id}")
async def get_profile(profile_id: str):
    db = await get_db()
    profile = await db.fetchrow(
        "SELECT * FROM research_profiles WHERE id = $1::uuid", profile_id
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    prompts = await db.fetch("""
        SELECT prompt_question, prompt_answer, word_count, position
        FROM research_profile_prompts
        WHERE profile_id = $1::uuid
        ORDER BY position
    """, profile_id)

    return {
        "profile": dict(profile),
        "prompts": [dict(p) for p in prompts]
    }


@router.post("/profiles")
async def create_profile(body: dict):
    """
    Creates a research profile with its prompts.
    Body: { label, age, occupation, source, is_real_profile, prompts: [{question, answer, position}] }
    """
    db = await get_db()

    profile_id = await db.fetchval("""
        INSERT INTO research_profiles (label, age, occupation, source, is_real_profile)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    """,
        body["label"],
        body.get("age"),
        body.get("occupation"),
        body.get("source", "manual"),
        body.get("is_real_profile", False)
    )

    for p in body.get("prompts", []):
        word_count = len(p["answer"].split())
        await db.execute("""
            INSERT INTO research_profile_prompts
                (profile_id, prompt_question, prompt_answer, word_count, position)
            VALUES ($1::uuid, $2, $3, $4, $5)
        """,
            profile_id,
            p["question"],
            p["answer"],
            word_count,
            p["position"]
        )

    return {"id": str(profile_id)}


@router.post("/sufficiency-check/{profile_id}")
async def sufficiency_check(profile_id: str):
    db = await get_db()

    prompts = await db.fetch("""
        SELECT prompt_question AS question, prompt_answer AS answer
        FROM research_profile_prompts
        WHERE profile_id = $1::uuid
        ORDER BY position
    """, profile_id)

    if not prompts:
        raise HTTPException(status_code=400, detail="Profile has no prompts")

    profile_text = format_profile_text([dict(p) for p in prompts])
    full_prompt = SUFFICIENCY_CHECK_PROMPT.format(profile_text=profile_text)

    result = await call_gemini(system_prompt="", user_content=full_prompt)

    try:
        parsed = json.loads(result["raw_text"])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse sufficiency check response")

    return {
        "passes": parsed["passes"],
        "confidence": parsed["confidence"],
        "reason": parsed["reason"],
        "conviction_statements_found": parsed.get("conviction_statements_found", []),
        "latency_ms": result["latency_ms"],
        "estimated_cost_usd": result["estimated_cost_usd"]
    }


@router.get("/prompt-versions")
async def list_prompt_versions(pipeline: str = None):
    db = await get_db()
    if pipeline:
        rows = await db.fetch("""
            SELECT id, pipeline, version_label, notes, created_at
            FROM research_prompt_versions
            WHERE pipeline = $1
            ORDER BY created_at DESC
        """, pipeline)
    else:
        rows = await db.fetch("""
            SELECT id, pipeline, version_label, notes, created_at
            FROM research_prompt_versions
            ORDER BY created_at DESC
        """)
    return {"versions": [dict(r) for r in rows]}


@router.post("/generate")
async def generate_game(body: dict):
    """
    Body: { profile_a_id, profile_b_id, prompt_version_id }
    Runs Pipeline 1 v3 generation against both profiles.
    """
    db = await get_db()

    profile_a = await db.fetchrow(
        "SELECT * FROM research_profiles WHERE id = $1::uuid", body["profile_a_id"]
    )
    profile_b = await db.fetchrow(
        "SELECT * FROM research_profiles WHERE id = $1::uuid", body["profile_b_id"]
    )
    if not profile_a or not profile_b:
        raise HTTPException(status_code=404, detail="One or both profiles not found")

    prompts_a = await db.fetch("""
        SELECT prompt_question AS question, prompt_answer AS answer
        FROM research_profile_prompts WHERE profile_id = $1::uuid ORDER BY position
    """, body["profile_a_id"])
    prompts_b = await db.fetch("""
        SELECT prompt_question AS question, prompt_answer AS answer
        FROM research_profile_prompts WHERE profile_id = $1::uuid ORDER BY position
    """, body["profile_b_id"])

    profile_a_text = format_profile_text([dict(p) for p in prompts_a])
    profile_b_text = format_profile_text([dict(p) for p in prompts_b])

    full_prompt = PIPELINE_1_V3_PROMPT.format(
        name_a=profile_a["label"],
        profile_a_text=profile_a_text,
        name_b=profile_b["label"],
        profile_b_text=profile_b_text
    )

    result = await call_gemini(system_prompt="", user_content=full_prompt)

    try:
        parsed = json.loads(result["raw_text"])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Failed to parse generation response: {result['raw_text'][:200]}")

    run_id = await db.fetchval("""
        INSERT INTO research_generation_runs (
            profile_a_id, profile_b_id, prompt_version_id, raw_response,
            model_used, latency_ms, input_tokens, output_tokens, estimated_cost_usd
        )
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9)
        RETURNING id
    """,
        body["profile_a_id"],
        body["profile_b_id"],
        body.get("prompt_version_id"),
        result["raw_text"],
        result["model"],
        result["latency_ms"],
        result["input_tokens"],
        result["output_tokens"],
        result["estimated_cost_usd"]
    )

    questions = []
    for q in parsed.get("questions", []):
        question_id = await db.fetchval("""
            INSERT INTO research_generated_questions (
                run_id, question_number, question_text, source_a, source_b, model_rationale
            )
            VALUES ($1::uuid, $2, $3, $4, $5, $6)
            RETURNING id
        """,
            run_id,
            q["question_number"],
            q["question_text"],
            q.get("source_a"),
            q.get("source_b"),
            q.get("why_this_works")
        )
        questions.append({
            "id": str(question_id),
            **q
        })

    return {
        "run_id": str(run_id),
        "questions": questions,
        "skipped_reason": parsed.get("skipped_reason"),
        "latency_ms": result["latency_ms"],
        "estimated_cost_usd": result["estimated_cost_usd"]
    }


@router.post("/score/{question_id}")
async def save_manual_score(question_id: str, body: dict):
    db = await get_db()
    score_id = await db.fetchval("""
        INSERT INTO research_manual_scores (question_id, score, notes)
        VALUES ($1::uuid, $2, $3)
        RETURNING id
    """,
        question_id,
        body["score"],
        body.get("notes")
    )
    return {"id": str(score_id)}


@router.post("/judge/{question_id}")
async def run_judge(question_id: str):
    db = await get_db()

    question = await db.fetchrow("""
        SELECT gq.*, gr.profile_a_id, gr.profile_b_id
        FROM research_generated_questions gq
        JOIN research_generation_runs gr ON gr.id = gq.run_id
        WHERE gq.id = $1::uuid
    """, question_id)

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    prompts_a = await db.fetch("""
        SELECT prompt_question AS question, prompt_answer AS answer
        FROM research_profile_prompts WHERE profile_id = $1::uuid ORDER BY position
    """, question["profile_a_id"])
    prompts_b = await db.fetch("""
        SELECT prompt_question AS question, prompt_answer AS answer
        FROM research_profile_prompts WHERE profile_id = $1::uuid ORDER BY position
    """, question["profile_b_id"])

    profile_context = format_profile_text([dict(p) for p in prompts_a] + [dict(p) for p in prompts_b])

    full_prompt = JUDGE_PROMPT.format(
        question_text=question["question_text"],
        source_a=question["source_a"] or "",
        source_b=question["source_b"] or "",
        profile_context=profile_context
    )

    result = await call_gemini(system_prompt="", user_content=full_prompt)

    try:
        parsed = json.loads(result["raw_text"])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse judge response")

    judge_score_id = await db.fetchval("""
        INSERT INTO research_judge_scores (
            question_id, judge_model, rubric_version,
            references_real_content, genuine_forced_binary, both_sides_cost_something,
            under_word_limit, avoids_clinical_language, comparable_stakes, total_score, judge_raw_response
        )
        VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
    """,
        question_id,
        result["model"],
        "v1",
        parsed["references_real_content"],
        parsed["genuine_forced_binary"],
        parsed["both_sides_cost_something"],
        parsed["under_word_limit"],
        parsed["avoids_clinical_language"],
        parsed["comparable_stakes"],
        parsed["total_score"],
        result["raw_text"]
    )

    return {"id": str(judge_score_id), **parsed}


@router.get("/analytics/summary")
async def analytics_summary():
    db = await get_db()

    total_runs = await db.fetchval("SELECT COUNT(*) FROM research_generation_runs")
    total_questions = await db.fetchval("SELECT COUNT(*) FROM research_generated_questions")
    avg_manual_score = await db.fetchval("SELECT AVG(score) FROM research_manual_scores")

    agreement_data = await db.fetch("""
        SELECT ms.score AS manual_score, js.total_score AS judge_score
        FROM research_manual_scores ms
        JOIN research_judge_scores js ON js.question_id = ms.question_id
    """)

    matches = 0
    total_compared = len(agreement_data)
    for row in agreement_data:
        m, j = row["manual_score"], row["judge_score"]
        m_bucket = "good" if m >= 4 else ("bad" if m <= 2 else "neutral")
        j_bucket = "good" if j >= 4 else ("bad" if j <= 2 else "neutral")
        if m_bucket == j_bucket:
            matches += 1

    agreement_rate = (matches / total_compared * 100) if total_compared > 0 else None

    return {
        "total_runs": total_runs,
        "total_questions": total_questions,
        "avg_manual_score": float(avg_manual_score) if avg_manual_score else None,
        "judge_manual_agreement_rate": agreement_rate,
        "total_compared": total_compared
    }