"""High-level inference service that combines the trained .pkl model with NLP analytics."""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from inference.model_loader import ModelRegistry
from preprocessing.nlp_pipeline import cosine_similarity, embed
from preprocessing.skill_extractor import (
    detect_sections,
    extract_skills,
    missing_keywords,
)
from preprocessing.text_cleaner import clean_resume_text, to_lower_clean
from utils.logger import logger


class ResumeInferenceService:
    """Orchestrates the full resume analysis pipeline."""

    def __init__(self) -> None:
        self.model = ModelRegistry.job_role_model()

    # ---------- Job-role classification ----------
    def predict_job_role(self, resume_text: str) -> Tuple[str, float, List[Dict[str, float]]]:
        """Run the loaded .pkl model to predict the most likely job role."""
        cleaned = to_lower_clean(resume_text)
        try:
            pred = self.model.predict([cleaned])[0]
        except Exception as exc:
            logger.error(f"Model predict failed: {exc}")
            return "Unknown", 0.0, []

        confidence = 0.0
        top_k: List[Dict[str, float]] = []
        if hasattr(self.model, "predict_proba"):
            try:
                proba = self.model.predict_proba([cleaned])[0]
                classes = list(getattr(self.model, "classes_", []))
                pairs = sorted(
                    zip(classes, proba), key=lambda p: p[1], reverse=True
                )[:5]
                top_k = [{"role": str(c), "probability": float(p)} for c, p in pairs]
                confidence = float(max(proba))
            except Exception as exc:
                logger.warning(f"predict_proba unavailable: {exc}")

        return str(pred), confidence, top_k

    # ---------- ATS scoring ----------
    @staticmethod
    def compute_ats_score(
        resume_text: str,
        sections: Dict[str, bool],
        skills: List[str],
        jd_match_ratio: Optional[float],
    ) -> Tuple[int, Dict[str, int]]:
        """Heuristic ATS score (0-100) with sub-component breakdown."""
        word_count = len(resume_text.split())

        # 1. Length score (resumes 350-900 words score best)
        if 350 <= word_count <= 900:
            length_score = 100
        elif word_count < 350:
            length_score = max(20, int(word_count / 350 * 100))
        else:
            length_score = max(40, 100 - (word_count - 900) // 50)
        length_score = min(100, length_score)

        # 2. Section completeness — canonical keys are populated by detect_sections() for EN+TR
        critical = ["experience", "education", "skills"]
        section_hits = sum(1 for s in critical if sections.get(s))
        section_score = int(section_hits / len(critical) * 100)

        # 3. Skill density
        if word_count == 0:
            skill_score = 0
        else:
            density = len(skills) / max(1, word_count / 100)
            skill_score = int(min(100, density * 25))

        # 4. Formatting (penalize obviously poor extractions)
        formatting_score = 100 if word_count > 120 else 50

        # 5. JD alignment (if provided)
        jd_score = int((jd_match_ratio or 0.0) * 100) if jd_match_ratio is not None else None

        components: Dict[str, int] = {
            "length": length_score,
            "sections": section_score,
            "skills": skill_score,
            "formatting": formatting_score,
        }
        if jd_score is not None:
            components["job_match"] = jd_score
            ats = int(0.20 * length_score + 0.20 * section_score + 0.20 * skill_score
                     + 0.10 * formatting_score + 0.30 * jd_score)
        else:
            ats = int(0.30 * length_score + 0.30 * section_score + 0.25 * skill_score
                     + 0.15 * formatting_score)

        return max(0, min(100, ats)), components

    # ---------- Job-resume similarity ----------
    @staticmethod
    def semantic_similarity(resume_text: str, job_description: str) -> float:
        if not job_description:
            return 0.0
        embeddings = embed([resume_text[:5000], job_description[:5000]])
        return cosine_similarity(embeddings[0], embeddings[1])

    # ---------- Quality heuristics ----------
    @staticmethod
    def quality_signals(resume_text: str, sections: Dict[str, bool]) -> Dict[str, Any]:
        words = resume_text.split()
        bullet_lines = sum(1 for line in resume_text.splitlines() if line.strip().startswith(("-", "*")))
        digits = sum(c.isdigit() for c in resume_text)
        return {
            "word_count": len(words),
            "bullet_lines": bullet_lines,
            "quantified_achievements": digits > 15,
            "has_summary": bool(sections.get("summary") or sections.get("objective")),
            "has_projects": bool(sections.get("projects")),
            "has_certifications": bool(sections.get("certifications")),
        }

    # ---------- Recruiter simulation ----------
    @staticmethod
    def recruiter_simulation(ats_score: int, quality: Dict[str, Any], skills: List[str]) -> Dict[str, Any]:
        verdict = "Güçlü aday" if ats_score >= 80 else (
            "Telefon görüşmesine değer" if ats_score >= 60
            else "ATS tarafından otomatik elenebilir"
        )
        recommendations: List[str] = []
        if quality["word_count"] < 350:
            recommendations.append("CV çok kısa — deneyim girdilerini daha ayrıntılı açıklayın.")
        if not quality["quantified_achievements"]:
            recommendations.append("Madde işaretlerine sayısal çıktılar ekleyin (rakam, %, ₺, ölçek).")
        if not quality["has_summary"]:
            recommendations.append("CV’nin başına 2-3 satırlık profesyonel bir özet ekleyin.")
        if not quality["has_projects"]:
            recommendations.append("Yetkinliklerinizi göstermek için bir Projeler bölümü ekleyin.")
        if len(skills) < 8:
            recommendations.append("Yetenekler bölümünde daha fazla teknik beceriyi açıkça belirtin.")
        return {"verdict": verdict, "recommendations": recommendations}

    # ---------- Full pipeline ----------
    def analyze(self, raw_text: str, job_description: Optional[str] = None) -> Dict[str, Any]:
        cleaned = clean_resume_text(raw_text)
        sections = detect_sections(cleaned)
        skills = extract_skills(cleaned)

        role, confidence, top_roles = self.predict_job_role(cleaned)

        jd_similarity: Optional[float] = None
        matched, missing = [], []
        if job_description:
            jd_similarity = self.semantic_similarity(cleaned, job_description)
            matched, missing = missing_keywords(cleaned, job_description)

        ats_score, components = self.compute_ats_score(cleaned, sections, skills, jd_similarity)
        quality = self.quality_signals(cleaned, sections)
        recruiter = self.recruiter_simulation(ats_score, quality, skills)

        return {
            "predicted_role": role,
            "confidence": confidence,
            "top_role_candidates": top_roles,
            "ats_score": ats_score,
            "ats_components": components,
            "skills": skills,
            "skill_count": len(skills),
            "sections_detected": sections,
            "quality_signals": quality,
            "recruiter_simulation": recruiter,
            "job_match": {
                "similarity": jd_similarity,
                "matched_keywords": matched,
                "missing_keywords": missing,
            } if job_description else None,
        }
