import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SCORE_PROMPT = """You are evaluating a comment written on a dating app profile.
The user read a prompt and answer from someone's profile, then wrote a comment before seeing any photos.

Prompt question: {prompt_question}
Prompt answer: {prompt_answer}
Comment written: {comment}

Score this comment on two dimensions:

1. SPECIFICITY (0-1): Does the comment reference concrete details from the prompt answer,
   or is it generic enough to apply to any profile?
   - 0.0-0.3: Completely generic ("sounds interesting", "I relate to this", "wow")
   - 0.4-0.6: Somewhat specific but could apply to many profiles
   - 0.7-1.0: References specific details, shows they actually read the answer

2. GENUINE ENGAGEMENT (0-1): Does this feel like a real human reaction to a real person,
   or does it feel like someone trying to meet a word count?
   - 0.0-0.3: Filler, performative, or hollow
   - 0.4-0.6: Decent but surface level
   - 0.7-1.0: Feels like a real person reacting to a real person

Return JSON only, no other text, no markdown:
{{
  "specificity": 0.0,
  "genuine_engagement": 0.0,
  "overall": 0.0,
  "reasoning": "one sentence explaining the score",
  "nudge": "one sentence suggestion to improve, or null if overall score >= 0.7"
}}"""


async def score_comment(comment: str, prompt_question: str, prompt_answer: str) -> dict:
    """
    Scores a comment using Claude.
    Returns scores, reasoning, and a nudge if quality is low.
    """
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": SCORE_PROMPT.format(
                    prompt_question=prompt_question,
                    prompt_answer=prompt_answer,
                    comment=comment,
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if model adds them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)

    # Validate expected fields exist
    required = ["specificity", "genuine_engagement", "overall", "reasoning", "nudge"]
    for field in required:
        if field not in result:
            raise ValueError(f"Missing field in scoring response: {field}")

    return result


def get_nudge_message(score_result: dict) -> str | None:
    """
    Returns a user-facing nudge message if comment quality is low.
    Frames it as helpful advice, not criticism.
    """
    if score_result["overall"] >= 0.7:
        return None

    base_nudge = score_result.get("nudge")

    if score_result["overall"] < 0.4:
        return f"Comments that reference something specific tend to get noticed more. {base_nudge}"

    return f"You're almost there — {base_nudge}"
