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
@Table(name = "loan_portfolios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanPortfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String portfolioName;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    private BigDecimal outstandingAmount;

    private BigDecimal defaultedAmount;

    private BigDecimal recoveryAmount;

    private BigDecimal defaultRate;

    private BigDecimal profitabilityRate;

    private Integer totalLoans;

    private Integer activeLoans;

    private Integer defaultedLoans;

    @Column(columnDefinition = "TEXT")
    private String portfolioAnalysis;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}