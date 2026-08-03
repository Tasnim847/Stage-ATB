// dto/request/RatioCalculationRequestDTO.java
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

    private String clientId;
    private String creditRequestId;

    // Revenus
    private BigDecimal monthlyNetIncome;
    private BigDecimal otherMonthlyIncome;
    private BigDecimal monthlyCharges;
    private BigDecimal existingCreditPayments;

    // Crédit
    private BigDecimal creditAmount;
    private Integer durationMonths;
    private BigDecimal annualInterestRate;
    private BigDecimal collateralValue;

    // Données professionnelles
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal currentAssets;
    private BigDecimal currentLiabilities;
    private BigDecimal ebit;
    private BigDecimal financialCharges;
    private BigDecimal availableCashFlow;
    private BigDecimal annualDebtService;
}