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
public class FinancialAnalysisResponseDTO {

    private String id;
    private String creditRequestId;
    private String analystName;

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

    private String financialHealthScore;
    private String analysisSummary;
    private Boolean approvedByAnalyst;
    private LocalDateTime createdAt;
}