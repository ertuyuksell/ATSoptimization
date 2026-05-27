from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from inference.inference_service import ResumeInferenceService
from preprocessing.pdf_extractor import PdfExtractionError, extract_text_from_pdf
from schemas.responses import AnalysisResponse
from utils.config import settings
from utils.logger import logger
from utils.security import verify_internal_api_key

router = APIRouter(prefix="/api/v1", tags=["analyze"], dependencies=[Depends(verify_internal_api_key)])

_service: Optional[ResumeInferenceService] = None


def get_service() -> ResumeInferenceService:
    global _service
    if _service is None:
        _service = ResumeInferenceService()
    return _service


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(default=None),
    service: ResumeInferenceService = Depends(get_service),
) -> AnalysisResponse:
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Only PDF resumes are accepted")

    payload = await file.read()
    if len(payload) > settings.max_pdf_size_mb * 1024 * 1024:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "PDF exceeds size limit")

    try:
        text, page_count = extract_text_from_pdf(payload)
    except PdfExtractionError as exc:
        logger.error(f"PDF extraction failed for {file.filename}: {exc}")
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))

    result = service.analyze(text, job_description)
    return AnalysisResponse(
        **result,
        page_count=page_count,
        char_count=len(text),
    )
