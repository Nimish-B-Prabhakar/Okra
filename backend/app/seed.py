import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fake profiles from the spec doc
PROFILES = [
    {
        "name": "Maya R.",
        "age": 27,
        "occupation": "Product designer",
        "looking_for": "relationship",
        "location_text": "2 miles away",
        "audio_duration": 22,
        "dealbreaker_tags": ["wants_kids_eventually", "non_smoker", "within_25_miles"],
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "The most uncomfortable thing I've done this year was...",
                "answer": "Quit a job I was good at because it was making me someone I didn't like. Took three weeks to tell anyone.",
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "You'll know we're compatible if...",
                "answer": "You think silence is underrated and you don't need to fill every moment with noise.",
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "The opinion I hold that most people disagree with is...",
                "answer": "Most people are more interesting in person than they think they are, and less interesting online than they pretend to be.",
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "Right now I'm looking for...",
                "answer": "Something real. Not in a rush, but not interested in a pen pal either.",
            },
        ],
    },
    {
        "name": "Jordan K.",
        "age": 29,
        "occupation": "High school English teacher",
        "looking_for": "relationship",
        "location_text": "5 miles away",
        "audio_duration": 20,
        "dealbreaker_tags": [
            "looking_for_relationship",
            "dog_friendly",
            "no_long_distance",
        ],
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "The last thing that genuinely surprised me was...",
                "answer": "A student who hated reading all year handed me a three-page letter on the last day of school. I had to step into the hallway.",
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "A non-negotiable in my life is...",
                "answer": "At least one meal a week that takes longer than 20 minutes to make. Cooking is how I decompress.",
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "My version of a perfect weekend involves...",
                "answer": "Farmer's market Saturday morning, something that gets me outside in the afternoon, dinner with people who don't look at their phones.",
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "I'm genuinely bad at...",
                "answer": "Leaving a bookstore without buying something. My apartment has a structural book problem.",
            },
        ],
    },
    {
        "name": "Priya S.",
        "age": 26,
        "occupation": "Data analyst",
        "looking_for": "relationship",
        "location_text": "8 miles away",
        "audio_duration": 18,
        "dealbreaker_tags": ["non_smoker", "open_to_kids", "active_lifestyle"],
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "Something most people don't know about me is...",
                "answer": "I used to do competitive swimming. Stopped at 18 and sometimes I miss it in a way that's hard to explain.",
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "The conversation I want to have on a first date is...",
                "answer": "Not 'what do you do' — I want to know what you were obsessed with at 14 and whether any of it stuck.",
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "I'm actively trying to get better at...",
                "answer": "Saying what I actually want instead of what I think sounds reasonable. Working on it.",
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "Right now I'm looking for...",
                "answer": "Someone I'd want to still be talking to after the first date nerves wear off.",
            },
        ],
    },
    {
        "name": "Marcus T.",
        "age": 31,
        "occupation": "Civil engineer",
        "looking_for": "relationship",
        "location_text": "3 miles away",
        "audio_duration": 24,
        "dealbreaker_tags": ["wants_kids", "relationship_focused", "within_30_miles"],
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "The thing I'm most proud of that's not on my resume is...",
                "answer": "Teaching my dad to video call. Took four weekends. Worth every minute.",
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "You'll know we click if...",
                "answer": "You have opinions about things. Doesn't matter what — food, films, the best way to spend a Sunday. I like someone who's thought about it.",
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "One thing I believe that's harder to live by than it sounds is...",
                "answer": "That how you do small things is how you do everything. I try to remember that when I'm losing patience.",
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "I'm looking for someone who...",
                "answer": "Is ready for something real and doesn't need to play it cool about it.",
            },
        ],
    },
    {
        "name": "Elena W.",
        "age": 28,
        "occupation": "Nurse practitioner",
        "looking_for": "relationship",
        "location_text": "6 miles away",
        "audio_duration": 21,
        "dealbreaker_tags": ["open_about_kids", "non_smoker", "emotionally_available"],
        "prompts": [
            {
                "stage": "discovery",
                "order": 1,
                "question": "A small thing that means a lot to me is...",
                "answer": "When someone remembers something specific you mentioned weeks ago and brings it up like it mattered. Because it did.",
            },
            {
                "stage": "discovery",
                "order": 2,
                "question": "The last time I was genuinely out of my comfort zone was...",
                "answer": "Solo trip to Portugal last October. Terrified the whole flight. Didn't want to leave.",
            },
            {
                "stage": "post_match",
                "order": 1,
                "question": "My love language in practice looks like...",
                "answer": "Sending you an article at 11pm because it made me think of something you said. Making sure you ate. Showing up.",
            },
            {
                "stage": "post_match",
                "order": 2,
                "question": "What I'm actually looking for is...",
                "answer": "A person, not a project. Someone with their own life who wants to share it.",
            },
        ],
    },
]


async def seed():
    conn = await asyncpg.connect(DATABASE_URL)

    print("Clearing existing data...")
    await conn.execute("TRUNCATE users, user_prompts CASCADE")

    print("Seeding profiles...")
    for profile in PROFILES:
        user_id = await conn.fetchval(
            """
            INSERT INTO users (name, age, occupation, looking_for, location_text, audio_duration, dealbreaker_tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        """,
            profile["name"],
            profile["age"],
            profile["occupation"],
            profile["looking_for"],
            profile["location_text"],
            profile["audio_duration"],
            profile["dealbreaker_tags"],
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
