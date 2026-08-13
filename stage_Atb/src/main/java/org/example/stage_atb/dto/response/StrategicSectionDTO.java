package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StrategicSectionDTO {
    private String title;
    private String content;
    private List<SectionMetricDTO> metrics;
    private Object chartData;
}