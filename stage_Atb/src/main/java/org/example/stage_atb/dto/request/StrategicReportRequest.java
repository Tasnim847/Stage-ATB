package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StrategicReportRequest {
    private String period; // today, week, month, quarter, year
    private boolean includeRiskAnalysis;
    private boolean includePerformance;
    private boolean includeForecast;
    private String language; // fr, en, ar
}