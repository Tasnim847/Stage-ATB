// dto/response/RatioCalculationResponseDTO.java
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
public class RatioCalculationResponseDTO {

    private String clientId;
    private BigDecimal totalMonthlyIncome;

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
    private BigDecimal debtToAssetRatio;
    private BigDecimal interestCoverageRatio;
    private BigDecimal dscr;
    private String dscrStatus;

    // Informations crédit
    private BigDecimal monthlyPayment;
    private BigDecimal totalCost;
    private BigDecimal totalInterest;
}