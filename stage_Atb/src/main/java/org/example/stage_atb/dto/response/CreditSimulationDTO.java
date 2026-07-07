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
public class CreditSimulationDTO {
    private String id;
    private String creditRequestId;
    private String userId;
    private String clientId;
    private BigDecimal amount;
    private Integer durationMonths;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
    private BigDecimal totalInterest;
    private BigDecimal totalPayment;
    private BigDecimal borrowingCapacity;
    private BigDecimal debtRatio;
    private Integer solvencyScore;
    private String simulationResults;
    private String comparisonResults;
    private String simulationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}