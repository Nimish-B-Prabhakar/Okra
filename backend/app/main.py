from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import discovery, requests

app = FastAPI(title="Okra API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/health")
async def health():
    return {"status": "ok", "app": "okra"}


app.include_router(discovery.router, prefix="/api/discovery", tags=["discovery"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])
