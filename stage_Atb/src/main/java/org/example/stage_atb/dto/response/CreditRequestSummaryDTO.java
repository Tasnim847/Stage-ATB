// dto/response/CreditRequestSummaryDTO.java
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
public class CreditRequestSummaryDTO {
    private String id;
    private String requestNumber;
    private String clientName;
    private BigDecimal amount;
    private CreditStatus status;
    private LocalDateTime createdAt;
    private String priority;
    private int daysPending;
}