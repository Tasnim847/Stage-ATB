// dto/response/ValidationResponseDTO.java
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.CreditStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResponseDTO {
    private String id;
    private String requestNumber;
    private String clientName;
    private String clientEmail;
    private BigDecimal amount;
    private String creditType;
    private int durationMonths;
    private BigDecimal monthlyPayment;
    private CreditStatus status;

    // Décision de l'analyste
    private String analystDecision;
    private String analystName;
    private String analystComments;
    private LocalDateTime analystDecisionDate;

    // Décision du manager
    private String managerDecision;
    private String managerName;
    private String managerComments;
    private LocalDateTime managerDecisionDate;

    // Indicateurs
    private boolean isHighAmount;
    private boolean isHighRisk;
    private String riskLevel;
    private BigDecimal riskScore;
    private String recommendation;

    // Workflow
    private String currentStep;
    private boolean requiresManagerValidation;
    private String validationReason;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}