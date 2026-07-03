package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @Column(nullable = false)
    private BigDecimal defaultProbability;

    private BigDecimal predictedLoss;

    private String economicScenario;

    @Column(columnDefinition = "TEXT")
    private String scenarioDescription;

    @Column(columnDefinition = "TEXT")
    private String sensitivityAnalysis;

    @Column(columnDefinition = "TEXT")
    private String preventiveRecommendations;

    private String predictionDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}