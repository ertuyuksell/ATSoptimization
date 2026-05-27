from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8000

    model_path: Path = Path("models/job_role_classifier.pkl")
    spacy_model: str = "en_core_web_sm"
    sbert_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    max_pdf_size_mb: int = 15
    cors_origins: List[str] = ["*"]
    api_key: str = "change-me-internal-key"


settings = Settings()
