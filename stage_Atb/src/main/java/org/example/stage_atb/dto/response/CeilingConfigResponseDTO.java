package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CeilingConfigResponseDTO {
    private String id;
    private String creditTypeId;
    private String creditTypeName;
    private Double minAmount;
    private Double maxAmount;
    private String currency;
    private Boolean isActive;
    private String approvalLevel;
    private Boolean requiresAdditionalApproval;
    private String additionalApprovalLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}