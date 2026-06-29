import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

PROFILES = [
    {
        "name": "Maya R.",
        "age": 27,
        "occupation": "Product designer",
        "location_text": "2 miles away",
        "audio_duration": 22,
        "audio_prompt": "What did you actually do last weekend — not the highlight, just the whole thing?",
        "dating_intention": "Something long-term",
        "politics": "Liberal",
        "sexuality": "Straight",
        "has_kids": "No kids, open to them",
        "drinking": "Socially",
        "smoking": "Never",
        "religion": "Agnostic",
        "astrology_sign": "Scorpio",
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "The most uncomfortable thing I've done this year was...",
                "answer": "Quit a job I was good at because it was making me someone I didn't like. Took three weeks to tell anyone."
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "If I'm being honest about what I want right now...",
                "answer": "Something real. Not in a rush, but not interested in a pen pal either. I've done situationships and I'm done."
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "Something I'm genuinely working on...",
                "answer": "Saying what I actually want instead of what I think sounds reasonable. Working on it."
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "Something I believe that's harder to live by than it sounds...",
                "answer": "Most people are more interesting in person than they think they are. I try to remember that."
            }
        ]
    },
    {
        "name": "Jordan K.",
        "age": 29,
        "occupation": "High school English teacher",
        "location_text": "5 miles away",
        "audio_duration": 20,
        "audio_prompt": "Tell me something you're looking forward to in the next few weeks.",
        "dating_intention": "Life partner",
        "politics": "Progressive",
        "sexuality": "Straight",
        "has_kids": "No kids, want them someday",
        "drinking": "Rarely",
        "smoking": "Never",
        "religion": "Spiritual but not religious",
        "astrology_sign": "Virgo",
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "The last thing that genuinely surprised me was...",
                "answer": "A student who hated reading all year handed me a three-page letter on the last day of school. I had to step into the hallway."
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "What actually brought me here is...",
                "answer": "I want someone I'd actually want to tell about my day. That sounds simple but it's apparently not."
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "Something I'm genuinely working on...",
                "answer": "Leaving work at work. I care a lot about my students and it follows me home more than it should."
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "Something I believe that's harder to live by than it sounds...",
                "answer": "That how you do small things is how you do everything. I try to remember that when I'm losing patience."
            }
        ]
    },
    {
        "name": "Priya S.",
        "age": 26,
        "occupation": "Data analyst",
        "location_text": "8 miles away",
        "audio_duration": 18,
        "audio_prompt": "Describe something small that made you happy recently.",
        "dating_intention": "Something long-term",
        "politics": "Liberal",
        "sexuality": "Bisexual",
        "has_kids": "No kids, open to them",
        "drinking": "Socially",
        "smoking": "Never",
        "religion": "Hindu",
        "astrology_sign": "Cancer",
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "Something most people don't know about me is...",
                "answer": "I used to do competitive swimming. Stopped at 18 and sometimes I miss it in a way that's hard to explain."
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "The kind of connection I'm ready for is...",
                "answer": "Something I'd still want to be in after the first date nerves wear off. I'm not here to collect matches."
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "Something I'm genuinely working on...",
                "answer": "Saying what I actually want instead of what I think sounds reasonable. Working on it."
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "One thing I won't compromise on...",
                "answer": "Intellectual curiosity. Doesn't matter what the things are — just that there are things you care about."
            }
        ]
    },
    {
        "name": "Marcus T.",
        "age": 31,
        "occupation": "Civil engineer",
        "location_text": "3 miles away",
        "audio_duration": 24,
        "audio_prompt": "What's something you've been thinking about a lot lately?",
        "dating_intention": "Life partner",
        "politics": "Moderate",
        "sexuality": "Straight",
        "has_kids": "No kids, want them",
        "drinking": "Socially",
        "smoking": "Never",
        "religion": "Christian — Protestant",
        "astrology_sign": "Taurus",
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "Something I'm quietly proud of that isn't on my resume...",
                "answer": "Teaching my dad to video call. Took four weekends. Worth every minute."
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "Right now I'm looking for...",
                "answer": "Someone ready for something real who doesn't need to play it cool about it. I'm not playing it cool either."
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "Something I'm genuinely working on...",
                "answer": "Slowing down. I build things for a living and I have to remind myself relationships aren't construction projects."
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "Something I believe that's harder to live by than it sounds...",
                "answer": "That how you do small things is how you do everything. I try to remember that when I'm losing patience."
            }
        ]
    },
    {
        "name": "Elena W.",
        "age": 28,
        "occupation": "Nurse practitioner",
        "location_text": "6 miles away",
        "audio_duration": 21,
        "audio_prompt": "What's something you do that most people your age don't?",
        "dating_intention": "Something long-term",
        "politics": "Liberal",
        "sexuality": "Straight",
        "has_kids": "No kids, open to them",
        "drinking": "Rarely",
        "smoking": "Never",
        "religion": "Spiritual but not religious",
        "astrology_sign": "Pisces",
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "A small thing that means a lot to me is...",
                "answer": "When someone remembers something specific you mentioned weeks ago and brings it up like it mattered. Because it did."
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "If I'm being honest about what I want right now...",
                "answer": "A person, not a project. Someone with their own life who wants to share it. I'm not looking to be someone's fixer-upper either."
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "Something I'm genuinely working on...",
                "answer": "Not taking work home with me emotionally. Long shifts make that hard. I'm better at it than I used to be."
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "Something I've learned I need in a relationship...",
                "answer": "Someone who can be emotionally present. Not perfect — just present and trying."
            }
        ]
    }
]

async def seed():
    conn = await asyncpg.connect(DATABASE_URL)

    print("Clearing existing data...")
    await conn.execute("TRUNCATE users, user_prompts CASCADE")

    print("Seeding profiles...")
    for profile in PROFILES:
        user_id = await conn.fetchval(
            """
            INSERT INTO users (name, age, occupation, location_text,
            audio_duration, audio_prompt,
            dating_intention, politics, sexuality,
            has_kids, drinking, smoking, religion, astrology_sign)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
        """,
            profile["name"],
            profile["age"],
            profile["occupation"],
            profile["location_text"],
            profile["audio_duration"],
            profile["audio_prompt"],
            profile["dating_intention"],
            profile["politics"],
            profile["sexuality"],
            profile["has_kids"],
            profile["drinking"],
            profile["smoking"],
            profile["religion"],
            profile["astrology_sign"],
        )

        for prompt in profile["prompts"]:
            await conn.execute(
                """
                INSERT INTO user_prompts (user_id, prompt_question, prompt_answer, display_stage, display_order)
                VALUES ($1, $2, $3, $4, $5)
            """,
                user_id,
                prompt["question"],
                prompt["answer"],
                prompt["stage"],
                prompt["order"],
            )

        print(f"  ✓ {profile['name']}")

    await conn.close()
    print("\nDone. Database seeded with 5 profiles.")


if __name__ == "__main__":
    asyncio.run(seed())
