package com.cvproje.resume.service;

import com.cvproje.resume.dto.AnalysisDtos;
import com.cvproje.resume.entity.*;
import com.cvproje.resume.exception.ApiException;
import com.cvproje.resume.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.*;

@Service
public class ResumeService {

    private final StorageService storage;
    private final AiServiceClient ai;
    private final ResumeRepository resumeRepo;
    private final ResumeAnalysisRepository analysisRepo;
    private final ExtractedSkillRepository skillRepo;
    private final AtsScoreRepository atsRepo;
    private final JobMatchRepository jobMatchRepo;

    public ResumeService(StorageService storage, AiServiceClient ai,
                         ResumeRepository resumeRepo,
                         ResumeAnalysisRepository analysisRepo,
                         ExtractedSkillRepository skillRepo,
                         AtsScoreRepository atsRepo,
                         JobMatchRepository jobMatchRepo) {
        this.storage = storage;
        this.ai = ai;
        this.resumeRepo = resumeRepo;
        this.analysisRepo = analysisRepo;
        this.skillRepo = skillRepo;
        this.atsRepo = atsRepo;
        this.jobMatchRepo = jobMatchRepo;
    }

    @Transactional
    public AnalysisDtos.AnalysisResponse uploadAndAnalyze(UUID userId, MultipartFile file, String jobDescription) {
        StorageService.StoredFile stored = storage.store(file);

        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setOriginalFilename(stored.originalFilename());
        resume.setStoragePath(stored.storagePath());
        resume.setFileSize(stored.size());
        resume = resumeRepo.save(resume);

        Path path = storage.resolve(stored.storagePath());
        JsonNode aiResp = ai.analyzeResume(path, stored.originalFilename(), jobDescription);
        if (aiResp == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Empty AI response");
        }

        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setResumeId(resume.getId());
        analysis.setUserId(userId);
        analysis.setPredictedRole(text(aiResp, "predicted_role"));
        analysis.setConfidence(aiResp.path("confidence").asDouble(0.0));
        analysis.setAtsScore(aiResp.path("ats_score").asInt(0));
        analysis.setSkillCount(aiResp.path("skill_count").asInt(0));
        analysis.setPageCount(aiResp.path("page_count").asInt(0));
        analysis.setCharCount(aiResp.path("char_count").asInt(0));
        analysis.setRawJson(aiResp.toString());
        final ResumeAnalysis savedAnalysis = analysisRepo.save(analysis);

        // skills
        List<ExtractedSkill> skills = new ArrayList<>();
        aiResp.path("skills").forEach(node -> {
            ExtractedSkill s = new ExtractedSkill();
            s.setAnalysisId(savedAnalysis.getId());
            s.setSkill(node.asText());
            skills.add(s);
        });
        skillRepo.saveAll(skills);

        // ats components
        JsonNode comps = aiResp.path("ats_components");
        List<AtsScore> ats = new ArrayList<>();
        comps.fields().forEachRemaining(e -> {
            AtsScore a = new AtsScore();
            a.setAnalysisId(savedAnalysis.getId());
            a.setComponent(e.getKey());
            a.setScore(e.getValue().asInt(0));
            ats.add(a);
        });
        atsRepo.saveAll(ats);

        // job match
        JsonNode jm = aiResp.path("job_match");
        if (jm != null && !jm.isNull() && !jm.isMissingNode()) {
            JobMatch m = new JobMatch();
            m.setAnalysisId(savedAnalysis.getId());
            m.setJobDescription(jobDescription);
            m.setSimilarity(jm.path("similarity").asDouble(0.0));
            m.setMatchedKeywords(jm.path("matched_keywords").toString());
            m.setMissingKeywords(jm.path("missing_keywords").toString());
            jobMatchRepo.save(m);
        }

        return new AnalysisDtos.AnalysisResponse(
                resume.getId(), savedAnalysis.getId(), resume.getOriginalFilename(),
                savedAnalysis.getPredictedRole(), savedAnalysis.getConfidence(), savedAnalysis.getAtsScore(), aiResp);
    }

    public List<AnalysisDtos.ResumeSummary> listForUser(UUID userId) {
        List<Resume> resumes = resumeRepo.findByUserIdOrderByUploadedAtDesc(userId);
        List<AnalysisDtos.ResumeSummary> out = new ArrayList<>();
        for (Resume r : resumes) {
            Optional<ResumeAnalysis> a = analysisRepo.findFirstByResumeIdOrderByCreatedAtDesc(r.getId());
            out.add(new AnalysisDtos.ResumeSummary(
                    r.getId(), r.getOriginalFilename(), r.getFileSize(), r.getUploadedAt(),
                    a.map(ResumeAnalysis::getAtsScore).orElse(null),
                    a.map(ResumeAnalysis::getPredictedRole).orElse(null)));
        }
        return out;
    }

    public AnalysisDtos.DashboardResponse dashboard(UUID userId) {
        List<AnalysisDtos.ResumeSummary> recent = listForUser(userId);
        double avg = recent.stream().filter(r -> r.atsScore() != null).mapToInt(AnalysisDtos.ResumeSummary::atsScore)
                .average().orElse(0.0);
        String latest = recent.stream().map(AnalysisDtos.ResumeSummary::predictedRole)
                .filter(Objects::nonNull).findFirst().orElse("—");
        return new AnalysisDtos.DashboardResponse(recent.size(), avg, latest,
                recent.subList(0, Math.min(recent.size(), 10)));
    }

    public Resume getOwned(UUID userId, UUID resumeId) {
        Resume r = resumeRepo.findById(resumeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resume not found"));
        if (!r.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your resume");
        }
        return r;
    }

    public ResumeAnalysis latestAnalysis(UUID userId, UUID resumeId) {
        getOwned(userId, resumeId);
        return analysisRepo.findFirstByResumeIdOrderByCreatedAtDesc(resumeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No analysis yet"));
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.path(field);
        return v.isMissingNode() || v.isNull() ? null : v.asText();
    }
}
