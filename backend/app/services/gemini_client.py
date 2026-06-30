import os
import time
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-6"

async def call_gemini(system_prompt: str, user_content: str) -> dict:
    """
    Calls Claude with a system prompt + user content.
    Returns raw text, latency, and token usage for logging.
    Function name kept as call_gemini for now to avoid touching every import site.
    """
    start = time.time()

    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {"role": "user", "content": f"{system_prompt}\n\n{user_content}" if system_prompt else user_content}
        ]
    )

    latency_ms = int((time.time() - start) * 1000)

    raw_text = message.content[0].text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    raw_text = raw_text.strip()

    input_tokens = message.usage.input_tokens
    output_tokens = message.usage.output_tokens

    # Claude Sonnet 4.6 pricing — $3/M input, $15/M output (verify current pricing)
    estimated_cost = (input_tokens * 0.000003) + (output_tokens * 0.000015)

    return {
        "raw_text": raw_text,
        "latency_ms": latency_ms,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "estimated_cost_usd": estimated_cost,
        "model": MODEL
    }