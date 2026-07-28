package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditTypeResponseDTO {
    private String id;
    private String code;
    private String name;
    private String description;
    private String category;
    private Boolean isActive;
    private Integer minDurationMonths;
    private Integer maxDurationMonths;
    private Double minAmount;
    private Double maxAmount;
    private Double baseInterestRate;
    private Boolean requiresCollateral;
    private Boolean requiresGuarantor;
    private List<String> requiredDocuments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}