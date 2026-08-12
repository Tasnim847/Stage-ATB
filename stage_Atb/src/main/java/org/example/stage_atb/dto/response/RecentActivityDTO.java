// dto/response/RecentActivityDTO.java
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
public class RecentActivityDTO {
    private String creditRequestId;
    private String requestNumber;
    private String clientName;
    private String action;
    private String status;
    private LocalDateTime actionDate;
    private BigDecimal amount;
}