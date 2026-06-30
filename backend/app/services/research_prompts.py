SUFFICIENCY_CHECK_PROMPT = """You are checking whether a dating profile contains enough genuine, conviction-bearing content to support generating a personalized forced-binary game question. You are NOT generating the game - only assessing whether generation is worth attempting.

A profile passes if it contains at least one statement with real emotional weight, specificity, or conviction - not a generic, low-effort, or purely factual answer.

Examples of PASS-worthy content:
- "Quit a job I was good at because it was making me someone I didn't like" (specific, costly decision, real stakes)
- "watching Philadelphia sports, although it's not always simple" (qualifying detail signals real emotional investment)

Examples of FAIL content:
- "Typical Sunday... naps" (no specificity, no conviction)
- "I like hiking, traveling, and good food" (generic list, no stakes)

Evaluate the profile below and output JSON only, no other text:
{{
  "passes": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "one sentence explaining the determination",
  "conviction_statements_found": ["list any qualifying statements found, empty array if none"]
}}

Profile:
{profile_text}"""


PIPELINE_1_V3_PROMPT = """You are mining a dating profile for the two most emotionally loaded things a person has said about themselves, and forcing them into an impossible binary choice.

YOUR PROCESS - follow these steps in order:

STEP 1 - Read every prompt answer on this profile. Identify anything stated with real conviction, devotion, or identity weight. Ignore generic interests (e.g. "I like reading"). Look for things stated with intensity, repetition, or a qualifying detail that shows it's not casual (e.g. "although it's not always simple" signals genuine emotional investment, not a passing mention).

STEP 2 - From everything you identified, pick TWO things this specific person cares about that would be genuinely painful or absurd to choose between. The best pairs combine something life-changing (relationships, family, identity) with something seemingly trivial but emotionally loaded (a sports team, a hometown ritual, a strong stated preference) - because the mismatch in stakes IS the joke.

STEP 3 - Phrase it as a forced "would you rather" with zero escape routes. No "it depends." No third option. Make both sides cost something real to THIS person specifically, using their own words or clear paraphrase of what they said.

STEP 4 - Repeat this process to generate up to 4 different forced binaries from the SAME profile, each pulling from a different stated conviction. If the profile has fewer than 4 genuinely weighty things to work with, write FEWER questions rather than inventing generic ones or duplicating the same underlying tension with different wording. Quality and distinctiveness over hitting a count.

RULES:
- Every question must reference something the person actually said, directly or in clear paraphrase. Never invent a scenario that has nothing to do with their stated content.
- The humor comes from real stakes colliding with absurd stakes - not from an invented wacky situation.
- Maximum 20 words per question.
- Write the question the way you'd actually say it out loud to a friend who'd find it funny, not the way you'd write it in a report.

OUTPUT - return valid JSON only, no markdown formatting, no other text:
{{
  "questions": [
    {{
      "question_number": 1,
      "question_text": "string",
      "source_a": "string - quote or close paraphrase",
      "source_b": "string - quote or close paraphrase",
      "why_this_works": "string - one sentence"
    }}
  ],
  "skipped_reason": "string or null - if fewer than 4 questions were generated, explain why"
}}

Profile A ({name_a}):
{profile_a_text}

Profile B ({name_b}):
{profile_b_text}"""


JUDGE_PROMPT = """You are scoring a generated dating-app game question against a strict rubric. Score each criterion as true or false only - do not use a sliding scale, do not explain unless asked. Binary judgments produce more consistent scoring than open scales.

CRITERIA:
1. references_real_content - Does the question clearly pull from specific, identifiable content in the source profile statements, rather than inventing an unrelated scenario?
2. genuine_forced_binary - Are both options real costs with no implied "correct" or "obviously better" answer, and no escape route ("it depends")?
3. both_sides_cost_something - Would choosing EITHER option require this specific person to give up something they said they value?
4. under_word_limit - Is the question 20 words or fewer?
5. avoids_clinical_language - Does the question avoid words like balance, dynamic, framework, mechanism, emotional encouragement, or other therapy/HR-adjacent phrasing?
6. comparable_stakes - Do both options belong on roughly the same scale of seriousness, such that a reasonable person would genuinely hesitate before choosing?

   This is the most commonly mis-scored criterion. Apply this test explicitly before answering:

   Ask yourself "if someone genuinely had to give up option A forever, would that be a real, felt loss for them - not just 'technically true' but actually costly in the way option B is costly?" If one option is a settled factual belief, a core ethical principle, or anything a person would never seriously reconsider regardless of stakes, while the other is a minor lifestyle preference, the pairing FAILS this criterion even if every other criterion passes.

   PASSES comparable_stakes (both sides are real, felt costs at similar weight, even if one is more "serious" in tone):
   - "Disown the Phillies forever, or give up rescuing stray animals" - both are identity-level devotions, neither is a settled fact or a trivial habit
   - "Never plan a perfect trip again, or give up your matcha walks" - both are cherished personal rituals of similar weight

   FAILS comparable_stakes (one side is not a real choice because it isn't actually negotiable for a reasonable person, or the gap in weight is too large to feel like tension):
   - "Believe the earth is flat, or put sugar in your coffee" - believing a false fact is not something anyone would trade a coffee preference for; there's no real hesitation
   - "Disavow housing as a human right, or stop looking at tide pools" - a moral/political conviction against a minor hobby; one side is not seriously up for negotiation
   - "Be unkind to the defenseless, or watch new TV shows" - basic ethical conduct against entertainment preference; not a genuine dilemma

   The pattern to watch for: anything phrased as "disavow," "stop believing," "accept that X is false," or "be cruel/unkind" on one side, paired against a hobby, food preference, or entertainment habit on the other side, should almost always FAIL this criterion. Settled facts and core ethics are not real trade-off material against lifestyle preferences.

   This criterion is binary. If you are uncertain, default to FALSE rather than TRUE - false negatives (rejecting a borderline-acceptable question) are far less costly than false positives (approving an unfun question), since a rejected question simply doesn't get used, while an approved bad question reaches a real user.

Score the question below against these 6 criteria.

Question: {question_text}
Source A: {source_a}
Source B: {source_b}
Original profile context: {profile_context}

Output JSON only, no other text:
{{
  "references_real_content": true/false,
  "genuine_forced_binary": true/false,
  "both_sides_cost_something": true/false,
  "under_word_limit": true/false,
  "avoids_clinical_language": true/false,
  "comparable_stakes": true/false,
  "total_score": 0-6
}}"""