package com.cvproje.resume.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AnalysisDtos {

    public record ResumeSummary(
            UUID id,
            String filename,
            long size,
            Instant uploadedAt,
            Integer atsScore,
            String predictedRole
    ) {}

    public record AnalysisResponse(
            UUID resumeId,
            UUID analysisId,
            String filename,
            String predictedRole,
            Double confidence,
            Integer atsScore,
            JsonNode raw
    ) {}

    public record DashboardResponse(
            int totalResumes,
            Double averageAtsScore,
            String latestRole,
            List<ResumeSummary> recent
    ) {}
}
