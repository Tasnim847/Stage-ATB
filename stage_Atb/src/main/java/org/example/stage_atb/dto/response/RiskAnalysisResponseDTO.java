package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysisResponseDTO {

    private String id;
    private String creditRequestId;
    private String analystName;

    private RiskLevel creditRisk;
    private RiskLevel financialRisk;
    private RiskLevel operationalRisk;
    private RiskLevel overallRisk;
    private BigDecimal riskScore;
    private String riskFactors;
    private String riskDescription;
    private boolean anomalyDetected;
    private String anomalyDetails;
    private String mitigationMeasures;
    private String riskReport;
    private LocalDateTime createdAt;
}