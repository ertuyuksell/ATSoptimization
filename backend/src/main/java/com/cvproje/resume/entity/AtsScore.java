package com.cvproje.resume.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "ats_scores")
public class AtsScore {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID analysisId;

    @Column(nullable = false)
    private String component;

    @Column(nullable = false)
    private Integer score;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAnalysisId() { return analysisId; }
    public void setAnalysisId(UUID analysisId) { this.analysisId = analysisId; }
    public String getComponent() { return component; }
    public void setComponent(String component) { this.component = component; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
