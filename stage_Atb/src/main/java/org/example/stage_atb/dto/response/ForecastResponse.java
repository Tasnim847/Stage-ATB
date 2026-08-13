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
public class ForecastResponse {
    private String id;
    private LocalDateTime date;
    private String metric;
    private Double currentValue;
    private List<ForecastValueDTO> forecastValues;
    private ConfidenceIntervalDTO confidenceInterval;
    private String trend; // up, down, stable
    private List<String> seasonality;
    private List<String> recommendations;
}