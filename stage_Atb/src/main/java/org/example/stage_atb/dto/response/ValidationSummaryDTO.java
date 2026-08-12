// dto/response/ValidationSummaryDTO.java
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
public class ValidationSummaryDTO {
    private String id;
    private String requestNumber;
    private String clientName;
    private BigDecimal amount;
    private String creditType;
    private String riskLevel;
    private String analystName;
    private String analystDecision;
    private LocalDateTime analystDecisionDate;
    private boolean requiresManagerValidation;
    private String managerName;
    private String managerDecision;
    private LocalDateTime managerDecisionDate;
    private int daysPending;
    private String priority;
}