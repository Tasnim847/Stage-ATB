package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrStatisticsResponse {
    private Long totalDocuments;
    private Long successCount;
    private Long errorCount;
    private Long warningCount;
    private Double averageConfidence;
    private Double averageProcessingTime;
    private Map<String, Long> documentTypeStats;
    private Map<String, Long> dailyStats;
}
