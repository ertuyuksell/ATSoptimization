"""Load and cache the existing trained .pkl model.

The model is loaded once at startup. We do NOT retrain; we only call
predict / predict_proba / transform on the loaded artifact.
"""
from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any, Optional

import joblib

from utils.config import settings
from utils.logger import logger


class ModelRegistry:
    _job_role_model: Optional[Any] = None

    @classmethod
    def bootstrap(cls) -> None:
        cls._job_role_model = cls._load(settings.model_path)

    @staticmethod
    def _load(path: Path) -> Any:
        if not path.exists():
            raise FileNotFoundError(f"Model file not found at {path.resolve()}")
        logger.info(f"Loading model artifact from {path}")
        try:
            return joblib.load(path)
        except Exception as exc:
            logger.warning(f"joblib.load failed ({exc}); falling back to pickle")
            with open(path, "rb") as f:
                return pickle.load(f)

    @classmethod
    def job_role_model(cls) -> Any:
        if cls._job_role_model is None:
            cls.bootstrap()
        return cls._job_role_model
