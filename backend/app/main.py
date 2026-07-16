"""
FinTwin AI — FastAPI application entrypoint.
Run with: uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import (
    auth_router, profile_router, investments_router, loans_router,
    goals_router, simulation_router, predictions_router, health_router,
    advisor_router, dashboard_router,
)

# Create all tables on startup (SQLite — no migrations needed for this project)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinTwin AI — Financial Digital Twin API",
    description="Backend for the FinTwin AI financial digital twin and scenario simulation platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(investments_router.router)
app.include_router(loans_router.router)
app.include_router(goals_router.router)
app.include_router(simulation_router.router)
app.include_router(predictions_router.router)
app.include_router(health_router.router)
app.include_router(advisor_router.router)
app.include_router(dashboard_router.router)


@app.get("/")
def root():
    return {"message": "FinTwin AI API is running.", "docs": "/docs"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
