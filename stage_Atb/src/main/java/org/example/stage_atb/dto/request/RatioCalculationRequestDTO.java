package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatioCalculationRequestDTO {

    // ============================================
    // INFORMATIONS CLIENT
    // ============================================
    private String clientId;
    private String creditRequestId;

    // ============================================
    // REVENUS
    // ============================================
    @Builder.Default
    private BigDecimal monthlyNetIncome = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal otherMonthlyIncome = BigDecimal.ZERO;
    private BigDecimal annualIncome;
    private BigDecimal monthlyEpargne;

    // ============================================
    // CHARGES
    // ============================================
    @Builder.Default
    private BigDecimal monthlyCharges = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal existingCreditPayments = BigDecimal.ZERO;
    private BigDecimal totalMonthlyDebts;

    // ============================================
    // CRÉDIT DEMANDÉ
    // ============================================
    private BigDecimal creditAmount;
    private Integer durationMonths;
    private BigDecimal annualInterestRate;
    private BigDecimal collateralValue;
    private BigDecimal guaranteeValue;

    // ============================================
    // PATRIMOINE
    // ============================================
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal currentAssets;
    private BigDecimal currentLiabilities;
    private BigDecimal shareholdersEquity;

    // ============================================
    // DONNÉES PROFESSIONNELLES
    // ============================================
    private BigDecimal ebit;
    private BigDecimal financialCharges;
    private BigDecimal availableCashFlow;
    private BigDecimal annualDebtService;
    private BigDecimal totalFinancialDebts;

    // ============================================
    // ÉPARGNE
    // ============================================
    private BigDecimal monthlySavings;
    private BigDecimal totalSavings;
}