package org.example.stage_atb.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastValueDTO {
    private String period;
    private Double value;
    private Double lowerBound;
    private Double upperBound;
}