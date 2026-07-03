package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel creditRisk;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel financialRisk;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel operationalRisk;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel overallRisk;

    private BigDecimal riskScore;

    private String riskFactors;

    @Column(columnDefinition = "TEXT")
    private String riskDescription;

    private boolean anomalyDetected = false;

    @Column(columnDefinition = "TEXT")
    private String anomalyDetails;

    private String mitigationMeasures;

    @Column(columnDefinition = "TEXT")
    private String riskReport;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}