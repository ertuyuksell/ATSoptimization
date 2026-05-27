package com.cvproje.resume.repository;

import com.cvproje.resume.entity.ExtractedSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExtractedSkillRepository extends JpaRepository<ExtractedSkill, UUID> {
    List<ExtractedSkill> findByAnalysisId(UUID analysisId);
}
