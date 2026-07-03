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
@Table(name = "credit_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    @Column(nullable = false)
    private BigDecimal riskScore;

    @Column(nullable = false)
    private BigDecimal solvencyScore;

    @Column(nullable = false)
    private BigDecimal overallScore;

    private String scoreGrade;

    private String scoreDescription;

    @Column(columnDefinition = "TEXT")
    private String scoringFactors;

    private boolean aiGenerated = false;

    @Column(columnDefinition = "TEXT")
    private String aiRecommendation;

    @Column(columnDefinition = "TEXT")
    private String aiExplanation;

    private boolean recommendationAccepted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}