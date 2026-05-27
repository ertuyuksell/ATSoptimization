"""
FastAPI AI microservice entrypoint.

Loads the existing trained .pkl model on startup and exposes endpoints for
resume analysis, ATS scoring, skill extraction, and job-resume similarity.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from inference.model_loader import ModelRegistry
from routers import analyze, health
from utils.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI service — loading model registry")
    ModelRegistry.bootstrap()
    logger.info("Model registry ready")
    yield
    logger.info("Shutting down AI service")


app = FastAPI(
    title="Resume Analyzer AI Service",
    version="1.0.0",
    description="NLP + ML inference microservice for ATS scoring and resume analytics",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyze.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=False)
