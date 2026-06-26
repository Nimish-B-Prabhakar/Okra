import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def get_db_pool():
    return await asyncpg.create_pool(DATABASE_URL)

# Global pool — created once on startup, reused across requests
pool = None

async def init_db():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)
    return pool

async def get_db():
    return pool