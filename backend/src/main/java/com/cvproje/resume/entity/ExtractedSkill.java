package com.cvproje.resume.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "extracted_skills")
public class ExtractedSkill {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID analysisId;

    @Column(nullable = false)
    private String skill;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAnalysisId() { return analysisId; }
    public void setAnalysisId(UUID analysisId) { this.analysisId = analysisId; }
    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }
}
