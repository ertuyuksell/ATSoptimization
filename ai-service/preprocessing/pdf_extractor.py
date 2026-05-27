"""PDF text extraction with safe fallback between PyMuPDF and pdfplumber."""
from __future__ import annotations

import io
from typing import Tuple

import fitz  # PyMuPDF
import pdfplumber

from utils.logger import logger


class PdfExtractionError(Exception):
    pass


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """Return (text, page_count). Raises PdfExtractionError on invalid input."""
    if not file_bytes:
        raise PdfExtractionError("Empty file payload")

    # Try PyMuPDF first — fastest, generally most reliable
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            pages = [page.get_text("text") for page in doc]
            text = "\n".join(pages).strip()
            if text:
                return text, len(pages)
    except Exception as exc:
        logger.warning(f"PyMuPDF extraction failed, falling back: {exc}")

    # Fallback to pdfplumber for tricky layouts
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [(p.extract_text() or "") for p in pdf.pages]
            text = "\n".join(pages).strip()
            if text:
                return text, len(pages)
    except Exception as exc:
        logger.error(f"pdfplumber fallback failed: {exc}")
        raise PdfExtractionError("Could not extract text from PDF") from exc

    raise PdfExtractionError("PDF contained no extractable text")
