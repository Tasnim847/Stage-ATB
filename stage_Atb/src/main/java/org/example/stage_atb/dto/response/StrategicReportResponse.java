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
public class StrategicReportResponse {
    private String id;
    private String title;
    private LocalDateTime date;
    private String summary;
    private List<StrategicSectionDTO> sections;
    private List<String> recommendations;
    private String generatedBy;
    private String version;
}