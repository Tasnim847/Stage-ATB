package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Double temperature;

    @Column(name = "system_prompt", columnDefinition = "TEXT")
    private String systemPrompt;

    @Column(nullable = false)
    private String language;

    @Column(name = "min_score", nullable = false)
    private Integer minScore = 0;

    @Column(name = "explanation_required", nullable = false)
    private Boolean explanationRequired = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}