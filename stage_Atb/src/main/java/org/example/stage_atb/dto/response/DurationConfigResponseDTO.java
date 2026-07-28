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
public class DurationConfigResponseDTO {
    private String id;
    private String creditTypeId;
    private String creditTypeName;
    private Integer durationMonths;
    private String label;
    private Boolean isDefault;
    private Boolean isActive;
    private Double minAmount;
    private Double maxAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}