"""Resume text normalisation utilities."""
from __future__ import annotations

import re
import unicodedata

_WHITESPACE_RE = re.compile(r"\s+")
_BULLETS_RE = re.compile(r"[•●◦▪■□➢➣✓►]+")
_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_EMAIL_RE = re.compile(r"[\w.\-+]+@[\w\-]+\.[\w.\-]+")
_PHONE_RE = re.compile(r"\+?\d[\d\s().\-]{7,}\d")


def normalize_unicode(text: str) -> str:
    return unicodedata.normalize("NFKC", text)


def clean_resume_text(text: str, *, strip_pii: bool = False) -> str:
    if not text:
        return ""
    text = normalize_unicode(text)
    text = _BULLETS_RE.sub(" ", text)
    if strip_pii:
        text = _URL_RE.sub(" ", text)
        text = _EMAIL_RE.sub(" ", text)
        text = _PHONE_RE.sub(" ", text)
    text = _WHITESPACE_RE.sub(" ", text)
    return text.strip()


def to_lower_clean(text: str) -> str:
    return clean_resume_text(text, strip_pii=True).lower()
