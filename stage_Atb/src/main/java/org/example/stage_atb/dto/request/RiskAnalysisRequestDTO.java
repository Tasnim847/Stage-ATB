package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.RiskLevel;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysisRequestDTO {

    private String creditRequestId;

    private RiskLevel creditRisk;
    private RiskLevel financialRisk;
    private RiskLevel operationalRisk;
    private RiskLevel overallRisk;
    private BigDecimal riskScore;
    private String riskFactors;
    private String riskDescription;
    private Boolean anomalyDetected;
    private String anomalyDetails;
    private String mitigationMeasures;
    private String riskReport;
}