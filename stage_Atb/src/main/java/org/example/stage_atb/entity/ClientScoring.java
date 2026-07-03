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
@Table(name = "client_scorings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientScoring {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    private BigDecimal overallScore;

    private BigDecimal paymentHistoryScore;

    private BigDecimal creditUtilizationScore;

    private BigDecimal creditHistoryLengthScore;

    private BigDecimal creditMixScore;

    private BigDecimal newCreditScore;

    private String scoreGrade;

    private String riskCategory;

    @Column(columnDefinition = "TEXT")
    private String scoringFactors;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    private String commercialPotential;

    private BigDecimal estimatedLifetimeValue;

    private LocalDateTime lastUpdateDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}