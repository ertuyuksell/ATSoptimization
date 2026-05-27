package com.cvproje.resume.repository;

import com.cvproje.resume.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, UUID> {
    Optional<ResumeAnalysis> findFirstByResumeIdOrderByCreatedAtDesc(UUID resumeId);
    List<ResumeAnalysis> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
