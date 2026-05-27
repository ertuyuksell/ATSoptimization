-- Standalone DB schema (mirror of Flyway V1__init.sql)
-- Tables: users, resumes, resume_analysis, extracted_skills, ats_scores, job_matches

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(32)  NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resumes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename  VARCHAR(512) NOT NULL,
    storage_path       VARCHAR(1024) NOT NULL,
    file_size          BIGINT NOT NULL,
    uploaded_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_analysis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id       UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    predicted_role  VARCHAR(255),
    confidence      DOUBLE PRECISION,
    ats_score       INTEGER,
    skill_count     INTEGER,
    page_count      INTEGER,
    char_count      INTEGER,
    raw_json        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS extracted_skills (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id   UUID NOT NULL REFERENCES resume_analysis(id) ON DELETE CASCADE,
    skill         VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ats_scores (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id   UUID NOT NULL REFERENCES resume_analysis(id) ON DELETE CASCADE,
    component     VARCHAR(64) NOT NULL,
    score         INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS job_matches (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id        UUID NOT NULL REFERENCES resume_analysis(id) ON DELETE CASCADE,
    job_description    TEXT,
    similarity         DOUBLE PRECISION,
    matched_keywords   TEXT,
    missing_keywords   TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
