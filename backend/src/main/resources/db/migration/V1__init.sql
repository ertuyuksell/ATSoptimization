CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(32)  NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE resumes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename  VARCHAR(512) NOT NULL,
    storage_path       VARCHAR(1024) NOT NULL,
    file_size          BIGINT NOT NULL,
    uploaded_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);

CREATE TABLE resume_analysis (
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
CREATE INDEX idx_analysis_resume ON resume_analysis(resume_id);
CREATE INDEX idx_analysis_user   ON resume_analysis(user_id);

CREATE TABLE extracted_skills (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id   UUID NOT NULL REFERENCES resume_analysis(id) ON DELETE CASCADE,
    skill         VARCHAR(255) NOT NULL
);
CREATE INDEX idx_skills_analysis ON extracted_skills(analysis_id);

CREATE TABLE ats_scores (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id   UUID NOT NULL REFERENCES resume_analysis(id) ON DELETE CASCADE,
    component     VARCHAR(64) NOT NULL,
    score         INTEGER NOT NULL
);
CREATE INDEX idx_ats_analysis ON ats_scores(analysis_id);

CREATE TABLE job_matches (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id        UUID NOT NULL REFERENCES resume_analysis(id) ON DELETE CASCADE,
    job_description    TEXT,
    similarity         DOUBLE PRECISION,
    matched_keywords   TEXT,
    missing_keywords   TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobmatch_analysis ON job_matches(analysis_id);
