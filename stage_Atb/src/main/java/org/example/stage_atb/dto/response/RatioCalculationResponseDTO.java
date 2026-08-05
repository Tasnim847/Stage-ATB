package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatioCalculationResponseDTO {

    // ============================================
    // INFORMATIONS DE BASE
    // ============================================
    private String clientId;
    private String clientName;
    private BigDecimal totalMonthlyIncome;
    private BigDecimal totalAnnualIncome;
    private LocalDateTime calculatedAt;

    // ============================================
    // RATIOS PARTICULIERS
    // ============================================
    private BigDecimal debtRatio;
    private String debtRatioStatus;

    private BigDecimal repaymentCapacity;
    private String repaymentCapacityStatus;

    private BigDecimal residualIncome;
    private String residualIncomeStatus;

    private BigDecimal monthlyPaymentRatio;
    private String monthlyPaymentRatioStatus;

    private BigDecimal chargesToIncomeRatio;

    private BigDecimal lti;
    private String ltiStatus;

    private BigDecimal ltv;
    private String ltvStatus;

    private BigDecimal coverageRatio;
    private String coverageRatioStatus;

    private BigDecimal incomeToPaymentRatio;

    // ============================================
    // RATIOS PROFESSIONNELS
    // ============================================
    private BigDecimal currentRatio;
    private String currentRatioStatus;

    private BigDecimal solvencyRatio;
    private String solvencyRatioStatus;

    private BigDecimal financialAutonomyRatio;
    private String financialAutonomyStatus;

    private BigDecimal debtToAssetRatio;
    private String debtToAssetStatus;

    private BigDecimal interestCoverageRatio;
    private String interestCoverageStatus;

    private BigDecimal dscr;
    private String dscrStatus;

    // ============================================
    // INFORMATIONS CRÉDIT
    // ============================================
    private BigDecimal monthlyPayment;
    private BigDecimal totalCost;
    private BigDecimal totalInterest;

    // ============================================
    // SCORE GLOBAL
    // ============================================
    private BigDecimal overallScore;
    private String riskLevel;
    private String recommendation;
    private String financialHealthScore;
}