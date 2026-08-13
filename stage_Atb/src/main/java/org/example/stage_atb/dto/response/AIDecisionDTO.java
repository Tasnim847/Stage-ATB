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
public class AIDecisionDTO {
    private String id;
    private String requestNumber;
    private String clientName;
    private String aiRecommendation;
    private Double riskScore;
    private String riskLevel;
    private Double confidence;
    private List<String> factors;
    private List<String> suggestedActions;
    private LocalDateTime generatedAt;
}