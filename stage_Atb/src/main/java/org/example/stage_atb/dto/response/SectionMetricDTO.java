package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionMetricDTO {
    private String label;
    private Object value;
    private double change;
    private String trend; // up, down, stable
    private String color;
}