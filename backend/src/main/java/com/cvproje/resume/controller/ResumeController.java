package com.cvproje.resume.controller;

import com.cvproje.resume.dto.AnalysisDtos;
import com.cvproje.resume.entity.Resume;
import com.cvproje.resume.entity.ResumeAnalysis;
import com.cvproje.resume.entity.User;
import com.cvproje.resume.service.ResumeService;
import com.cvproje.resume.service.StorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final StorageService storageService;

    public ResumeController(ResumeService resumeService, StorageService storageService) {
        this.resumeService = resumeService;
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisDtos.AnalysisResponse> upload(
            @AuthenticationPrincipal User user,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "jobDescription", required = false) String jobDescription) {
        return ResponseEntity.ok(resumeService.uploadAndAnalyze(user.getId(), file, jobDescription));
    }

    @GetMapping
    public ResponseEntity<List<AnalysisDtos.ResumeSummary>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.listForUser(user.getId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AnalysisDtos.DashboardResponse> dashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.dashboard(user.getId()));
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<ResumeAnalysis> latestAnalysis(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return ResponseEntity.ok(resumeService.latestAnalysis(user.getId(), id));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<FileSystemResource> getFile(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        Resume r = resumeService.getOwned(user.getId(), id);
        FileSystemResource res = new FileSystemResource(storageService.resolve(r.getStoragePath()));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "inline; filename=\"" + r.getOriginalFilename() + "\"")
                .body(res);
    }
}
