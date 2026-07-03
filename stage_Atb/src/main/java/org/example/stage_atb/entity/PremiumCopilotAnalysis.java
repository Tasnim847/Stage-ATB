package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "premium_copilot_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PremiumCopilotAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id", nullable = false)
    private User analyst;

    @Column(columnDefinition = "TEXT")
    private String analysisRequest;

    @Column(columnDefinition = "TEXT")
    private String analysisResponse;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private BigDecimal debtRatio;

    private String incomeStability;

    private String recommendedAction;

    @Column(columnDefinition = "TEXT")
    private String actionSuggestions;

    @Column(columnDefinition = "TEXT")
    private String aiInsights;

    private boolean premiumEnabled = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Version
    private Long version;
}