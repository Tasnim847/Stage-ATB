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
public class CopilotAnalysisResponseDTO {

    private String id;

    private String creditRequestId;

    private String creditRequestNumber;

    private String analystId;

    private String analystName;

    private String analysisRequest;

    private String analysisResponse;

    private RiskLevel riskLevel;

    private BigDecimal debtRatio;

    private String incomeStability;

    private String recommendedAction;

    private String actionSuggestions;

    private String aiInsights;

    private boolean premiumEnabled;

    private LocalDateTime createdAt;
}