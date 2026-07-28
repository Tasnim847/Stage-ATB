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
public class InterestRateResponseDTO {
    private String id;
    private String creditTypeId;
    private String creditTypeName;
    private Double rate;
    private Double minRate;
    private Double maxRate;
    private Boolean isDefault;
    private String clientCategory;
    private Double rateAdjustment;
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Boolean isActive;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
