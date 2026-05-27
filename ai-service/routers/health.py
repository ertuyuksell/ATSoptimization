from fastapi import APIRouter

from inference.model_loader import ModelRegistry
from schemas.responses import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    loaded = ModelRegistry._job_role_model is not None
    return HealthResponse(status="ok", model_loaded=loaded, version="1.0.0")
