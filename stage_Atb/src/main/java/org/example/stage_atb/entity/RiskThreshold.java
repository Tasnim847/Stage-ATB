package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "risk_thresholds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskThreshold {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "min_score", nullable = false)
    private Integer minScore;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(nullable = false)
    private String level;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String color;

    @Column(name = "alert_level", nullable = false)
    private String alertLevel;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}