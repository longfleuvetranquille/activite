import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

logging.basicConfig(level=logging.INFO)
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import crawl, dashboard, events, preferences, tags
from app.config import settings
from app.scheduler.scheduler import start_scheduler, stop_scheduler
from app.services.pocketbase import pb_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await pb_client.connect()
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="Palmier API",
    description="Découvre les meilleures activités à Cannes et sur la Côte d'Azur",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(crawl.router, prefix="/api/crawl", tags=["crawl"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["preferences"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "env": settings.api_env}
