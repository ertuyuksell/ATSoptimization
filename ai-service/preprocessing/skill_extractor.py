"""Lexicon-driven skill extractor with spaCy noun-chunk fallback."""
from __future__ import annotations

from typing import Dict, List, Set, Tuple

from preprocessing.nlp_pipeline import get_spacy

# Curated skill lexicon (extend as needed). Lowercased canonical forms.
SKILL_LEXICON: Set[str] = {
    # Programming languages
    "python", "java", "c++", "c#", "javascript", "typescript", "go", "rust",
    "kotlin", "swift", "scala", "ruby", "php", "r", "sql", "bash",
    # Frontend
    "react", "next.js", "vue", "angular", "tailwindcss", "redux", "html", "css",
    "framer motion", "sass", "webpack", "vite",
    # Backend
    "spring boot", "spring", "django", "flask", "fastapi", "express", "node.js",
    "nestjs", ".net", "graphql", "rest", "grpc",
    # Data / AI
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "spacy",
    "transformers", "huggingface", "langchain", "llm", "rag",
    # DevOps / Cloud
    "docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions",
    "aws", "gcp", "azure", "linux", "nginx", "redis", "kafka",
    # Databases
    "postgresql", "mysql", "mongodb", "elasticsearch", "cassandra", "dynamodb",
    # Soft / general
    "agile", "scrum", "ci/cd", "tdd", "microservices", "system design",
}

# Common ATS-friendly section headers (English + Turkish)
ATS_SECTIONS = {
    # English
    "experience", "work experience", "professional experience",
    "education", "skills", "technical skills", "projects",
    "certifications", "summary", "objective", "achievements",
    "publications", "languages",
    # Turkish
    "deneyim", "iş deneyimi", "is deneyimi", "profesyonel deneyim",
    "çalışma deneyimi", "calisma deneyimi", "iş tecrübesi",
    "eğitim", "egitim", "öğrenim", "ogrenim", "akademik",
    "yetenekler", "beceriler", "teknik beceriler", "yetkinlikler",
    "projeler", "proje", "kişisel projeler", "kisisel projeler",
    "sertifikalar", "sertifika",
    "özet", "ozet", "hakkımda", "hakkimda", "profil",
    "amaç", "amac", "kariyer hedefi",
    "başarılar", "basarilar", "ödüller", "oduller",
    "yayınlar", "yayinlar",
    "diller", "yabancı diller", "yabanci diller",
    "referanslar", "iletişim", "iletisim",
}

# Map source-section keys back to canonical English keys used by the scoring algorithm.
SECTION_ALIASES = {
    # experience
    "deneyim": "experience", "iş deneyimi": "experience", "is deneyimi": "experience",
    "profesyonel deneyim": "experience", "çalışma deneyimi": "experience",
    "calisma deneyimi": "experience", "iş tecrübesi": "experience",
    "work experience": "experience", "professional experience": "experience",
    # education
    "eğitim": "education", "egitim": "education", "öğrenim": "education",
    "ogrenim": "education", "akademik": "education",
    # skills
    "yetenekler": "skills", "beceriler": "skills", "teknik beceriler": "skills",
    "yetkinlikler": "skills", "technical skills": "skills",
    # projects
    "projeler": "projects", "proje": "projects",
    "kişisel projeler": "projects", "kisisel projeler": "projects",
    # certifications
    "sertifikalar": "certifications", "sertifika": "certifications",
    # summary
    "özet": "summary", "ozet": "summary", "hakkımda": "summary",
    "hakkimda": "summary", "profil": "summary",
    # objective
    "amaç": "objective", "amac": "objective", "kariyer hedefi": "objective",
    # achievements
    "başarılar": "achievements", "basarilar": "achievements",
    "ödüller": "achievements", "oduller": "achievements",
    # publications
    "yayınlar": "publications", "yayinlar": "publications",
    # languages
    "diller": "languages", "yabancı diller": "languages", "yabanci diller": "languages",
}


def extract_skills(text: str) -> List[str]:
    """Return de-duplicated skills found in resume text."""
    if not text:
        return []
    lower = text.lower()
    found: Set[str] = set()
    for skill in SKILL_LEXICON:
        if skill in lower:
            found.add(skill)

    # Augment with named entities / noun chunks that match lexicon variants
    nlp = get_spacy()
    if nlp.has_pipe("ner"):
        doc = nlp(text[:100000])
        for ent in doc.ents:
            if ent.label_ in {"ORG", "PRODUCT", "WORK_OF_ART"}:
                token = ent.text.lower().strip()
                if token in SKILL_LEXICON:
                    found.add(token)
    return sorted(found)


def detect_sections(text: str) -> Dict[str, bool]:
    """Detect resume sections in EN/TR. Returns canonical English keys
    so the downstream scoring (which checks 'experience', 'education',
    'skills', 'projects', 'summary', ...) works for both languages."""
    lower = text.lower()
    found: Dict[str, bool] = {}
    for section in ATS_SECTIONS:
        if section in lower:
            canonical = SECTION_ALIASES.get(section, section)
            found[canonical] = True
            found[section] = True  # keep raw key too for visibility
    # Ensure canonical keys exist even when False, for stable downstream behaviour
    for canonical in {"experience", "education", "skills", "projects",
                      "summary", "objective", "certifications",
                      "achievements", "publications", "languages"}:
        found.setdefault(canonical, False)
    return found


def missing_keywords(resume_text: str, jd_text: str) -> Tuple[List[str], List[str]]:
    """Return (matched, missing) keywords from JD vs resume."""
    if not jd_text:
        return [], []
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()
    jd_skills = {s for s in SKILL_LEXICON if s in jd_lower}
    matched = sorted([s for s in jd_skills if s in resume_lower])
    missing = sorted([s for s in jd_skills if s not in resume_lower])
    return matched, missing
