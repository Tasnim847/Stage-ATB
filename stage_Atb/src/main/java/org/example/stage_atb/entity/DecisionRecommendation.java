package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "decision_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    private String recommendedAction;

    private String recommendationReason;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Column(columnDefinition = "TEXT")
    private String detailedRecommendation;

    private boolean aiGenerated = false;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;

    private boolean decisionAccepted = false;

    private String decisionNotes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}