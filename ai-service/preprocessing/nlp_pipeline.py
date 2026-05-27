"""spaCy + Sentence-BERT pipeline (lazy, singleton)."""
from __future__ import annotations

from functools import lru_cache
from typing import List

import numpy as np
import spacy
from sentence_transformers import SentenceTransformer

from utils.config import settings
from utils.logger import logger


@lru_cache(maxsize=1)
def get_spacy():
    try:
        return spacy.load(settings.spacy_model, disable=["parser", "lemmatizer"])
    except OSError:
        logger.warning(f"spaCy model '{settings.spacy_model}' not found — using blank English pipeline")
        return spacy.blank("en")


@lru_cache(maxsize=1)
def get_sbert() -> SentenceTransformer:
    logger.info(f"Loading Sentence-BERT model: {settings.sbert_model}")
    return SentenceTransformer(settings.sbert_model)


def embed(texts: List[str]) -> np.ndarray:
    if not texts:
        return np.zeros((0, 384), dtype=np.float32)
    return get_sbert().encode(texts, normalize_embeddings=True, convert_to_numpy=True)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if a.ndim == 1:
        a = a.reshape(1, -1)
    if b.ndim == 1:
        b = b.reshape(1, -1)
    return float(np.dot(a, b.T).flatten()[0])
