package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastRequest {
    private String period; // month, quarter, year
    private String metric; // approval_rate, volume, risk_score, default_rate
    private Integer confidenceLevel;
}