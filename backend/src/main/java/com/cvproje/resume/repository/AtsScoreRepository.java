package com.cvproje.resume.repository;

import com.cvproje.resume.entity.AtsScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AtsScoreRepository extends JpaRepository<AtsScore, UUID> {
    List<AtsScore> findByAnalysisId(UUID analysisId);
}
