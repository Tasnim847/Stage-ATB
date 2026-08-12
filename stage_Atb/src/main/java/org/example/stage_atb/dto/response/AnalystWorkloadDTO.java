// dto/response/AnalystWorkloadDTO.java - WITH @Builder
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder  // ✅ AJOUTER @Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalystWorkloadDTO {
    private String analystId;
    private String analystName;
    private String analystEmail;
    private long currentWorkload;
    private long maxCapacity;
    private double workloadPercentage;
    private String workloadLevel;
    private List<CreditRequestSummaryDTO> assignedRequests;
}