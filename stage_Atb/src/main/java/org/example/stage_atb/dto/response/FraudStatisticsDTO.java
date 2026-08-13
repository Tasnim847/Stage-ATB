// dto/response/FraudStatisticsDTO.java
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudStatisticsDTO {
    private long totalAlerts;
    private long newAlerts;
    private long underReview;
    private long confirmed;
    private long rejected;
    private Map<String, Long> byType;
    private Map<String, Long> bySeverity;
    private long[] trendLastDays;
}