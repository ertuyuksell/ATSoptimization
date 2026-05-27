from fastapi import Header, HTTPException, status

from utils.config import settings


async def verify_internal_api_key(x_internal_api_key: str = Header(default="")) -> None:
    """Lightweight shared-secret check between Spring Boot gateway and AI service."""
    if not x_internal_api_key or x_internal_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key",
        )
