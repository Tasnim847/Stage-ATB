package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.CreditStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditResponseDTO {

    private String id;
    private String requestNumber;
    private String clientId;
    private String clientName;
    private String clientEmail;
    private BigDecimal amount;
    private String currency;
    private Integer durationMonths;
    private BigDecimal monthlyPayment;
    private BigDecimal interestRate;
    private String loanPurpose;
    private CreditStatus status;
    private String rejectionReason;
    private LocalDate approvalDate;
    private LocalDate expectedDisbursementDate;
    private LocalDateTime createdAt;
    private String analystName;
    private String riskLevel;
    private BigDecimal riskScore;
    private String decisionRecommendation;
    private String financialHealthScore;
    private BigDecimal debtRatio;
}