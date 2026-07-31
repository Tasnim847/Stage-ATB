// FinancialAnalysisResponseDTO.java
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialAnalysisResponseDTO {

    // Informations de base
    private String id;
    private String creditRequestId;
    private String clientId;
    private String clientName;
    private String analystName;

    // Données de base
    private BigDecimal totalMonthlyIncome;
    private BigDecimal monthlyCharges;
    private BigDecimal existingCreditPayments;
    private BigDecimal newMonthlyPayment;

    // Ratios particuliers
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
    private BigDecimal incomeToPaymentRatio;

    // Ratios professionnels
    private BigDecimal currentRatio;
    private String currentRatioStatus;
    private BigDecimal solvencyRatio;
    private String solvencyRatioStatus;
    private BigDecimal financialAutonomyRatio;
    private BigDecimal financialDebtRatio;
    private BigDecimal debtToAssetRatio;
    private BigDecimal interestCoverageRatio;
    private BigDecimal dscr;
    private String dscrStatus;

    // Analyse crédit
    private BigDecimal totalCost;
    private BigDecimal totalInterest;
    private BigDecimal monthlyPayment;

    // Score et décision
    private BigDecimal overallScore;
    private String riskLevel;
    private String recommendation;
    private String financialHealthScore;

    // Métadonnées
    private String status;
    private String analyzedBy;
    private boolean approvedByAnalyst;
    private String createdAt;
    private String updatedAt;
}