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
@Table(name = "financial_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id", nullable = false)
    private CreditRequest creditRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    // Financial Ratios
    private BigDecimal debtRatio;
    private BigDecimal liquidityRatio;
    private BigDecimal solvencyRatio;
    private BigDecimal profitabilityRatio;
    private BigDecimal efficiencyRatio;

    // Cash Flow Analysis
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal netMonthlyCashFlow;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal netWorth;

    // Repayment Capacity
    private BigDecimal repaymentCapacity;
    private BigDecimal debtServiceCoverageRatio;
    private BigDecimal monthlyPaymentToIncomeRatio;

    // Analysis Results
    private String financialHealthScore;
    private String analysisSummary;

    @Column(columnDefinition = "TEXT")
    private String detailedAnalysis;

    private boolean approvedByAnalyst;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}